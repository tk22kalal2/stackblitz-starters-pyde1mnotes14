import { callGeminiAPI } from './services/apiService.js';

export async function generateNotes(text) {
  return await callGeminiAPI(text);
}