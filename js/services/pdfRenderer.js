import { PDFDocumentProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';

export async function renderPdf(pdfBytes, container) {
  try {
    // Clear the container and ensure it's visible
    container.innerHTML = '';
    container.style.display = 'block';
    
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    
    // Create a PDF container div
    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-container';
    container.appendChild(pdfContainer);
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Use a scale that fits well within the container
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Add styles to canvas
      canvas.style.margin = '5px';
      canvas.style.border = '1px solid #ddd';
      
      // Render PDF page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      pdfContainer.appendChild(canvas);
    }
    
    return true;
  } catch (error) {
    console.error('Error rendering PDF:', error);
    container.innerHTML = '<div class="error">Error rendering PDF. Please try again.</div>';
    return false;
  }
}