import { API_KEYS, API_ENDPOINTS } from '../config/constants.js';

export async function generateNotes(text) {
  if (!text.trim()) {
    throw new Error('No text content provided for summarization');
  }

  const prompt = {
    model: "mixtral-8x7b-32768",
    contents: [{
      parts: [{
        text: `Transform the following text into detailed, well-structured notes. Maintain the original content's depth while making it easier to understand. Use clear explanations and simple language where possible, but keep all important information:

${text}

Guidelines for notes generation:
- Keep maximum information from the source text
- Maintain the original content's depth and detail
- Use clear section headings with <h2> tags
- Break down complex concepts into digestible parts
- Use bullet points (<ul> and <li>) for better readability
- Highlight key terms with <strong> tags
- Explain Difficult terms in simpler language using brackets '()' 
- Organize content logically with proper hierarchy
- Use examples where they help clarify concepts
- Keep formulas, cycles, flowcharts, tables etc as it is
- Include all relevant details, dates, numbers, and specific information`
      }]
    }],
    generationConfig: {
      temperature: 0.5,
      topK: 40,
      topP: 0.9 // Increased to allow for more detailed output
    }
  };

  const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt)
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }
  
  return formatGeminiResponse(data.candidates[0].content.parts[0].text);
}

function formatGeminiResponse(text) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/<\/h[123]>/g, '$&\n')
    .replace(/<\/ul>/g, '$&\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/  +/g, ' ')
    .trim();
}
