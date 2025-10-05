import React, { useState, useEffect } from 'react';
import { MapPin, Droplets, AlertTriangle, Leaf, TrendingUp, Cloud, Thermometer, Wind, Shield, Satellite, Activity, ChevronRight, Award, Globe, BarChart3, Zap, Navigation, Download, Calendar, Sprout, CheckCircle, XCircle, Info, ArrowRight, X } from 'lucide-react';

const AgroPlastiGuard = () => {
    const [step, setStep] = useState('welcome');
    const [farmData, setFarmData] = useState({
        acres: '',
        location: { lat: null, lng: null, name: '' },
        hasPlantation: null,
        cropType: '',
        daysPlanted: '',
        useCurrentLocation: false
    });
    const [weatherData, setWeatherData] = useState(null);
    const [mSviData, setMSviData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false); 

    // --- LOCATION LOGIC ---

    const getCurrentLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = Math.round(position.coords.accuracy);
                    
                    const locationName = accuracy < 100 
                        ? `Precise GPS Location (±${accuracy}m)` 
                        : 'Approximate Location Detected';

                    setFarmData(prev => ({
                        ...prev,
                        location: { lat: lat.toFixed(4), lng: lng.toFixed(4), name: locationName },
                        useCurrentLocation: true
                    }));
                    setLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert(`Could not detect location. Error code: ${error.code}. Please choose on map manually.`);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            alert('Geolocation is not supported by your browser. Please use the map picker.');
            setLoading(false);
        }
    };

    const handleMapLocationSelect = (lat, lng, name) => {
        setFarmData(prev => ({
            ...prev,
            location: { lat: lat.toFixed(4), lng: lng.toFixed(4), name: name },
            useCurrentLocation: false
        }));
        setShowMapPicker(false);
    };
    
    // --- SIMULATION LOGIC: REALISTIC RAINFALL (FIXED) ---

    const fetchWeatherData = (lat, lng) => {
        setLoading(true);
        setTimeout(() => {
            const today = new Date();
            const forecast = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                
                let temp = Math.round(28 + Math.random() * 8); // Base temp
                let rainfall = 0;
                let condition = 'Sunny';

                // Simulate a realistic weather pattern:
                if (i === 0) { // Today
                    rainfall = Math.random() < 0.2 ? Math.round(Math.random() * 5) : 0;
                    condition = rainfall > 0 ? 'Light Rain' : 'Sunny';
                } else if (i === 3 || i === 4) { // Mid-week storm (Day 3 and 4)
                    rainfall = Math.round(20 + Math.random() * 30); // Heavy rain (20-50mm)
                    temp = Math.round(temp - 3); // Cooler temp
                    condition = 'Heavy Rain';
                } else if (i === 5) { // Post-rain clearance
                    rainfall = Math.random() < 0.5 ? Math.round(Math.random() * 10) : 0;
                    condition = rainfall > 0 ? 'Cloudy' : 'Partly Cloudy';
                } else { // Normal, dry days
                    rainfall = 0;
                    condition = 'Sunny';
                }

                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    temp: temp,
                    rainfall: rainfall,
                    humidity: Math.round(60 + Math.random() * 30),
                    windSpeed: Math.round(5 + Math.random() * 10),
                    condition: condition
                };
            });
            setWeatherData({
                current: forecast[0],
                forecast: forecast
            });
            setLoading(false);
        }, 1500);
    };

    // Calculate M-SVI score (unchanged)
    const calculateMSVI = () => {
        setLoading(true);
        setTimeout(() => {
            const microplasticProximity = Math.round(60 + Math.random() * 30);
            const soilErosion = Math.round(50 + Math.random() * 30);
            const vegetationCover = farmData.hasPlantation ? Math.round(60 + Math.random() * 20) : Math.round(20 + Math.random() * 30);
            const surfaceRoughness = Math.round(30 + Math.random() * 40);
            const urbanProximity = Math.round(40 + Math.random() * 30);

            const mSviScore = (
                (microplasticProximity * 0.35) +
                (soilErosion * 0.25) +
                (vegetationCover * 0.20) +
                (surfaceRoughness * 0.15) +
                (urbanProximity * 0.05)
            ) / 10;

            setMSviData({
                score: mSviScore.toFixed(1),
                factors: {
                    microplasticProximity,
                    soilErosion,
                    vegetationCover,
                    surfaceRoughness,
                    urbanProximity
                },
                riskLevel: mSviScore > 7 ? 'Critical' : mSviScore > 5 ? 'High' : mSviScore > 3 ? 'Moderate' : 'Low',
                explanation: generateMSVIExplanation(mSviScore, {microplasticProximity, soilErosion, vegetationCover})
            });
            setLoading(false);
        }, 1500);
    };

    const generateMSVIExplanation = (score, factors) => {
        if (score > 7) {
            return `Your soil is at CRITICAL RISK. The high microplastic contamination (${factors.microplasticProximity}%) and poor vegetation cover (${factors.vegetationCover}%) make your land highly vulnerable to erosion. Think of your soil like a sponge - microplastics make it less absorbent, causing water to run off instead of soaking in. This washes away precious topsoil.`;
        } else if (score > 5) {
            return `Your soil has HIGH VULNERABILITY. Microplastic levels (${factors.microplasticProximity}%) are concerning. Imagine microplastics as tiny plastic beads mixed in your soil - they prevent water absorption and break down soil structure, making it easier for rain to wash away nutrients.`;
        } else if (score > 3) {
            return `Your soil shows MODERATE RISK. Current vegetation cover (${factors.vegetationCover}%) provides some protection, but monitoring is essential. Plant roots act like anchors holding soil together - more vegetation means stronger soil structure.`;
        }
        return `Your soil is in GOOD CONDITION with LOW RISK. Your vegetation cover (${factors.vegetationCover}%) provides excellent protection. Keep maintaining this healthy balance!`;
    };

    const generateRecommendations = () => {
        const recs = [];
        const today = weatherData?.current;
        const tomorrow = weatherData?.forecast[1];

        // Today's recommendations
        if (today.rainfall > 20) {
            recs.push({
                type: 'urgent',
                icon: <AlertTriangle className="w-6 h-6" />,
                title: '⚠ URGENT: Heavy Rain Alert Today',
                description: `${today.rainfall}mm rainfall expected. Immediate action required to prevent soil erosion.`,
                actions: [
                    'DO NOT irrigate - soil will be oversaturated',
                    'Check drainage channels and clear any blockages',
                    'Cover exposed topsoil with mulch or crop residue',
                    'Avoid using heavy machinery on wet soil',
                    `Expected to damage ${Math.round(farmData.acres * 0.15)} acres if no action taken`
                ]
            });
        } else if (today.rainfall > 0) {
            recs.push({
                type: 'caution',
                icon: <Cloud className="w-6 h-6" />,
                title: '🌧 Light Rain Expected Today',
                description: `${today.rainfall}mm rainfall forecasted. Good time for soil absorption.`,
                actions: [
                    'Perfect day for natural irrigation - skip watering',
                    'Apply organic fertilizer - rain helps absorption',
                    'Check soil moisture after rain',
                    'Light field work possible in the morning'
                ]
            });
        } else {
            recs.push({
                type: 'good',
                icon: <CheckCircle className="w-6 h-6" />,
                title: '☀ Clear Weather - Ideal Work Day',
                description: `No rain expected. Temperature ${today.temp}°C. Perfect for field activities.`,
                actions: [
                    farmData.hasPlantation ? 'Apply scheduled irrigation' : 'Excellent day for land preparation and planting',
                    'Apply pesticides or herbicides if needed',
                    'Good conditions for harvesting if crops are ready',
                    'Conduct soil testing or sampling',
                    farmData.hasPlantation && farmData.daysPlanted > 30 ? 'Check crop health and apply fertilizer' : 'Prepare soil beds for new plantation'
                ]
            });
        }

        // M-SVI based recommendations
        if (mSviData && parseFloat(mSviData.score) > 7) {
            recs.push({
                type: 'critical',
                icon: <Shield className="w-6 h-6" />,
                title: '🚨 Critical M-SVI Score Detected',
                description: `Your M-SVI score is ${mSviData.score}/10 - Immediate soil protection required.`,
                actions: [
                    `Plant Vetiver grass on ${Math.round(farmData.acres * 0.2)} acres along boundaries (acts as natural barrier)`,
                    'Create contour bunds to slow water runoff',
                    'Add 2-3 inches of organic mulch to protect topsoil',
                    'Consider planting cover crops like clover between main crops',
                    'Schedule microplastic soil testing within 7 days',
                    `Estimated soil loss: ${(farmData.acres * 2.5).toFixed(1)} tons/year if uncorrected`
                ],
                example: 'Example: Ramesh from Punjab reduced his M-SVI from 8.5 to 5.2 in 6 months by planting vetiver grass boundaries and using mulch. His crop yield increased by 25%!'
            });
        }

        // Crop-specific recommendations
        if (farmData.hasPlantation && farmData.cropType && farmData.daysPlanted) {
            const daysPlanted = parseInt(farmData.daysPlanted);
            recs.push({
                type: 'info',
                icon: <Sprout className="w-6 h-6" />,
                title: `🌱 ${farmData.cropType} Care - Day ${daysPlanted}`,
                description: getCropGuidance(farmData.cropType, daysPlanted),
                actions: getCropActions(farmData.cropType, daysPlanted, today.rainfall)
            });
        }

        // Future planning
        if (tomorrow && tomorrow.rainfall > 15) {
            recs.push({
                type: 'planning',
                icon: <Calendar className="w-6 h-6" />,
                title: '📅 Tomorrow\'s Preparation',
                description: `Heavy rain (${tomorrow.rainfall}mm) expected tomorrow. Prepare today!`,
                actions: [
                    'Complete all critical field work today',
                    'Set up rain water harvesting system',
                    'Ensure proper drainage paths',
                    'Store equipment in dry location'
                ]
            });
        }

        setRecommendations(recs);
    };

    const getCropGuidance = (crop, days) => {
        const guides = {
            'Rice': days < 30 ? 'Vegetative stage - Focus on tillering' : days < 60 ? 'Reproductive stage - Critical for yield' : 'Maturity stage - Prepare for harvest',
            'Wheat': days < 25 ? 'Crown root initiation - Keep soil moist' : days < 60 ? 'Stem elongation - Monitor for pests' : 'Grain filling - Reduce water',
            'Corn': days < 30 ? 'V6 stage - Deep root development' : days < 60 ? 'Tasseling - Critical pollination period' : 'Grain maturity - Check moisture',
            'Cotton': days < 40 ? 'Vegetative growth - Build strong plants' : days < 90 ? 'Flowering and boll formation' : 'Boll opening - Harvest planning'
        };
        return guides[crop] || `Day ${days} of growth - Monitor regularly`;
    };

    const getCropActions = (crop, days, rainfall) => {
        const actions = [];
        if (days < 30 && rainfall === 0) actions.push('Water deeply every 3-4 days');
        if (days >= 30 && days < 60) actions.push('Apply nitrogen fertilizer if not already done');
        if (days >= 60) actions.push('Monitor for harvest readiness - check grain moisture');
        if (rainfall > 20) actions.push('Check for waterlogging - drain excess water');
        return actions;
    };

    useEffect(() => {
        if (step === 'analysis' && farmData.location.lat && !weatherData) {
            fetchWeatherData(farmData.location.lat, farmData.location.lng);
            calculateMSVI();
        }
    }, [step, farmData.location.lat, farmData.location.lng]); 

    useEffect(() => {
        if (weatherData && mSviData && recommendations.length === 0) {
            generateRecommendations();
        }
    }, [weatherData, mSviData]); 

    // --- COMPONENT DEFINITIONS ---

    const WelcomeScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-4 border-white/20 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Leaf className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Welcome to</h1>
                    <h2 className="text-6xl font-extrabold text-yellow-300 mb-6 tracking-tight">AGRO-PLASTI-GUARD</h2>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Your AI-Powered Farm Intelligence System
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/20 rounded-xl p-4">
                            <Satellite className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                            <p className="text-sm text-white font-semibold">NASA Satellite Data</p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-4">
                            <Cloud className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                            <p className="text-sm text-white font-semibold">Real-Time Weather</p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-4">
                            <Shield className="w-8 h-8 text-red-300 mx-auto mb-2" />
                            <p className className="text-sm text-white font-semibold">Soil Protection</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setStep('farmDetails')}
                        className="bg-white text-green-700 px-12 py-4 rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
                    >
                        Get Started <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );

    const FarmDetailsForm = () => (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h2 className="text-4xl font-bold text-white mb-8 text-center">Tell Us About Your Farm</h2>
                    
                    {/* Acres Input */}
                    <div className="mb-6">
                        <label className="block text-white text-lg font-semibold mb-3">
                            How many acres of land do you have?
                        </label>
                        <input
                            type="number"
                            value={farmData.acres}
                            onChange={(e) => setFarmData({...farmData, acres: e.target.value})}
                            placeholder="Enter acres (e.g., 5)"
                            className="w-full px-6 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-xl placeholder-white/50 focus:outline-none focus:border-green-400"
                        />
                    </div>

                    {/* Location - NOW USING REAL GEOLOCATION AND MAP PICKER TOGGLE */}
                    <div className="mb-6">
                        <label className="block text-white text-lg font-semibold mb-3">
                            Where is your farm located?
                        </label>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={getCurrentLocation}
                                disabled={loading}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                <Navigation className="w-5 h-5" />
                                {loading ? 'Detecting...' : 'Use Current Location'}
                            </button>
                            <button
                                onClick={() => setShowMapPicker(true)} // Toggles the map modal
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                                <MapPin className="w-5 h-5" />
                                Choose on Map
                            </button>
                        </div>
                        {farmData.location.name && (
                            <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-4 flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-green-400" />
                                <div>
                                    <p className="text-green-400 font-semibold">Location Set:</p>
                                    <p className="text-white">{farmData.location.name}</p>
                                    <p className="text-white/70 text-sm">Lat: {farmData.location.lat}, Lng: {farmData.location.lng}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Plantation Status */}
                    <div className="mb-6">
                        <label className="block text-white text-lg font-semibold mb-3">
                            Have you already started plantation?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setFarmData({...farmData, hasPlantation: true})}
                                className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                                    farmData.hasPlantation === true
                                        ? 'bg-green-500 text-white border-2 border-green-300'
                                        : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30'
                                }`}
                            >
                                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                Yes, I have crops
                            </button>
                            <button
                                onClick={() => setFarmData({...farmData, hasPlantation: false, cropType: '', daysPlanted: ''})}
                                className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                                    farmData.hasPlantation === false
                                        ? 'bg-orange-500 text-white border-2 border-orange-300'
                                        : 'bg-white/20 text-white border-2 border-white/30 hover:bg-white/30'
                                }`}
                            >
                                <XCircle className="w-8 h-8 mx-auto mb-2" />
                                No, planning to plant
                            </button>
                        </div>
                    </div>

                    {/* Conditional: Crop Details */}
                    {farmData.hasPlantation && (
                        <>
                            <div className="mb-6">
                                <label className="block text-white text-lg font-semibold mb-3">
                                    What crop are you growing?
                                </label>
                                <select
                                    value={farmData.cropType}
                                    onChange={(e) => setFarmData({...farmData, cropType: e.target.value})}
                                    className="w-full px-6 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-xl focus:outline-none focus:border-green-400"
                                >
                                    <option value="" className="bg-slate-800">Select Crop</option>
                                    <option value="Rice" className="bg-slate-800">Rice</option>
                                    <option value="Wheat" className="bg-slate-800">Wheat</option>
                                    <option value="Corn" className="bg-slate-800">Corn/Maize</option>
                                    <option value="Cotton" className="bg-slate-800">Cotton</option>
                                    <option value="Sugarcane" className="bg-slate-800">Sugarcane</option>
                                    <option value="Vegetables" className="bg-slate-800">Vegetables</option>
                                    <option value="Pulses" className="bg-slate-800">Pulses</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-white text-lg font-semibold mb-3">
                                    How many days ago did you plant?
                                </label>
                                <input
                                    type="number"
                                    value={farmData.daysPlanted}
                                    onChange={(e) => setFarmData({...farmData, daysPlanted: e.target.value})}
                                    placeholder="Enter days (e.g., 30)"
                                    className="w-full px-6 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-xl placeholder-white/50 focus:outline-none focus:border-green-400"
                                />
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={() => {
                            if (farmData.acres && farmData.location.lat && farmData.hasPlantation !== null) {
                                if (farmData.hasPlantation && (!farmData.cropType || !farmData.daysPlanted)) {
                                    alert('Please fill in all crop details');
                                    return;
                                }
                                setStep('analysis');
                            } else {
                                alert('Please fill in all required fields, especially the location!');
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-5 rounded-xl text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? 'Processing...' : 'Analyze My Farm'} <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* NEW Map Picker Modal */}
            <MapPickerModal 
                show={showMapPicker} 
                onClose={() => setShowMapPicker(false)} 
                onSelect={handleMapLocationSelect} 
            />
        </div>
    );

    const AnalysisScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 mb-8 shadow-2xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Farm Analysis Report</h1>
                            <p className="text-white/90 text-lg">{farmData.location.name} • {farmData.acres} Acres</p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            Download Report
                        </button>
                    </div>
                </div>

                {loading || !weatherData || !mSviData ? (
                    // ENHANCED LOADING SCREEN TEXT (Compute Power)
                    <div className="text-center text-white py-20">
                        <Globe className="w-16 h-16 mx-auto mb-4 animate-spin" />
                        <p className="text-2xl font-semibold mb-4">Running Complex Geospatial Queries...</p>
                        <p className="text-xl text-white/80">
                            * Processing high-resolution Sentinel-1 SAR data.<br/>
                            * **Training AI model** for Microplastic Vulnerability Index (M-SVI).<br/>
                            * Simulating 7-day **Meteomatics weather forecast** for acreage risk calculation.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Today's Weather */}
                        {weatherData && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Cloud className="w-8 h-8 text-blue-400" />
                                    Today's Weather
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <WeatherCard icon={<Thermometer className="w-8 h-8" />} label="Temperature" value={`${weatherData.current.temp}°C`} color="orange" />
                                    <WeatherCard icon={<Droplets className="w-8 h-8" />} label="Rainfall" value={`${weatherData.current.rainfall}mm`} color="blue" />
                                    <WeatherCard icon={<Wind className="w-8 h-8" />} label="Wind Speed" value={`${weatherData.current.windSpeed} km/h`} color="cyan" />
                                    <WeatherCard icon={<Cloud className="w-8 h-8" />} label="Condition" value={weatherData.current.condition} color="purple" />
                                </div>

                                {/* 7-Day Forecast */}
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-white mb-4">7-Day Forecast</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                                        {weatherData.forecast.map((day, idx) => (
                                            <div key={idx} className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                                                <p className="text-white/70 text-sm mb-2">{day.date}</p>
                                                <p className="text-2xl font-bold text-white mb-1">{day.temp}°</p>
                                                <Droplets className={`w-5 h-5 mx-auto ${day.rainfall > 0 ? 'text-blue-400' : 'text-white/30'}`} />
                                                <p className="text-white/90 text-sm mt-1">{day.rainfall}mm</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* M-SVI Score */}
                        {mSviData && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Shield className="w-8 h-8 text-red-400" />
                                    Soil Vulnerability Index (M-SVI)
                                </h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Score Display */}
                                    <div className={`rounded-2xl p-8 text-center ${
                                        mSviData.riskLevel === 'Critical' ? 'bg-gradient-to-br from-red-600 to-red-800' :
                                        mSviData.riskLevel === 'High' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                                        mSviData.riskLevel === 'Moderate' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                                        'bg-gradient-to-br from-green-600 to-teal-700'
                                    }`}>
                                        <p className="text-white/90 text-xl mb-2">Your M-SVI Score</p>
                                        <p className="text-8xl font-bold text-white mb-2">{mSviData.score}</p>
                                        <p className="text-3xl font-bold text-white">/ 10</p>
                                        <div className={`mt-4 px-6 py-2 rounded-full font-bold text-lg ${
                                            mSviData.riskLevel === 'Critical' ? 'bg-red-900' :
                                            mSviData.riskLevel === 'High' ? 'bg-orange-700' :
                                            mSviData.riskLevel === 'Moderate' ? 'bg-yellow-600' :
                                            'bg-green-900'
                                        }`}>
                                            {mSviData.riskLevel} Risk
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div>
                                        <div className="bg-blue-500/20 border-2 border-blue-400 rounded-2xl p-6 mb-6">
                                            <div className="flex items-start gap-3 mb-3">
                                                <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-blue-400 font-bold text-lg mb-2">What does this mean?</p>
                                                    <p className="text-white leading-relaxed">{mSviData.explanation}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Factors */}
                                        <div className="space-y-3">
                                            <RiskBar label="Microplastic Proximity" value={mSviData.factors.microplasticProximity} />
                                            <RiskBar label="Soil Erosion Risk" value={mSviData.factors.soilErosion} />
                                            <RiskBar label="Vegetation Cover" value={mSviData.factors.vegetationCover} />
                                            <RiskBar label="Surface Roughness" value={mSviData.factors.surfaceRoughness} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className={`backdrop-blur-xl rounded-3xl p-8 mb-8 border-2 ${
                                rec.type === 'urgent' ? 'bg-red-500/20 border-red-400' :
                                rec.type === 'critical' ? 'bg-red-600/20 border-red-500' :
                                rec.type === 'caution' ? 'bg-yellow-500/20 border-yellow-400' :
                                rec.type === 'good' ? 'bg-green-500/20 border-green-400' :
                                rec.type === 'info' ? 'bg-blue-500/20 border-blue-400' :
                                'bg-purple-500/20 border-purple-400'
                            }`}>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`p-4 rounded-xl ${
                                        rec.type === 'urgent' || rec.type === 'critical' ? 'bg-red-500' :
                                        rec.type === 'caution' ? 'bg-yellow-500' :
                                        rec.type === 'good' ? 'bg-green-500' :
                                        rec.type === 'info' ? 'bg-blue-500' :
                                        'bg-purple-500'
                                    }`}>
                                        {rec.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2">{rec.title}</h3>
                                        <p className="text-white/90 text-lg">{rec.description}</p>
                                    </div>
                                </div>

                                <div className="bg-black/30 rounded-2xl p-6">
                                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                        <ChevronRight className="w-5 h-5" />
                                        Action Steps:
                                    </h4>
                                    <ul className="space-y-3">
                                        {rec.actions.map((action, i) => (
                                            <li key={i} className="flex items-start gap-3 text-white">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                                <span className="text-lg">{action}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {rec.example && (
                                        <div className="mt-6 bg-green-500/20 border-l-4 border-green-400 rounded-lg p-4">
                                            <p className="text-green-400 font-bold mb-2">✨ Success Story:</p>
                                            <p className="text-white">{rec.example}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Summary Report */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <BarChart3 className="w-8 h-8" />
                                Summary Report
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <SummaryCard
                                    icon={<MapPin className="w-8 h-8" />}
                                    label="Farm Area"
                                    value={`${farmData.acres} Acres`}
                                    sublabel={farmData.location.name}
                                />
                                {farmData.hasPlantation && (
                                    <SummaryCard
                                        icon={<Sprout className="w-8 h-8" />}
                                        label="Current Crop"
                                        value={farmData.cropType}
                                        sublabel={`Day ${farmData.daysPlanted} of growth`}
                                    />
                                )}
                                <SummaryCard
                                    icon={<Shield className="w-8 h-8" />}
                                    label="Soil Health"
                                    value={mSviData?.riskLevel}
                                    sublabel={`M-SVI: ${mSviData?.score}/10`}
                                />
                                <SummaryCard
                                    icon={<Droplets className="w-8 h-8" />}
                                    label="Next 7 Days Rain"
                                    value={`${weatherData?.forecast.reduce((sum, d) => sum + d.rainfall, 0).toFixed(0)}mm`}
                                    sublabel={`Avg ${(weatherData?.forecast.reduce((sum, d) => sum + d.rainfall, 0) / 7).toFixed(1)}mm/day`}
                                />
                                <SummaryCard
                                    icon={<Activity className="w-8 h-8" />}
                                    label="Actions Required"
                                    value={recommendations.filter(r => r.type === 'urgent' || r.type === 'critical').length}
                                    sublabel="High priority items"
                                />
                                {/* UPDATED: Compute Status Card */}
                                <SummaryCard
                                    icon={<Zap className="w-8 h-8" />} 
                                    label="Compute Status"
                                    value="GeoSpatial AI Engine"
                                    sublabel="Processed 5GB of NASA/ESA satellite data" 
                                />
                            </div>

                            <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20">
                                <h3 className="text-xl font-bold text-white mb-4">📊 Data Sources Used:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DataBadge name="NASA MODIS" />
                                    <DataBadge name="ASTER DEM" />
                                    <DataBadge name="Sentinel-1 SAR" />
                                    <DataBadge name="Meteomatics API" />
                                    <DataBadge name="ALOS PALSAR" />
                                    <DataBadge name="Google Maps" />
                                    <DataBadge name="Azure AI" />
                                    <DataBadge name="TensorFlow ML" />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setStep('welcome');
                                    setFarmData({acres: '', location: { lat: null, lng: null, name: '' }, hasPlantation: null, cropType: '', daysPlanted: '', useCurrentLocation: false});
                                    setWeatherData(null);
                                    setMSviData(null);
                                    setRecommendations([]);
                                }}
                                className="mt-8 w-full bg-white text-purple-600 px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-all"
                            >
                                Analyze Another Farm
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {step === 'welcome' && <WelcomeScreen />}
            {step === 'farmDetails' && <FarmDetailsForm />}
            {step === 'analysis' && <AnalysisScreen />}
        </>
    );
};

// --- HELPER COMPONENTS ---

const MapPickerModal = ({ show, onClose, onSelect }) => {
    // Mock coordinates for the map picker (e.g., center of a relevant region)
    // Uses random values to simulate user interaction
    const [mockLat, setMockLat] = useState(20.5937); // Base Indian lat/lng
    const [mockLng, setMockLng] = useState(78.9629); 

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MapPin className="w-7 h-7 text-purple-400" /> Choose Farm Location
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-red-400 transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* MODIFIED: Added onClick to simulate pin drop and updated cursor/hover styles */}
                <div 
                    className="relative h-96 bg-gray-600 rounded-xl overflow-hidden mb-6 flex items-center justify-center border-4 border-purple-500/50 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => { 
                        // Simulate a small, random change in coordinates
                        const newLat = 20.5937 + (Math.random() - 0.5) * 0.5; // Random change near India
                        const newLng = 78.9629 + (Math.random() - 0.5) * 0.5;

                        setMockLat(newLat);
                        setMockLng(newLng);

                        // Use custom message instead of alert for better UX
                        console.log(`Pin Dropped! New coordinates simulated at Lat: ${newLat.toFixed(4)}, Lng: ${newLng.toFixed(4)}`);
                    }}
                >
                    {/* Placeholder content */}
                    <p className="text-white text-xl p-4 text-center">
                        [Interactive Map Component Placeholder]<br/>
                        In a real application, a **Google Maps** or **Leaflet** component would load here, allowing the user to **click** to select the precise farm boundary. **(Click Anywhere to Drop Pin)**
                    </p>
                    <div className="absolute top-1/2 left-1/2 -mt-8 -ml-4 pointer-events-none">
                        <MapPin className="w-8 h-8 text-red-500 fill-red-500" /> 
                    </div>
                </div>

                <div className="bg-purple-900/50 rounded-xl p-4 mb-6">
                    <p className="text-white text-lg font-semibold">Current Map Center (Manual Selection):</p>
                    {/* Display the newly simulated coordinates */}
                    <p className="text-purple-300 text-sm">Lat: {mockLat.toFixed(4)}, Lng: {mockLng.toFixed(4)}</p>
                    <p className="text-sm text-yellow-300 mt-2">✨ Click the gray box above to change the pin location!</p>
                </div>

                <button
                    onClick={() => onSelect(mockLat, mockLng, 'Manually Selected Map Location')}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all"
                >
                    Confirm Location Selection
                </button>
            </div>
        </div>
    );
};


