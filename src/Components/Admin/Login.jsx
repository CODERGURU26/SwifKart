import React, { useState } from "react"
import img from './SignUpImg/a.svg'
import { Link, useNavigate } from "react-router-dom"
import firebaseAppConfig from "../../../util/firebase-config"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

const auth = getAuth(firebaseAppConfig)

const Login = () => {
    const [passType, setPassType] = useState("password")
    const [error, setError] = useState(null)

    const [formValue, setFormValue] = useState({
        email: '',
        password: ''
    })

    const [loader, setLoader] = useState(false)

    const navigate = useNavigate()

    const login = async (e) => {
        try {
            e.preventDefault()
            setLoader(true)
            await signInWithEmailAndPassword(auth, formValue.email, formValue.password)
            navigate('/')
        }
        catch (err) {
            setError(err.message)
        }
        finally {
            setLoader(false)
        }
    }

    const handleChange = (e) => {
        const input = e.target
        const name = input.name
        const value = input.value
        setFormValue({
            ...formValue,
            [name]: value
        })
        setError(null)
    }
    return (
        <div className="grid md:grid-cols-2 animate__animated animate__backInDown">
            <div className="">
                <img src={img} className="mt-40 w-[700px]" />
            </div>
            <div className=" p-16 flex flex-col justify-center mt-29 ">
                <h1 className="text-2xl font-bold text-pink-600">SignIn</h1>
                <p className="text-gray-500">Enter Your Details For Login</p>
                <form className="flex flex-col  gap-2">
                    <label className="font-bold mb-1 mt-6 text-pink-600">Email</label>
                    <input
                        onChange={handleChange}
                        required
                        name="email"
                        type="text" placeholder="example@gmail.com" className="border-2 border-pink-600 p-2 w-[60%]" />

                    <div className="relative flex flex-col">
                        <label className="font-bold mb-1 text-pink-600">Password</label>
                        <input
                            onChange={handleChange}
                            required
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
                            <h1 className="font-bold text-blue-600 ">Loading...</h1>
                            :
                            <button onClick={login} className="bg-pink-600 w-fit p-2 text-white font-semibold rounded-[10px] hover:bg-blue-400">
                                Login
                            </button>
                    }


                </form>
                <div>
                    Don't Have An Account ? <Link to='/SignUp' className='text-blue-800'>Register Now</Link>
                </div>
                {
                    error &&
                    <div className="p-2 bg-red-400 font-bold text-white">
                        <h1>OOPS ! Something Went Wrong ! Please Try Again...</h1>
                    </div>
                }
            </div>
        </div>
    )
}
export default Login