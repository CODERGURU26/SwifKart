import React from "react"
import Layout from "./Layout"
import ReactApexChart from "react-apexcharts"
import img2 from './DashboardImg/a.jpg'
const Dashboard = () => {
    const sales = {
        options: {
            chart: {
                id: 'apexchart-example'
            },
            xaxis: {
                categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
            }
        },
        series: [{
            name: 'series-1',
            data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
        }]
    }

    const profit = {
        options: {
            chart: {
                id: "profit-chart",
                toolbar: {
                    show: true
                }
            },
            xaxis: {
                categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
                title: {
                    text: "Month"
                }
            },
            yaxis: {
                title: {
                    text: "$ (thousands)"
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                position: "bottom"
            },
            colors: ['#008FFB', '#00E396', '#FEB019'] // Blue, Green, Orange
        },
        series: [
            {
                name: "Net Profit",
                data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
            },
            {
                name: "Revenue",
                data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
            },
            {
                name: "Free Cash Flow",
                data: [35, 41, 36, 26, 48, 52, 53, 53, 41]
            }
        ]
    }


    return (
        <>
            <Layout>
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="bg-orange-100 shadow-lg rounded-[10px] p-4 flex gap-6 justify-center items-center">
                        <div className="space-y-2">
                            <div className="flex justify-center items-center  bg-orange-400 w-16 h-16 rounded-full border border-white border-3">
                                <i className="ri-shopping-cart-line text-3xl text-white"></i>
                            </div>
                            <h1 className="text-xl font-bold text-orange-600">Products</h1>
                        </div>
                        <div className="border-r border-white h-20  border-2"></div>
                        <h1 className="text-3xl text-orange-600">
                            {(22000).toLocaleString()}
                        </h1>
                    </div>

                    <div className="bg-violet-100 shadow-lg rounded-[10px] p-7 flex gap-6 justify-center items-center">
                        <div className="space-y-2">
                            <div className="bg-violet-400 rounded-full h-16 w-16 gap-6 flex justify-center items-center border border-white border-3">
                                <i className="ri-instance-line text-3xl text-white"></i>
                            </div>
                            <h1 className="text-xl text-violet-600 font-bold">Orders</h1>
                        </div>
                        <div className="border-r border-white h-20 border-2"></div>
                        <h1 className="text-3xl text-violet-600">
                            {(44000).toLocaleString()}
                        </h1>
                    </div>

                    <div className="bg-rose-100 rounded-[10px] shadow-lg p-7 flex justify-center items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-center items-center bg-rose-400 h-16 w-16 rounded-full border border-white border-3">
                                <i className="ri-money-rupee-circle-line text-3xl text-white"></i>
                            </div>
                            <h1 className="text-rose-600  text-xl font-bold">Payments</h1>
                        </div>
                        <div className="border-r border-white h-20 border-3"></div>
                        <h1 className="text-3xl text-rose-600">
                            {(544909).toLocaleString()}
                        </h1>
                    </div>

                    <div className="bg-lime-100 rounded-[10px] shadow-lg p-7 flex gap-6 jsutify-center items-center">
                        <div className="space-y-2">
                            <div className="flex justify-center items-center bg-lime-400 h-16 w-16 rounded-full border border-white border-3">
                                <i className="ri-user-smile-fill text-3xl text-white"></i>
                            </div>
                            <h1 className="text-lime-600 text-xl font-bold">Customers</h1>
                        </div>
                        <div className="border-r border-white border-3 h-20"></div>
                        <h1 className="text-3xl text-lime-600 ">
                            {(1000).toLocaleString()}
                        </h1>
                    </div>

                    <div className="bg-white rounded-[10px] shadow-lg p-4 md:col-span-2">
                        <h1 className="text-xl font-bold text-rose-600">Sales</h1>
                        <ReactApexChart
                            options={sales}
                            series={sales.series}
                            height={350}
                            type="bar"
                        />
                    </div>

                    <div className="bg-white p-4 rounded-[10px] shadow-lg md:col-span-2">
                        <h1 className="text-xl font-bold text-rose-600">Profit</h1>
                        <ReactApexChart
                            options={profit.options}
                            series={profit.series}
                            type="bar"
                        />
                    </div>

                    <div className="bg-rose-600 md:col-span-4 shadow-lg p-4 md:flex-row flex-col rounded-[10px] flex items-center gap-6">
                        <div className="bg-white rounded-full ">
                            <img src={img2} className="rounded-full w-[250px]" />
                        </div>
                        <div>
                            <h1 className="md:text-4xl text-2xl text-white mb-2 text-center">
                                Dashboard Reports & Analytics
                            </h1>
                            <p className="text-gray-100 md:text-left text-center">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere, quibusdam. Animi ducimus repellendus illo sapiente eaque at corporis dolorum! Officia ratione incidunt facere debitis tempore nisi illo assumenda asperiores quam.</p>
                        </div>

                    </div>
                </div>
            </Layout>

        </>
    )
}
export default Dashboard