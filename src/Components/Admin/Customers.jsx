import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import img from './avtar/avtar.svg';
import firebaseAppConfig from "../../../util/firebase-config";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const db = getFirestore(firebaseAppConfig);

const Customers = () => {
  const [customer, setCustomer] = useState([]);

  useEffect(() => {
    const req = async () => {
      const snapshot = await getDocs(collection(db, 'customers'));
      const tmp = [];
      snapshot.forEach((doc) => {
        tmp.push(doc.data());
      });
      setCustomer(tmp);
    };
    req();
  }, []);

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-rose-600 mb-4">
          Customers
        </h1>

        <div className="overflow-x-auto rounded-md shadow-md">
          <table className="min-w-[600px] w-full text-sm text-left">
            <thead className="bg-rose-600 text-white text-sm sm:text-base font-semibold">
              <tr>
                <th className="p-4">Customer's Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {customer.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={img} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <small className="text-gray-500">{item.date}</small>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{item.email}</td>
                  <td className="p-4">{item.phone}</td>
                  <td className="p-4">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
