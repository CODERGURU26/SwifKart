import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import firebaseAppConfig from "../../../util/firebase-config"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { collection, where, query, getDocs, getFirestore } from "firebase/firestore"
import img from './productlogog/c.png'
import img2 from './user/a.svg'
const auth = getAuth(firebaseAppConfig)

const db = getFirestore(firebaseAppConfig)


const Layout2 = ({ children, update }) => {
    const [session, setSession] = useState(null)
    const [cartCount, setCartCount] = useState(0)
    const [updateUI, setUpdateUI] = useState(false)
    const [role, setRole] = useState(null)
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setSession(user)
            }
            else {
                setSession(false)
            }
        })
    }, [])

    const [accountMenu, setAccountMenu] = useState(false)
    const [open, setOpen] = useState(false)
    const [menu, setMenu] = useState([
        {
            label: 'Home',
            link: '/'
        },
        {
            label: 'Products',
            link: '/Products2'
        },

        {
            label: 'Contact-Us',
            link: '/ContactUs'
        },

    ])

    useEffect(() => {
        if (session) {
            const req = async () => {
                const col = collection(db, 'carts')
                const q = query(col, where('userId', '==', session.uid))
                const snapshot = await getDocs(q)

                setCartCount(snapshot.size)
            }
            req()
        }

    }, [session, update])

    useEffect(() => {
        const fetchRole = async () => {
            if (session) {
                console.log("Fetching role for UID:", session.uid)
                const col = collection(db, 'customers')
                const q = query(col, where('userId', '==', session.uid))
                const snapshot = await getDocs(q)

                if (snapshot.empty) {
                    console.log("❌ No matching user found in 'customers'")
                } else {
                    snapshot.forEach((doc) => {
                        const data = doc.data()
                        console.log("✅ Found user:", data)
                        setRole(data.role)
                    })
                }
            }
        }

        fetchRole()
    }, [session])

    if (session === null)
        return (
            <div>
                <h1 className="font-bold text-center mt-70">Loading...</h1>
            </div>
        )
    return (
        <>
            <nav className="bg-slate-50 sticky top-0 left-0 w-full z-50">
                <div className="flex items-center justify-between shadow-lg p-2">
                    <div className="flex items-center gap-4">
                        <img src={img} className="w-[80px]" />
                        <Link to='/' className="text-2xl text-rose-600 font-bold">SwiftKart</Link>
                    </div>

                    {/* Mobile Only Auth Buttons or Profile */}
                    <div className="md:hidden flex items-center gap-4">
                        {session ? (
                            <button onClick={() => setAccountMenu(!accountMenu)}>
                                <img src={img2} className="w-[40px] shadow-lg rounded-[10px]" />
                                {accountMenu && (
                                    <div className="absolute right-2 top-16 bg-white shadow-lg flex flex-col p-2 rounded-md z-[9999] animate__animated animate__fadeInDown">
                                        {role === 'admin' && (
                                            <Link to='/Products' className="hover:bg-rose-200 p-2">
                                                <i className="ri-admin-line mr-2"></i>
                                                Admin Panel
                                            </Link>
                                        )}
                                        <Link to='/Profile' className="hover:bg-rose-200 p-2">
                                            <i className="ri-user-3-fill mr-2"></i>My Profile
                                        </Link>
                                        <Link to='/Cart' className="hover:bg-rose-200 p-2">
                                            <i className="ri-shopping-cart-fill mr-2"></i>Cart
                                        </Link>
                                        <button
                                            onClick={() => signOut(auth)}
                                            className="hover:bg-rose-200 p-2 text-left"
                                        >
                                            <i className="ri-logout-circle-line mr-2"></i>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </button>
                        ) : (
                            <>
                                <Link to="/Login" className="text-sm bg-blue-600 text-white font-semibold px-3 py-1 rounded hover:bg-rose-600">
                                    Login
                                </Link>
                                <Link to="/SignUp" className="text-sm bg-red-600 text-white font-semibold px-3 py-1 rounded hover:bg-blue-600">
                                    SignUp
                                </Link>
                            </>
                        )}
                        {/* Hamburger */}
                        <button onClick={() => setOpen(!open)}>
                            <i className="ri-menu-line font-bold text-4xl"></i>
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <ul className="md:flex gap-8 items-center hidden">
                        {menu.map((item, index) => (
                            <li key={index}>
                                <Link className="text-xl font-semibold hover:text-rose-600" to={item.link}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}

                        {session && cartCount > 0 && (
                            <Link to='/Cart' className="text-xl relative">
                                <i className="ri-shopping-cart-line"></i>
                                <div className="absolute -top-4 left-4 bg-rose-600 text-white rounded-full w-6 h-6 flex justify-center items-center">
                                    {cartCount}
                                </div>
                            </Link>
                        )}

                        {!session && (
                            <>
                                <Link to="/Login" className="text-xl bg-blue-600 text-white font-semibold p-2 rounded-[10px] hover:bg-rose-600">
                                    Login
                                </Link>
                                <Link to="/SignUp" className="text-xl bg-red-600 text-white font-semibold p-2 rounded-[10px] hover:bg-blue-600">
                                    SignUp
                                </Link>
                            </>
                        )}

                        {session && (
                            <button onClick={() => setAccountMenu(!accountMenu)} className="relative">
                                <img src={img2} className="w-[50px] shadow-lg rounded-[10px]" />
                                {
                                    accountMenu && (
                                        <div className="absolute right-0 top-16 bg-white shadow-rose-200 flex flex-col items-start shadow-xl z-[9999] rounded-md animate__animated animate__fadeInDown">
                                            {role === 'admin' && (
                                                <Link to='/Products' className="hover:bg-rose-200 p-2">
                                                    <i className="ri-admin-line mr-2"></i> Admin Panel
                                                </Link>
                                            )}
                                            <Link to='/Profile' className="hover:bg-rose-200 p-2">
                                                <i className="ri-user-3-fill mr-2"></i> My Profile
                                            </Link>
                                            <Link to='/Cart' className="hover:bg-rose-200 p-2 w-full text-left">
                                                <i className="ri-shopping-cart-fill mr-2"></i> Cart
                                            </Link>
                                            <button onClick={() => signOut(auth)} className="hover:bg-rose-200 p-2 w-full text-left">
                                                <i className="ri-logout-circle-line mr-2"></i> Logout
                                            </button>
                                        </div>
                                    )
                                }
                            </button>

                        )}
                    </ul>
                </div>
            </nav>
            <div>
                {children}
            </div>
            <footer className="bg-rose-600 text-white">
                <div className="w-11/12 mx-auto py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">
                    {/* Useful Links */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-2xl font-semibold">Useful Links</h1>
                        <ul className="mt-6 space-y-3">
                            {menu.map((item, index) => (
                                <li key={index}>
                                    <Link to={item.link} className="hover:text-blue-300">{item.label}</Link>
                                </li>
                            ))}
                            {!session && (
                                <>
                                    <li>
                                        <Link to="/Login" className="hover:text-blue-300">Login</Link>
                                    </li>
                                    <li>
                                        <Link to="/SignUp" className="hover:text-blue-300">SignUp</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-2xl font-semibold">Follow Us</h1>
                        <ul className="mt-6 space-y-3">
                            {["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube"].map((platform, idx) => (
                                <li key={idx}>
                                    <a href="/" className="hover:text-blue-300">{platform}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-2xl font-semibold">Contact Us</h1>
                        <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex flex-col space-y-4 w-full sm:w-auto">
                            <input
                                name="fullname"
                                className="bg-white text-black p-2 rounded w-full sm:w-auto"
                                placeholder="Your Name"
                            />
                            <input
                                name="email"
                                className="bg-white text-black p-2 rounded w-full sm:w-auto"
                                placeholder="example@gmail.com"
                            />
                            <textarea
                                className="bg-white text-black p-2 rounded w-full sm:w-auto"
                                placeholder="Write your query here..."
                            />
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                                Submit
                            </button>
                        </form>
                    </div>

                    {/* Brand Info */}
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-2xl font-semibold">Brand Details</h1>
                        <p className="mt-4 text-sm leading-relaxed max-w-xs">
                            "Shop Swift, Shop Smart" — SwiftKart is a fast, reliable, and user-friendly e-commerce platform designed to offer a seamless shopping experience.
                        </p>
                        <img src={img} alt="SwiftKart Logo" className="w-24 mt-6" />
                    </div>
                </div>
            </footer>



            <aside
                className={`fixed top-0 left-0 h-full bg-slate-900 shadow-lg transition-all duration-300 ease-in-out z-50 ${open ? "w-52" : "w-0 overflow-hidden"
                    }`}
                aria-hidden={!open}
            >
                <div className="flex flex-col gap-8 p-4">
                    {menu.map((item, index) => (
                        <Link to={item.link} key={index} className="text-white truncate">
                            {item.label}
                        </Link>
                    ))}
                </div>
            </aside>


        </>
    )
}
export default Layout2