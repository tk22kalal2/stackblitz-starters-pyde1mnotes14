export function showLoading(loadingElement) {
  loadingElement.style.display = "block";
}

export function hideLoading(loadingElement) {
  loadingElement.style.display = "none";
}

export function updatePreview(previewElement, title, content) {
  previewElement.innerHTML = `<h2>${title}</h2><pre>${content}</pre>`;
}

export function showError(previewElement, message) {
  previewElement.innerHTML = `<div style="color: red;">${message}</div>`;
}