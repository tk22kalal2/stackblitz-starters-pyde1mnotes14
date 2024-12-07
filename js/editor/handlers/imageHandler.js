export function createImagePickerCallback() {
  return function (callback, value, meta) {
    if (meta.filetype === 'image') {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.onchange = function () {
        const file = this.files[0];
        
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
          console.error('Selected file is not an image');
          return;
        }

        const reader = new FileReader();
        reader.onload = function () {
          const id = 'blobid' + (new Date()).getTime();
          const blobCache = tinymce.activeEditor.editorUpload.blobCache;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          callback(blobInfo.blobUri(), { 
            title: file.name,
            alt: file.name 
          });
        };
        reader.onerror = function () {
          console.error('Failed to read file');
        };
        reader.readAsDataURL(file);
      };

      input.click();
    }
  };
}