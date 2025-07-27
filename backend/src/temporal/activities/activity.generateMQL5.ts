import fs from 'fs';
import path from 'path';
import { uploadBotToGCS } from '../../server/utils/utils.uploadToGCS';



export interface GeneralError {
  error: string;
}

export interface MessageResult {
  message: string;
}

export interface SaveGeneratedCodeResult {
  success: boolean;
  results: (GeneralError[]|MessageResult[]);// Array of results, each can be a message or an error
  signedUrl?: string | null; // Optional signed URL for the uploaded bot
}

export async function saveGeneratedCodeFunction(botName: string, code: string): Promise<SaveGeneratedCodeResult> {
  console.log(`📝 Saving generated code for bot: ${botName}`)
  code = code.trim(); // Ensure no leading/trailing whitespace
  const baseDir = path.join(process.cwd(),"Experts/AIGENERATED");
  // Ensure the botName ends with .mq5 extension
  if (!botName.endsWith('.mq5')) {
    botName += '.mq5';
  }

  // Construct the full path for the .mq5 file
  const fullPath = path.join(baseDir, botName);
  console.log(`📂 Full path for saving code: ${fullPath}`);
  try {
    // Ensure the directory exists before writing the file
    const directory = path.dirname(fullPath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`📁 Created directory: ${directory}`);
    }

    // Save the MQL5 code to the specified file path
    fs.writeFileSync(fullPath, code);
    console.log(`✅ Code saved to ${fullPath}`);


    // Upload the .mq5 file to GCS
    try {
      console.log(`⬆️ Uploading .mq5 file to GCS: ${botName}`);
      // The file to upload is the .mq5 source code itself
      const gcsPath = await uploadBotToGCS(fullPath, botName); // Upload the .mq5 file
      console.log(`✅ .mq5 file uploaded to GCS at: ${gcsPath}`);

  
      return {
        success: true,
        results: [
          { message: `Code saved and uploaded successfully. GCS Path: ${gcsPath}` }
        ]
      };
    } catch (uploadError: any) {
      console.error(`❌ Error uploading bot to GCS: ${uploadError.message || uploadError}`);
      return {
        success: false,
        results: [{ error: `Failed to upload bot to GCS: ${uploadError.message || uploadError}` }]
      };
    }
  } catch (saveError: any) {
    console.error(`❌ Error saving code to file: ${saveError.message || saveError}`);
    return {
      success: false,
      results: [
        { error: `Failed to save code to file: ${saveError.message || saveError}` }
      ]
    };
  }
}



