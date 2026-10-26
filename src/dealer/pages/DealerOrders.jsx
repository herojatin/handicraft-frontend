
import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  RefreshCw,
  X,
  MessageSquare,
} from "lucide-react";
import BASE_URL from "../../config/api";

const API_URL = `${BASE_URL}`.replace(/\/+$/, "");

const displayText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.map(displayText).join(", ");
  }

  if (typeof value === "object") {
    return value.name || value.productCode || "-";
  }

  return String(value);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB");
};

const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
    case "Approved":
      return "bg-green-100 text-green-700";

    case "Processing":
      return "bg-blue-100 text-blue-700";

    case "Cancelled":
    case "Rejected":
      return "bg-red-100 text-red-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const DealerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        throw new Error("Dealer session expired. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("Dealer orders error:", err);
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (order) => {
    const id = order._id;

    if (!id) {
      alert("Order database ID is missing.");
      return;
    }

    try {
      setDownloadingId(id);

      const token = localStorage.getItem("dealerToken");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/api/orders/${id}/excel`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = "Failed to download Excel.";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // Server did not return JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Enquiry-${order.orderId || id}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel download error:", err);
      alert(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            My Orders
          </h1>

          <p className="text-gray-500 mt-1">
            View your enquiries and download Excel files.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center">
          Loading orders...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          No enquiries available yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {[
                  "Order ID",
                  "Product Code",
                  "Product",
                  "Quantity",
                  "Order Date",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-4 text-left border-b"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id || order.orderId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-4 font-medium">
                    {order.orderId || order._id}
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    {(order.items || [])
                      .map((item) => item.productCode || item.code)
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </td>

                  <td className="px-4 py-4">
                    {(order.items || [])
                      .map(
                        (item) =>
                          item.productName ||
                          item.name ||
                          item.productId?.name ||
                          "Product"
                      )
                      .join(", ")}
                  </td>

                  <td className="px-4 py-4">
                    {order.totalQuantity ??
                      (order.items || []).reduce(
                        (sum, item) =>
                          sum + Number(item.quantity || 0),
                        0
                      )}
                  </td>

                  <td className="px-4 py-4">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        onClick={() => downloadExcel(order)}
                        disabled={downloadingId === order._id}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Download size={16} />
                        {downloadingId === order._id
                          ? "Downloading..."
                          : "Excel"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold">
                  Enquiry Details
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedOrder.orderId || selectedOrder._id}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">
                    Enquiry Date
                  </p>
                  <p className="font-semibold">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Total Quantity
                  </p>
                  <p className="font-semibold">
                    {selectedOrder.totalQuantity ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Status
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status || "Pending"}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">
                Products
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        "Code",
                        "Product",
                        "Quantity",
                        "Length",
                        "Width",
                        "Height",
                        "CBM",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="border p-3 text-left"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(selectedOrder.items || []).map(
                      (item, index) => (
                        <tr key={index}>
                          <td className="border p-3">
                            {displayText(item.productCode)}
                          </td>

                          <td className="border p-3">
                            {displayText(
                              item.productName ||
                              item.name ||
                              item.productId?.name
                            )}
                          </td>

                          <td className="border p-3">
                            {item.quantity ?? 0}
                          </td>

                          <td className="border p-3">
                            {displayText(
                              item.length ?? item.size?.length
                            )}
                          </td>

                          <td className="border p-3">
                            {displayText(
                              item.width ?? item.size?.width
                            )}
                          </td>

                          <td className="border p-3">
                            {displayText(
                              item.height ?? item.size?.height
                            )}
                          </td>

                          <td className="border p-3">
                            {displayText(
                              item.cbm ?? item.size?.cbm
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* PRODUCT QUESTIONS */}

              <h3 className="text-lg font-semibold mt-7 mb-3">
                Product Questions
              </h3>

              <div className="space-y-3">
                {(selectedOrder.items || []).filter(
                  (item) => item.question || item.comment
                ).length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No product-specific questions.
                  </p>
                ) : (
                  selectedOrder.items.map((item, index) =>
                    item.question || item.comment ? (
                      <div
                        key={index}
                        className="bg-gray-50 border rounded-lg p-4"
                      >
                        <p className="font-semibold text-sm mb-2">
                          Product: {displayText(item.productCode)}
                        </p>

                        <p className="text-gray-700 whitespace-pre-wrap">
                          {item.question || item.comment}
                        </p>
                      </div>
                    ) : null
                  )
                )}
              </div>

              {/* GENERAL ENQUIRY QUESTION */}

              <div className="mt-7 bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare
                    size={20}
                    className="text-amber-700"
                  />

                  <h3 className="font-semibold text-amber-900">
                    General Enquiry Question
                  </h3>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedOrder.enquiryQuestion ||
                    "No general question submitted."}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-7">
                <button
                  onClick={() => downloadExcel(selectedOrder)}
                  disabled={
                    downloadingId === selectedOrder._id
                  }
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Download size={18} />
                  Download Excel
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="border px-5 py-3 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerOrders;
