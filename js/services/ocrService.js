import { API_KEYS, API_ENDPOINTS } from '../config/constants.js';

export async function performOCR(imageData) {
    try {
        const response = await fetch(`${API_ENDPOINTS.VISION}?key=${API_KEYS.VISION_API}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [{
                    image: {
                        content: imageData
                    },
                    features: [{
                        type: 'TEXT_DETECTION'
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Vision API request failed');
        }

        const data = await response.json();
        return data.responses[0]?.fullTextAnnotation?.text || '';
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to perform OCR');
    }
}