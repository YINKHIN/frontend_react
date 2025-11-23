import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Calendar,
  RefreshCw,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useSalesReport, exportReport } from "../hooks/useReports";
import LoadingSpinner from "../components/LoadingSpinner"
import { formatDate, formatCurrency } from "../utils/helper";
import { toast } from "react-hot-toast";

const SalesReportPage = () => {
  // Set default date range
  const [dateRange, setDateRange] = useState({
    from: "2024-10-29",
    to: "2025-11-28",
  });
  const [exportFormat, setExportFormat] = useState("excel");
  const [filters, setFilters] = useState({
    staff_id: "",
    customer_id: "",
  });
  const [viewMode, setViewMode] = useState("orders"); // 'orders' or 'products'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch sales data with caching
  const {
    data: salesReport,
    isLoading,
    error,
    refetch,
  } = useSalesReport({
    date_from: dateRange.from,
    date_to: dateRange.to,
    ...filters,
  });

  // Cache processed data to avoid re-processing
  const [cachedSalesData, setCachedSalesData] = useState(null);
  const [salesCacheKey, setSalesCacheKey] = useState('');

  useEffect(() => {
    const newCacheKey = `sales-${dateRange.from}-${dateRange.to}-${JSON.stringify(filters)}`;
    if (newCacheKey !== salesCacheKey && salesReport) {
      setSalesCacheKey(newCacheKey);
      setCachedSalesData(salesReport);
    }
  }, [salesReport, dateRange, filters, salesCacheKey]);

  // Process data based on API response structure with caching
  const processSalesData = () => {
    const dataToProcess = cachedSalesData || salesReport;
    if (!dataToProcess?.data) return { orders: [], products: [] };

    const rawData = dataToProcess.data;
    console.log("Raw sales data:", rawData);

    // If data is already in product format (flat structure)
    if (
      Array.isArray(rawData) &&
      rawData.length > 0 &&
      rawData[0].product_name
    ) {
      return {
        orders: [],
        products: rawData,
      };
    }

    // If data is in order format with order_details
    if (Array.isArray(rawData) && rawData.length > 0) {
      const orders = rawData;
      const products = rawData.flatMap((order) => {
        const details = order.order_details || order.orderDetails || [];
        return details.map((detail) => ({
          order_id: order.id,
          order_date: order.ord_date || order.order_date,
          customer_name: order.cus_name || order.customer?.name,
          staff_name: order.staff_name || order.staff?.name,
          product_name: detail.pro_name || detail.product?.name,
          qty: detail.qty,
          amount: detail.amount,
          unit_price: detail.unit_price,
          payment_status: order.payment_status || "Unknown",
          status: order.status || "completed",
        }));
      });

      return { orders, products };
    }

    return { orders: [], products: [] };
  };

  const { orders, products } = processSalesData();
  const displayData = viewMode === "orders" ? orders : products;

  console.log("Processed orders:", orders);
  console.log("Processed products:", products);
  console.log("Display data:", displayData);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      // Add a small delay to ensure the loading spinner is visible
      setTimeout(() => {
        setIsRefreshing(false);
      }, 300);
    }
  }, [refetch]);

  // Handle export
  const handleExport = async () => {
    const loadingToast = toast.loading(`Preparing sales report for export...`);
    
    try {
      // Add delay to show loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const params = {
        date_from: dateRange.from,
        date_to: dateRange.to,
        ...filters,
      };

      let extension;
      switch (exportFormat) {
        case "pdf":
          extension = "pdf";
          break;
        case "xlsx":
          extension = "xlsx";
          break;
        case "word":
          extension = "html";
          break;
        default:
          extension = "xlsx";
      }

      const filename = `sales_report_${dateRange.from}_to_${dateRange.to}.${extension}`;

      // Get fresh real data from database like UI does
      let exportData = [];
      try {
        const { reportService } = await import('../services/reportService');
        const salesResponse = await reportService.getSalesReport({
          date_from: dateRange.from,
          date_to: dateRange.to,
          ...filters
        });
        
        // Process data exactly like UI does
        let orders = [];
        if (salesResponse) {
          if (Array.isArray(salesResponse.data)) {
            orders = salesResponse.data;
          } else if (Array.isArray(salesResponse)) {
            orders = salesResponse;
          } else if (salesResponse.orders && Array.isArray(salesResponse.orders)) {
            orders = salesResponse.orders;
          } else if (salesResponse.sales && Array.isArray(salesResponse.sales)) {
            orders = salesResponse.sales;
          } else if (salesResponse.data && typeof salesResponse.data === 'object') {
            orders = salesResponse.data.orders || salesResponse.data.data || salesResponse.data.sales || [];
          }
        }
        
        // Process based on view mode like UI does
        if (viewMode === "orders") {
          exportData = orders;
        } else {
          // Flatten to product view
          exportData = orders.flatMap(order => {
            const details = order.order_details || [];
            return details.map(detail => ({
              order_id: order.id,
              order_date: order.ord_date,
              customer_name: order.cus_name,
              staff_name: order.staff_name,
              product_name: detail.pro_name,
              qty: detail.qty,
              amount: detail.amount,
              payment_status: order.payment_status,
              status: order.status
            }));
          });
        }
        
        console.log('Using real sales data from database:', exportData);
      } catch (error) {
        console.error('Failed to get real sales data:', error);
        // Fallback to UI data
        exportData = displayData.length > 0 ? displayData : [];
      }
      
      if (exportData.length === 0) {
        throw new Error('No sales data available to export. Please check your date range and try again.');
      }

      toast.dismiss(loadingToast);
      const processingToast = toast.loading(`Generating ${extension.toUpperCase()} file...`);

      await exportReport({
        type: "sales",
        format: exportFormat,
        params,
        filename,
        fallbackData: exportData,
      });

      toast.dismiss(processingToast);
      toast.success("Sales report exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.dismiss(loadingToast);
      toast.error("Export failed: " + (error.message || "Unknown error"));
    }
  };

  // Calculate payment status for orders
  const getPaymentStatus = (order) => {
    const payments = order.payments || [];
    const totalPaid = payments.reduce(
      (sum, payment) => sum + (parseFloat(payment.deposit) || 0),
      0
    );
    const totalAmount = parseFloat(order.total) || 0;

    if (totalPaid >= totalAmount)
      return { status: "Paid", color: "bg-green-100 text-green-800" };
    if (totalPaid > 0)
      return { status: "Partial", color: "bg-yellow-100 text-yellow-800" };
    return { status: "Unpaid", color: "bg-red-100 text-red-800" };
  };

  if (isLoading || isRefreshing) {
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error loading data
        </h3>
        <p className="text-red-600">
          {error.message || "Failed to load sales report data"}
        </p>
        <button onClick={handleRefresh} className="mt-4 btn-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-gray-600">Detailed sales transactions report</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Date Range */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="input pl-10"
                />
              </div>
              <span className="self-center text-gray-400">to</span>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="input"
            >
              <option value="orders">Order View</option>
              <option value="products">Product View</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input"
            >
              <option value="excel">Excel (.xls)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pdf">PDF</option>
              <option value="word">Word</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={handleExport} className="btn-primary w-full">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Sales Report Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {viewMode === "orders" ? "Sales Orders" : "Sales Products"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {displayData.length} records from{" "}
                {formatDate(dateRange.from)} to {formatDate(dateRange.to)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("orders")}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  viewMode === "orders"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Orders
              </button>
              <button
                onClick={() => setViewMode("products")}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  viewMode === "products"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {viewMode === "orders" ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
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
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <tr
                    key={
                      viewMode === "orders"
                        ? item.id
                        : `${item.order_id}-${index}`
                    }
                    className="hover:bg-gray-50"
                  >
                    {viewMode === "orders" ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          #{item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.ord_date || item.order_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.cus_name || item.customer?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.staff_name || item.staff?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.total || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const payment = getPaymentStatus(item);
                            return (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${payment.color}`}
                              >
                                {payment.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          #{item.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.order_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.customer_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.product_name || "Unknown Product"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.qty || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.status || "Completed"}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={viewMode === "orders" ? 7 : 7}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No sales records found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your filters or date range
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {displayData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  Total Records:
                </span>
                <span className="ml-2 text-gray-900">{displayData.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Value:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  {formatCurrency(
                    displayData.reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(
                          viewMode === "orders"
                            ? item.total || 0
                            : item.amount || 0
                        ),
                      0
                    )
                  )}
                </span>
              </div>
              {viewMode === "products" && (
                <div>
                  <span className="font-medium text-gray-700">
                    Total Quantity:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {displayData.reduce(
                      (sum, item) => sum + parseInt(item.qty || 0),
                      0
                    )}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">View Mode:</span>
                <span className="ml-2 text-gray-900 capitalize">
                  {viewMode}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReportPage;