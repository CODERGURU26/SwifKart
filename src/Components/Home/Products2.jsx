import React, { useState } from "react"
import Layout2 from "./Layout2"
import img5 from './Techpro/a.webp'
import img6 from './Techpro/b.jpg'
import img7 from './Techpro/c.jpg'
import img8 from './Techpro/d.jpg'

const Products2 = () => {
    const [products, setProducts] = useState([])
    return (
        <Layout2>
            <div className="p-16">
                <h1 className="text-3xl text-center text-pink-600 font-bold"> Products</h1>
                <p className="text-center text-sm w-6/12 mx-auto mt-2 mb-6">The latest trending products include the Apple Vision Pro,
                    a cutting-edge mixed-reality headset for immersive AR/VR experiences,
                    and the Samsung Galaxy S24 Ultra,
                    featuring AI-powered enhancements and a stunning 200MP camera.</p>
                <div className="p-6 w-11/12 mx-auto grid md:grid-cols-4 flex gap-4">
                    {
                        products.map((item, index) => {
                            return (
                                <div key={index} className="rounded-[10px] p-2 bg-white shadow-lg flex flex-col items-center">
                                    <img src={item.image} className=" h-80 object-cover rounded-[10px]" />
                                    <h1 className="texxt-xl font-semibold">{item.title}</h1>
                                    <p className="text-gray-600">{item.description.slice(0, 45)}...</p>
                                    <div className="flex gap-4">
                                        <p className="font-bold">₹{item.price - (item.price * item.discount) / 100}</p>
                                        <del className="text-gray-400">₹{item.price}</del>
                                        <p>(15%OFF)</p>
                                    </div>
                                    <button className="bg-blue-400 text-white w-full p-2 font-semibold rounded-[10px]">Buy Now</button>
                                    <button className="bg-red-400 mt-2 text-white w-full p-2 font-semibold rounded-[10px]">
                                    <i class="ri-shopping-cart-2-fill mr-2"></i>
                                        Add To Cart</button>

                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </Layout2>
    )
}
export default Products2