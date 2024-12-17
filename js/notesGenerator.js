import { callGroqAPI } from './services/apiService.js';

export async function generateNotes(text) {
  return await callGroqAPI(text);
}