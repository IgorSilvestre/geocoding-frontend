"use client";

import {useState} from "react";

// Component for rendering JSON in a mobile-friendly way
const JsonView = ({ data }: { data: any }) => {
    // Add custom styles for different data types and mobile optimization
    const styles = {
        string: "text-green-600 dark:text-green-400",
        number: "text-purple-600 dark:text-purple-400",
        boolean: "text-orange-600 dark:text-orange-400",
        null: "text-gray-500 dark:text-gray-400",
        key: "text-blue-600 dark:text-blue-400 font-medium",
        index: "text-gray-500 dark:text-gray-400 text-xs mr-1",
        toggle: "text-gray-700 dark:text-gray-300 mr-1 inline-block min-w-[12px]",
        preview: "text-xs text-gray-500 dark:text-gray-400 ml-1",
    };
    // Function to determine if an item is expandable (object or array)
    const isExpandable = (item: any) => {
        return typeof item === 'object' && item !== null && Object.keys(item).length > 0;
    };

    // Recursive component to render JSON nodes
    const JsonNode = ({ data, level = 0 }: { data: any, level?: number }) => {
        const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first two levels

        // Handle primitive values (string, number, boolean, null)
        if (!isExpandable(data)) {
            const dataType = data === null ? 'null' : typeof data;
            return (
                <span className={styles[dataType]}>
                    {data === null ? 'null' : 
                     typeof data === 'string' ? `"${data}"` : 
                     String(data)}
                </span>
            );
        }

        // Handle objects and arrays
        const isArray = Array.isArray(data);
        const items = isArray ? data : Object.keys(data);

        return (
            <div className="relative">
                <span 
                    className="cursor-pointer select-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className={styles.toggle}>{isExpanded ? '▼' : '►'}</span> {isArray ? '[' : '{'}
                    {!isExpanded && (
                        <span className={styles.preview}>
                            {isArray 
                                ? `${items.length} items` 
                                : `${items.length} ${items.length === 1 ? 'key' : 'keys'}`
                            }
                        </span>
                    )}
                </span>

                {isExpanded && (
                    <div className="ml-3 md:ml-4 border-l-2 border-gray-300 pl-2 py-0.5">
                        {isArray ? (
                            // Render array items
                            items.map((item, index) => (
                                <div key={index} className="py-0.5 my-0.5">
                                    <span className={styles.index}>{index}:</span>
                                    <JsonNode data={item} level={level + 1} />
                                </div>
                            ))
                        ) : (
                            // Render object properties
                            items.map((key) => (
                                <div key={key} className="py-0.5 my-0.5">
                                    <span className={styles.key}>{key}:</span>{' '}
                                    <JsonNode data={data[key]} level={level + 1} />
                                </div>
                            ))
                        )}
                    </div>
                )}

                <span>{isArray ? ']' : '}'}</span>
            </div>
        );
    };

    return (
        <div className="text-sm font-mono break-words touch-manipulation">
            <JsonNode data={data} />
        </div>
    );
};

