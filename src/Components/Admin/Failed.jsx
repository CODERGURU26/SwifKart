import React from "react"
import img2 from './FaildeImage/a.svg'
import { Link } from "react-router-dom"
const Failed = ()=>{
    return(
        <>
            <div className="h-screen bg-hray-100 flex flex-col items-center justify-center ">
                <img src={img2} className="w-6/12 mb-5"/>
                <h1 className="inline-block text-4xl font-bold ">Payment Failed !</h1>
                <br />
                 <Link to='/' className=" bg-red-600 p-2 text-white text-2xl">Try Again !</Link>
            </div>
        </>
    )
}
export default Failed