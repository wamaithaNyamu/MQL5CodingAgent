/**
 * Sanitizes the response content to ensure it's valid JSON.
 * Removes code block markers and extracts the main JSON object.
 * @param responseContent - The raw response content to sanitize.
 * @returns Cleaned and extracted JSON string.
 */
export function sanitizeJsonResponse(responseContent: string): string {
  // Step 1: Remove markdown code block markers
  let cleanedContent = responseContent
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Step 2: Find the boundaries of the main JSON object
  // This is crucial for handling cases where LLM might output text before or after the JSON.
  const firstBraceIndex = cleanedContent.indexOf('{');
  const lastBraceIndex = cleanedContent.lastIndexOf('}');

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex < firstBraceIndex) {
    // If no valid JSON object (or an incomplete one) is found after initial cleaning,
    // we might have a serious issue or unexpected response format.
    // For now, return the cleanedContent and let JSON.parse throw a more specific error
    // if it's truly not JSON. You might want to throw an error here too
    // if you strictly expect JSON.
    return cleanedContent;
  }

  // Step 3: Extract only the content between and including the first '{' and last '}'
  // This effectively discards any text before the first '{' or after the last '}'.
  const jsonString = cleanedContent.substring(firstBraceIndex, lastBraceIndex + 1);

  return jsonString;
}

/**
 * Parses a JSON string and returns it as a JavaScript object.
 * @param responseContent - The raw JSON string to parse.
 * @returns Parsed object.
 * @throws Error if the JSON is invalid.
 */
export function parseJsonResponse(responseContent: string): Record<string, any> {
  try {
    // Always sanitize before parsing to handle unexpected LLM output
    const sanitizedContent = sanitizeJsonResponse(responseContent);
    // console.log('Attempting to parse sanitized JSON:', sanitizedContent); // For debugging

    const data = JSON.parse(sanitizedContent);
    // console.log('Successfully parsed JSON data:', data); // For debugging
    return data;
  } catch (e) {
    console.error('Invalid JSON encountered during parsing:', e);
    // Re-throw with a more informative message if needed
    throw new Error(`Failed to parse JSON response. Details: ${(e as Error).message}`);
  }
}