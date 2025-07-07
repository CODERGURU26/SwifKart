import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import firebaseAppConfig from "../../util/firebase-config"; // adjust path if needed
import Layout2 from "../Home/Layout2";

const db = getFirestore(firebaseAppConfig);

const Category = () => {
  const { categoryName } = useParams(); // get slug from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "products"), where("category", "==", categoryName));
        const snapshot = await getDocs(q);
        const items = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({ id: doc.id, ...data });
        });
        setProducts(items);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryName]);

  return (
    <Layout2>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">Category: {categoryName.replace("-", " ")}</h1>

        {loading ? (
          <p className="text-center text-xl text-gray-500">Loading products...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg p-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h2 className="text-lg font-bold">{product.title}</h2>
                <p className="text-gray-600 text-sm">{product.description?.slice(0, 60)}...</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-green-700 font-bold">
                      ₹{product.price - (product.price * product.discount) / 100}
                    </span>
                    <del className="ml-2 text-gray-500">₹{product.price}</del>
                  </div>
                  <span className="text-sm text-gray-500">({product.discount}% OFF)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">No products found in this category.</p>
        )}
      </div>
    </Layout2>
  );
};

export default Category;
