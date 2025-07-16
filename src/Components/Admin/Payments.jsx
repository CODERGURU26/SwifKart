import React, { useEffect, useState } from "react"
import Layout from "./Layout"
import img from './avtar/avtar.svg'
import axios from "axios"
import moment from "moment"

const Payments = () => {
    const [payment, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const req = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get('http://localhost:8080/payments');
                setPayments(data.items)
                console.log(data)
            }
            catch (err) {
                console.log(err)
                setError('Failed to load payments')
            }
            finally {
                setLoading(false)
            }
        }
        req()
    }, [])

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600"></div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center text-red-600 p-4">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </Layout>
        )
    }

    return (
        <>
            <Layout>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Payments</h1>
                    <div className="text-sm text-gray-600">
                        Total: {payment.length} payments
                    </div>
                </div>

                {payment.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 text-lg">No payments found</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full mt-6 border-collapse shadow-md rounded-lg overflow-hidden min-w-[800px]">
                            <thead className="w-full bg-rose-600 text-white font-semibold text-center">
                                <tr>
                                    <th className="p-3 text-left">Payment ID</th>
                                    <th className="p-3 text-left">Customer's Name</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Phone</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 text-left">Products</th>
                                    <th className="p-3 text-left">Date</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white">
                                {payment.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50 border-b border-gray-200">
                                        <td className="p-4 font-mono text-sm">{item.id}</td>
                                        <td className="p-4">
                                            <span className="font-semibold">{item.notes?.name || 'N/A'}</span>
                                        </td>
                                        <td className="p-4 text-sm">{item.email || 'N/A'}</td>
                                        <td className="p-4">{item.contact || 'N/A'}</td>
                                        <td className="p-4 text-right font-semibold">
                                            ₹{(item.amount / 100).toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-4 text-sm max-w-[200px] truncate" title={item.description}>
                                            {item.description || 'N/A'}
                                        </td>
                                        <td className="p-4 text-sm">
                                            {moment.unix(item.created_at).format('DD MMM YYYY, hh:mm A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Layout>
        </>
    )
}

export default Payments