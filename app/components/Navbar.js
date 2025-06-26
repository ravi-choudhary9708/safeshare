import React from 'react'
import Link from 'next/link'

const Navbar = () => {
    return (


        <nav className=" border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="max-w-screen flex flex-wrap items-center justify-between p-1">
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">SafeShare</span>
                </Link>
               
                <div className="  mx-4" >
                    <ul className="flex  font-medium p-2 mt-1   rounded-lg      ">
                        
                        <li>
                            <Link href="/verify" className=" mx-4 bg-white block px-2 text-white bg-blue-700 rounded-sm   dark:bg-blue-600 " aria-current="page">Print</Link>
                        </li>
                        <li>
                            <Link href="/trace" className="bg-white block  px-2 text-white bg-blue-700 rounded-sm    dark:bg-blue-600
                             " aria-current="page">Logs</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    )
}

export default Navbar
