import React, { useEffect, useState } from "react";
import firebaseAppConfig from "../../../util/firebase-config";
import { getDocs, getFirestore, collection, doc, updateDoc } from "firebase/firestore";
import Layout from "./Layout";

const db = getFirestore(firebaseAppConfig);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleIndex, setToggleIndex] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const ordersData = snapshot.docs.map((doc) => ({
          firebaseId: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (firebaseId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", firebaseId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.firebaseId === firebaseId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update status");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return timestamp.toDate
      ? timestamp.toDate().toLocaleString()
      : new Date(timestamp).toLocaleString();
  };

  const getPhoneNumber = (order) => {
    return (
      order.address?.Mobile ||
      order.address?.mobile ||
      order.address?.phone ||
      order.phone ||
      order.mobile ||
      order.phoneNumber ||
      ""
    );
  };

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-rose-600 mb-6">
          Orders ({orders.length})
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40 text-lg">
            Loading orders...
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No orders found</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-[900px] w-full text-sm text-left">
              <thead className="bg-rose-600 text-white">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order, index) => (
                  <tr key={order.firebaseId}>
                    <td className="p-4 font-mono text-xs">{order.orderId || order.firebaseId}</td>
                    <td className="p-4 capitalize">{order.customerName || "N/A"}</td>
                    <td className="p-4">{order.email || "N/A"}</td>
                    <td className="p-4">
                      {getPhoneNumber(order) || (
                        <span className="text-gray-400 italic">No phone</span>
                      )}
                    </td>
                    <td className="p-4 capitalize">{order.title || "N/A"}</td>
                    <td className="p-4">{formatDate(order.date)}</td>
                    <td className="p-4 font-semibold">
                      ₹{order.price?.toLocaleString() || "0"}
                    </td>
                    <td className="p-4">
                      <button
                        className="text-blue-600 underline text-sm"
                        onClick={() =>
                          setToggleIndex(toggleIndex === index ? null : index)
                        }
                      >
                        {toggleIndex === index ? "Hide Address" : "Show Address"}
                      </button>

                      {toggleIndex === index && order.address && (
                        <div className="mt-2 text-gray-700 text-xs animate__animated animate__fadeIn">
                          {`${order.address.Address}, ${order.address.City}, ${order.address.State}, ${order.address.Country}, ${order.address.Pincode}`}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) =>
                          handleStatusChange(order.firebaseId, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring focus:border-rose-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
