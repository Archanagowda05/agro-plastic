import React, { useState, useEffect } from 'react';
// Import necessary map components from the external library
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { MapPin, Droplets, AlertTriangle, Leaf, Cloud, Thermometer, Wind, Shield, Satellite, Globe, Navigation, Download, CheckCircle, XCircle, Info, ArrowRight, X, Calendar, Sprout, TrendingUp, Search } from 'lucide-react';

// --- Configuration Constants ---
// ⚠️ IMPORTANT: Replace this with YOUR actual Google Maps API Key from Google Cloud.
const GOOGLE_MAPS_API_KEY = "YOUR_VALID_GOOGLE_MAPS_API_KEY"; 
const LIBRARIES = ["places"];
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 }; // Central India

// --- Helper Components (Simplified for brevity) ---
const WeatherCard = ({ icon, label, value, color }) => {
    const colors = { /* ... colors remain the same ... */ };
    return (
        <div className={`bg-gradient-to-br ${colors.orange} rounded-2xl p-4 text-white text-center shadow-lg transition-all hover:scale-[1.02]`}>
            <div className="flex justify-center mb-2">{icon}</div>
            <p className="text-xs opacity-90 font-semibold">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
};
const RiskBar = ({ label, value }) => ( /* ... remains the same ... */ null );
const SummaryCard = ({ icon, label, value, sublabel }) => ( /* ... remains the same ... */ null );

// --- Live Google Map & Search Component ---

const GoogleMapComponent = ({ lat, lng, onMapClick, onSearchSelect }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });
    
    const [map, setMap] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMarker, setSearchMarker] = useState(null);

    // Geocoder setup for address search
    const geocoder = isLoaded ? new window.google.maps.Geocoder() : null;
    
    // Function to handle address search
    const handleSearch = () => {
        if (!geocoder || !searchTerm) return;

        geocoder.geocode({ address: searchTerm }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const newLat = results[0].geometry.location.lat();
                const newLng = results[0].geometry.location.lng();
                const name = results[0].formatted_address;
                
                onSearchSelect(newLat, newLng, name);
                
                // Update map center and marker
                if (map) {
                    map.panTo({ lat: newLat, lng: newLng });
                    setSearchMarker({ lat: newLat, lng: newLng });
                }
            } else {
                alert('Geocoding failed: ' + status);
            }
        });
    };

    if (loadError) return <div className="text-red-500 p-4">Error loading map service. Check your API key and network.</div>;
    if (!isLoaded) return <div className="text-white p-4 animate-pulse">Loading Live Google Map...</div>;

    const center = { lat: parseFloat(lat), lng: parseFloat(lng) };

    return (
        <div className='flex flex-col h-full'>
            {/* Search Input */}
            <div className='p-4 bg-slate-800 rounded-t-xl z-10 flex gap-3'>
                <input
                    type="text"
                    placeholder="Type city, state, or address (e.g., Pune, India)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="flex-grow px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 pl-10"
                />
                <button onClick={handleSearch} className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold'>
                    <Search className='w-5 h-5' />
                </button>
            </div>

            {/* Live Map */}
            <div className='flex-1'>
                <GoogleMap
                    mapContainerStyle={MAP_CONTAINER_STYLE}
                    center={center}
                    zoom={9}
                    onLoad={setMap}
                    onClick={(e) => onMapClick(e.latLng.lat(), e.latLng.lng())}
                >
                    <Marker position={center} />
                    {searchMarker && <Marker position={searchMarker} title="Search Result" />}
                </GoogleMap>
            </div>
        </div>
    );
};

