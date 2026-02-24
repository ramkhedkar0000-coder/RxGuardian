import * as fs from 'fs';
import * as path from 'path';
import { RefillAlert } from '../types';

const LOG_FILE = path.join(__dirname, '../../data/notifications.json');

// Ensure log file exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

export interface NotificationLog {
    id: string;
    patientId: string;
    type: 'EMAIL' | 'SMS' | 'WHATSAPP';
    status: 'SENT' | 'FAILED';
    timestamp: string;
    message: string;
}

export const sendRefillReminder = async (alert: RefillAlert, channel: 'EMAIL' | 'WHATSAPP' = 'EMAIL'): Promise<NotificationLog> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const message = `Hi ${alert.patientId}, your prescription for ${alert.productName} is due for a refill on ${new Date(alert.expectedRefillDate).toLocaleDateString()}. Reply 'YES' to order.`;

    // In a real app, you would call SendGrid/Twilio API here.
    console.log(`[${channel}] Sending to ${alert.patientId}: ${message}`);

    const logEntry: NotificationLog = {
        id: `NOTIF-${Date.now()}`,
        patientId: alert.patientId,
        type: channel,
        status: 'SENT',
        timestamp: new Date().toISOString(),
        message
    };

    // Log to file
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    logs.push(logEntry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

    return logEntry;
};

export const getNotificationLogs = () => {
    if (fs.existsSync(LOG_FILE)) {
        return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    }
    return [];
};
