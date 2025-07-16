import React, { useState, useRef, useEffect } from "react";
import Layout from "./Layout";
import Swal from "sweetalert2";
import firebaseAppConfig from "../../../util/firebase-config";
import { getFirestore, addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import AOS from 'aos';
import 'aos/dist/aos.css';

const db = getFirestore(firebaseAppConfig);

const Products = () => {
    const model = {
        title: '',
        price: '',
        discount: '',
        description: '',
        image: ''
    };

    useEffect(() => {
        AOS.init({
            duration: 800,       // Animation duration (in ms)
            once: true,          // Only animate once on scroll
            easing: 'ease-in-out',
        });
    }, []);


    const [product, setProduct] = useState([]);
    const [productForm, setProductForm] = useState(model);
    const [productModel, setProductModel] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const modelContainer = useRef(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(db, 'products'));
            const tmp = [];
            snapshot.forEach((doc) => {
                tmp.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setProduct(tmp);
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire('Error!', 'Failed to fetch products.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCloseModel = () => {
        setProductModel(false);
        setProductForm(model);
        setImageFile(null);
        setEditingProduct(null);
    };

    const handleProductForm = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = editingProduct?.image || '';

            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                formData.append("upload_preset", "SwiftKart");
                formData.append("folder", "products");

                const uploadRes = await fetch("https://api.cloudinary.com/v1_1/dyimyol9r/image/upload", {
                    method: "POST",
                    body: formData
                });

                const uploadData = await uploadRes.json();
                imageUrl = uploadData.secure_url;
            } else if (!editingProduct && !imageFile) {
                Swal.fire('Error', 'Please select an image file.', 'error');
                return;
            }

            const productToSave = {
                ...productForm,
                price: Number(productForm.price),
                discount: Number(productForm.discount),
                image: imageUrl
            };

            if (editingProduct) {
                const docRef = doc(db, "products", editingProduct.id);
                await updateDoc(docRef, productToSave);
                setProduct(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productToSave } : p));
                Swal.fire('Success!', 'Product updated successfully.', 'success');
            } else {
                const docRef = await addDoc(collection(db, "products"), productToSave);
                setProduct(prev => [...prev, { id: docRef.id, ...productToSave }]);
                Swal.fire('Success!', 'Product added successfully.', 'success');
            }

            setProductForm(model);
            setImageFile(null);
            handleCloseModel();

        } catch (err) {
            console.error(err);
            Swal.fire('Error!', 'Something went wrong.', 'error');
        }
    };

    const deleteProduct = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const ref = doc(db, 'products', id);
                await deleteDoc(ref);
                setProduct(prev => prev.filter(p => p.id !== id));
                Swal.fire('Deleted!', 'Product has been deleted.', 'success');
            }
        } catch (err) {
            console.error('Delete error:', err);
            Swal.fire('Error!', 'Failed to delete this product!', 'error');
        }
    };

    const editProduct = (id) => {
        const productToEdit = product.find(p => p.id === id);
        if (productToEdit) {
            setEditingProduct(productToEdit);
            setProductForm({
                title: productToEdit.title,
                price: productToEdit.price,
                discount: productToEdit.discount,
                description: productToEdit.description,
                image: productToEdit.image
            });
            setProductModel(true);
        }
    };

    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-semibold text-blue-600">
                        Products ({product.length})
                    </h1>
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm sm:text-base transition-colors"
                        onClick={() => setProductModel(true)}
                    >
                        <i className="ri-sticky-note-add-line"></i> New Product
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg">Loading products...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                        {product.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                No products found. Add your first product!
                            </div>
                        ) : (
                            product.map(item => (
                                <div key={item.id}
                                    data-aos="zoom-in"
                                    className="bg-white rounded-[10px] p-2 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-[10px] transform transition-transform duration-300 hover:scale-105"

                                    />
                                    <div className="p-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold truncate">{item.title}</h3>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => editProduct(item.id)}
                                                    className="hover:scale-110 transition-transform"
                                                    title="Edit Product"
                                                >
                                                    <i className="ri-edit-box-line bg-blue-600 text-white rounded-[10px] p-2"></i>
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct(item.id)}
                                                    className="hover:scale-110 transition-transform"
                                                    title="Delete Product"
                                                >
                                                    <i className="ri-delete-bin-5-line rounded-[10px] bg-red-600 text-white p-2"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <small className="text-gray-400 block mb-2">{item.description}</small>
                                        <div className="font-bold flex gap-2 items-center">
                                            <span className="text-green-600">
                                                ₹{(item.price - (item.price * item.discount) / 100).toLocaleString()}
                                            </span>
                                            <del className="text-gray-400">₹{item.price.toLocaleString()}</del>
                                            <span className="text-orange-500 text-sm">({item.discount}% Off)</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {productModel && (
                    <div ref={modelContainer} className="animate__animated animate__fadeIn bg-black bg-opacity-40 fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 px-2">
                        <div className="animate__animated animate__pulse bg-white w-[95%] sm:w-10/12 md:w-8/12 lg:w-6/12 py-4 px-4 sm:px-6 rounded-md relative max-h-[90vh] overflow-y-auto">
                            <button className="absolute top-2 right-1" onClick={handleCloseModel}>
                                <i className="ri-close-circle-line text-xl font-bold bg-red-600 p-2 text-white rounded-full hover:bg-red-700"></i>
                            </button>
                            <h1 className="font-bold text-lg mb-2">
                                {editingProduct ? 'Edit Product' : 'Add A Product'}
                            </h1>
                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3" onSubmit={handleSubmit}>
                                <input
                                    required
                                    name='title'
                                    placeholder="Enter Product Title..."
                                    className="p-2 border border-gray-300 rounded-md col-span-full focus:outline-none focus:border-indigo-500"
                                    type="text"
                                    onChange={handleProductForm}
                                    value={productForm.title}
                                />
                                <input
                                    required
                                    name='price'
                                    placeholder="Price"
                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    onChange={handleProductForm}
                                    value={productForm.price}
                                />
                                <input
                                    required
                                    name='discount'
                                    placeholder="Discount (%)"
                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                                    type="number"
                                    min="0"
                                    max="100"
                                    onChange={handleProductForm}
                                    value={productForm.discount}
                                />
                                <textarea
                                    required
                                    name="description"
                                    placeholder="Description"
                                    className="p-2 border border-gray-300 rounded-md col-span-full focus:outline-none focus:border-indigo-500"
                                    rows={4}
                                    onChange={handleProductForm}
                                    value={productForm.description}
                                ></textarea>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="col-span-full border p-2 rounded focus:outline-none focus:border-indigo-500"
                                />

                                {editingProduct?.image && (
                                    <div className="col-span-full">
                                        <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                                        <img
                                            src={editingProduct.image}
                                            alt="Current product"
                                            className="w-20 h-20 object-cover rounded border"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Select a new image to replace the current one
                                        </p>
                                    </div>
                                )}

                                <div className="col-span-full">
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 px-6 py-2 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Products;
