"use client";

import { useState, useEffect,Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { decryptBufferClient } from "@/utils/aesClient";

const VerifyPageContent = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("");
  const [access, setAccess] = useState("");
  const [file, setFile] = useState(null);
  const [publicId, setpublicId] = useState("")
  const [decryptedFileBuffer, setDecryptedFileBuffer] = useState(null);
  const [otp, setotp] = useState("");

  const searchParams = useSearchParams();
  const fileId = searchParams.get("public");

  console.log("file id public",fileId)


 

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/verify/verifyFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicIds: fileId,otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "File not found");
        setFile(null);
       
        setLoading(false);
        return;
      }

     
      // const fileRes = await fetch(data.fileUrl);
      // if (!fileRes.ok) {
      //   setError("Failed to fetch encrypted file");
      //   setLoading(false);
      //   return;
      // }

      // const encryptedArrayBuffer = await fileRes.arrayBuffer();

  

      // const decryptedBuffer = await decryptBufferClient(
      //   encryptedArrayBuffer,
      //    otp,
      //   data.iv,
      //   data.salt
      // );

      // setDecryptedFileBuffer(decryptedBuffer);


      setFile(data);
      setMode(data.mode);
      setAccess(data.access);
    

    } catch (err) {
      console.error("Error in handleVerify:", err);
      setError("Something went wrong");
      setFile(null);
      setDecryptedFileBuffer(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint =async () => {
    const res = await fetch("/api/verify/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "File not found");
       
        setDecryptedFileBuffer(null);
        setLoading(false);
       
        return;
      }

       const fileRes = await fetch(data.fileUrl);
       console.log("fileres print",fileRes)
      if (!fileRes.ok) {
        setError("Failed to fetch encrypted file");
        setLoading(false);
        return;
      }

      const encryptedArrayBuffer = await fileRes.arrayBuffer();

      console.log("encripted array print",encryptedArrayBuffer)

  

      const decryptedBuffer = await decryptBufferClient(
        encryptedArrayBuffer,
        otp,
        data.iv,
        data.salt
      );

      console.log("decripted array buffer aa rha hai",decryptedBuffer)



    const blob = new Blob([decryptedBuffer], { type: file.mimeType });
    const url = URL.createObjectURL(blob);

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print File</title>
          <style>
            body { margin: 0; padding: 0; }
            .print-container {
              position: relative; width: 100vw; height: 100vh; overflow: hidden;
            }
            .print-container iframe {
              width: 100%; height: 100%; border: none; filter: blur(2px);
            }
            .watermark {
              position: fixed; top: 50%; left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 3rem; color: rgba(0, 0, 0, 0.2);
              font-weight: bold; z-index: 9999 !important;
              pointer-events: none; user-select: none; white-space: nowrap;
              text-align: center;
            }
            @media print {
              .print-container iframe { filter: none !important; }
              .watermark { display: block !important; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">CONFIDENTIAL<br/>OTP USED: ${otp}</div>
          <div class="print-container">
            <iframe src="${url}" onload="this.contentWindow.focus(); this.contentWindow.print();"></iframe>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

   
  };

  const handleDownload = async (e) => {
    e.preventDefault(); 

    try {
       const res=   await fetch("/api/verify/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicIds: fileId}),
      });
        
   if (!res.ok) {
        setError(data.error || "File not found");
       
        setDecryptedFileBuffer(null);
        setLoading(false);
        return;
      }

      const data=await res.json();

       const fileRes = await fetch(data.fileUrl);
       console.log('file res bhai:',fileRes);
       
      if (!fileRes.ok) {
        setError("Failed to fetch encrypted file");
        setLoading(false);
        return;
      }

      const encryptedArrayBuffer = await fileRes.arrayBuffer();

  
      console.log("Encrypted URL aa rhe h:", data.fileUrl);
       console.log("IV:", data.iv);
      console.log("Salt:", data.salt);

     let decryptedBuffer = null;

try {
  decryptedBuffer = await decryptBufferClient(
    encryptedArrayBuffer,
    otp,
    data.iv,
    data.salt
  );
  console.log("Decryption successful:", decryptedBuffer);
} catch (err) {
  console.error("Decryption failed:", err.message);
  setError("Invalid OTP or corrupted file.");
  setLoading(false);
  return;
}




 if (!decryptedBuffer ) {
      setError("No decrypted file available to download");
      return;
    }

    const blob = new Blob([decryptedBuffer], { type: data.mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = data.fileName || "downloaded_file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);


    } catch (error) {
        console.log("some error on file deletaion",error)
    }

   
  };

  const handleView = async (e) => {
    e.preventDefault(); 
   
        const res  =  await fetch("/api/verify/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({  publicIds: fileId }),
      });
      const data=  await res.json();

     console.log("Encrypted URL aa rhe h:", data.fileUrl);
         console.log("IV:", data.iv);
        console.log("Salt:", data.salt);
      
      

       const fileRes = await fetch(data.fileUrl);

     const encryptedArrayBuffer = await fileRes.arrayBuffer();

  
     

     let decryptedBuffer = null;


  decryptedBuffer = await decryptBufferClient(
    encryptedArrayBuffer,
    otp,
    data.iv,
    data.salt
  );
  console.log("Decryption successful:", decryptedBuffer);

    if (!decryptedBuffer ) {
      setError("No decrypted file available to view");
      return;
    }

    const blob = new Blob([decryptedBuffer], { type: file.mimeType });
    const url = URL.createObjectURL(blob);

    const viewWindow = window.open(url, "_blank");
    const a= document.createElement("a");
    a.href=url
    if (viewWindow) {
      viewWindow.focus();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } else {
      setError("Failed to open view window");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Verify File</h2>
        <input
          value={otp}
          onChange={(e) => setotp(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
          type="text"
          placeholder="Enter OTP"
        />
        <button
          disabled={loading}
          type="submit"
          className="w-full text-white bg-blue-600 hover:bg-blue-500 p-2 mt-4 rounded disabled:bg-blue-300"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {file && mode === "print" && (
          <div className="mt-4 space-y-4">
            <button
            type="button"
              onClick={handlePrint}
              className="w-full font-bold text-white bg-pink-600 hover:bg-pink-400 p-2 rounded"
            >
              Print
            </button>
          </div>
        )}

        {file && mode === "share" && (
          <div className="mt-4 flex gap-2">
            <button
             type="button"
              onClick={handleView}
              className="w-[50vh] font-bold text-white bg-purple-600 hover:bg-purple-400 p-2 rounded"
            >
              View
            </button>
            {access === "download" && (
              <button
              
              type="button"
                onClick={handleDownload}
                className="w-[50vh] font-bold text-white bg-green-600 hover:bg-green-400 p-2 rounded"
              >
                Download
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};




// Main page component wrapped with Suspense


export default function Page() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}