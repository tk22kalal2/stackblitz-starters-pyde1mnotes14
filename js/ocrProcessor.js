import { callVisionAPI } from './services/apiService.js';

export async function performOCR(pdfBytes) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    const image = canvas.toDataURL("image/png").split(",")[1];

    const result = await callVisionAPI(image);
    text += (result.responses[0]?.fullTextAnnotation?.text || "") + "\n";
  }
  return text;
}