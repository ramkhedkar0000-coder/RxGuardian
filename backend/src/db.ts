import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
    console.warn('[DB] DATABASE_URL is not set!');
}

const connectionString = process.env.DATABASE_URL || '';
const sql = postgres(connectionString, { ssl: 'require' });

export default sql;
