const { GoogleGenAI } = require('@google/genai');
const logger = require('./logger');

let clientInstance;

function getClient() {
  if (clientInstance) return clientInstance;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }

  try {
    clientInstance = new GoogleGenAI(apiKey);
    return clientInstance;
  } catch (err) {
    const error = new Error(`Failed to initialize GoogleGenAI client: ${err.message}`);
    error.statusCode = 500;
    throw error;
  }
}

/**
 * Call Google Gemini with a simple text prompt.
 * Returns clean text output only.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callGemini(prompt) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    const error = new Error('Prompt must be a non-empty string');
    error.statusCode = 400;
    throw error;
  }

  try {
    const client = getClient();

    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = result?.text || '';

    return String(text).trim();
  } catch (err) {
    logger.error('Gemini API error:', err);
    logger.error('Error details:', {
      message: err.message,
      status: err.status,
      name: err.name
    });

    const error = new Error(
      err.message || 'Failed to generate content with Gemini'
    );
    error.statusCode = err.status || 502;
    throw error;
  }
}

module.exports = {
  callGemini
};

