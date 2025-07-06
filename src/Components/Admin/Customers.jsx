import React, { useEffect, useState } from "react"
import Layout from "./Layout"
import img from './avtar/avtar.svg'
import firebaseAppConfig from "../../../util/firebase-config"
import { collection, getDocs, getFirestore } from "firebase/firestore"

const db = getFirestore(firebaseAppConfig)

const Customers = () => {
  const [customer, setCustomer] = useState([])

  useEffect(() => {
    const req = async () => {
      const snapshot = await getDocs(collection(db, 'customers'))
      const tmp = []
      snapshot.forEach((doc) => {
        tmp.push(doc.data())
      })
      setCustomer(tmp)
    }
    req()
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-semibold ">Customers</h1>

      <table className="w-full mt-5">
        <thead className="bg-rose-600 text-white font-semibold">
          <tr>
            <td className="p-[15px]">Customer's Name</td>
            <td>Email</td>
            <td>Phone</td>
            <td>Date</td>
          </tr>
        </thead>
        <tbody className="bg-white">
          {
            customer.map((item, index) => (
              <tr key={index}>
                <td className="p-4">
                  <div className="flex gap-4 items-center">
                    <img src={img} className="w-10 h-10" />
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <small className="text-gray-600">{item.date}</small>
                    </div>
                  </div>
                </td>
                <td className="p-4">{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.date}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </Layout>
  )
}

export default Customers
