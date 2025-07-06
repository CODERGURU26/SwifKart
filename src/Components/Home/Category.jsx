import React, { useState } from "react"
import Layout2 from "./Layout2"
import img from './CategoryImg/a.jpg'
import img2 from './CategoryImg/b.jpg'
import img3 from './CategoryImg/c.jpg'
import img4 from './CategoryImg/d.png'
const Category = ()=>{
    const [category , setCategory] = useState([
       {
         image : img,
         title : 'Electronics & Gadgets'
       },
       {
        image : img2,
        title : 'Toys & Games '
       },
       {
        image : img3,
        title : 'Fashion & Apparel'
       },
       {
        image : img4,
        title : 'Groceries & Food '
       },
       {
        image : img,
        title : 'Electronics & Gadgets'
      },
      {
       image : img2,
       title : 'Toys & Games '
      },
      {
       image : img3,
       title : 'Fashion & Apparel'
      },
      {
       image : img4,
       title : 'Groceries & Food '
      },
      {
        image : img,
        title : 'Electronics & Gadgets'
      },
      {
       image : img2,
       title : 'Toys & Games '
      },
      {
       image : img3,
       title : 'Fashion & Apparel'
      },
      {
       image : img4,
       title : 'Groceries & Food '
      },
      {
        image : img,
        title : 'Electronics & Gadgets'
      },
      {
       image : img2,
       title : 'Toys & Games '
      },
      {
       image : img3,
       title : 'Fashion & Apparel'
      },
      {
       image : img4,
       title : 'Groceries & Food '
      }
    ])
    return(
        <>
        <Layout2>
           <div className="p-16">
                <div className="w-10/12 mx-auto grid md:grid-cols-4  gap-6">
                    {
                        category.map((item , index)=>{
                               return(
                                    <div key={index} className="bg-white shadow-lg p-4 rounded-[10px]">
                                        <img src={item.image} className="h-[300px] object-cover rounded-[10px] w-full" />
                                        <h1 className="text-xl font-bold text-center">{item.title}</h1>
                                    </div>
                               ) 
                        })
                    }
                </div>
           </div>
        </Layout2>
           
        </>
    )
}
export default Category