import { GoogleGenerativeAI } from '@google/generative-ai';
import { placeOrderTool, addOrder } from './orderService';
import { checkStock, decrementStock, getProductByName } from './productService';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// ─── Chat log persistence ─────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, '../../data/chat_logs.json');

// Ensure data dir exists
const dataDir = path.dirname(LOG_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]');

const logInteraction = (query: string, response: string, toolCall?: string) => {
    try {
        const entry = { timestamp: new Date().toISOString(), query, response, toolCall };
        const logs: any[] = fs.existsSync(LOG_FILE)
            ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
            : [];
        logs.push(entry);
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error('[ChatService] Failed to log interaction:', e);
    }
};

export const getSmartLogs = (): any[] => {
    try {
        return fs.existsSync(LOG_FILE)
            ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'))
            : [];
    } catch {
        return [];
    }
};

// ─── Gemini lazy initialization ───────────────────────────────────────────────
let genAI: GoogleGenerativeAI | null = null;
let generativeModel: any = null;

const getModel = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'YOUR_GEMINI_KEY_HERE') return null;

    if (!generativeModel) {
        console.log(`[Gemini] Initializing model with key length: ${key.length}`);
        genAI = new GoogleGenerativeAI(key);
        generativeModel = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            tools: [{ functionDeclarations: [placeOrderTool] }],
        });
    }
    return generativeModel;
};

// ─── Context type ─────────────────────────────────────────────────────────────
interface ChatContext {
    products: any[];    // normalised Product[] from productService
    orders: any[];      // raw order rows from orderService
    patientId?: string;
}

// ─── Main chat handler ────────────────────────────────────────────────────────
export const processUserQuery = async (
    userMessage: string,
    context: ChatContext
): Promise<string> => {
    const model = getModel();

    // No API key — return a friendly fallback
    if (!model) {
        const key = process.env.GEMINI_API_KEY;
        console.warn(`[ChatService] Offline: apiKey=${key ? 'HIDDEN(' + key.length + ')' : 'MISSING'}`);
        return `🤖 AI Assistant is offline (GEMINI_API_KEY not configured). However, I can tell you that we have ${context.products.length} products in stock. Please ask a pharmacist for help.`;
    }

    // ── Build context snippets ────────────────────────────────────────────────
    const msgLower = userMessage.toLowerCase();

    // Find products mentioned by name keyword
    const relevantProducts = context.products
        .filter(p => {
            const name = (p.name || p['product name'] || '').toLowerCase();
            return msgLower.split(' ').some(word => word.length > 3 && name.includes(word));
        })
        .slice(0, 5)
        .map(p => ({
            name: p.name || p['product name'],
            price: p.price ?? p['price rec'],
            stock: p.stock,
            packageSize: p.packageSize || p['package size'],
        }));

    // Find orders for this patient
    const patientOrders = context.orders
        .filter(o => !context.patientId || o['Patient ID'] === context.patientId)
        .slice(-10)
        .map(o => ({
            product: o['Product Name'],
            date: o._purchaseDateISO || o['Purchase Date'],
            qty: o['Quantity'],
        }));

    // ── Gemini call ───────────────────────────────────────────────────────────
    const systemPrompt = `
You are RXGuardians — an intelligent, friendly pharmacy assistant. 
Patient ID: ${context.patientId || 'GUEST-001'}
Available products (matching query): ${JSON.stringify(relevantProducts)}
Patient's recent orders: ${JSON.stringify(patientOrders)}
Total products in catalog: ${context.products.length}

Instructions:
- Be concise and professional.
- Help with: checking stock, product info, pricing, ordering, refill reminders.
- If the user explicitly asks to ORDER or BUY something, call the placeOrder tool.
- Ask for confirmation before placing an order if quantity is ambiguous.
- Prices are in INR (₹). 
- Do NOT make up product names not in the provided list.
- If a product isn't in the list, say you don't carry it currently.
    `.trim();

    const chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: systemPrompt }],
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I\'m ready to help patients with their pharmacy needs.' }],
            },
        ],
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        // ── Handle function call (placeOrder) ─────────────────────────────────
        const functionCalls = response.functionCalls?.() || [];
        if (functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === 'placeOrder') {
                const args = call.args as { productName: string; quantity: number; patientId?: string };

                // Validate product exists
                const product = await getProductByName(args.productName);
                if (!product) {
                    const text = `I couldn't find "${args.productName}" in our catalog. Please check the exact product name.`;
                    logInteraction(userMessage, text);
                    return text;
                }

                // Validate stock
                if (!(await checkStock(args.productName, args.quantity))) {
                    const text = `Sorry, we only have ${product.stock} unit(s) of ${product.name} in stock — not enough for ${args.quantity}.`;
                    logInteraction(userMessage, text);
                    return text;
                }

                // Place order
                await decrementStock(args.productName, args.quantity);
                const newOrder = await addOrder({
                    id: `ORD-${Date.now()}`,
                    'Patient ID': args.patientId || context.patientId || 'GUEST-001',
                    'Product Name': product.name,
                    'Quantity': args.quantity,
                    'Total Price (EUR)': +(product.price * args.quantity).toFixed(2),
                    '_purchaseDateISO': new Date().toISOString(),
                    status: 'Confirmed',
                });

                // Send function response back to model for natural language reply
                const result2 = await chat.sendMessage([{
                    functionResponse: {
                        name: 'placeOrder',
                        response: {
                            success: true,
                            orderId: newOrder.id,
                            productName: product.name,
                            quantity: args.quantity,
                            total: `€${newOrder['Total Price (EUR)']}`,
                            status: 'Confirmed',
                        },
                    },
                }]);

                const finalText = result2.response.text();
                logInteraction(
                    userMessage,
                    finalText,
                    `placeOrder: ${product.name} × ${args.quantity} = €${newOrder['Total Price (EUR)']}`
                );
                return finalText;
            }
        }

        // ── Normal text response ───────────────────────────────────────────────
        const textResponse = response.text();
        logInteraction(userMessage, textResponse);
        return textResponse;

    } catch (err: any) {
        console.error('[ChatService] Gemini error:', err?.message || err);
        const msg = 'I\'m having trouble processing your request right now. Please try again in a moment.';
        logInteraction(userMessage, msg);
        return msg;
    }
};
