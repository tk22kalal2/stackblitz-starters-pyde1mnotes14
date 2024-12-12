// State management
let pdfDoc = null;
let currentView = 'upload'; // Possible values: 'upload', 'split', 'ocr', 'notes'

// DOM Elements
const elements = {
  pdfUpload: document.getElementById('pdfUpload'),
  previewContainer: document.getElementById('previewContainer'),
  splitOptions: document.getElementById('splitOptions'),
  startPage: document.getElementById('startPage'),
  endPage: document.getElementById('endPage'),
  splitPdf: document.getElementById('splitPdf'),
  ocrButton: document.getElementById('ocrButton'),
  ocrControls: document.getElementById('ocrControls'),
  notesButton: document.getElementById('notesButton'),
  notesControls: document.getElementById('notesControls'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  notesEditorContainer: document.getElementById('notesEditorContainer'),
  ocrTextPreview: document.getElementById('ocrTextPreview')
};

// Initialize TinyMCE
tinymce.init({
  selector: '#notesEditor',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | help',
  height: 500,
  readonly: false
});

// Event Listeners
elements.pdfUpload.addEventListener("change", handleFileUpload);
elements.splitPdf.addEventListener("click", handleSplitPDF);
elements.ocrButton.addEventListener("click", handleOCR);
elements.notesButton.addEventListener("click", handleNotesGeneration);
document.getElementById('saveNotesButton').addEventListener('click', handleSaveNotes);

// File Upload Handler
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Please upload a valid PDF file.");
    return;
  }

  try {
    showLoading();
    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    // Show PDF preview and split controls
    await renderPDFPreview();
    showSplitControls();
    setView('split');
  } catch (error) {
    console.error("Error loading PDF:", error);
    alert("Failed to load PDF. Please try again.");
  } finally {
    hideLoading();
  }
}

// PDF Rendering
async function renderPDFPreview() {
  elements.previewContainer.innerHTML = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const canvas = document.createElement("canvas");
    canvas.id = `pdfPage${i}`;
    elements.previewContainer.appendChild(canvas);
    await renderPage(i, canvas);
  }
}

async function renderPage(pageNumber, canvas) {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  } catch (error) {
    console.error(`Error rendering page ${pageNumber}:`, error);
  }
}

// Split PDF Handler
async function handleSplitPDF() {
  const start = parseInt(elements.startPage.value);
  const end = parseInt(elements.endPage.value);

  if (isNaN(start) || isNaN(end) || start < 1 || end > pdfDoc.numPages || start > end) {
    alert("Invalid page range.");
    return;
  }

  try {
    showLoading();
    elements.previewContainer.innerHTML = "";
    
    for (let i = start; i <= end; i++) {
      const canvas = document.createElement("canvas");
      canvas.id = `splitPage${i}`;
      elements.previewContainer.appendChild(canvas);
      await renderPage(i, canvas);
    }
    
    showOCRControls();
    setView('ocr');
  } catch (error) {
    console.error("Error splitting PDF:", error);
    alert("Failed to split PDF. Please try again.");
  } finally {
    hideLoading();
  }
}

// OCR Handler
async function handleOCR() {
  try {
    showLoading();
    const canvases = document.querySelectorAll('canvas');
    let fullText = '';

    for (const canvas of canvases) {
      const imageData = canvas.toDataURL('image/png').split(',')[1];
      const text = await performOCR(imageData);
      fullText += text + '\n\n';
    }

    hideAllContainers();
    elements.ocrTextPreview.innerHTML = `<h2>OCR Results</h2><pre>${fullText}</pre>`;
    elements.ocrTextPreview.style.display = "block";
    showNotesControls();
    elements.ocrButton.dataset.ocrText = fullText;
    setView('notes');
  } catch (error) {
    console.error("OCR Error:", error);
    alert("Failed to perform OCR. Please try again.");
  } finally {
    hideLoading();
  }
}

// Notes Generation Handler
async function handleNotesGeneration() {
  const ocrText = elements.ocrButton.dataset.ocrText;
  if (!ocrText) {
    alert("Please perform OCR first.");
    return;
  }

  try {
    showLoading();
    const notes = await generateNotes(ocrText);
    hideAllContainers();
    elements.notesEditorContainer.style.display = "block";
    await updateEditorContent(notes);
    setView('editor');
  } catch (error) {
    console.error("Notes Generation Error:", error);
    alert("Failed to generate notes. Please try again.");
  } finally {
    hideLoading();
  }
}

// Save Notes Handler
function handleSaveNotes() {
  const content = tinymce.get('notesEditor').getContent();
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'processed-notes.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// UI State Management
function setView(view) {
  currentView = view;
  updateUIState();
}

function updateUIState() {
  hideAllContainers();
  switch (currentView) {
    case 'upload':
      elements.previewContainer.style.display = 'block';
      break;
    case 'split':
      elements.previewContainer.style.display = 'block';
      elements.splitOptions.style.display = 'block';
      break;
    case 'ocr':
      elements.previewContainer.style.display = 'block';
      elements.ocrControls.style.display = 'block';
      break;
    case 'notes':
      elements.ocrTextPreview.style.display = 'block';
      elements.notesControls.style.display = 'block';
      break;
    case 'editor':
      elements.notesEditorContainer.style.display = 'block';
      break;
  }
}

function hideAllContainers() {
  elements.previewContainer.style.display = 'none';
  elements.splitOptions.style.display = 'none';
  elements.ocrControls.style.display = 'none';
  elements.ocrTextPreview.style.display = 'none';
  elements.notesControls.style.display = 'none';
  elements.notesEditorContainer.style.display = 'none';
}

// Loading State Management
function showLoading() {
  elements.loadingIndicator.style.display = 'block';
}

function hideLoading() {
  elements.loadingIndicator.style.display = 'none';
}

// Control Visibility
function showSplitControls() {
  elements.splitOptions.style.display = "block";
}

function showOCRControls() {
  elements.ocrControls.style.display = "block";
}

function showNotesControls() {
  elements.notesControls.style.display = "block";
}
