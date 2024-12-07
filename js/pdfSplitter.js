export async function splitPdf(pdfBytes, start, end) {
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const newPdf = await PDFLib.PDFDocument.create();
  
  for (let i = start - 1; i < end; i++) {
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
  }
  
  return await newPdf.save();
}