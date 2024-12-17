import { API_KEYS, API_ENDPOINTS } from '../config/constants.js';

export async function callVisionAPI(imageContent) {
  const response = await fetch(`${API_ENDPOINTS.VISION}?key=${API_KEYS.VISION_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ 
        image: { content: imageContent }, 
        features: [{ type: "TEXT_DETECTION" }] 
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Vision API error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function callGroqAPI(text) {
  if (!text.trim()) {
    throw new Error('No text content provided for summarization');
  }

  const prompt = {
    messages: [{
      role: "user",
      content: `Transform the following text into detailed, well-structured notes. Maintain the original content's depth while making it easier to understand. Use clear explanations and simple language where possible, but keep all important information:

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
    }],
    model: "mixtral-8x7b-32768",
    temperature: 1,
    top_p: 0.9,
    stream: false
  };

  try {
    const response = await fetch(API_ENDPOINTS.GROQ, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEYS.GROQ_API}`
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }
  
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }
    
    return formatGroqResponse(data.choices[0].message.content);
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate notes: ' + error.message);
  }
}

function formatGroqResponse(text) {
  return text
    // Remove excessive newlines first
    .replace(/\n{3,}/g, '\n\n')
    // Convert markdown headings to HTML if not already
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Handle bullet points
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Wrap consecutive list items
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Format bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Add minimal spacing between sections
    .replace(/<\/h[123]>/g, '$&\n')
    .replace(/<\/ul>/g, '$&\n')
    // Clean up any remaining multiple spaces or lines
    .replace(/\n{3,}/g, '\n\n')
    .replace(/  +/g, ' ')
    .trim();
}
