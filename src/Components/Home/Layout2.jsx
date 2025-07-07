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
            <nav className="bg-slate-50 ">
                <div className="flex items-center sticky top-0 left-0 justify-between shadow-lg p-2">
                    <div className="flex items-center gap-4">
                        <img src={img} className="w-[80px]" />
                        <h1 className="text-2xl text-rose-600 font-bold">SwiftKart</h1>
                    </div>

                    <button className="md:hidden" onClick={() => setOpen(!open)}>
                        <i className="ri-menu-line font-bold text-4xl"></i>
                    </button>
                    <ul className="md:flex gap-8 items-center hidden">
                        {
                            menu.map((item, index) => {
                                return (
                                    <li key={index}><Link className="text-xl font-semibold hover:text-rose-600" to={item.link}>{item.label}</Link></li>
                                )
                            })
                        }
                        {
                            (session && cartCount > 0) &&
                            <Link to='/Cart' className="text-xl relative">
                                <i className="ri-shopping-cart-line"></i>
                                <div className="absolute -top-4  bg-rose-600 text-white rounded-full w-6 text-center h-6 left-4 flex justify-center items-center">
                                    {cartCount}
                                </div>
                            </Link>
                        }
                        {
                            !session &&
                            <>
                                <button className="text-xl bg-blue-600 text-white font-semibold p-2 rounded-[10px] hover:bg-rose-600 text-center">
                                    <a href="/Login">Login</a></button>

                                <button className="text-xl bg-red-600 transition duration-150 text-white font-semibold p-2 rounded-[10px] hover:bg-blue-600 text-center">
                                    <a href="/SignUp">SignUp</a></button>
                            </>
                        }
                        {
                            session &&
                            <button onClick={() => setAccountMenu(!accountMenu)}>
                                <img src={img2} className="w-[50px] shadow-lg rounded-[10px]" />
                                {
                                    accountMenu &&
                                    <div className="bg-white shadow-rose-200   flex flex-col items-start  shadow-xl  animate__animated animate__fadeInDown">
                                        {
                                    

                                            (role && role === 'admin') &&
                                            <Link to='/Products' className="hover:bg-rose-200 p-2">
                                               <i className="ri-admin-line mr-2"></i>
                                                Admin Panel</Link>
                                        }

                                        <Link to='/Profile' className="hover:bg-rose-200 p-2">
                                            <i className="ri-user-3-fill mr-2 "></i>
                                            My  Profile</Link>

                                        <Link to='/Cart' className="hover:bg-rose-200 p-2 w-full text-left">
                                            <i className="ri-shopping-cart-fill mr-2"></i>
                                            Cart</Link>

                                        <button className="hover:bg-rose-200 p-2 w-full text-left" onClick={() => signOut(auth)}>
                                            <i className="ri-logout-circle-line mr-2"></i>
                                            Logout
                                        </button>

                                    </div>
                                }

                            </button>
                        }
                    </ul>
                </div>
            </nav>
            <div>
                {children}
            </div>
            <footer className="bg-rose-600 ">
                <div className="grid md:grid-cols-4 md:gap-0 gap-8 mx-auto w-10/12 py-10 ">

                    <div>
                        <h1 className="text-2xl font-semibold text-white">Usefull Links</h1>
                        <ul className="mt-8 text-xl font-lg text-white flex flex-col gap-4 ">
                            {
                                menu.map((item, index) => {
                                    return (
                                        <li key={index}>
                                            <a href={item.link} className="hover:text-blue-400">{item.label}</a>
                                        </li>
                                    )
                                })
                            }
                            <li><a href="/Login" className="hover:text-blue-400">Login</a></li>
                            <li><a href="/SignUp" className="hover:text-blue-400" >SignUp</a></li>
                        </ul>

                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Follow Us</h1>
                        <ul className="mt-8 text-xl font-lg text-white flex flex-col gap-4 ">
                            <li><a href="/" className="hover:text-blue-400">Facebook</a></li>
                            <li><a href="/" className="hover:text-blue-400">Twitter</a></li>
                            <li><a href="/" className="hover:text-blue-400" >Instagram</a></li>
                            <li><a href="/" className="hover:text-blue-400" >LinkedIn</a></li>
                            <li><a href="/" className="hover:text-blue-400" >Youtube</a></li>

                        </ul>

                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Contact-Us</h1>
                        <form className="mt-4 flex flex-col gap-8 mr-24">
                            <input
                                name="fullname"
                                className="bg-white p-2 w-full"
                                placeholder="Your Name"
                            />
                            <input name="email"
                                className="bg-white p-2 w-full"
                                placeholder="example@gmail.com"
                            />
                            <textarea
                                className="bg-white p-2 w-full"
                                placeholder="Write Your Query Here.."
                            ></textarea>
                            <button className="bg-blue-400  text-white font-semibold p-2 text-lg">
                                Submit
                            </button>
                        </form>

                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Brand Details</h1>
                        <h1 className="text-xl font-semibold text-white">"Shop Swift, Shop Smart"</h1>
                        <p className="text-gray-100 mt-4">SwiftKart is a fast, reliable, and user-friendly e-commerce platform designed to offer a seamless shopping experience.
                            It provides a wide range of products, including electronics, fashion, home essentials, and more.
                            With a focus on quick delivery and excellent customer service,
                            SwiftKart aims to become the preferred choice for online shoppers.</p>
                        <img src={img} className="w-28 mt-8" />

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