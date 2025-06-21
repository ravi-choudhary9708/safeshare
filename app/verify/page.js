'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const searchParams = useSearchParams();
  const fileId = searchParams.get('fileId');
  console.log("fileid", fileId)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("otp on verify", otp)

    try {
      const res = await fetch('/api/verify/fileVerify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

console.log("response",res)

const data= await res.json();
console.log('res data',data);

      if (!res.ok) {
        setError('File not found');
        return;
      }
      if (res.ok) {
        setFile(data)
 // ⭐ Direct data use karo, file state nhi
      console.log("file verify (data):", data);
      console.log("file verify mode (data):", data.mode);
      console.log("file verify access (data):", data.access);
      }
    



    } catch (err) {
      setError('Something went wrong');
      setFile(null);
    }
    setLoading(false);
  };


 const handlePrint = async () => {
    try {
      const res = await fetch('/api/verify/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      if (!res.ok) throw new Error('Failed to fetch file');

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

    } catch (err) {
      console.error('Error in handle print', err);
      setError('Print failed');
    }
  };








  const handleDownload = async () => {
    try {
      const res = await fetch('/api/verify/shareFile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, fileId }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName || 'download.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Download failed');
      }
    } catch (err) {
      setError('Download error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Enter OTP to Download File</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {file && (
          <div className="mt-6 space-y-4">
            <div className="border rounded-lg p-4">
              <img
                src={file.fileUrl}
                alt="File preview"
                className="w-full max-h-64 object-contain rounded"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePrint(file.fileUrl)}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Print File
              </button>

              {file.mode === 'share' && file.access === 'download' && (
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Download File
                </button>
              )}


            </div>
          </div>
        )}
      </div>
    </div>
  );
}