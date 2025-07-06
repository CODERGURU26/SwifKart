import React, { useEffect, useState } from "react";
import firebaseAppConfig from "../../../util/firebase-config";
import { getDocs, getFirestore, collection, doc, updateDoc } from "firebase/firestore";
import Layout from "./Layout";

const db = getFirestore(firebaseAppConfig);

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const[toggleAddress , setToggleAddress] = useState(false)
    const[toggleIndex , setToggleIndex] = useState(null)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const snapshot = await getDocs(collection(db, 'orders'));
                const ordersData = [];
                snapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    ordersData.push({
                        firebaseId: docSnapshot.id,
                        ...data
                    });
                });
                setOrders(ordersData);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleStatusChange = async (firebaseId, newStatus) => {
        try {
            const orderRef = doc(db, 'orders', firebaseId);
            await updateDoc(orderRef, { status: newStatus });

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.firebaseId === firebaseId
                        ? { ...order, status: newStatus }
                        : order
                )
            );
        } catch (err) {
            console.error('Error updating order status:', err);
            alert(`Failed to update order status: ${err.message}`);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleString();
        }
        return new Date(timestamp).toLocaleString();
    };

    // Helper function to get phone number with multiple fallbacks
    const getPhoneNumber = (order) => {
        // Try multiple possible locations for phone number
        const phoneNumber = order.address?.Mobile ||
            order.address?.mobile ||
            order.address?.phone ||
            order.phone ||
            order.mobile ||
            order.phoneNumber;

        // Return empty string instead of N/A, or return the phone number
        return phoneNumber || '';

        // Alternative: Return a dash instead of N/A
        // return phoneNumber || '-';

        // Alternative: Keep N/A but style it differently
        // return phoneNumber || 'N/A';
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64 text-lg">Loading orders...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Orders ({orders.length})</h1>
                {orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No orders found</div>
                ) : (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="w-full border-collapse">
                            <thead className="bg-rose-500 text-white">
                                <tr>
                                    <th className="p-4 text-left">Order ID</th>
                                    <th className="p-4 text-left">Customer Name</th>
                                    <th className="p-4 text-left">Email</th>
                                    <th className="p-4 text-left">Phone</th>
                                    <th className="p-4 text-left">Product</th>
                                    <th className="p-4 text-left">Date</th>
                                    <th className="p-4 text-left">Amount</th>
                                    <th className="p-4 ">Address</th>
                                    <th className="p-4 text-left">Status</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white">
                                {orders.map((order, index) => (
                                    <tr key={order.firebaseId || index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-2 font-mono text-sm">{order.orderId || order.firebaseId}</td>
                                        <td className="p-2 capitalize">{order.customerName || 'N/A'}</td>
                                        <td className="p-2">{order.email || 'N/A'}</td>

                                        {/* FIXED: Phone field with better handling */}
                                        <td className="p-2">
                                            {getPhoneNumber(order) ? (
                                                <span>{getPhoneNumber(order)}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">No phone</span>
                                            )}
                                        </td>

                                        <td className="p-2 capitalize">{order.title || 'N/A'}</td>
                                        <td className="p-2">{formatDate(order.date)}</td>
                                        <td className="p-2 font-semibold">₹{order.price?.toLocaleString() || '0'}</td>
                                        <button className="text-blue-600" onClick={()=>{
                                            setToggleIndex(index)
                                            setToggleAddress(!toggleAddress)
                                        }}>Browse Address</button>
                                        <div >
                                            {
                                                (toggleAddress && toggleIndex === index) &&
                                                <div className="animate__animated animate__zoomIn">
                                                     <td className="p-4 ">{`${order.address.Address},${order.address.City}, ${order.address.Country}, ${order.address.State}, ${order.address.Pincode}`}</td>
                                                </div>
                                                
                                            }
                                        </div>
                                        <td className="p-4">
                                            <select
                                                value={order.status || 'Pending'}
                                                onChange={(e) => handleStatusChange(order.firebaseId, e.target.value)}
                                                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-rose-500"
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