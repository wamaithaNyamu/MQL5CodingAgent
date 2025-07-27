import path from 'path';
import { fileURLToPath } from 'url';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from '../activities/activities';
import * as config from '../../config/envVariables.config';
import { BUILD_A_TRADING_BOT } from '../shared/variables.shared';


const {
   temporalAPIKey,
temporalNamespace,
temporalAddress,
temporalHost, // Uncomment if using host
temporalPort, // Uncomment if using port

} = config;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function run() {
  console.log('🚀 Starting Temporal Worker...');
  console.log('🟡 Resolved __dirname:', __dirname);

  const workflowsPath = path.resolve(__dirname, '../workflows/workflows.ts'); // Use JS version
  console.log('📂 Workflows Path:', workflowsPath);

  console.log(`📡 Connecting to Temporal at  ${temporalHost}:${temporalPort}...`);
  const connection = await NativeConnection.connect({
    address: `${temporalHost}:${temporalPort}`,
  });

   // Add this console log for debugging API Key
  // console.log('🔑 Using Temporal API Key:', temporalAPIKey ? '*****' : 'NOT SET');
  // console.log('📍 Connecting to Temporal Address:', temporalAddress);
  // console.log('📚 Using Temporal Namespace:', temporalNamespace);

//   const connection = await NativeConnection.connect({
//     address:temporalAddress,
//     tls: true,
//     apiKey: temporalAPIKey,
// });
  console.log('✅ Connected to Temporal!');
  try {
    console.log('🛠️ Creating Worker...');

    const worker = await Worker.create({
      connection,
      namespace: 'default',
      // namespace: temporalNamespace,
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
