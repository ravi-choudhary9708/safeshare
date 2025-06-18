'use client';
import { useState } from 'react';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setFile(data);
        setError('');
      } else {
        setError(data.error);
        setFile(null);
      }
    } catch (err) {
      setError('Something went wrong');
      setFile(null);
    }
    setLoading(false);
  };

  

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, download: true }),
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
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View File
              </a>
               {file.mode === 'share' && file.access === 'download' && (
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download File
              </button>
                  )}

                   {file.mode === 'share' && (
      <a className='bg-yellow-400 px-4 py-2 rounded hover:bg-amber-700 text-black'
        href={`https://wa.me/?text=${encodeURIComponent(`Here is your file: ${file.fileUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share via WhatsApp
      </a>
    )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}