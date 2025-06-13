"use client"
import { useState } from "react";

export default function FileUploader() {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Upload a File</h2>
      <input
        type="file"
        onChange={handleChange}
        className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      />
      {file && (
        <p className="mt-4 text-green-600 text-sm">
          Selected File: <strong>{file.name}</strong>
        </p>
      )}
    </div>
  );
}
