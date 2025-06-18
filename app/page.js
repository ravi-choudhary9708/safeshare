"use client"
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState("")
  const [access, setAccess] = useState("")
  const [loading, setloading] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) return alert("Please select a file.");
    
    

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("access", access);
    setloading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setOtp(data.otp);
    } else {
      alert(data.error);
    }
    setloading(false)
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Upload Your File</h2>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
        >
         {loading? "uploading...": "upload"} 
        </button>

  <select value={mode} onChange={(e) => setMode(e.target.value)} required>
  <option value="">Select Mode</option>
  <option value="print">Print Only</option>
  <option value="share">Share</option>
</select>

{mode === 'share' && (
  <select value={access} onChange={(e) => setAccess(e.target.value)} required>
    <option value="">Access Level</option>
    <option value="view">View Only</option>
    <option value="download">View & Download</option>
  </select>
)}



        {otp && (
          <p className="mt-4 text-green-600">
            Your OTP: <strong>{otp}</strong>
          </p>

          
        )}
       {otp && file && mode === 'share' && (
      <a className='bg-yellow-400 px-4 py-2 rounded hover:bg-amber-700 text-black'
        href={`https://wa.me/?text=${encodeURIComponent(`Here is your file: ${file.fileUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share via WhatsApp
      </a>
        )}
       
      </form>
    </div>
  );
}


