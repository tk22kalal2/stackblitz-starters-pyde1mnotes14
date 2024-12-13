import { performOCR } from './ocrService.js';
import { generateNotes } from './notesService.js';

export async function processPageByPage(pdfBytes) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  let combinedNotes = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    // Process one page at a time
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page to canvas
    await page.render({ canvasContext: context, viewport }).promise;
    
    // Perform OCR on the page
    const imageData = canvas.toDataURL("image/png").split(",")[1];
    const ocrText = await performOCR(imageData);
    
    // Generate notes for this page
    if (ocrText.trim()) {
      const pageNotes = await generateNotes(
        `Page ${i}:\n${ocrText}`
      );
      combinedNotes += `<h2>Page ${i}</h2>${pageNotes}\n\n`;
    }
  }

  return combinedNotes;
}
