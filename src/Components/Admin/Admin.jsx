import React from "react"
import img from './AdminLogin/b.svg'
const Admin = () => {
  return (
    <>
      <div className="bg-gray-200 h-screen flex justify-center items-center">
        <div>
          <img src={img} className="w-[440px] h-[440px]" />
        </div>
        <div>
          <h1 className="text-3xl text-rose-600 font-bold">Admin Console</h1>
        </div>
      </div>
    </>
  )
}
export default Admin