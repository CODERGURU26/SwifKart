import React, { useEffect, useState } from "react"
import Layout from "./Layout"
import img from './avtar/avtar.svg'
import axios from "axios"
import moment from "moment"

const Payments = () => {
    const [payment ,setPayments] = useState([])

    useEffect(() => {
        const req = async () => {
            try { 
                const { data } = await axios.get('http://localhost:8080/payments');
                setPayments(data.items)
                console.log(data)
            }
            catch (err) {
                console.log(err)
            }
        }
        req()
    }, [])
    return (
        <>
            <Layout>
                <h1 className="text-2xl font-semibold">Payments</h1>

                <table className="w-full mt-6 border-collapse shadow-md rounded-lg overflow-hidden">
                    <thead className="w-full bg-rose-600 text-white font-semibold text-center">
                        <tr>
                            <td className="p-2 m-2">PaymentId</td>
                            <td >Customer's Name</td>
                            <td >Email</td>
                            <td>Phone</td>
                            <td>Amount</td>
                            <td>Products</td>
                            <td>Date</td>
                        </tr>
                    </thead>

                    <tbody className="bg-white text-center">
                        {payment.map((item, index) => (
                            <tr key={index}>
                                <td className="p-4">{item.id}</td>
                                <td className="p-4">
                                    <span className="font-bold">{item.notes.name || 'N/A'}</span>
                                </td>
                                <td className="p-4">{item.email}</td>
                                <td className="p-4">{item.contact}</td>
                                <td className="p-4">₹{item.amount.toLocaleString()}</td>
                                <td className="p-4">{item.description}</td>
                                <td className="p-4">{moment.unix(item.created_at).format('DD MMM YYYY hh:mm:ss A')}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </Layout>

        </>
    )
}
export default Payments