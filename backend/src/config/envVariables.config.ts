// load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
export const temporalHost = process.env.TEMPORAL_HOST || 'localhost';
export const temporalPort = process.env.TEMPORAL_PORT || '7233';
export const port = process.env.PORT || 9090;
export const connectionString = process.env.CONNECTION_STRING || (() => { throw new Error('CONNECTION_STRING is not defined') })();

export const geminiAPIKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || (() => { throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined') })();
// Set default values with fallback for test environments
export const redisHost = process.env.REDIS_HOST || 'redis-docker-service';
export const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
export const isTestEnvironment = process.env.ENVIRONMENT === 'DEV';
export const gcpBucketName = process.env.GCS_BUCKET_NAME || (() => { throw new Error('GCS_BUCKET_NAME is not defined') })();
export const temporalAPIKey = process.env.TEMPORAL_API_KEY || (() => { throw new Error('TEMPORAL_API_KEY is not defined') })();
export const temporalNamespace = process.env.TEMPORAL_NAMESPACE || (() => { throw new Error('TEMPORAL_NAMESPACE is not defined') })();
export const temporalAddress = process.env.TEMPORAL_ADDRESS || (() => { throw new Error('TEMPORAL_ADDRESS is not defined') })();
export const geminiCache = process.env.GEMINI_CACHE || (() => { throw new Error('GEMINI_CACHE is not defined') })();
