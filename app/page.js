"use client"
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [otp, setOtp] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);

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
          Upload
        </button>
        {otp && (
          <p className="mt-4 text-green-600">
            Your OTP: <strong>{otp}</strong>
          </p>
        )}
      </form>
    </div>
  );
}