// --- Map Picker Modal Component ---
const MapPickerModal = ({ onClose, onSelect }) => {
    const [lat, setLat] = useState(DEFAULT_CENTER.lat);
    const [lng, setLng] = useState(DEFAULT_CENTER.lng);
    const [locationName, setLocationName] = useState('Central India');
    
    // Function to handle location selection from search, map click, or GPS
    const handleLocationChange = (newLat, newLng, newName) => {
        setLat(newLat);
        setLng(newLng);
        setLocationName(newName);
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleLocationChange(position.coords.latitude, position.coords.longitude, `GPS Location (±${Math.round(position.coords.accuracy)}m)`);
                },
                () => { alert('Unable to get current GPS location.'); }
            );
        } else { alert('Geolocation not supported.'); }
    };
    
    const handleMapClick = (newLat, newLng) => {
        handleLocationChange(newLat, newLng, `Map Click Point`);
    };
    
    const handleSearchSelect = (newLat, newLng, newName) => {
        handleLocationChange(newLat, newLng, newName);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-3xl p-8 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MapPin className="w-7 h-7 text-purple-400" />Choose Farm Location
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-red-400 transition-colors bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
                </div>
                
                {/* Map/Search Area */}
                <div className="flex-1 min-h-[400px] bg-gray-900 rounded-xl overflow-hidden mb-6 border-4 border-purple-500/50 shadow-inner">
                    <GoogleMapComponent 
                        lat={lat} 
                        lng={lng} 
                        onMapClick={handleMapClick} 
                        onSearchSelect={handleSearchSelect}
                    />
                </div>
                
                {/* Control/Confirmation */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <button onClick={handleCurrentLocation} className="col-span-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"><Navigation className="w-5 h-5" />Use GPS</button>
                    <div className="col-span-2 bg-slate-800 rounded-xl p-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-green-400 font-semibold text-sm">{locationName}</p>
                                <p className="text-white/70 text-xs">Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</p>
                            </div>
                        </div>
                        
                        <button onClick={() => onSelect(lat, lng, locationName)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2 rounded-xl text-md font-bold transition-all shadow-md">
                            <CheckCircle className="w-4 h-4 inline mr-1" />Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Application Component (Calling the secure backend) ---

const AgroPlastiGuard = () => {
    const [step, setStep] = useState('welcome');
    const [farmData, setFarmData] = useState({
        acres: '', location: { lat: null, lng: null, name: '' }, hasPlantation: null,
        cropType: '', daysPlanted: '', isManualCrop: false // isManualCrop for manual input
    });
    const [weatherData, setWeatherData] = useState(null);
    const [mSviData, setMSviData] = useState(null);
    const [suitabilityData, setSuitabilityData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // ⚠️ IMPORTANT: This URL must be updated after you deploy your Firebase Function.
    const METEOMATICS_FUNCTION_URL = "YOUR_DEPLOYED_FIREBASE_FUNCTION_HTTP_TRIGGER_URL"; 
    
    // --- Meteomatics Fetch Logic (Secure Backend Call) ---
    const fetchWeatherData = async () => {
        setLoading(true);
        setWeatherData(null);
        setRecommendations([]);

        const { lat, lng } = farmData.location;
        if (!lat || !lng) {
            setLoading(false);
            return;
        }

        try {
            // 💡 This is the CRITICAL change: calling the secure backend
            const response = await fetch(`${METEOMATICS_FUNCTION_URL}?lat=${lat}&lng=${lng}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend fetch failed: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            // Assume the backend formats the data correctly
            setWeatherData(data); 
            
        } catch (error) {
            console.error('Secure Fetch Failed. Using Simulation:', error);
            alert(`Weather API Failed (Backend Issue). Using Simulated Data.`);
            // --- Fallback Simulation (Used if the secure backend fails) ---
            const fallbackForecast = Array.from({ length: 7 }, (_, i) => { /* ... simulation logic ... */ return { date: `Day ${i+1}`, temp: 30, rainfall: 5, windSpeed: 10, humidity: 75, condition: 'Sunny' }; });
            const totalRainfall = fallbackForecast.reduce((sum, d) => sum + d.rainfall, 0).toFixed(1);
            setWeatherData({ current: fallbackForecast[0], forecast: fallbackForecast, totalRainfall });
        } finally {
            setLoading(false);
        }
    };
    
    // ... (calculateMSVI, determineCropSuitability, generateRecommendations, etc., remain the same)
    
    // Render current step component
    return (
        <div className="min-h-screen">
            {step === 'welcome' && <WelcomeScreen setStep={setStep} />}
            {step === 'farmDetails' && <FarmDetailsForm {...{ farmData, setFarmData, loading, getCurrentLocation: () => { /* ... */ }, setShowMapPicker, setStep }} />}
            {step === 'analysis' && <AnalysisScreen {...{ farmData, weatherData, mSviData, suitabilityData, recommendations, loading, setStep, downloadReport: () => {} }} />}
            {showMapPicker && <MapPickerModal onClose={() => setShowMapPicker(false)} onSelect={(lat, lng, name) => {
                 setFarmData(prev => ({ ...prev, location: { lat: lat.toFixed(4), lng: lng.toFixed(4), name: name || 'Map Selection' } }));
                 setShowMapPicker(false);
            }} />}
        </div>
    );
};

const WelcomeScreen = ({ setStep }) => (
    // Updated background for better consistency
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        {/* ... rest of WelcomeScreen ... */}
        <button onClick={() => setStep('farmDetails')} className="bg-white text-blue-800 px-8 md:px-12 py-3 md:py-4 rounded-full text-lg md:text-xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-xl">
             Start Analysis <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
    </div>
);

const FarmDetailsForm = ({ farmData, setFarmData, loading, getCurrentLocation, setShowMapPicker, setStep }) => {
    const cropOptions = ["Rice", "Wheat", "Corn (Maize)", "Cotton", "Sugarcane"];

    const handleCropChange = (e) => {
        const value = e.target.value;
        const isManual = value === 'other' || !cropOptions.includes(value);
        setFarmData({ 
            ...farmData, 
            cropType: isManual ? (value === 'other' ? '' : value) : value,
            isManualCrop: isManual
        });
    };
    
    const handleManualCropChange = (e) => {
         setFarmData({...farmData, cropType: e.target.value, isManualCrop: true});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-12">
            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20">
                {/* ... (Acres and Location Picker unchanged) ... */}
                
                {/* Plantation Status - Crop Input Section */}
                {farmData.hasPlantation === true && (
                    <div className="p-4 bg-slate-800 rounded-2xl border border-green-500/30 mb-8">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Sprout className="w-5 h-5 text-green-400" />Crop Information</h3>
                        <div className="mb-4">
                            <label className="block text-white text-md font-semibold mb-2">Crop Type</label>
                            <select 
                                value={cropOptions.includes(farmData.cropType) ? farmData.cropType : (farmData.cropType ? 'other' : '')} 
                                onChange={handleCropChange} 
                                className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 text-white text-md focus:outline-none focus:border-green-400 appearance-none"
                            >
                                <option value="" className="bg-slate-800">Select Common Crop</option>
                                {cropOptions.map(crop => <option key={crop} value={crop} className="bg-slate-800">{crop}</option>)}
                                <option value="other" className="bg-slate-800">Other (Type manually below)</option>
                            </select>
                        </div>
                        {(farmData.isManualCrop || !cropOptions.includes(farmData.cropType)) && (
                            <div className="mb-4">
                                <label className="block text-white text-md font-semibold mb-2">Enter Crop Name Manually</label>
                                <input 
                                    type="text" 
                                    value={farmData.cropType} 
                                    onChange={handleManualCropChange} 
                                    placeholder="e.g., Chillies, Millet" 
                                    className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 text-white text-md placeholder-white/50 focus:outline-none focus:border-green-400" 
                                />
                            </div>
                        )}
                        {/* ... (Days Since Planting input) ... */}
                    </div>
                )}
                
                {/* ... (Analyze My Farm Button) ... */}
            </div>
        </div>
    );
};

const AnalysisScreen = ({ farmData, weatherData, mSviData, suitabilityData, recommendations, loading, setStep, downloadReport }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 py-8">
        <div className="max-w-7xl mx-auto">
            {/* ... (Loading State) ... */}
            
            {/* NEW: Crop Suitability Section (Conditional) */}
            {farmData.hasPlantation === false && suitabilityData && (
                 <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 border border-white/20">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 text-yellow-300">
                        <Leaf className="w-8 h-8" />Crop Suitability Analysis
                    </h2>
                    <div className="bg-slate-800 p-6 rounded-2xl">
                        <p className="text-white text-lg font-bold mb-3">Suitable Crops for {mSviData.riskLevel} Risk Soil:</p>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {suitabilityData.suitableCrops.map(crop => (
                                <span key={crop} className="bg-green-500/20 text-green-300 px-4 py-1 rounded-full text-sm font-semibold border border-green-500">
                                    {crop}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 p-4 bg-blue-900/50 rounded-xl border-l-4 border-blue-400">
                            <p className="text-blue-300 font-semibold mb-1">Reasoning:</p>
                            <p className="text-white text-sm">{suitabilityData.reason}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ... (Weather, M-SVI, Recommendations, Summary sections remain the same) ... */}
        </div>
    </div>
);

export default AgroPlastiGuard; // Keep this line in your actual file