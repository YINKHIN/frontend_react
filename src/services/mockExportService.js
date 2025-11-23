// Mock Export Service - Temporary solution until Laravel API endpoints are created
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const mockExportService = {
  // Generate Excel file from data
  generateExcel: (data, filename, type = "import") => {
    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Process data based on type
      const excelData = processExportData(data, type);

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        type === "import" ? "Import Report" : "Sales Report"
      );

      // Generate Excel file
      XLSX.writeFile(wb, filename);

      return { success: true, message: "Excel file generated successfully" };
    } catch (error) {
      console.error("Excel generation error:", error);
      return { success: false, error: error.message };
    }
  },

  // Generate PDF file from data
  generatePDF: (data, filename, type = "import") => {
    try {
      console.log(`Generating PDF for ${type}:`, {
        filename,
        dataLength: data.length,
        sampleData: data.slice(0, 2),
      });

      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text(type === "import" ? "Import Report" : "Sales Report", 20, 20);

      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Records: ${data.length}`, 20, 35);
      doc.text(`Data Source: ${getDataSourceInfo(data)}`, 20, 40);

      // Process data for PDF table
      const { tableData, headers } = preparePDFTableData(data, type);

      // Add table or no data message
      if (data.length === 0) {
        addNoDataMessage(doc);
      } else {
        doc.autoTable({
          head: [headers],
          body: tableData,
          startY: 55,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] },
        });
      }

      // Save PDF
      doc.save(filename);

      return { success: true, message: "PDF file generated successfully" };
    } catch (error) {
      console.error("PDF generation error:", error);
      return { success: false, error: error.message };
    }
  },

  // Generate Word-like HTML file from data
  generateWord: (data, filename, type = "import") => {
    try {
      // Validate input data
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      // Process data for Word export
      const processedData = processExportData(data, type);

      // Generate HTML content
      const htmlContent = generateHTMLContent(processedData, type);

      // Create and download file
      downloadHTMLFile(htmlContent, filename);

      return {
        success: true,
        message: "Word-like HTML file generated successfully",
      };
    } catch (error) {
      console.error("Word generation error:", error);
      return { success: false, error: error.message };
    }
  },
};

// Helper functions
const processExportData = (data, type) => {
  return data
    .map((item) => {
      if (type === "import") {
        return processImportData(item);
      } else {
        return processSalesData(item);
      }
    })
    .flat()
    .filter((item) => item != null);
};

const processImportData = (item) => {
  // Try to get product name from multiple sources
  const productName = item.product_name || item.pro_name || item.product?.pro_name || "Unknown Product";
  
  // Calculate quantity and amount properly
  const qty = item.qty || item.quantity || 0;
  let amount = item.amount || item.price || item.total || 0;
  
  // If amount is 0 but we have qty and price, calculate it
  if (amount == 0 && qty > 0 && (item.price || item.unit_price)) {
    amount = qty * (item.price || item.unit_price);
  }
  
  // Get batch number with better fallback
  const batchNumber = item.batch_number || item.batchNumber || item.batch || "N/A";
  
  // Get expiration date with better fallback
  const expirationDate = item.expiration_date || item.expirationDate || item.expiry || "N/A";
  
  // Get staff name with better fallback
  const staffName = item.staff_name || item.full_name || item.staff?.full_name || "Unknown Staff";
  
  // Get supplier name with better fallback
  const supplierName = item.supplier_name || item.supplier || item.supplier?.supplier || "Unknown Supplier";
  
  return {
    ID: item.id || "N/A",
    Date: item.imp_date ? formatDate(new Date(item.imp_date)) : "N/A",
    Staff: staffName,
    Supplier: supplierName,
    "Product Name": productName,
    Qty: qty,
    Amount: formatCurrency(amount),
    "Batch Number": batchNumber,
    "Expiration Date": expirationDate !== "N/A" ? formatDate(new Date(expirationDate)) : "N/A",
    Status: item.status || "completed",
  };
};

const processSalesData = (item) => {
  // Try to get product name from multiple sources
  const productName = item.product_name || item.pro_name || item.product?.pro_name || "Unknown Product";
  
  // Get quantity with better fallback
  const qty = item.qty || item.quantity || 0;
  
  // Get amount with better fallback
  const amount = item.amount || item.price || item.total || 0;
  
  // Get staff name with better fallback
  const staffName = item.staff_name || item.full_name || item.staff?.full_name || "Unknown Staff";
  
  // Get customer name with better fallback
  const customerName = item.customer || item.cus_name || item.customer_name || "Unknown Customer";
  
  // If item has orderDetails, it's a full order object
  if (item.orderDetails && item.orderDetails.length > 0) {
    return item.orderDetails.map((detail) => ({
      ID: item.id || "N/A",
      Date: item.ord_date ? formatDate(new Date(item.ord_date)) : "N/A",
      Customer: customerName,
      Staff: staffName,
      "Product Name": detail.pro_name || detail.product?.pro_name || "Unknown Product",
      Qty: detail.qty || 0,
      Amount: formatCurrency(detail.amount || 0),
      "Payment Status": calculatePaymentStatus(item),
      Status: item.status || "completed",
    }));
  } else {
    // Already flattened sales data
    return {
      ID: item.orderId || item.id || "N/A",
      Date: item.date ? formatDate(new Date(item.date)) : "N/A",
      Customer: customerName,
      Staff: staffName,
      "Product Name": productName,
      Qty: qty,
      Amount: formatCurrency(amount),
      "Payment Status": item.paymentStatus || "Unpaid",
      Status: item.status || "completed",
    };
  }
};

const calculatePaymentStatus = (order) => {
  const totalAmount = parseFloat(order.total) || 0;
  const payments = order.payments || [];

  const totalPaid = payments.reduce((sum, payment) => {
    return sum + (parseFloat(payment.deposit) || 0);
  }, 0);

  if (totalPaid >= totalAmount) {
    return "Paid";
  } else if (totalPaid > 0) {
    return "Partial";
  } else {
    return "Unpaid";
  }
};

const preparePDFTableData = (data, type) => {
  const processedData = processExportData(data, type);

  const tableData = processedData.map((item) => {
    if (type === "import") {
      return [
        item.ID,
        item.Date,
        item.Staff,
        item.Supplier,
        item["Product Name"],
        item.Qty,
        item.Amount,
        item["Batch Number"],
        item["Expiration Date"],
        item.Status,
      ];
    } else {
      return [
        item.ID,
        item.Date,
        item.Customer,
        item.Staff,
        item["Product Name"],
        item.Qty,
        item.Amount,
        item["Payment Status"],
        item.Status,
      ];
    }
  });

  const headers =
    type === "import"
      ? [
          "ID",
          "Date",
          "Staff",
          "Supplier",
          "Product Name",
          "Qty",
          "Amount",
          "Batch Number",
          "Expiration Date",
          "Status",
        ]
      : [
          "ID",
          "Date",
          "Customer",
          "Staff",
          "Product Name",
          "Qty",
          "Amount",
          "Payment Status",
          "Status",
        ];

  return { tableData, headers };
};

const generateHTMLContent = (processedData, type) => {
  const totalAmount = processedData.reduce((sum, item) => {
    const amount =
      typeof item.Amount === "string"
        ? parseFloat(item.Amount.replace(/[$,]/g, ""))
        : parseFloat(item.Amount) || 0;
    return sum + amount;
  }, 0);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${type === "import" ? "Import Report" : "Sales Report"}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .info { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .total { font-weight: bold; background-color: #e8f5e9; }
    </style>
</head>
<body>
    <h1>${type === "import" ? "Import Report" : "Sales Report"}</h1>
    
    <div class="info">
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Records:</strong> ${processedData.length}</p>
        <p><strong>Data Source:</strong> ${getDataSourceInfo(processedData)}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                ${
                  type === "import"
                    ? "<th>ID</th><th>Date</th><th>Staff</th><th>Supplier</th><th>Product Name</th><th>Qty</th><th>Amount</th><th>Batch Number</th><th>Expiration Date</th><th>Status</th>"
                    : "<th>ID</th><th>Date</th><th>Customer</th><th>Staff</th><th>Product Name</th><th>Qty</th><th>Amount</th><th>Payment Status</th><th>Status</th>"
                }
            </tr>
        </thead>
        <tbody>
            ${processedData
              .map(
                (item) => `
                <tr>
                    ${
                      type === "import"
                        ? `<td>${item.ID}</td><td>${item.Date}</td><td>${item.Staff}</td><td>${item.Supplier}</td><td>${item["Product Name"]}</td><td>${item.Qty}</td><td>${item.Amount}</td><td>${item["Batch Number"]}</td><td>${item["Expiration Date"]}</td><td>${item.Status}</td>`
                        : `<td>${item.ID}</td><td>${item.Date}</td><td>${item.Customer}</td><td>${item.Staff}</td><td>${item["Product Name"]}</td><td>${item.Qty}</td><td>${item.Amount}</td><td>${item["Payment Status"]}</td><td>${item.Status}</td>`
                    }
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>
    
    <div class="info total">
        <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
    </div>
</body>
</html>`;
};

const downloadHTMLFile = (htmlContent, filename) => {
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.(word|doc)$/i, ".html");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const addNoDataMessage = (doc) => {
  doc.setFontSize(12);
  doc.text("No data available for the selected date range.", 20, 70);
  doc.setFontSize(10);
  doc.text("Please check:", 20, 85);
  doc.text("• API endpoints are working", 25, 95);
  doc.text("• Database has records", 25, 105);
  doc.text("• Date range includes data", 25, 115);
};

const getDataSourceInfo = (data) => {
  if (data.length === 0) return "No data available";
  return data[0].staff_name === "Analytics Data"
    ? "Analytics/Mock Data"
    : "Real Database";
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount) || 0;
  return `$${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
