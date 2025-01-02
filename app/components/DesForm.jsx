"use client";

import { useState } from "react";
import axios from "axios";

export default function DESForm() {
  const [action, setAction] = useState("encrypt");
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");

    try {
      const response = await axios.post("/api/des", {
        action,
        text,
        key,
      });
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-purple-900 to-black">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-600">
          🔒 DES Encryption & Decryption
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Selection */}
          <div className="flex justify-between items-center">
            <label className="text-lg font-medium text-gray-700">
              Choose Action:
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  checked={action === "encrypt"}
                  onChange={() => setAction("encrypt")}
                  className="w-5 h-5 accent-purple-500"
                />
                Encrypt
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  checked={action === "decrypt"}
                  onChange={() => setAction("decrypt")}
                  className="w-5 h-5 accent-purple-500"
                />
                Decrypt
              </label>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Enter Text:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="4"
              className="w-full px-5 py-3 text-gray-800 bg-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter the text to encrypt/decrypt"
            />
          </div>

          {/* Key Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Secret Key (8 characters):
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              maxLength={8}
              className="w-full px-5 py-3 text-gray-800 bg-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter the secret key"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700 transition-all"
            >
              {action === "encrypt" ? "Encrypt Now" : "Decrypt Now"}
            </button>
          </div>
        </form>

        {/* Result Section */}
        {result && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
            <h4 className="font-medium text-lg">Result:</h4>
            <p className="break-words text-gray-800">{result}</p>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
            <h4 className="font-medium text-lg">Error:</h4>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
