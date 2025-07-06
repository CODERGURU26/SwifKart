import React, { useState } from "react"
import img from './SignUpImg/a.svg'
import { Link, useNavigate } from "react-router-dom"
import firebaseAppConfig from "../../../util/firebase-config"
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth"
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore"

const db = getFirestore(firebaseAppConfig)
const auth = getAuth(firebaseAppConfig)

const SignUp = () => {
    const navigate = useNavigate()
    const [passType, setPassType] = useState("password")
    const [formValue, setFormVale] = useState({
        fullname: '',
        email: '',
        mobile: '',
        password: ''
    })
    const [error, setError] = useState(null)
    const [loader, setLoader] = useState(false)
    const signUpBtn = async (e) => {
        try {
            e.preventDefault()
            setLoader(true)
            const userCredentials = await createUserWithEmailAndPassword(auth, formValue.email, formValue.password)
            await updateProfile(auth.currentUser, { displayName: formValue.fullname })
            await addDoc(collection(db, 'customers'), {
                name: formValue.fullname,
                email: formValue.email,
                phone: formValue.mobile,
                address: 'N/A', // Optional or fetch from profile later
                date: new Date().toLocaleDateString(), 
                role : 'user',
                userId: userCredentials.user.uid
            });

            navigate('/')
        }
        catch (err) {
            setError(err.message)
        }
        finally {
            setLoader(false)
        }
    }
    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormVale((prevState) => ({
            ...prevState,
            [name]: value
        }));
        setError(null)
    };

    return (
        <div className="grid md:grid-cols-2 animate__animated animate__backInDown">
            <div >
                <img src={img} className="mt-40 w-[700px]" />
            </div>
            <div className=" p-16 flex flex-col justify-center mt-29">
                <h1 className="text-2xl font-bold text-pink-600">New User</h1>
                <p className="text-gray-500">Create Your Account For Continuing Limitless Shopping</p>
                <form className="flex flex-col mt-4">
                    <label className="font-bold mb-1 text-pink-600">FullName</label>
                    <input
                        required
                        onChange={handleInput}
                        name="fullname"
                        type="text"
                        placeholder="Guru..."
                        className="border-2 border-pink-600 p-2 w-[60%]" />

                    <label className="font-bold mb-1 text-pink-600">Email</label>
                    <input
                        required
                        onChange={handleInput}
                        name="email"
                        type="text"
                        placeholder="example@gmail.com"
                        className="border-2 border-pink-600 p-2 w-[60%]" />

                    <label className="font-bold mb-1 text-pink-600">Mobile</label>
                    <input
                        required
                        onChange={handleInput}
                        name="mobile"
                        type="number"
                        placeholder="9999999999"
                        className="border-2 border-pink-600 p-2 w-[60%]" />


                    <div className="relative flex flex-col">
                        <label className="font-bold mb-1 text-pink-600">Password</label>
                        <input
                            required
                            onChange={handleInput}
                            name="password"
                            type={passType}
                            placeholder="******"
                            className="border-2 border-pink-600 p-2 w-[60%]" />
                        <button onClick={() => setPassType(passType === 'password' ? 'text' : 'password')} type="button" className="absolute top-9 md:right-65 right-40">
                            {
                                passType === 'password'
                                    ?
                                    <i className="ri-eye-line text-gray-500 hover:text-pink-600 text-[20px]"></i>
                                    :
                                    <i className="ri-eye-off-line text-gray-500 hover:text-pink-600 text-[20px]"></i>
                            }
                        </button>
                    </div>
                    {
                        loader ?
                            <h1 className="text-blue-600 font-bold mt-4">Loading...</h1>
                            :
                            <button onClick={signUpBtn} className="bg-pink-600 w-fit mt-4 p-2 text-white font-semibold rounded-[10px] hover:bg-blue-400">
                                SignUp
                            </button>
                    }


                </form>
                <div>
                    Already Have An Account ? <Link to='/Login' className="text-blue-800">Login</Link>
                </div>
                {
                    error &&
                    <div className="mt-2 bg-red-600 p-2 text-white font-semibold animate__animated animate__pulse">
                        <p className="text-center">Something Is Wrong ! Please Try Again Later..</p>
                    </div>
                }

            </div>
        </div>
    )
}
export default SignUp