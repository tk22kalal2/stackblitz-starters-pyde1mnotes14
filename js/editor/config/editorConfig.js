import { API_KEYS } from '../../config/constants.js';

export const editorConfig = {
  selector: '#notesEditor',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'fontsize', 'fontfamily'
  ],
  toolbar: [
    'undo redo | fontfamily fontsize | styles | bold italic forecolor backcolor',
    'alignleft aligncenter alignright alignjustify | bullist numlist | image | removeformat'
  ],
  font_family_formats: 
    'Arial=arial,helvetica,sans-serif;' +
    'Arial Black=arial black,avant garde;' +
    'Book Antiqua=book antiqua,palatino;' +
    'Comic Sans MS=comic sans ms,sans-serif;' +
    'Courier New=courier new,courier;' +
    'Georgia=georgia,palatino;' +
    'Helvetica=helvetica;' +
    'Impact=impact,chicago;' +
    'Tahoma=tahoma,arial,helvetica,sans-serif;' +
    'Terminal=terminal,monaco;' +
    'Times New Roman=times new roman,times;' +
    'Trebuchet MS=trebuchet ms,geneva;' +
    'Verdana=verdana,geneva',
  font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
  height: 500,
  menubar: true,
  image_title: true,
  automatic_uploads: true,
  file_picker_types: 'image',
  content_style: `
    body { 
      font-family: Arial, sans-serif; 
      font-size: 14px; 
      margin: 15px;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  `,
  branding: false,
  promotion: false,
  readonly: false,
  inline: false,
  verify_html: false,
  forced_root_block: 'p',
  remove_script_host: true,
  convert_urls: false,
  relative_urls: false,
  skin: 'oxide',
  resize: true,
  statusbar: true,
  elementpath: true,
  contextmenu: 'link image table',
  extended_valid_elements: 'img[class|src|border=0|alt|title|width|height|style]',
  api_key: API_KEYS.TINYMCE_API
};