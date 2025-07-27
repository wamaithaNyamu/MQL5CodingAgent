import { Storage } from '@google-cloud/storage';
import type {GetSignedUrlConfig} from '@google-cloud/storage'
import fs from 'fs'; // Node.js File System module
import path from 'path'; // Node.js Path module
import { gcpBucketName } from '../../config/envVariables.config'; // Import your GCS bucket name from environment variables
// --- Configuration ---
// Define the path to your service account JSON file.
const SERVICE_ACCOUNT_KEY_FILE = 'service_account.json';
const SERVICE_ACCOUNT_KEY_PATH = path.join(process.cwd(), SERVICE_ACCOUNT_KEY_FILE);


let credentials;
let projectIdFromKey: string | undefined;

// Attempt to read and parse the service account key file
try {
  if (fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
    const serviceAccountKeyContent = fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, 'utf8');
    credentials = JSON.parse(serviceAccountKeyContent);

    // Basic validation to ensure it looks like a service account key
    if (!credentials.private_key || !credentials.client_email || !credentials.project_id) {
      throw new Error('Parsed JSON file is not a valid service account key. Missing private_key, client_email, or project_id.');
    }
    projectIdFromKey = credentials.project_id;
    console.log(`✅ Google Cloud Storage credentials loaded from ${SERVICE_ACCOUNT_KEY_FILE}.`);
  } else {
    console.warn(`⚠️ Service account key file not found at ${SERVICE_ACCOUNT_KEY_PATH}.`);
    console.warn("Relying on Application Default Credentials (ADC) or GOOGLE_APPLICATION_CREDENTIALS environment variable.");
  }
} catch (error: any) {
  console.error(`❌ Error processing service account key file ${SERVICE_ACCOUNT_KEY_FILE}:`, error.message);
 
}


// Creates a client using the parsed credentials or falls back to ADC
const storage = new Storage({
  projectId: projectIdFromKey, // Use the project ID from the key file if loaded
  credentials: credentials,    // Pass the parsed JSON object directly
});

export async function generateV4ReadSignedUrl(
  fileName: string,
  bucketName: string = gcpBucketName
): Promise<string> {
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read' as const,
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const file = storage.bucket(bucketName).file(fileName);

  try {
    // Check if the file exists
    const [exists] = await file.exists();

    if (!exists) {
      const errorMessage = `File not found in GCS: gs://${bucketName}/${fileName}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // If the file exists, proceed to generate the signed URL
    const [url] = await file.getSignedUrl(options);

    return url;
  } catch (error: any) {
    console.error(`❌ Error generating signed URL for ${fileName} in bucket ${bucketName}:`, error);
    // Re-throw the original error, or a more specific one if needed
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

// --- Upload to GCS ---
export async function uploadBotToGCS(
  localFilePath: string,
  destinationFileName: string,
bucketName: string = gcpBucketName,

): Promise<string | void> {
  console.log(`⬆️ Attempting to upload ${localFilePath} to gs://${bucketName}/${destinationFileName}`);

  // 1. Validate if the local file exists
  if (!fs.existsSync(localFilePath)) {
    const errorMsg = `Local file not found at: ${localFilePath}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 2. Get references to the bucket and the destination file (blob)
  const bucket = storage.bucket(bucketName);

  try {
    // 3. Perform the upload
    await bucket.upload(localFilePath, {
      destination: destinationFileName,
      metadata: {
        contentType: 'application/octet-stream', // Appropriate MIME type for compiled executables
      },
    });

    console.log(`✅ Successfully uploaded ${localFilePath} to gs://${bucketName}/${destinationFileName}`);
    return `${bucketName}/${destinationFileName}`
  } catch (error: any) {
    console.error(`❌ Error uploading file ${localFilePath} to GCS:`, error);
    throw new Error(`Failed to upload file to GCS: ${error.message}`);
  }
}

