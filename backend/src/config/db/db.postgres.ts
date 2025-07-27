// src/db/connect.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { connectionString } from '../envVariables.config';

export const connectToPostgres = () => {
  try {
    const client = postgres(connectionString, { prepare: false });
    const db = drizzle(client);
    console.log('✅ PostgreSQL connection established');
    return db;
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    throw error;
  }
};

export const db = connectToPostgres();
