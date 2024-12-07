import { showError } from '../utils/uiHelpers.js';

export class PDFPreviewService {
  constructor() {
    this.previewContainer = document.getElementById('previewContainer');
    this.pdfDoc = null;
  }

  async loadPDF(arrayBuffer) {
    try {
      this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
      return true;
    } catch (error) {
      console.error('Error loading PDF:', error);
      showError(this.previewContainer, 'Failed to load the PDF. Please try again.');
      return false;
    }
  }

  async renderAllPages() {
    if (!this.pdfDoc) return;
    
    this.previewContainer.innerHTML = '';
    
    for (let i = 1; i <= this.pdfDoc.numPages; i++) {
      const canvas = document.createElement('canvas');
      canvas.id = `pdfPage${i}`;
      this.previewContainer.appendChild(canvas);
      await this.renderPage(i, canvas);
    }
  }

  async renderPageRange(start, end) {
    if (!this.pdfDoc) return;
    
    if (!this.validatePageRange(start, end)) {
      showError(this.previewContainer, 'Invalid page range.');
      return false;
    }

    this.previewContainer.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
      const canvas = document.createElement('canvas');
      canvas.id = `splitPage${i}`;
      this.previewContainer.appendChild(canvas);
      await this.renderPage(i, canvas);
    }
    
    return true;
  }

  async renderPage(pageNumber, canvas) {
    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
      canvas.remove();
    }
  }

  validatePageRange(start, end) {
    return !isNaN(start) && 
           !isNaN(end) && 
           start >= 1 && 
           end <= this.pdfDoc.numPages && 
           start <= end;
  }

  getTotalPages() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }

  clear() {
    this.previewContainer.innerHTML = '';
    this.pdfDoc = null;
  }
}