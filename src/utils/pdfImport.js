import * as pdfjsLib from 'pdfjs-dist/build/pdf.min';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

// Set the worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Parse PDF file and extract text content
 * @param {File} file - PDF file to parse
 * @returns {Promise<string>} - Extracted text content
 */
export const parsePDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Extract import data from PDF text content
 * This is a simplified implementation - in a real scenario, you would need
 * to parse the specific format of your PDF import documents
 * @param {string} text - Text content extracted from PDF
 * @returns {Object} - Parsed import data
 */
export const extractImportDataFromPDF = (text) => {
  // This is a placeholder implementation
  // In a real implementation, you would parse the actual PDF format

  // Example of what you might extract:
  const importData = {
    imp_date: new Date().toISOString().split('T')[0], // Default to today
    staff_id: null,
    sup_id: null,
    supplier: '',
    total: 0,
    import_details: []
  };

  // Simple regex-based extraction (this would need to be customized for your PDF format)
  const dateMatch = text.match(/Date[:\s]*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i);
  if (dateMatch) {
    importData.imp_date = dateMatch[1];
  }

  const supplierMatch = text.match(/Supplier[:\s]*([^\n\r]+)/i);
  if (supplierMatch) {
    importData.supplier = supplierMatch[1].trim();
  }

  // Extract product lines (this is highly dependent on PDF format)
  const productLines = text.match(/Product[:\s]*.*?Qty[:\s]*\d+.*?Price[:\s]*[\d.]+/gi);
  if (productLines) {
    productLines.forEach(line => {
      const productMatch = line.match(/Product[:\s]*([^\n\r:]+?)\s*Qty[:\s]*(\d+)\s*Price[:\s]*([\d.]+)/i);
      if (productMatch) {
        importData.import_details.push({
          pro_code: null, // Would need to map product names to codes
          pro_name: productMatch[1].trim(),
          qty: parseInt(productMatch[2]),
          price: parseFloat(productMatch[3]),
          amount: parseInt(productMatch[2]) * parseFloat(productMatch[3]),
          batch_number: '',
          expiration_date: ''
        });
      }
    });
  }

  // Calculate total
  importData.total = importData.import_details.reduce((sum, detail) => sum + detail.amount, 0);

  return importData;
};
