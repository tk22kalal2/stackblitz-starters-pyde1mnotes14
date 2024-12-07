import { setupEventListeners } from './utils/eventHandlers.js';
import { initializeEditor } from './editor/notesEditor.js';

export function initializeApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupApplication);
  } else {
    setupApplication();
  }
}

function setupApplication() {
  const elements = {
    pdfUpload: document.getElementById("pdfUpload"),
    pdfPreview: document.getElementById("pdfPreview"),
    splitPreview: document.getElementById("splitPreview"),
    splitControls: document.getElementById("splitControls"),
    ocrControls: document.getElementById("ocrControls"),
    splitButton: document.getElementById("splitButton"),
    ocrButton: document.getElementById("ocrButton"),
    notesButton: document.getElementById("notesButton"),
    startPage: document.getElementById("startPage"),
    endPage: document.getElementById("endPage"),
    ocrTextPreview: document.getElementById("ocrTextPreview"),
    loadingIndicator: document.getElementById("loadingIndicator"),
    notesControls: document.getElementById("notesControls"),
    notesEditorContainer: document.getElementById("notesEditorContainer")
  };

  if (!validateElements(elements)) {
    console.error('Required DOM elements not found');
    return;
  }
  
  setupEventListeners(elements);
  initializeEditor();
}

function validateElements(elements) {
  return Object.values(elements).every(element => element !== null);
}