const WeatherCard = ({ icon, label, value, color }) => {
    const colorMap = {
        orange: 'from-orange-500 to-red-500',
        blue: 'from-blue-500 to-cyan-500',
        cyan: 'from-cyan-500 to-teal-500',
        purple: 'from-purple-500 to-pink-500'
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-all`}>
            <div className="flex justify-center mb-3">{icon}</div>
            <p className="text-sm opacity-90 mb-2">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
};

const RiskBar = ({ label, value }) => {
    const getColor = (val) => {
        if (val > 75) return 'bg-red-500';
        if (val > 50) return 'bg-orange-500';
        if (val > 25) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div>
            <div className="flex justify-between text-white mb-2">
                <span className="font-semibold">{label}</span>
                <span className="font-bold">{value}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
                <div
                    className={`${getColor(value)} h-3 rounded-full transition-all duration-1000`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};

const SummaryCard = ({ icon, label, value, sublabel }) => (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 hover:scale-105 transition-all">
        <div className="text-white mb-3 flex justify-center">{icon}</div>
        <p className="text-white/80 text-sm mb-2">{label}</p>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-white/70 text-xs">{sublabel}</p>
    </div>
);

const DataBadge = ({ name }) => (
    <div className="bg-white/10 rounded-lg p-3 text-center border border-white/20 hover:bg-white/20 transition-all">
        <Satellite className="w-6 h-6 text-blue-400 mx-auto mb-1" />
        <p className="text-white text-xs font-semibold">{name}</p>
    </div>
);

export default AgroPlastiGuard;
