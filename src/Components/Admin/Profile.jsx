import React, { useEffect, useState } from "react"
import Layout2 from "../Home/Layout2"
import img from './avtar/avtar.svg'
import img2 from './Loader/a.webp'
import firebaseAppConfig from "../../../util/firebase-config"
import { onAuthStateChanged, getAuth, updateProfile } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore"

const auth = getAuth(firebaseAppConfig)
const db = getFirestore(firebaseAppConfig)
const Profile = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [session, setSession] = useState(null)
    const [image, setImage] = useState(img)
    const [formValue, setFormVale] = useState({
        Fullname: '',
        Email: '',
        Mobile: ''
    }
    )
    const [addressFormValue, setAddressFormValue] = useState({
        Address: '',
        City: '',
        State: '',
        Country: '',
        Pincode: '',
        userId: '',
        Mobile : ''
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
    }
        , [session, Isupdated])

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
            <h1 className="text-center mt-100 font-bold text-3xl">Loading...</h1>
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

    const getStatusColor = (status) => {
        if (status === 'Pending') {
            return 'bg-yellow-600 text-white'
        }
        else if (status === 'Processing') {
            return 'bg-blue-600 text-white'
        }
        else if (status === 'Dispatched') {
            return 'bg-indigo-600 text-white'
        }
        else if (status === 'Delivered') {
            return 'bg-green-600 text-white'
        }
        else if (status === 'Returned') {
            return 'bg-red-600 text-white'
        }
    }
    return (
        <>
            <Layout2>
                <div className="p-8 my-8 md:w-7/12 mx-auto bg-white shadow-lg ">
                    <div className="flex items-center gap-2">
                        <i className="ri-instance-fill text-2xl"></i>
                        <h1 className="font-bold text-2xl">Orders</h1>
                    </div>
                    <hr className="my-6" />
                    {
                        orders.map((item, index) => {
                            return (
                                <div className="flex  gap-3 mb-10" key={index}>
                                    <img src={item.image} className="w-[150px]" />
                                    <div>
                                        <h1 className="capitalize font-semibold text-xl">{item.title}</h1>
                                        <p className="text-gray-600">{item.description.slice(0, 50)}</p>
                                        <div className="space-x-1">
                                            <label className="font-bold text-lg">
                                                ₹{item.price - (item.price * item.discount) / 100}
                                            </label>
                                            ₹<del className="text-gray-600">{item.price}</del>
                                            <label className="text-green-600">({item.discount}%OFF)</label>
                                        </div>
                                        <button className={`mt-2 ${getStatusColor(item.status)} text-white p-2 capitalize`}>{item.status}</button>
                                    </div>
                                </div>
                            )
                        })
                    }

                </div>

                <div className="p-8 my-8 md:w-7/12 mx-auto bg-white shadow-lg ">
                    <div className="flex items-center gap-2">
                        <i className="ri-user-smile-fill text-2xl"></i>
                        <h1 className="font-bold text-2xl">My Profile</h1>
                    </div>
                    <hr className="my-6" />
                    <div className=" w-fit mx-auto relative">
                        {
                            loading ?
                                <img src={img2} className="w-[100px] mb-8 rounded-full" />
                                :
                                <img src={image} className="w-[100px] mb-8 rounded-full" />
                        }

                        <input
                            type="file"
                            accept="image/*"
                            className="opacity-0 absolute top-0 left-0 w-full h-full"
                            onChange={onProfileChange}
                        />
                    </div>
                    <div>
                        <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-xl">Fullname</label>
                                <input
                                    onChange={handleForm}
                                    name="Fullname"
                                    type="text"
                                    className="p-2 border border-gray-400"
                                    value={formValue.Fullname}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-xl">Email</label>
                                <input
                                    readOnly
                                    onChange={handleForm}
                                    name="Email"
                                    type="text"
                                    className="p-2 border border-gray-400"
                                    value={session.email}
                                />
                            </div>

                            <div />
                            <div className="col-span-2">
                                <button className="hover:bg-green-400 w-fit rounded-[10px] bg-blue-600 text-white font-bold p-2">
                                    <i className="ri-save-3-line mr-2"></i>
                                    Save
                                </button>
                            </div>


                        </form>
                    </div>

                </div>

                <div className="p-8 my-8 md:w-7/12 mx-auto bg-white shadow-lg ">
                    <div className="flex items-center gap-2">
                        <i className="ri-truck-fill mr-2 text-4xl"></i>
                        <h1 className="font-bold text-2xl">Delivery Address</h1>
                    </div>
                    <hr className="my-6" />

                    <div>
                        <form className="grid grid-cols-2 gap-6" onSubmit={isAddress ? updateAddress : saveAddress}>
                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="font-bold text-xl">Area/Street/Village</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    name="Address"
                                    type="text"
                                    className="p-2 border border-gray-400"
                                    value={addressFormValue.Address}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-xl">City</label>
                                <input

                                    onChange={handleAddressFormValue}
                                    name="City"
                                    type="text"
                                    className="p-2 border border-gray-400"
                                    value={addressFormValue.City}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-xl">State</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    name="State"
                                    type="text"
                                    className="p-2 border border-gray-400"
                                    value={addressFormValue.State}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xl font-bold">Country</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    type="text"
                                    name="Country"
                                    className="p-2 border border-gray-400"
                                    value={addressFormValue.Country}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xl font-bold">Pincode</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    type="number"
                                    name="Pincode"
                                    className="p-2 border border-gray-400"
                                    value={addressFormValue.Pincode}
                                />
                            </div>
                            <div className="flex flex-col gap-2 " >
                                <label className="font-bold text-xl">Mobile</label>
                                <input
                                    onChange={handleAddressFormValue}
                                    name="Mobile"
                                    type="number"
                                    className="p-2 border border-gray-400"
                                    value={addressFormValue.Mobile}
                                />
                            </div>
                            <br/>
                            {
                                isAddress ?
                                    <button className="hover:bg-green-400 w-fit rounded-[10px] bg-blue-600 text-white font-bold p-2">
                                        <i className="ri-save-3-line mr-2"></i>
                                        Save
                                    </button>
                                    :
                                    <button className="hover:bg-blue-400 w-fit rounded-[10px] bg-green-600 text-white font-bold p-2">
                                        <i className="ri-save-3-line mr-2"></i>
                                        Submit
                                    </button>
                            }


                        </form>
                    </div>

                </div>
            </Layout2>

        </>
    )
}
export default Profile