import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileImage,
  FileType,
  RefreshCw,
  Eye,
  Settings,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  useImportReport,
  useSalesReport,
  useImportSummary,
  useSalesSummary,
  useBestSellingProducts,
  useLowStockProducts,
  useInventorySummary,
  exportReport,
} from "../hooks/useReports";
import { useProducts } from "../hooks/useProducts";
import { useUsers } from "../hooks/useUsers";
import LoadingSpinner from "../components/LoadingSpinner";
import ImportReportTable from "../components/ImportReportTable";
import { formatCurrency, formatDate } from "../utils/helper";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("import");
  // Get today's date and extend to end of year to include all data
  const getDefaultDateRange = () => {
    const today = new Date();
    // Set to end of 2025 to include all November imports (Nov 06, Nov 13)
    const endOf2025 = new Date("2025-12-31");
    return {
      from: "2024-01-01", // Start from 2024 to include all data
      to: endOf2025.toISOString().split("T")[0], // End of 2025 to include November imports
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === "sales") {
        setActiveTab("sales");
      } else {
        setActiveTab("import");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Report queries with filters
  const reportParams = {
    ...filters,
    date_from: dateRange.from,
    date_to: dateRange.to,
  };

  const { data: importReport, isLoading: loadingImportReport } =
    useImportReport(reportParams);
  const {
    data: salesReport,
    isLoading: loadingSalesReport,
    error: salesError,
  } = useSalesReport(reportParams);

  const handleExport = async (type, format) => {
    // Import toast for notifications
    const { toast } = await import("react-hot-toast");

    try {
      const filename = `${type}_report_${dateRange.from}_to_${dateRange.to}.${format}`;
      let exportData = [];

      // Get processed data that matches UI table structure
      if (type === "import") {
        // Use real data from same source as UI (use reportService.getImportReport with date filtering)
        try {
          const { reportService } = await import("../services/reportService");
          const importsResponse = await reportService.getImportReport({
            date_from: dateRange.from,
            date_to: dateRange.to,
            ...filters,
          });

          // Handle different API response formats
          // Note: request.get transforms { success: true, data: [...] } to { data: [...] }
          let imports = [];
          if (importsResponse) {
            // After request.get transformation, response is { data: [...] }
            if (Array.isArray(importsResponse.data)) {
              imports = importsResponse.data;
            } else if (Array.isArray(importsResponse)) {
              imports = importsResponse;
            } else if (
              importsResponse.success &&
              Array.isArray(importsResponse.data)
            ) {
              // Handle original API format if not transformed
              imports = importsResponse.data;
            } else if (
              importsResponse.data &&
              typeof importsResponse.data === "object"
            ) {
              imports =
                importsResponse.data.data || importsResponse.data.imports || [];
            }
          }

          console.log("=== IMPORT EXPORT DEBUG ===");
          console.log("importsResponse:", importsResponse);
          console.log("imports array:", imports);
          console.log("imports length:", imports.length);
          console.log("==========================");

          // Additional client-side filtering by date range (in case API doesn't filter properly)
          const filteredImports = Array.isArray(imports)
            ? imports.filter((importItem) => {
                if (!importItem.imp_date) return true; // Include items without date
                const importDate = new Date(importItem.imp_date);
                const fromDate = new Date(dateRange.from);
                fromDate.setHours(0, 0, 0, 0);
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                return importDate >= fromDate && importDate <= toDate;
              })
            : [];

          // Process data exactly like ImportReportTable does
          exportData = filteredImports.flatMap((importItem) => {
            const details =
              importItem.import_details || importItem.importDetails || [];

            // If no details, create a general entry
            if (details.length === 0) {
              return [
                {
                  id: `${importItem.id}-0`,
                  importId: importItem.id,
                  date: importItem.imp_date,
                  staff:
                    importItem.staff_name ||
                    importItem.staff?.full_name ||
                    importItem.full_name ||
                    `Staff ${importItem.staff_id}`,
                  supplier:
                    importItem.supplier_name ||
                    importItem.supplier?.supplier ||
                    importItem.supplier ||
                    "N/A",
                  productName: "General Import",
                  qty: 1,
                  amount: importItem.total_amount || importItem.total || 0,
                  batchNumber: "N/A",
                  expirationDate: "N/A",
                  status: importItem.status || "Completed",
                },
              ];
            }

            return details.map((detail, index) => ({
              id: `${importItem.id}-${index}`,
              importId: importItem.id,
              date: importItem.imp_date,
              staff:
                importItem.staff_name ||
                importItem.staff?.full_name ||
                importItem.full_name ||
                `Staff ${importItem.staff_id}`,
              supplier:
                importItem.supplier_name ||
                importItem.supplier?.supplier ||
                importItem.supplier ||
                "N/A",
              productName:
                detail.pro_name ||
                detail.product?.pro_name ||
                detail.product_name ||
                "Unknown Product",
              qty: detail.qty || detail.quantity || 0,
              amount: detail.amount || detail.price || detail.total || 0,
              batchNumber:
                detail.batch_number ||
                detail.batchNumber ||
                detail.batch ||
                "N/A",
              expirationDate:
                detail.expiration_date ||
                detail.expirationDate ||
                detail.expiry ||
                "N/A",
              status: importItem.status || "Completed",
            }));
          });

          console.log("Using real import data from database:", exportData);
        } catch (error) {
          console.error("Failed to get real import data:", error);
          exportData = [];
        }
      } else if (type === "sales") {
        // Use real data from same source as UI (SalesReportTable uses useSalesReport)
        try {
          const { reportService } = await import("../services/reportService");
          const salesResponse = await reportService.getSalesReport({
            date_from: dateRange.from,
            date_to: dateRange.to,
            ...filters,
          });

          console.log("=== REAL SALES DATA DEBUG ===");
          console.log("salesResponse:", salesResponse);

          // Process data exactly like SalesReportTable does
          // Note: request.get transforms { success: true, data: [...] } to { data: [...] }
          let orders = [];
          if (salesResponse) {
            // After request.get transformation, response is { data: [...] }
            if (Array.isArray(salesResponse.data)) {
              orders = salesResponse.data;
            } else if (Array.isArray(salesResponse)) {
              orders = salesResponse;
            } else if (
              salesResponse.success &&
              Array.isArray(salesResponse.data)
            ) {
              // Handle original API format if not transformed
              orders = salesResponse.data;
            } else if (
              salesResponse.orders &&
              Array.isArray(salesResponse.orders)
            ) {
              orders = salesResponse.orders;
            } else if (
              salesResponse.sales &&
              Array.isArray(salesResponse.sales)
            ) {
              orders = salesResponse.sales;
            } else if (
              salesResponse.data &&
              typeof salesResponse.data === "object"
            ) {
              orders =
                salesResponse.data.orders ||
                salesResponse.data.data ||
                salesResponse.data.sales ||
                [];
            }
          }

          console.log("orders array:", orders);
          console.log("orders length:", orders.length);
          console.log("============================");

          // Remove duplicates same way as UI
          const uniqueOrdersMap = new Map();
          orders.forEach((order) => {
            const orderId = order.id || order.order_id;
            const key =
              orderId ||
              `${order.ord_date || order.order_date || ""}-${
                order.total || ""
              }-${order.cus_name || ""}`;
            if (!uniqueOrdersMap.has(key)) {
              uniqueOrdersMap.set(key, order);
            }
          });
          orders = Array.from(uniqueOrdersMap.values());

          // Flatten to product level like UI shows
          exportData = orders.flatMap((order) => {
            const details = order.order_details || order.orderDetails || [];
            if (details.length > 0) {
              return details.map((detail) => ({
                order_id: `#${order.id || order.order_id}`,
                order_date: order.ord_date || order.order_date,
                customer_name:
                  order.cus_name ||
                  order.customer?.name ||
                  order.customer_name ||
                  order.customer ||
                  "N/A",
                staff_name:
                  order.staff_name ||
                  order.staff?.name ||
                  order.full_name ||
                  order.staff ||
                  "N/A",
                product_name:
                  detail.pro_name ||
                  detail.product?.name ||
                  detail.product_name ||
                  "Unknown Product",
                qty: detail.qty || 0,
                amount: detail.amount || 0,
                payment_status: order.payment_status || "Unknown",
                status: order.status || "completed",
              }));
            } else {
              // If no details, show order level
              return [
                {
                  order_id: `#${order.id || order.order_id}`,
                  order_date: order.ord_date || order.order_date,
                  customer_name:
                    order.cus_name ||
                    order.customer?.name ||
                    order.customer_name ||
                    order.customer ||
                    "N/A",
                  staff_name:
                    order.staff_name ||
                    order.staff?.name ||
                    order.full_name ||
                    order.staff ||
                    "N/A",
                  product_name: "General Order",
                  qty: 1,
                  amount: order.total || order.amount || 0,
                  payment_status: order.payment_status || "Unknown",
                  status: order.status || "completed",
                },
              ];
            }
          });

          console.log("Using real sales data from database:", exportData);
        } catch (error) {
          console.error("Failed to get real sales data:", error);
          exportData = [];
        }
      }

      console.log("=== FINAL EXPORT DATA ===");
      console.log("Export type:", type);
      console.log("Export format:", format);
      console.log("Final exportData:", exportData);
      console.log("Data length:", exportData.length);
      if (exportData.length > 0) {
        console.log("First export item:", exportData[0]);
      }
      console.log("========================");

      if (exportData.length === 0) {
        // Provide more helpful error message
        const errorMsg = `No ${type} data found for the selected date range (${dateRange.from} to ${dateRange.to}). Please try adjusting the date range or check if there is data in the database.`;
        console.error("Export failed - no data:", {
          type,
          dateRange,
          filters,
          exportDataLength: exportData.length,
        });
        throw new Error(errorMsg);
      }

      await exportReport({
        type,
        format,
        params: reportParams,
        filename,
        fallbackData: exportData,
      });

      toast.success(`${type} report exported successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed: " + error.message);
    }
  };

  const ExportButton = ({
    type,
    format,
    icon: Icon,
    label,
    color = "blue",
  }) => (
    <button
      onClick={() => handleExport(type, format)}
      className={`flex items-center space-x-2 px-3 py-2 bg-${color}-50 text-${color}-700 rounded-lg hover:bg-${color}-100 transition-colors text-sm font-medium`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  // Sales Report Table Component
  const SalesReportTable = ({ dateRange, filters }) => {
    const {
      data: salesReport,
      isLoading: loadingSalesReport,
      error,
      refetch,
    } = useSalesReport({
      date_from: dateRange.from,
      date_to: dateRange.to,
      ...filters,
    });

    // Debug: Log the actual data being used by UI
    console.log("UI SalesReportTable data:", salesReport);

    if (loadingSalesReport) {
      return (
        <div className="flex justify-center items-center py-6">
          <div className="text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
            <p className="text-gray-600 text-xs">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-500">
          <AlertCircle className="w-16 h-16 mx-auto text-red-300 mb-4" />
          <p className="text-lg font-medium">Error loading sales data</p>
          <p className="text-sm mt-2">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      );
    }

    // Check for data in multiple possible structures
    const hasData =
      salesReport &&
      ((Array.isArray(salesReport.data) && salesReport.data.length > 0) ||
        (Array.isArray(salesReport) && salesReport.length > 0) ||
        (salesReport.orders &&
          Array.isArray(salesReport.orders) &&
          salesReport.orders.length > 0) ||
        (salesReport.sales &&
          Array.isArray(salesReport.sales) &&
          salesReport.sales.length > 0));

    if (!hasData) {
      return (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No sales data available</p>
          <p className="text-sm mb-4">
            Try adjusting your date range or filters
          </p>

          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() =>
                setDateRange({
                  from: "2024-01-01",
                  to: new Date().toISOString().split("T")[0],
                })
              }
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              Full Year
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                setDateRange({
                  from: firstDay.toISOString().split("T")[0],
                  to: now.toISOString().split("T")[0],
                });
              }}
              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
            >
              This Month
            </button>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Refetch
            </button>
          </div>
        </div>
      );
    }

    // Extract orders from various response structures
    let orders = [];
    if (salesReport) {
      if (Array.isArray(salesReport.data)) {
        orders = salesReport.data;
      } else if (Array.isArray(salesReport)) {
        orders = salesReport;
      } else if (salesReport.orders && Array.isArray(salesReport.orders)) {
        orders = salesReport.orders;
      } else if (salesReport.sales && Array.isArray(salesReport.sales)) {
        orders = salesReport.sales;
      } else if (salesReport.data && typeof salesReport.data === "object") {
        orders =
          salesReport.data.orders ||
          salesReport.data.data ||
          salesReport.data.sales ||
          [];
      }
    }

    // Remove duplicates using Map (more efficient than Set)
    const uniqueOrdersMap = new Map();
    orders.forEach((order) => {
      const orderId = order.id || order.order_id;
      // Create composite key if no ID exists
      const key =
        orderId ||
        `${order.ord_date || order.order_date || ""}-${order.total || ""}-${
          order.cus_name || ""
        }`;

      if (!uniqueOrdersMap.has(key)) {
        uniqueOrdersMap.set(key, order);
      }
    });
    orders = Array.from(uniqueOrdersMap.values());

    // Debug: Log the processed orders for UI
    console.log("=== UI TABLE DEBUG ===");
    console.log("Processed orders for UI:", orders);
    console.log("First order for UI:", orders[0]);
    console.log("First order details for UI:", orders[0]?.order_details);
    console.log("=====================");

    // Helper functions
    const getPaymentStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "paid":
          return "bg-green-100 text-green-800";
        case "partial":
          return "bg-yellow-100 text-yellow-800";
        case "unpaid":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const getPaymentStatus = (order) => {
      if (order.payment_status) {
        return order.payment_status;
      }

      const payments = order.payments || [];
      const totalPaid = payments.reduce(
        (sum, payment) => sum + (parseFloat(payment.deposit) || 0),
        0
      );
      const totalAmount = parseFloat(order.total) || 0;

      if (totalPaid >= totalAmount) return "Paid";
      if (totalPaid > 0) return "Partial";
      return "Unpaid";
    };

    const getTotalItems = (order) => {
      const details = order.order_details || order.orderDetails || [];
      return details.reduce(
        (sum, detail) => sum + (parseInt(detail.qty) || 0),
        0
      );
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Orders ({orders.length})
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {dateRange.from} to {dateRange.to}
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ord_ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const totalItems = getTotalItems(order);

                // Create stable unique key
                const orderId = order.id || order.order_id;
                const uniqueKey =
                  orderId ||
                  `order-${order.ord_date || order.order_date || ""}-${
                    order.cus_name || ""
                  }-${order.total || ""}`;

                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{orderId || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(
                        order.ord_date ||
                          order.order_date ||
                          order.date ||
                          order.created_at ||
                          new Date()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.cus_name ||
                        order.customer?.name ||
                        order.customer_name ||
                        order.customer ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.staff_name ||
                        order.staff?.name ||
                        order.full_name ||
                        order.staff ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(() => {
                        // Get product names from order_details
                        const details =
                          order.order_details || order.orderDetails || [];
                        if (details.length > 0) {
                          const productNames = details
                            .map(
                              (detail) =>
                                detail.pro_name ||
                                detail.product?.name ||
                                detail.product_name ||
                                "Unknown"
                            )
                            .filter((name) => name !== "Unknown");

                          if (productNames.length > 0) {
                            return productNames.length > 1
                              ? `${productNames[0]} (+${productNames} )`
                              : productNames[0];
                          }
                        }

                        // Fallback to order level product name
                        return (
                          order.product_name ||
                          order.product?.name ||
                          order.pro_name ||
                          order.product ||
                          "N/A"
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalItems || order.qty || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(
                        order.total || order.amount || order.total_amount || 0
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          paymentStatus
                        )}`}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (order.status || "completed").toLowerCase() ===
                          "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* <tfoot className="bg-gray-50">
              <tr className="bg-blue-200">
                <td
                  colSpan="6"
                  className="px-6 py-3 text-sm font-medium text-black text-right"
                >
                  Total Sales:
                </td>
                <td className="px-6 py-3 text-sm font-bold text-black">
                  {formatCurrency(
                    orders.reduce(
                      (sum, order) => sum + (parseFloat(order.total || order.amount || order.total_amount) || 0),
                      0
                    )
                  )}
                </td>
                <td colSpan="2" className="px-6 py-3"></td>
              </tr>
              <tr className="bg-yellow-200">
                <td
                  colSpan="6"
                  className="px-6 py-2 text-sm font-medium text-black text-right"
                >
                  Total Orders:
                </td>
                <td className="px-6 py-2 text-sm font-bold text-black">
                  {orders.length}
                </td>
                <td colSpan="2" className="px-6 py-2"></td>
              </tr>
            </tfoot> */}
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📊 Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive import and sales reports
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Date Range */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="text-sm border-none outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="text-sm border-none outline-none"
            />
          </div>

          <button
            onClick={() => {
              // Clear cache and reload
              if ("caches" in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => {
                    caches.delete(name);
                  });
                });
              }
              window.location.reload(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Hard Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border-b">
        <div className="flex space-x-8 px-6 overflow-x-auto">
          {[
            { id: "import", label: "Import Reports", icon: Package },
            { id: "sales", label: "Sales Reports", icon: ShoppingCart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.location.hash = tab.id === "sales" ? "sales" : "";
              }}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Import Reports Tab */}
      {activeTab === "import" && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📥 Export Import Reports
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <ExportButton
                type="import"
                format="xlsx"
                icon={FileSpreadsheet}
                label="EXCEL"
                color="green"
              />
              <ExportButton
                type="import"
                format="pdf"
                icon={FileImage}
                label="PDF"
                color="red"
              />
            </div>
          </div>

          {/* Import Summary Statistics */}
          {(() => {
            const imports = importReport?.data || [];
            // Calculate unique import IDs (each import can have multiple products)
            const uniqueImportIds = new Set(imports.map((imp) => imp.id));
            const totalImports = uniqueImportIds.size;

            // Calculate total value from all import records
            const totalValue = imports.reduce((sum, imp) => {
              // If we have total_amount, use it; otherwise sum from details
              if (imp.total_amount) {
                return sum + parseFloat(imp.total_amount);
              }
              const details = imp.import_details || imp.importDetails || [];
              const detailSum = details.reduce((detailSum, detail) => {
                return detailSum + parseFloat(detail.amount || 0);
              }, 0);
              return (
                sum + (detailSum > 0 ? detailSum : parseFloat(imp.total || 0))
              );
            }, 0);

            // Calculate total quantity from all import details
            const totalQuantity = imports.reduce((sum, imp) => {
              const details = imp.import_details || imp.importDetails || [];
              if (details.length > 0) {
                return (
                  sum +
                  details.reduce(
                    (qtySum, detail) => qtySum + parseInt(detail.qty || 0),
                    0
                  )
                );
              }
              // If no details, count as 1 (general import)
              return sum + 1;
            }, 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Total Imports
                      </p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {totalImports}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Total Value
                      </p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatCurrency(totalValue)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Total Quantity
                      </p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {totalQuantity.toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Import Report Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Import Reports
              </h3>
              <div className="text-sm text-gray-500">
                {importReport?.data?.length || 0} records
              </div>
            </div>
            <ImportReportTable dateRange={dateRange} filters={filters} />
          </div>
        </div>
      )}

      {/* Sales Reports Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Export Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📤 Export Sales Reports
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 w-[100px] lg:grid-cols-6 gap-3">
              <ExportButton
                type="sales"
                format="xlsx"
                icon={FileSpreadsheet}
                label="EXCEL"
                color="green"
              />
              <ExportButton
                type="sales"
                format="pdf"
                icon={FileImage}
                label="PDF"
                color="red"
              />
            </div>
          </div>

          {/* Error Alert */}
          {salesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="font-medium text-red-800">API Error</h4>
              </div>
              <p className="text-red-600 text-sm mt-1">{salesError.message}</p>
            </div>
          )}

          {/* Sales Summary Statistics */}
          {(() => {
            const orders = salesReport?.data || [];
            const totalOrders = new Set(orders.map((order) => order.id)).size;
            const totalSales = orders.reduce(
              (sum, order) =>
                sum +
                parseFloat(
                  order.total || order.amount || order.total_amount || 0
                ),
              0
            );

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        {totalOrders}
                      </p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Total Sales
                      </p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {formatCurrency(totalSales)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sales Report Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sales Reports
              </h3>
              <div className="text-sm text-gray-500">
                {salesReport?.data?.length || 0}
              </div>
            </div>
            <SalesReportTable dateRange={dateRange} filters={filters} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
