
import {
  GoogleGenAI
} from "@google/genai";

import {geminiAPIKey} from "../../config/envVariables.config"
if (!geminiAPIKey) {
  throw new Error("geminiAPIKey is not set. Please set it in your environment variables.");
}


const ai = new GoogleGenAI({ apiKey: geminiAPIKey});
// import system prompts
import { systemPrompt } from "../../temporal/prompts/systemPrompt.prompts";
import {codeTradingBotMQL5Goal} from "../../temporal/goals/codeTradingBot.goals"

export const SetGeminiCacheForCodeTradingBotMQL5Goal = async (): Promise<string> => {
  try {
    console.log("Setting cache for Code Trading Bot MQL5 Goal...");
    const modelName = "gemini-2.0-flash-001"; // Ensure this matches the model used for generations

    // Fetch the system prompt content
    const systemPromptContent = await systemPrompt(codeTradingBotMQL5Goal);

    console.log("System prompt content fetched successfully.");

    // Create the cache with the explicit name and TTL
    const cache = await ai.caches.create({
      model: modelName,
      config: {
        systemInstruction: systemPromptContent,
        ttl: `${7*24 * 3600}s`, // 7 days in seconds
      },
    });

    // this name will be used in the .env file as geminiCache
    console.log("Cache created:", cache.name);
  
    return cache.name ?? ""; // Return the full resource name of the cache

  } catch (error) {
      console.error(`Error setting cache: ${error}`);
    throw error;
  }
};



export const getAllCache = async (): Promise<string[]> => {
  try {
    console.log("Fetching all caches:"); // More descriptive log
    const cacheNames: string[] = []; // Array to store all cache names

    const pager = await ai.caches.list({ config: { pageSize: 10 } });
    let page = pager.page;

    while (true) {
      for (const c of page) {
        if (c.name) { // Ensure 'c.name' exists before adding
          console.log("##",c.name); // Still useful for immediate debugging
          cacheNames.push(c.name); // Add the cache name to the array
        }
      }
      if (!pager.hasNextPage()) {
        break; // No more pages, exit loop
      }
      page = await pager.nextPage(); // Fetch the next page
    }

    console.log(`Successfully fetched ${cacheNames.length} caches.`);
    
    return cacheNames; // Return the array of cache names

  } catch (error) {
    console.error(`Error fetching caches: ${error}`);
    // Re-throw the error so calling functions can handle it
    throw error;
  }
};

export const deleteCache = async (): Promise<void> => {
  try {
    // get all caches first
    const allCaches = await getAllCache();
    for (const name of allCaches) {
    console.log("Cache Name:", name); // Log each cache name
    console.log(`Deleting cache: ${name}`);
    await ai.caches.delete({ name: name });  
    console.log(`Cache ${name} deleted successfully.`);
    }
  } catch (error) {
    console.error(`Error deleting cache : ${error}`);   
    // Re-throw the error so calling functions can handle it
    throw error;
  } 
}

// set new cache and delete old cache
await SetGeminiCacheForCodeTradingBotMQL5Goal().then(cacheName => {
  console.log(`Cache set successfully with name: ${cacheName}`);
}).catch(err => {
  console.error("Failed to set cache:", err);
});


// await deleteCache().then(() => {
//   console.log("Old cache deleted successfully.");
// }).catch(err => {
//   console.error("Failed to delete old cache:", err);      
// });

// await getAllCache()






