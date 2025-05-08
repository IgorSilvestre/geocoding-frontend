"use client";

import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("google");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add the logic to handle the form submission
    // and update the iframe based on the API response
    console.log("Address:", address)
    console.log("Provider:", provider)
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-4xl space-y-8">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
            Geocoding Service
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter an address"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="provider"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Provider
              </label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="google">Google</option>
                <option value="nominatium">Self-host</option>
                <option value="geoapify">Geoapify</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </form>
        </div>

        <div className="h-[400px] w-full rounded-lg shadow-lg overflow-hidden">
          <iframe
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDr4cY_GUUB4IiK3A_A219AptKOM6Xngrw
    &q=geomais+sao+jose"
              className="w-full h-full rounded-lg shadow-md"
              style={{ border: 0 }}
              loading="lazy"
          ></iframe>
        </div>
      </main>
    </div>
  );
}
