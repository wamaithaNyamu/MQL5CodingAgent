import { Connection, Client } from '@temporalio/client';

import * as config from '../../config/envVariables.config';
const { 
  temporalAPIKey,
  temporalNamespace,
  temporalAddress,
  temporalHost, // Uncomment if using host
  temporalPort, // Uncomment if using port
} = config;

export async function getWorkFlowClient() {
  try {
  //   const connectionOptions = {
  //     address: temporalAddress,
  //     tls:true,
  //     apiKey: temporalAPIKey,
  //   };
  // const connection = await Connection.connect(connectionOptions);

    // Connect to local Temporal Server
    const temporalAddress = `${temporalHost}:${temporalPort}`;
    const connection = await Connection.connect({ address:  temporalAddress });

    console.log(`🔄 Connecting to Temporal server at ${temporalAddress}...`);

    // Health check: Ensure the server is available
    const workflowClient = new Client({ connection });
    // const workflowClient = new Client({
    //   connection,
    //   namespace: temporalNamespace,
    // });
    console.log('✅ Connected to Temporal!');
    return workflowClient

  } catch (err) {
    console.error('❌ Failed to connect to Temporal server:', err);
    process.exit(1);
  }
}