export default function Home() {
    const [address, setAddress] = useState("");
    const [provider, setProvider] = useState("google");
    const [geolocation, setGeolocation] = useState("geomais+sao+jose");
    const [apiResponse, setApiResponse] = useState(null);
    const [multipleResults, setMultipleResults] = useState([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState(0);
    const [inputError, setInputError] = useState("");
    const [apiError, setApiError] = useState("");

    // Validate address input - only allow letters, numbers, and commas
    const validateAddress = (input: string): boolean => {
        const regex = /^[a-zA-Z0-9,\s]+$/;
        return regex.test(input);
    };

    const fetchGeocodingData = async (provider: string, address: string) => {
        const endpoint = "https://simple-go-server-production.up.railway.app/external/";
        let url = "";

        switch (provider) {
            case "google":
                url = endpoint + 'geocode?address=' + address;
                break;
            case "nominatium":
                url = endpoint + 'geocode-nominatim?address=' + address;
                break;
            case "geoapify":
                url = endpoint + 'geocode-geoapify?address=' + address;
                break;
            case "maptiler":
                url = endpoint + 'geocode-maptiler?address=' + address;
                break;
            default:
                return null;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Check if the API returned an error message
            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            console.error("Geocoding API error:", error);
            setApiError(error.message || "Failed to fetch geocoding data");
            return null;
        }
    };

    const extractCoordinates = (data: any, provider: string, index: number = 0) => {
        switch (provider) {
            case "google":
                return data?.results[index]?.geometry?.location?.lat + ',' + data?.results[index]?.geometry?.location?.lng;
            case "nominatium":
                return data[index]?.lat + ',' + data[index]?.lon;
            case "geoapify":
                return data?.features[index]?.geometry?.coordinates[1] + ',' + data?.features[index]?.geometry?.coordinates[0];
            case "maptiler":
                return data?.features[index]?.geometry?.coordinates[1] + ',' + data?.features[index]?.geometry?.coordinates[0];
            default:
                return "";
        }
    };

    const getResultsArray = (data: any, provider: string) => {
        switch (provider) {
            case "google":
                return data?.results || [];
            case "nominatium":
                return Array.isArray(data) ? data : [];
            case "geoapify":
            case "maptiler":
                return data?.features || [];
            default:
                return [];
        }
    };

    const getAddressFromResult = (result: any, provider: string) => {
        switch (provider) {
            case "google":
                return result?.formatted_address || "Unknown address";
            case "nominatium":
                return result?.display_name || "Unknown address";
            case "geoapify":
            case "maptiler":
                return result?.properties?.formatted || result?.properties?.address_line1 || "Unknown address";
            default:
                return "Unknown address";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setInputError("");
        setApiError("");

        // Validate address input
        if (!address.trim()) {
            setInputError("Please enter an address");
            return;
        }

        if (!validateAddress(address)) {
            setInputError("Address can only contain letters, numbers, commas, and spaces");
            return;
        }

        const data = await fetchGeocodingData(provider, address);

        // Only proceed if we have valid data (no API errors)
        if (data) {
            setApiResponse(data);

            // Reset selected index for new search
            setSelectedResultIndex(0);

            // Get results array based on provider
            const results = getResultsArray(data, provider);

            // Check if there are multiple results
            if (results.length > 1) {
                setMultipleResults(results);
            } else {
                setMultipleResults([]);
            }

            // Check if we have any results
            if (results.length === 0) {
                setApiError("No results found for this address");
                return;
            }

            // Update map with coordinates of first result
            const coordinates = extractCoordinates(data, provider, 0);
            setGeolocation(coordinates);
        }

        console.log("Address:", address);
        console.log("Provider:", provider);
    }

    const handleSelectResult = (index: number) => {
        setSelectedResultIndex(index);
        if (apiResponse) {
            const coordinates = extractCoordinates(apiResponse, provider, index);
            setGeolocation(coordinates);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-8 font-[family-name:var(--font-geist-sans)]">
            <main className="w-full max-w-4xl space-y-8">
                <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
                        Geocoding Service
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {apiError && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                <p className="text-sm">{apiError}</p>
                            </div>
                        )}

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
                                onChange={(e) => {
                                    setAddress(e.target.value);
                                    // Clear input error when user starts typing
                                    if (inputError) setInputError("");
                                }}
                                placeholder="Enter an address"
                                className={`w-full rounded-md border ${inputError ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                            />
                            {inputError && (
                                <p className="mt-1 text-sm text-red-600">{inputError}</p>
                            )}
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
                                onChange={(e) => {
                                    setProvider(e.target.value);
                                    // Clear API error when provider changes
                                    if (apiError) setApiError("");
                                }}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="google">Google</option>
                                <option value="nominatium">Self-host</option>
                                <option value="geoapify">Geoapify</option>
                                <option value="maptiler">MapTiler</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Search
                        </button>

                        {multipleResults.length > 1 && (
                            <div className="mt-4 p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Multiple addresses found. Please select one:
                                </h3>
                                <div className="space-y-2">
                                    {multipleResults.map((result, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex items-start p-2 rounded-md cursor-pointer ${
                                                selectedResultIndex === index 
                                                    ? 'bg-blue-100 dark:bg-blue-900' 
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                            onClick={() => handleSelectResult(index)}
                                        >
                                            <input
                                                type="radio"
                                                id={`address-${index}`}
                                                name="address-selection"
                                                checked={selectedResultIndex === index}
                                                onChange={() => handleSelectResult(index)}
                                                className="mt-1 mr-2"
                                            />
                                            <label 
                                                htmlFor={`address-${index}`}
                                                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                            >
                                                {getAddressFromResult(result, provider)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="h-[400px] w-full rounded-lg shadow-lg overflow-hidden">
                    <iframe
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDr4cY_GUUB4IiK3A_A219AptKOM6Xngrw
    &q=${encodeURI(geolocation)}`}
                        className="w-full h-full rounded-lg shadow-md"
                        style={{border: 0}}
                        loading="lazy"
                    ></iframe>
                </div>

                {apiResponse && (
                    <div className="rounded-lg bg-white p-4 md:p-8 shadow-lg dark:bg-gray-800">
                        <h2 className="mb-4 text-sm font-bold text-gray-800 dark:text-white">API Response</h2>
                        <div className="overflow-auto rounded bg-gray-100 p-3 md:p-4 dark:bg-gray-700 dark:text-white max-h-[60vh] md:max-h-[70vh]">
                            <JsonView data={apiResponse} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
