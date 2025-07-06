import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import React from "react"
import 'animate.css'
import Products from "./Components/Admin/products"
import 'remixicon/fonts/remixicon.css'
import Orders from "./Components/Admin/Orders"
import NotFound from "./Components/Admin/NotFound"
import Layout from "./Components/Admin/Layout"
import Payments from "./Components/Admin/Payments"
import Setting from "./Components/Admin/Setting"
import Dashboard from "./Components/Admin/Dashboard"
import Customers from "./Components/Admin/Customers"

import Home from "./Components/Home/Home"
import Category from "./Components/Home/Category"

import Login from "./Components/Admin/Login"
import SignUp from "./Components/Admin/SignUp"
import ContactUs from "./Components/Admin/ContactUs"
import PreGuard from "./Components/Guard/PreGuard"
import Cart from "./Components/Admin/Cart"
import 'animate.css';
import Profile from "./Components/Admin/Profile"
import Failed from "./Components/Admin/Failed"
import AdminGuard from "./Components/Guard/AdminGuard"


const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home Slider />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path='/ContactUs' element={<ContactUs />} />
          <Route path="/Category" element={<Category />} />
          <Route path="/Products2" element={<Home />} />

          <Route element={<AdminGuard />} />
          <Route element={<AdminGuard />}>
            <Route path="/Layout" element={<Layout />} />
            <Route path="/Orders" element={<Orders />} />
            <Route path="Products" element={<Products />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Setting" element={<Setting />} />
            <Route path="/Customers" element={<Customers />} />
            <Route path="/Payments" element={<Payments />} />
          </Route>


          <Route element={<PreGuard />}>
            <Route path="/Login" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
          </Route>

          <Route path="/Failed" element={<Failed />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App