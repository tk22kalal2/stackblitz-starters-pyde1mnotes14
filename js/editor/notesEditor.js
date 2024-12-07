import { editorConfig } from './config/editorConfig.js';
import { createImagePickerCallback } from './handlers/imageHandler.js';

export function initializeEditor() {
  return tinymce.init({
    ...editorConfig,
    setup: function(editor) {
      editor.on('init', function() {
        editor.getBody().setAttribute('contenteditable', true);
      });
    },
    file_picker_callback: createImagePickerCallback(),
    readonly: false // Explicitly set readonly to false
  });
}

export async function updateEditorContent(content) {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50;
    let attempts = 0;
    
    const checkEditor = setInterval(() => {
      const editor = tinymce.get('notesEditor');
      if (editor) {
        clearInterval(checkEditor);
        editor.setContent(content);
        editor.setMode('design'); // Ensure editor is in editable mode
        editor.getBody().setAttribute('contenteditable', true);
        resolve(editor);
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(checkEditor);
        reject(new Error('Failed to initialize TinyMCE editor'));
      }
    }, 100);
  });
}

export function getEditorContent() {
  const editor = tinymce.get('notesEditor');
  return editor ? editor.getContent() : '';
}

export function destroyEditor() {
  const editor = tinymce.get('notesEditor');
  if (editor) {
    editor.destroy();
  }
}