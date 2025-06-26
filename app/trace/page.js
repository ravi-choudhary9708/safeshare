"use client"

import { verifyJWT } from "@/libs/jwt";
import { jwtDecode } from "jwt-decode"; 
import { useState,useEffect } from "react";
import { useRouter } from "next/router";

const Page = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
      const token =localStorage.getItem("safeshare_token");
      console.log('token trace',token);

      if(!token) return;

      try {
        const decoded= jwtDecode(token);
        const uploaderId= decoded?.uploaderId;


        console.log('uploader id',uploaderId);

        if(!uploaderId) return;

            fetch("/api/trace",{
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ uploaderId }),
})
        .then((res) => res.json())
        .then((data) => {
            console.log("data ",data)
          setLogs(data.logs || ["no log dound"]);
          console.log("data log",data.logs)
          setLoading(false);
        });
        
      } catch (error) {
        console.log(error)
      }
      
    
     
    }, [])
    
  return (

     <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 File Access Trace</h1>

      {loading ? (
        <p>Loading traces...</p>
      ) : logs.length === 0 ? (
        <p>No trace data found.</p>
      ) : (
        logs.map((log, i) => (
          <div key={i} className="border text-amber-600 p-4 mb-4 rounded bg-white shadow">
            <p>⏰ <b>{new Date(log.accessTime).toLocaleString()}</b></p>
            <p> IP: {log.ip}</p>
            <p> User Agent: {log.userAgent}</p>
            <p> OTP Used: {log.otpUsed}</p>
            {log.fileDeleted ? (
              <p className="text-red-600 mt-1">🗑 File was deleted after access</p>
            ) : (
              <>
                <p> File: {log.fileName}</p>
               
              </>
            )}
            
          </div>
        ))
      )}
    </div>
  )
}

export default Page