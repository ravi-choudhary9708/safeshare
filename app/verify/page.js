'use client';
import { useState } from 'react';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setFileName(data.fileName);
        setError('');
      } else {
        setError(data.error);
        setFileName('');
      }
    } catch (err) {
      setError('Something went wrong');
      setFileName('');
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
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Verify
          </button>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {fileName && (
          <div className="mt-4">
            <a
              href={`/uploads/${fileName}`}
              download
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

