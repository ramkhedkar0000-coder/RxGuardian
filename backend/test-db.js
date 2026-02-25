require('dotenv').config();
const postgres = require('postgres');

console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));

const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    connect_timeout: 10
});

async function run() {
    try {
        console.log('Connecting...');
        const res = await sql`SELECT 1 as result`;
        console.log('Connected! Result:', res);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await sql.end();
    }
}

run();
