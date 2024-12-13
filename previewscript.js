let pdfDoc = null;
const pdfUpload = document.getElementById('pdfUpload');
const previewContainer = document.getElementById('previewContainer');
const ocrTextPreview = document.getElementById('ocrTextPreview');
const notesEditorContainer = document.getElementById('notesEditorContainer');
const splitOptions = document.getElementById('splitOptions');
const startPage = document.getElementById('startPage');
const endPage = document.getElementById('endPage');
const splitPdf = document.getElementById('splitPdf');
const ocrButton = document.getElementById('ocrButton');
const ocrControls = document.getElementById('ocrControls');
const notesButton = document.getElementById('notesButton');
const notesControls = document.getElementById('notesControls');
const loadingIndicator = document.getElementById('loadingIndicator');

import { performOCR } from './js/services/ocrService.js';
import { generateNotes } from './js/services/notesService.js';
import { initializeEditor, updateEditorContent } from './js/editor/notesEditor.js';

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

// Function to manage preview containers visibility
function showOnlyContainer(containerToShow) {
    // Hide all containers first
    previewContainer.style.display = 'none';
    ocrTextPreview.style.display = 'none';
    notesEditorContainer.style.display = 'none';

    // Show the specified container
    if (containerToShow) {
        containerToShow.style.display = 'block';
    }
}

pdfUpload.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        try {
            loadingIndicator.style.display = 'block';
            const arrayBuffer = await file.arrayBuffer();
            pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            // Show only PDF preview container
            showOnlyContainer(previewContainer);
            await renderAllPages();
            
            splitOptions.style.display = "block";
            ocrControls.style.display = "none";
            notesControls.style.display = "none";
        } catch (error) {
            console.error("Error loading PDF:", error);
            alert("Failed to load PDF. Please try again.");
        } finally {
            loadingIndicator.style.display = 'none';
        }
    } else {
        alert("Please upload a valid PDF file.");
    }
});

async function renderAllPages() {
    previewContainer.innerHTML = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const canvas = document.createElement("canvas");
        canvas.id = `pdfPage${i}`;
        previewContainer.appendChild(canvas);
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

splitPdf.addEventListener("click", async () => {
    const start = parseInt(startPage.value);
    const end = parseInt(endPage.value);

    if (isNaN(start) || isNaN(end) || start < 1 || end > pdfDoc.numPages || start > end) {
        alert("Invalid page range.");
        return;
    }

    try {
        loadingIndicator.style.display = 'block';
        showOnlyContainer(previewContainer);
        previewContainer.innerHTML = "";

        for (let i = start; i <= end; i++) {
            const canvas = document.createElement("canvas");
            canvas.id = `splitPage${i}`;
            previewContainer.appendChild(canvas);
            await renderPage(i, canvas);
        }

        ocrControls.style.display = "block";
    } catch (error) {
        console.error("Error splitting PDF:", error);
        alert("Failed to split PDF. Please try again.");
    } finally {
        loadingIndicator.style.display = 'none';
    }
});

ocrButton.addEventListener("click", async () => {
    try {
        loadingIndicator.style.display = 'block';
        const canvases = document.querySelectorAll('canvas');
        let fullText = '';

        for (const canvas of canvases) {
            const imageData = canvas.toDataURL('image/png').split(',')[1];
            const text = await performOCR(imageData);
            fullText += text + '\n\n';
        }

        // Show only OCR preview
        showOnlyContainer(ocrTextPreview);
        ocrTextPreview.innerHTML = `<h2>OCR Results</h2><pre>${fullText}</pre>`;
        
        notesControls.style.display = "block";
        ocrButton.dataset.ocrText = fullText;
    } catch (error) {
        console.error("OCR Error:", error);
        alert("Failed to perform OCR. Please try again.");
    } finally {
        loadingIndicator.style.display = 'none';
    }
});

notesButton.addEventListener("click", async () => {
    const ocrText = ocrButton.dataset.ocrText;
    if (!ocrText) {
        alert("Please perform OCR first.");
        return;
    }

    try {
        loadingIndicator.style.display = 'block';
        const notes = await generateNotes(ocrText);
        
        // Show only notes editor
        showOnlyContainer(notesEditorContainer);
        await updateEditorContent(notes);
    } catch (error) {
        console.error("Notes Generation Error:", error);
        alert("Failed to generate notes. Please try again.");
    } finally {
        loadingIndicator.style.display = 'none';
    }
});

document.getElementById('saveNotesButton').addEventListener('click', () => {
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
});
