import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import img from './ContactImg/a.webp'; // your contact image
import Layout2 from '../Home/Layout2';

const ContactUs = () => {
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        emailjs
            .sendForm('service_3zc48ee', 'template_1ap5e72', form.current, {
                publicKey: 'XkA69SFjQZahOB6Np',
            })
            .then(
                () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Message Sent!',
                        text: 'Thank you for reaching out. I’ll get back to you soon.',
                        confirmButtonColor: '#e11d48',
                    });
                    form.current.reset();
                },
                (error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong. Please try again later.',
                        confirmButtonColor: '#e11d48',
                    });
                }
            );
    };

    return (
        <Layout2>
            <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-white">
                <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl overflow-hidden">
                    {/* Image */}
                    <div className="w-full h-auto">
                        <img src={img} alt="Contact" className="w-full object-cover" />
                    </div>

                    {/* Form */}
                    <div className="p-6 md:p-10">
                        <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <label className="text-pink-600 font-bold text-xl mb-1">FirstName</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    placeholder="Guru.."
                                    className="p-3 border border-pink-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-pink-600 font-bold text-xl mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder="example@gmail.com"
                                    className="p-3 border border-pink-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-pink-600 font-bold text-xl mb-1">Message</label>
                                <textarea
                                    required
                                    name="message"
                                    placeholder="Enter Your Query Here...."
                                    rows="4"
                                    className="p-3 border border-pink-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded transition-all duration-300"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </Layout2>

    );
};

export default ContactUs;
