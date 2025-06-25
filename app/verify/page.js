"use client"

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const VerifyPageContent = () => {
    const [otp, setotp] = useState("")
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState(null)
    const [mode, setmode] = useState("");
    const [access, setaccess] = useState("");
    const [file, setfile] = useState(null);

    const searchParams = useSearchParams();
    const fileId = searchParams.get("fileId");

    console.log("fileid", fileId)
    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/verify/verifyFile", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp })
            })

            const data = await res.json()
            console.log("data", data);

            if (!res.ok) {
                seterror("file not found");
                return;
            }
            if (res.ok) {
                setfile(data);
                setmode(data.mode);
                setaccess(data.access)
            }
        } catch (err) {
            seterror("something went wrong");
            setfile(null)
        }

    }
    const handlePrint = async (e) => {
      try {
         const res = await fetch('/api/verify/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      if(!res.ok) throw new Error("failed to fetch file")

       const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const printWindow = window.open('', '_blank');

      printWindow.document.write(`
        <html>
          <head>
            <title>Print File</title>
            <style>
              body {
                margin: 0;
                padding: 0;
              }
              .print-container {
                position: relative;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
              }
              .print-container iframe {
                width: 100%;
                height: 100%;
                border: none;
                filter: blur(2px);
              }
              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 3rem;
                color: rgba(0, 0, 0, 0.2);
                font-weight: bold;
                z-index: 9999 !important;
                pointer-events: none;
                user-select: none;
                white-space: nowrap;
                text-align: center;
              }
              @media print {
                .print-container iframe {
                  filter: none !important;
                }
                .watermark {
                  display: block !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="watermark">
              CONFIDENTIAL<br/>OTP USED: ${otp}
            </div>
            <div class="print-container">
              <iframe src="${url}" onload="this.contentWindow.focus(); this.contentWindow.print();"></iframe>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();



        
      } catch (error) {
        console.error("print failed",error);
        seterror("print failed")
      }

    }


    const handleDownload = async (e) => {
     try {
        const res = await fetch("/api/verify/download",{
            method:"POST",
            headers:{"content-Type":"application/json"},
            body:JSON.stringify({otp,fileId})
        })

        
        if(res.ok){

             const blob= await res.blob();
        const url=window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href=url;
        a.download=file.fileName || "download.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
           
        }else{
             seterror("file not found");
            console.log("res not okay")
        }

     
        
     } catch (error) {
        seterror("download error");
        console.error("download error",error)
     }

    }
    const handleView = async (e) => {

 try {
        const res = await fetch("/api/verify/print",{
            method:"POST",
            headers:{"content-Type":"application/json"},
            body:JSON.stringify({otp,fileId})
        })

        
        if(res.ok){

             const blob= await res.blob();
        const url=window.URL.createObjectURL(blob);
         const viewWindow = window.open('', '_blank');
         
         if(viewWindow){
            viewWindow.location.href=url;

            viewWindow.addEventListener("load",()=>{
                window.URL.revokeObjectURL(url);
            },{once:true})
         }
           
        }else{
             seterror("file not found");
            console.log("res not okay")
        }

     
        
     } catch (error) {
        seterror("download error");
        console.error("download error",error)
     }
    }
    return (
        <div>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
                <form onSubmit={handleVerify}
                    className='bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200'

                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Verify File</h2>
                    <div >
                        <input value={otp} onChange={(e) => setotp(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring  focus:ring-blue-400" type="text"
                        placeholder="enter otp"  />
                    </div>
                    <button disabled={loading} type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-500 p-2 mt-4 rounded disabled:bg-blue-300">
                        {loading ? "verifying.." : "verify"}
                    </button>
                    {error && <p className="text-red-600 mt-4">error</p>}


                    {file && mode === "print" && (
                        <div className="mt-4 space-y-4">
                            <button onClick={handlePrint} className="w-full font-bold text-white bg-pink-600 hover:bg-pink-400 p-2  rounded">
                                print
                            </button>

                        </div>
                    )}
                    {file && mode == "share" && (
                        <div className="mt-4 flex gap-2">
                            <button onClick={handleView} className="w-[50vh]  font-bold text-white bg-purple-600 hover:bg-purple-400 p-2  rounded">
                                view
                            </button>
                            {access == "download" && (
                                <button onClick={handleDownload} className="w-[50vh] font-bold text-white bg-green-600 hover:bg-green-400 p-1  rounded">
                                    Download
                                </button>
                            )}

                        </div>
                    )}
                </form>

            </div>
        </div>
    )
}



// Main page component wrapped with Suspense
export default function Page() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}