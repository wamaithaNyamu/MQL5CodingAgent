import { defineConfig } from 'drizzle-kit';
import {connectionString} from './src/config/envVariables.config'



export default defineConfig({
  out: './drizzle',
  schema: './src/config/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
    schemaFilter: ["drizzle"], // <-- target this schema ONLY
});