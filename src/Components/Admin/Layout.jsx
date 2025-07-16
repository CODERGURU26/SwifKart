import React, { useEffect, useState } from "react"
import img from './avtar/avtar.svg'
import { Link, useLocation } from "react-router-dom"
import firebaseAppConfig from "../../../util/firebase-config"
import { getAuth , onAuthStateChanged, signOut } from "firebase/auth"

const auth = getAuth(firebaseAppConfig)

const Layout = ({ children }) => {

    const [size, setSize] = useState(280)
    const [mobileSize, setMobileSize] = useState(0)
    const [accountMenu, setAccountMenu] = useState(false)
    const [session , setSession] = useState(false)

    useEffect(()=>{
        onAuthStateChanged(auth , (user)=>{
            if(user){
                setSession(user)
            }
            else{   
                setSession(null)
            }
        })
    },[])

    const menus = [
        {
            label: 'Dashboard',
            icon: <i className="ri-dashboard-2-fill mr-4"></i>,
            link: '/Dashboard'
        },
        {
            label: 'Customer',
            icon: <i className="ri-user-2-fill mr-4"></i>,
            link: '/Customers'
        },
        {
            label: 'Products',
            icon: <i className="ri-shopping-cart-2-fill mr-4"></i>,
            link: '/Products'
        },
        {
            label: 'Orders',
            icon: <i className="ri-box-3-fill mr-4"></i>,
            link: '/Orders'
        },

        
        {
            label: 'Setting',
            icon: <i className="ri-settings-4-fill mr-4"></i>,
            link: '/Setting'
        }
    ]

    const location = useLocation()

    return (
        <>
            {/* Desktop */}
            <div className="md:block hidden">
                <aside
                    className={`h-full bg-rose-400 fixed top-0 left-0 transition-transform duration-300 ${size === 0 ? '-translate-x-full' : 'translate-x-0'
                        }`}
                    style={{ width: size, overflow: 'hidden' }}
                >
                    <div className="flex flex-col">
                        {menus.map((item, index) => (
                            <Link key={index} to={item.link}
                                className="py-3 px-4 text-white hover:bg-blue-400  "
                                style={{
                                    background: (location.pathname === item.link) ? 'dodgerblue' : ''
                                }}
                            >
                                {item.icon} {item.label}
                            </Link>
                        ))}
                        <button   
                        className="py-3 px-4 text-white hover:bg-blue-400 text-left"
                        onClick={()=>{signOut(auth)}}
                        >
                        <i className="ri-logout-circle-line mr-4"></i>
                        Logout
                        </button>
                    </div>
                </aside>

                <section className=" min-h-screen bg-gray-200"
                    style={{
                        marginLeft: size,
                        transition: '0.3s'
                    }}
                >
                    <nav className="bg-white shadow p-4 flex items-center justify-between sticky top-0 left-0">
                        <div className="flex gap-3 items-center">
                            <button
                                onClick={() => setSize(
                                    size === 280 ? 0 : 280
                                )}
                                className="bg-gray-200 w-8 h-8 hover:bg-rose-400 hover:text-white">
                                <i className="ri-menu-2-line text-2xl font-semibold"></i>
                            </button>
                            <Link to='/' className="text-2xl font-bold text-rose-600">
                                SwiftKart
                            </Link>
                        </div>


                        <div >
                            <button className="relative" >
                                <img src={img} className="w-10 h-10" onClick={() => setAccountMenu(!accountMenu)} />
                                {
                                    accountMenu &&
                                    <div className="absolute top-10 right-0 bg-white p-4 mt-2">
                                        <h1 className="font-bold text-xl">{(session && session.displayName ) ? session.displayName : 'Admin'}</h1>
                                        <p className="text-gray-400 ">{session && session.email}</p>
                                        <div className="my-4">
                                            <button className="font-bold text-xl"onClick={()=>signOut(auth)}>
                                                <i className="ri-logout-circle-r-line mr-2 font-bold"></i>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                }

                            </button>
                        </div>
                    </nav>
                    <div className="p-8">
                        {children}
                    </div>
                </section>
            </div>
            {/* Mobile */}
            <div className="md:hidden">
                <aside
                    className={`h-full bg-rose-400 fixed z-10 top-0 left-0 transition-transform duration-300 ${size === 0 ? '-translate-x-full' : 'translate-x-0'
                        }`}
                    style={{ width: mobileSize, overflow: 'hidden' }}
                >
                    <div className="flex flex-col">
                        <button
                          onClick={() => setMobileSize(
                            mobileSize === 280 ? 0 : 280
                        )}
                        className=" text-right mx-4 mt-4"
                        >
                            <i className="ri-close-circle-fill text-4xl text-white "></i>
                        </button>
                        {menus.map((item, index) => (
                            <Link key={index} to={item.link}
                                className="py-3 px-4 text-white hover:bg-blue-400  "
                                style={{
                                    background: (location.pathname === item.link) ? 'dodgerblue' : ''
                                }}
                            >
                                {item.icon} {item.label}
                            </Link>
                        ))}
                         <button   
                        className="py-3 px-4 text-white hover:bg-blue-400 text-left">
                        <i class="ri-logout-circle-line mr-4"></i>
                        Logout
                        </button>
                    </div>
                </aside>

                <section className=" min-h-screen  bg-gray-200"
                    style={{

                    }}
                >
                    <nav className="bg-white shadow p-4 flex items-center justify-between sticky top-0 left-0">
                        <div className="flex gap-3 items-center">
                            <button
                                onClick={() => setMobileSize(
                                    mobileSize === 280 ? 0 : 280
                                )}
                                className="bg-gray-200 w-8 h-8 hover:bg-rose-400 hover:text-white">
                                <i className="ri-menu-2-line text-2xl font-semibold"></i>
                            </button>
                            <h1 className="text-2xl font-bold text-rose-600">
                                SwiftKart
                            </h1>
                        </div>


                        <div >
                            <button className="relative" >
                                <img src={img} className="w-10 h-10" onClick={() => setAccountMenu(!accountMenu)} />
                                {
                                    accountMenu &&
                                    <div className="absolute top-10 right-0 bg-white p-4 mt-2">
                                        <h1 className="font-bold text-xl">Guru</h1>
                                        <p className="text-gray-400 ">example@gmail.com</p>
                                        <div className="my-4">
                                            <button className="font-bold text-xl">
                                                <i className="ri-logout-circle-r-line mr-2 font-bold"></i>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                }

                            </button>
                        </div>
                    </nav>
                    <div className="p-8">
                        {children}
                    </div>
                </section>
            </div>
        </>

    )
}

export default Layout