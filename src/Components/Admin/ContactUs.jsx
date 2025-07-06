import React from "react"
import Layout2 from "../Home/Layout2"
import img from './ContactImg/a.webp'
const ContactUs = () => {
    return (
        <Layout2>
            <header className="p-8">
                <div className=" w-6/12 bg-white shadow-lg mx-auto ">
                    <img src={img} alt="" />
                    <div className="p-8">
                            <form className="flex flex-col gap-6">
                                <div className="flex flex-col">
                                <label className="font-bold mb- text-2xl text-pink-600">FirstName</label>
                                <input 
                                required
                                type="text" 
                                name="fullname"
                                placeholder="Guru.." 
                                className="p-2 border-2 border-pink-600"
                                />
                                </div>

                                <div className="flex flex-col">
                                <label className="font-bold mb- text-2xl text-pink-600">Email</label>
                                <input 
                                required
                                type="text" 
                                name="email"
                                placeholder="example@gmail.com" 
                                className="p-2 border-2 border-pink-600"
                                />
                                </div>

                                
                                <div className="flex flex-col">
                                <label className="font-bold mb- text-2xl text-pink-600">Message</label>
                                <textarea 
                                required
                             
                                name="message"
                                placeholder="Enter Your Query Here...." 
                                className="p-2 border-2 border-pink-600"
                                />
                                </div>
                              
                            </form>
                    </div>
                </div>                
                
            </header>
        </Layout2>
    )
}
export default ContactUs

