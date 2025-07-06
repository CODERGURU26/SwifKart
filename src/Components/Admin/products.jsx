import React, { useState, useRef, useEffect } from "react";
import Layout from "./Layout";
import Swal from "sweetalert2";
import firebaseAppConfig from "../../../util/firebase-config";
import { getFirestore, addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

const db = getFirestore(firebaseAppConfig);

const Products = () => {
    const model = {
        title: '',
        price: '',
        discount: '',
        description: '',
        image: ''
    };

    const [product, setProduct] = useState([]);
    const [productForm, setProductForm] = useState(model);
    const [productModel, setProductModel] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const modelContainer = useRef(null);

    // Fetch products
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

            // Only upload new image if a file is selected
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
                // Update existing product
                const docRef = doc(db, "products", editingProduct.id);
                await updateDoc(docRef, productToSave);

                // Live edit - update specific product in local state
                setProduct(prevProducts => 
                    prevProducts.map(item => 
                        item.id === editingProduct.id 
                            ? { ...item, ...productToSave } 
                            : item
                    )
                );

                Swal.fire('Success!', 'Product updated successfully.', 'success');
            } else {
                // Add new product
                const docRef = await addDoc(collection(db, "products"), productToSave);
                
                // Add to local state immediately (live update)
                const newProduct = {
                    id: docRef.id,
                    ...productToSave
                };
                setProduct(prevProducts => [...prevProducts, newProduct]);

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

    // Live delete function
    const deleteProduct = async (id) => {
        try {
            // Show confirmation dialog
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
                // Delete from Firestore
                const ref = doc(db, 'products', id);
                await deleteDoc(ref);

                // Remove from local state immediately (live delete)
                setProduct(prevProducts => prevProducts.filter(item => item.id !== id));

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Product has been deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('Delete error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete this product!'
            });
        }
    };

    // Edit product function
    const editProduct = (id) => {
        const productToEdit = product.find(item => item.id === id);
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
            <div>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-blue-600">
                        Products ({product.length})
                    </h1>
                    <button 
                        className="bg-indigo-600 text-white p-4 rounded hover:bg-indigo-700 transition-colors" 
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
                    <div className="grid md:grid-cols-4 gap-8 mt-8">
                        {product.length === 0 ? (
                            <div className="col-span-4 text-center text-gray-500 py-8">
                                No products found. Add your first product!
                            </div>
                        ) : (
                            product.map((item, index) => (
                                <div key={item.id} className="bg-white rounded-[10px] p-2 shadow-lg hover:shadow-xl transition-shadow">
                                    <img 
                                        src={item.image} 
                                        alt={item.title}
                                        className="w-full h-64 object-cover rounded-[10px]" 
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
                    <div ref={modelContainer} className="animate__animated animate__fadeIn bg-black bg-opacity-40 fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
                        <div className="animate__animated animate__pulse bg-white w-6/12 py-4 px-6 rounded-md relative max-h-[90vh] overflow-y-auto">
                            <button className="absolute top-2 right-1" onClick={handleCloseModel}>
                                <i className="ri-close-circle-line text-xl font-bold bg-red-600 p-2 text-white rounded-full hover:bg-red-700"></i>
                            </button>
                            <h1 className="font-bold text-lg mb-2">
                                {editingProduct ? 'Edit Product' : 'Add A Product'}
                            </h1>
                            <form className="grid grid-cols-2 gap-6 mt-3" onSubmit={handleSubmit}>
                                <input
                                    required
                                    name='title'
                                    placeholder="Enter Product Title..."
                                    className="p-2 border border-gray-300 rounded-md col-span-2 focus:outline-none focus:border-indigo-500"
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
                                    className="p-2 border border-gray-300 rounded-md col-span-2 focus:outline-none focus:border-indigo-500"
                                    rows={4}
                                    onChange={handleProductForm}
                                    value={productForm.description}
                                ></textarea>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="col-span-2 border p-2 rounded focus:outline-none focus:border-indigo-500"
                                />
                                
                                {editingProduct && editingProduct.image && (
                                    <div className="col-span-2">
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

                                <div className="col-span-2">
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