import React, { useEffect, useState } from "react"
import Layout from "./Layout"
import img from './avtar/avtar.svg'
import img2 from './Loader/a.webp'
import firebaseAppConfig from "../../../util/firebase-config"
import { onAuthStateChanged, getAuth, updateProfile } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { updatePassword } from "firebase/auth"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore"

const auth = getAuth(firebaseAppConfig)
const db = getFirestore(firebaseAppConfig)

const Setting = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [session, setSession] = useState(null)
    const [image, setImage] = useState(img)
    const [newPassword, setNewPassword] = useState('')
    const [currentPassword, setCurrentPassword] = useState("")

    const [formValue, setFormVale] = useState({
        Fullname: '',
        Email: '',
        Mobile: ''
    })
    
    const [addressFormValue, setAddressFormValue] = useState({
        Address: '',
        City: '',
        State: '',
        Country: '',
        Pincode: '',
        userId: '',
        Mobile: ''
    })

    const [isAddress, setIsAddress] = useState(false)
    const [DocId, setDocId] = useState(null)
    const [Isupdated, SetIsUpdated] = useState(false)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setSession(user)
            }
            else {
                setSession(false)
                navigate('/Login')
            }
        })
    }, [])

    useEffect(() => {
        const req = async () => {
            if (session) {
                setFormVale({
                    ...formValue,
                    Fullname: session.displayName,
                    Mobile: (session.phoneNumber ? session.phoneNumber : '')
                })

                //Fetch Address
                const col = collection(db, 'addresses')
                const q = query(col, where("userId", "==", session.uid))
                const snapshot = await getDocs(q)
                snapshot.forEach((docs) => {
                    setDocId(docs.id)
                    const address = docs.data()
                    setIsAddress(!snapshot.empty)
                    setAddressFormValue({
                        ...addressFormValue,
                        ...address
                    })
                })
            }
        }
        req()
    }, [session, Isupdated])

    useEffect(() => {
        const req = async () => {
            if (session) {
                const col = collection(db, 'orders')
                const q = query(col, where('userId', '==', session.uid))
                const temp = []
                const snapshot = await getDocs(q)
                snapshot.forEach((docs) => {
                    temp.push(docs.data())
                })
                setOrders(temp)
            }
        }
        req()
    }, [session])

    if (session === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-center font-bold text-2xl md:text-3xl">Loading...</h1>
            </div>
        )
    }

    const handleForm = (e) => {
        const input = e.target
        const name = input.name
        const value = input.value

        setFormVale({
            ...formValue,
            [name]: value
        })
    }

    const handleAddressFormValue = (e) => {
        const input = e.target
        const name = input.name
        const value = input.value

        setAddressFormValue({
            ...addressFormValue,
            [name]: value
        })
    }

    const onProfileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return ('Please First Select An Image !!')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'SwiftKart')
        formData.append('cloud_name', 'dyimyol9r')

        try {
            setLoading(true)
            const response = await fetch('https://api.cloudinary.com/v1_1/dyimyol9r/image/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            console.log('Upload Image Url', data.secure_url)
            setImage(data.secure_url)
        }
        catch (err) {
            alert(err.message)
        }
        finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await updateProfile(auth.currentUser, {
            displayName: formValue.Fullname,
            phoneNumber: formValue.Mobile
        })
        new Swal({
            icon: 'success',
            title: 'Profile Updated !'
        })
    }

    const saveAddress = async (e) => {
        e.preventDefault()
        try {
            await addDoc(collection(db, "addresses"), {
                ...addressFormValue,
                userId: session.uid
            })

            setIsAddress(true)
            SetIsUpdated(!Isupdated)
            new Swal({
                icon: 'success',
                title: 'Address Saved Successfully!'
            })
        }
        catch (err) {
            new Swal({
                icon: 'error',
                title: 'OOPS! Something Went Wrong '
            })
        }
    }

    const updateAddress = async (e) => {
        try {
            e.preventDefault()
            const ref = doc(db, "addresses", DocId)
            await updateDoc(ref, addressFormValue)

            new Swal({
                icon: 'success',
                title: 'Address Updated ! '
            })
        }
        catch (err) {
            new Swal({
                icon: 'error',
                title: 'OOPS! Something Went Wrong '
            })
        }
    }


    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!newPassword || newPassword.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Password must be at least 6 characters'
            });
            return;
        }

        try {
            const user = auth.currentUser;

            // Re-authenticate the user first
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Then update password
            await updatePassword(user, newPassword);
            Swal.fire({
                icon: 'success',
                title: 'Password updated successfully'
            });

            // Clear inputs
            setCurrentPassword("")
            setNewPassword("")
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error updating password',
                text: error.message
            });
        }
    };

    return (
        <Layout>
            <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Profile Section */}
                    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <i className="ri-user-smile-fill text-xl sm:text-2xl"></i>
                            <h1 className="font-bold text-xl sm:text-2xl">My Profile</h1>
                        </div>
                        <hr className="my-4 sm:my-6" />
                        
                        {/* Profile Image */}
                        <div className="w-fit mx-auto relative mb-6">
                            {loading ? (
                                <img 
                                    src={img2} 
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover" 
                                    alt="Loading"
                                />
                            ) : (
                                <img 
                                    src={image} 
                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover" 
                                    alt="Profile"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
                                onChange={onProfileChange}
                            />
                        </div>
                        
                        {/* Profile Form */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-lg sm:text-xl">Fullname</label>
                                    <input
                                        onChange={handleForm}
                                        name="Fullname"
                                        type="text"
                                        className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formValue.Fullname}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-lg sm:text-xl">Email</label>
                                    <input
                                        readOnly
                                        onChange={handleForm}
                                        name="Email"
                                        type="text"
                                        className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base bg-gray-100 cursor-not-allowed"
                                        value={session.email}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-start pt-4">
                                <button 
                                    type="submit"
                                    className="bg-blue-600 hover:bg-green-400 text-white font-bold p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                                >
                                    <i className="ri-save-3-line mr-2"></i>
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <i className="ri-truck-fill text-xl sm:text-2xl"></i>
                            <h1 className="font-bold text-xl sm:text-2xl">Delivery Address</h1>
                        </div>
                        <hr className="my-4 sm:my-6" />
                        
                        <form className="space-y-4" onSubmit={isAddress ? updateAddress : saveAddress}>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-lg sm:text-xl">Area/Street/Village</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    name="Address"
                                    type="text"
                                    className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={addressFormValue.Address}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-lg sm:text-xl">City</label>
                                    <input
                                        onChange={handleAddressFormValue}
                                        name="City"
                                        type="text"
                                        className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={addressFormValue.City}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-lg sm:text-xl">State</label>
                                    <input
                                        onChange={handleAddressFormValue}
                                        name="State"
                                        type="text"
                                        className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={addressFormValue.State}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-lg sm:text-xl">Country</label>
                                    <input
                                        onChange={handleAddressFormValue}
                                        type="text"
                                        name="Country"
                                        className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={addressFormValue.Country}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold text-lg sm:text-xl">Pincode</label>
                                    <input
                                        onChange={handleAddressFormValue}
                                        type="number"
                                        name="Pincode"
                                        className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={addressFormValue.Pincode}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-lg sm:text-xl">Mobile</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    name="Mobile"
                                    type="number"
                                    className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={addressFormValue.Mobile}
                                />
                            </div>
                            
                            <div className="flex justify-start pt-4">
                                {isAddress ? (
                                    <button 
                                        type="submit"
                                        className="bg-blue-600 hover:bg-green-400 text-white font-bold p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        <i className="ri-save-3-line mr-2"></i>
                                        Update Address
                                    </button>
                                ) : (
                                    <button 
                                        type="submit"
                                        className="bg-green-600 hover:bg-blue-400 text-white font-bold p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        <i className="ri-save-3-line mr-2"></i>
                                        Submit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <i className="ri-lock-password-fill text-xl sm:text-2xl"></i>
                            <h1 className="font-bold text-xl sm:text-2xl">Update Password</h1>
                        </div>
                        <hr className="my-4 sm:my-6" />
                        
                        <form className="space-y-4" onSubmit={handleChangePassword}>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-lg sm:text-xl">Current Password</label>
                                <input
                                    type="password"
                                    className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-lg sm:text-xl">New Password</label>
                                <input
                                    type="password"
                                    className="p-2 sm:p-3 border border-gray-400 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-start pt-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-green-600 text-white font-bold p-2 sm:p-3 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                                >
                                    <i className="ri-key-line mr-2"></i>
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Setting