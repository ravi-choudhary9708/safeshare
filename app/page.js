"use client"
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState("")
  const [access, setAccess] = useState("")
  const [loading, setloading] = useState(false)
  const [publicId, setpublicId] = useState("")

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) return alert("Please select a file.");
    
    const token = localStorage.getItem("safeshare_token");

      console.log("File type:", file.type);
     console.log("File name:", file.name);
  
  // Supported file types
  const supportedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/msword'
  ];
  
  if (!supportedTypes.includes(file.type)) {
    alert('Unsupported file type!');
    return;
  }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("access", access);
    formData.append("token", token);
    setloading(true);



    const res = await fetch("/api/upload", {
      method: "POST",
       headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,token
    });

    const data = await res.json();
    console.log("data baba",data)
    if (res.ok) {
      setOtp(data.otp);
      setpublicId(data.publicId)


        // ✅ Save token to localStorage
  if (data.token) {
    localStorage.setItem("safeshare_token", data.token);
    console.log("✅ Token saved to localStorage");
  } else {
    console.warn("⚠️ Token not received from server");
  }


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


 {otp && publicId && mode=== "share" && (
      <>
       <div className="border rounded-lg p-4">
              <img 
                src={file.fileUrl} 
                alt="File preview" 
                className="w-full max-h-64 object-contain rounded"
              />
            </div>
        <p className="mb-2">🔗 Shareable Link:</p>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            readOnly
            value={`http://localhost:3000/verify?otp=${otp}&fileId=${publicId}`}
            id="share-link"
            className="border px-2 py-1 rounded w-full"
          />
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              const link = document.getElementById('share-link').value;
              navigator.clipboard.writeText(link);
              alert("🔗 Link copied!");
            }}
          >
            Copy
          </button>
        </div>
      </>
    )}



       {otp && file && mode === 'share' && (
      <a
    className='bg-yellow-400 px-4 py-2 rounded hover:bg-amber-700 text-black'
    href={`https://wa.me/?text=${encodeURIComponent(
      `Hi! Here is your secure file.\nAccess it at:\nhttps://yoursite.com/verify?fileId=${publicId}\nAnd use OTP: ${otp}`
    )}`}
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


