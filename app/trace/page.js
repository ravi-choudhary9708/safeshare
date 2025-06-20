"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; 


export default function UploaderDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("safeshare_token");
    console.log('token',token);
    
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const uploaderId = decoded?.uploaderId;
      console.log("trace upload id",uploaderId)
      if (!uploaderId) return;

      fetch("/api/uploader-uploads", {
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
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

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
            <p>📍 IP: {log.ip}</p>
            <p>💻 User Agent: {log.userAgent}</p>
            <p>🔐 OTP Used: {log.otpUsed}</p>
            {log.fileDeleted ? (
              <p className="text-red-600 mt-1">🗑 File was deleted after access</p>
            ) : (
              <>
                <p>📁 File: {log.fileName}</p>
                <a
                  href={log.fileUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View File
                </a>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
