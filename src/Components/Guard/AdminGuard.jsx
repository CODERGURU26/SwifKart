import React, { useEffect, useState } from "react"
import firebaseAppConfig from "../../../util/firebase-config"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useNavigate, Outlet ,Navigate } from "react-router-dom"
import { getFirestore, where, query, getDocs, collection } from "firebase/firestore"
import { useLocation } from "react-router-dom"

const auth = getAuth(firebaseAppConfig)
const db = getFirestore(firebaseAppConfig)

const AdminGuard = () => {
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const[isAdmin , setIsAdmin] = useState(false)
    const location = useLocation()

    console.log(location)
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setSession(user)
            }
            else {
                navigate('/')
                return false
            }
        })
    }, [])

    useEffect(() => {
        const req = async () => {
            if (session) {
                const col = collection(db, 'customers')
                const q = query(col, where('userId', '==', session.uid))
                const snapshot = await getDocs(q)
                let role = null

                snapshot.forEach((docs) => {
                    const customers = docs.data()
                    role = customers.role
                })

                if (role === 'user') {
                    navigate('/Profile')
                    return false
                }
                else {
                    setIsAdmin(true)
                }
            }
        }
        req()
    }, [session])

    if(location.pathname === '/Admin'){
        return <Navigate to='/Dashboard' />
    }

    if(isAdmin) return <Outlet />

    return (
        <>
            <div className=" h-screen flex justify-center items-center">
                <span class="relative flex w-12 h-12">
                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                    <span class="relative inline-flex w-12 h-12  rounded-full bg-sky-500"></span>
                </span>
            </div>

        </>
    )
}

export default AdminGuard