## Development Setup
Instructions on running the `backend`

## Supabase
The database being used here is postgres, ideally any postgres works but for this example supabase was used. Navigate to supabase.com and get a postgres connection string. Add the connection string to the .env as `CONNECTION_STRING`.

## Drizzle
Drizzle ORM is used for type-safe database interactions. Here are the common commands for managing your database schema and migrations.

#### Pull Latest Schema
Before making changes or generating new migrations, it's good practice to pull the latest schema definition from your database.

```sh
npm run drizzle-pull
```
#### Generate Migrations
After making changes to your Drizzle schema, generate new migration files to reflect those changes. This command will create a new migration file in your migrations directory.

```sh
npm run drizzle-generate
```

#### Apply Migrations
Once migration files are generated (or if you've pulled new migrations from version control), apply them to your database to update its schema.

```sh
npm run drizzle-migrate
```

#### Push Schema to Database
In development, you might occasionally want to directly push your Drizzle schema to the database, skipping explicit migrations. Use this with caution, as it can be destructive in production environments.

```sh
npm run drizzle-push
```

## Gemini setup
Navigate to google and generate an API key. Add it as `GOOGLE_GENERATIVE_AI_API_KEY` in the .env file (see below).

So as to avoid sending the system prompt on every message, we need to set the cache. Once you have the API key, run:

```sh
npm run cache-gemini
```
The cache name printed should be pasted in your `.env` file under `GEMINI_CACHE`

## Temporal 
Temporal services are run either using Docker or using Temporal cloud for easy setup and management.

### Temporal on docker
To start all the necessary Temporal services (e.g., Temporal Server, UI, PostgreSQL, etc.), run the following command. 

```sh
docker compose --env-file .env up --build
```
This will build the necessary images and start the containers as defined in your compose.yml file, utilizing environment variables from your .env file.

The current code assumes you used the docker option.

### Temporal cloud
Signup to temporal cloud and get the following values from the dashboard and add them to the `.env`. Check the [docs](https://docs.temporal.io/cloud/get-started) on how to set this up. 

```sh
TEMPORAL_API_KEY=
TEMPORAL_NAMESPACE=
TEMPORAL_ADDRESS=
TEMPORAL_ACCOUNT_ID=
```
Once you have the above, you need to change the connections in two places:

1. Navigate to `backend/src/temporal/clientServices/client.ts` and use the following configs

```js
import { Connection, Client } from '@temporalio/client';

import * as config from '../../config/envVariables.config';
const { 
  temporalAPIKey,
  temporalNamespace,
  temporalAddress,
} = config;

export async function getWorkFlowClient() {
  try {
    const connectionOptions = {
      address: temporalAddress,
      tls:true,
      apiKey: temporalAPIKey,
    };
    const connection = await Connection.connect(connectionOptions);
    console.log(`🔄 Connecting to Temporal server at ${temporalAddress}...`);

    const workflowClient = new Client({
      connection,
      namespace: temporalNamespace,
    });
    console.log('✅ Connected to Temporal!');
    return workflowClient

  } catch (err) {
    console.error('❌ Failed to connect to Temporal server:', err);
    process.exit(1);
  }
}
```
2. Navigate to `backend/src/temporal/workers/worker.ts` and connect to temporal cloud:


```js
import path from 'path';
import { fileURLToPath } from 'url';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from '../activities/activities';
import * as config from '../../config/envVariables.config';
import { BUILD_A_TRADING_BOT } from '../shared/variables.shared';


const {
temporalAPIKey,
temporalNamespace,
temporalAddress
} = config;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function run() {
  console.log('🚀 Starting Temporal Worker...');
  console.log('🟡 Resolved __dirname:', __dirname);

  const workflowsPath = path.resolve(__dirname, '../workflows/workflows.ts'); // Use JS version
  console.log('📂 Workflows Path:', workflowsPath);



   // Add this console log for debugging API Key
  console.log('🔑 Using Temporal API Key:', temporalAPIKey ? '*****' : 'NOT SET');
  console.log('📍 Connecting to Temporal Address:', temporalAddress);
  console.log('📚 Using Temporal Namespace:', temporalNamespace);

  const connection = await NativeConnection.connect({
    address:temporalAddress,
    tls: true,
    apiKey: temporalAPIKey,
});
  console.log('✅ Connected to Temporal!');
  try {
    console.log('🛠️ Creating Worker...');

    const worker = await Worker.create({
      connection,
      namespace: temporalNamespace,
      taskQueue: BUILD_A_TRADING_BOT,
      workflowsPath,
      activities,
    });

    console.log('🟢 Worker is running...');
    await worker.run();
  } finally {
    console.log('❌ Closing connection...');
    await connection.close();
  }
}

run().catch((err) => {
  console.error('❌ Worker Failed:', err);
  process.exit(1);
});

```

## GCP bucket
To upload the generated code to a GCS bucket, you need to generate a service account file that has the necessary permissions for cloud storage. Save the file as `service_account.json` at the root level of the project.

Set the default bucket name the code should be uploaded to in the .env as `GCS_BUCKET_NAME`.


## Environmental Variables
Your full `.env` file should now look like this:

```sh
CONNECTION_STRING=
GCS_BUCKET_NAME=
GOOGLE_GENERATIVE_AI_API_KEY=
TEMPORAL_API_KEY=
TEMPORAL_NAMESPACE=
TEMPORAL_ADDRESS=
TEMPORAL_ACCOUNT_ID=
GEMINI_CACHE=
PORT=9090
# temporal docker compose environment variables
COMPOSE_PROJECT_NAME=temporal
TEMPORAL_VERSION=1.27.2
TEMPORAL_ADMINTOOLS_VERSION=1.27.2-tctl-1.18.2-cli-1.3.0
TEMPORAL_UI_VERSION=2.34.0
POSTGRESQL_VERSION=16
POSTGRES_PWD=temporal
POSTGRES_USER=temporal
POSTGRES_DEFAULT_PORT=5432
TEMPORAL_HOST=temporal
TEMPORAL_PORT=7233
REDIS_HOST=redis-docker-service
REDIS_PORT=6379
COMPOSE_BAKE=true
```
