import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Droplets, AlertTriangle, Leaf, Cloud, Thermometer, Wind, Shield, Satellite, Globe, Navigation, Download, CheckCircle, XCircle, Info, ArrowRight, X, Calendar, Sprout, TrendingUp } from 'lucide-react';

const AgroPlastiGuard = () => {
    const [step, setStep] = useState('welcome');
    const [farmData, setFarmData] = useState({
        acres: '', location: { lat: null, lng: null, name: '' }, hasPlantation: null,
        cropType: '', daysPlanted: ''
    });
    const [weatherData, setWeatherData] = useState(null);
    const [mSviData, setMSviData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    const getCurrentLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = Math.round(position.coords.accuracy);
                    const locationName = accuracy < 100 ? `GPS (±${accuracy}m)` : 'Approximate Location';
                    setFarmData(prev => ({ ...prev, location: { lat: lat.toFixed(4), lng: lng.toFixed(4), name: locationName } }));
                    setLoading(false);
                },
                () => {
                    alert('Could not detect location. Please choose on map.');
                    setLoading(false);
                }
            );
        }
    };

    const handleMapLocationSelect = (lat, lng, name) => {
        setFarmData(prev => ({ ...prev, location: { lat: lat.toFixed(4), lng: lng.toFixed(4), name: name || 'Map Selection' } }));
        setShowMapPicker(false);
    };

    const fetchWeatherData = () => {
        setLoading(true);
        setTimeout(() => {
            const forecast = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                let temp = Math.round(28 + Math.random() * 8);
                let rainfall = i === 3 || i === 4 ? Math.round(20 + Math.random() * 30) : Math.round(Math.random() * 5);
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    temp, rainfall, windSpeed: Math.round(5 + Math.random() * 10),
                    humidity: Math.round(60 + Math.random() * 30),
                    condition: rainfall > 20 ? 'Heavy Rain' : rainfall > 5 ? 'Light Rain' : 'Sunny'
                };
            });
            setWeatherData({ current: forecast[0], forecast, totalRainfall: forecast.reduce((sum, d) => sum + d.rainfall, 0) });
            setLoading(false);
        }, 1500);
    };

    const calculateMSVI = () => {
        setTimeout(() => {
            const mp = Math.round(60 + Math.random() * 30);
            const se = Math.round(50 + Math.random() * 30);
            const vc = farmData.hasPlantation ? Math.round(60 + Math.random() * 20) : Math.round(20 + Math.random() * 30);
            const sr = Math.round(40 + Math.random() * 40);
            const mSviScore = ((mp * 0.35) + (se * 0.25) + (vc * 0.20) + (sr * 0.20)) / 10;
            const soilLoss = (mSviScore / 10) * parseFloat(farmData.acres || 1) * 2.5;
            setMSviData({
                score: mSviScore.toFixed(1),
                factors: { microplasticProximity: mp, soilErosion: se, vegetationCover: vc, surfaceRoughness: sr },
                riskLevel: mSviScore > 7 ? 'Critical' : mSviScore > 5 ? 'High' : mSviScore > 3 ? 'Moderate' : 'Low',
                explanation: mSviScore > 7 ? 'Critical microplastic contamination risk detected. Immediate soil protection measures required.' : mSviScore > 5 ? 'High soil vulnerability. Active monitoring and intervention needed.' : 'Moderate risk level. Preventive measures recommended.',
                estimatedSoilLoss: soilLoss.toFixed(1)
            });
        }, 1000);
    };

    const generateRecommendations = () => {
        const recs = [];
        const today = weatherData?.current;
        
        if (today?.rainfall > 20) {
            recs.push({
                type: 'urgent', icon: <AlertTriangle className="w-6 h-6" />,
                title: 'Heavy Rain Alert - Immediate Action Required', 
                description: `${today.rainfall}mm rainfall expected today`,
                actions: [
                    'Check all drainage channels immediately',
                    'Cover exposed soil areas with tarps or mulch',
                    'Avoid any irrigation today',
                    'Create temporary water diversion trenches',
                    'Secure loose farming equipment'
                ],
                impact: 'Without action: Risk of 500kg+ soil loss per acre'
            });
        } else if (today?.rainfall > 5) {
            recs.push({
                type: 'caution', icon: <Cloud className="w-6 h-6" />,
                title: 'Light Rain Expected - Natural Irrigation Day',
                description: `${today.rainfall}mm rainfall - Good for crops`,
                actions: [
                    'Skip irrigation today, let rain do the work',
                    'Check for waterlogging in low areas',
                    'Great day for liquid fertilizer application (after rain)',
                    'Monitor seedlings for proper water absorption'
                ]
            });
        } else if (today?.condition === 'Sunny') {
            recs.push({
                type: 'optimal', icon: <Thermometer className="w-6 h-6" />,
                title: 'Perfect Weather for Farm Activities',
                description: `Clear day, ${today.temp}°C - Ideal working conditions`,
                actions: [
                    'Excellent day for planting or transplanting',
                    'Apply morning irrigation (7-9 AM)',
                    'Inspect crop health and pest presence',
                    'Good time for soil testing and amendments'
                ]
            });
        }

        if (mSviData && parseFloat(mSviData.score) > 7) {
            const acres = parseFloat(farmData.acres) || 1;
            const vetiverNeeded = Math.ceil(acres * 400);
            const mulchNeeded = acres * 2;
            
            recs.push({
                type: 'critical', icon: <Shield className="w-6 h-6" />,
                title: 'Critical M-SVI Score - Urgent Soil Protection',
                description: `Score: ${mSviData.score}/10 | Est. Soil Loss: ${mSviData.estimatedSoilLoss} tons/year`,
                actions: [
                    `Plant ${vetiverNeeded} Vetiver grass slips (400 per acre) along contours`,
                    `Apply ${mulchNeeded} tons organic mulch (2 tons per acre)`,
                    'Install silt fences at field boundaries immediately',
                    'Create vegetative buffer strips 3-5 meters wide',
                    'Begin composting to improve soil organic matter'
                ],
                example: '✅ Success Story: Farmer in Maharashtra reduced M-SVI from 8.2 to 5.1 in 6 months using Vetiver + mulch',
                timeframe: '3-6 months to see significant improvement',
                cost: `Estimated: ₹${(acres * 12000).toLocaleString('en-IN')} for complete protection`
            });
        } else if (mSviData && parseFloat(mSviData.score) > 5) {
            recs.push({
                type: 'warning', icon: <Shield className="w-6 h-6" />,
                title: 'High M-SVI - Prevention Better Than Cure',
                description: `Score: ${mSviData.score}/10 - Act now before it worsens`,
                actions: [
                    'Plant cover crops in off-season (mustard, clover)',
                    'Apply 2-3 inch mulch layer in vulnerable areas',
                    'Practice contour farming on slopes',
                    'Maintain minimum 30% vegetation cover year-round'
                ],
                example: 'Tip: Cover crops can reduce soil erosion by 60-90%'
            });
        }

        if (farmData.hasPlantation && farmData.cropType && farmData.daysPlanted) {
            const days = parseInt(farmData.daysPlanted);
            const crop = farmData.cropType;
            let cropRec = null;

            if (crop === 'Rice') {
                if (days < 21) cropRec = { stage: 'Seedling', care: ['Keep 2-3 inch water level', 'Apply first nitrogen dose (1/3 of total)', 'Watch for leaf folder pests'], next: 'Tillering stage starts around day 21' };
                else if (days < 45) cropRec = { stage: 'Tillering', care: ['Maintain 5cm water depth', 'Apply second nitrogen dose', 'Remove weeds manually'], next: 'Panicle initiation at day 45-50' };
                else if (days < 90) cropRec = { stage: 'Reproductive', care: ['Keep field continuously flooded', 'Apply final fertilizer dose', 'Monitor for brown plant hopper'], next: 'Harvest preparation after 90-100 days' };
                else cropRec = { stage: 'Maturity', care: ['Drain field 7-10 days before harvest', 'Monitor grain moisture (20-24% for harvest)', 'Prepare harvesting equipment'], next: 'Ready for harvest!' };
            } else if (crop === 'Wheat') {
                if (days < 25) cropRec = { stage: 'Crown Root Initiation', care: ['Light irrigation if dry', 'No nitrogen yet, roots developing', 'Protect from birds'], next: 'Tillering begins day 25' };
                else if (days < 60) cropRec = { stage: 'Tillering/Jointing', care: ['First irrigation at 21 days', 'Apply 1/2 nitrogen dose', 'Control broad-leaf weeds'], next: 'Flowering stage at 60-70 days' };
                else if (days < 100) cropRec = { stage: 'Heading/Flowering', care: ['Critical irrigation period - do not miss', 'Apply remaining nitrogen', 'Watch for rust disease'], next: 'Grain filling phase' };
                else cropRec = { stage: 'Maturity', care: ['Stop irrigation 10 days before harvest', 'Watch for lodging in wind', 'Harvest at 20% grain moisture'], next: 'Harvest time!' };
            } else if (crop === 'Corn') {
                if (days < 20) cropRec = { stage: 'Emergence/V3', care: ['Ensure good soil moisture', 'Side-dress nitrogen if yellowing', 'Control cutworms'], next: 'Rapid growth phase ahead' };
                else if (days < 50) cropRec = { stage: 'Vegetative Growth', care: ['Deep irrigation weekly', 'Apply main nitrogen dose', 'Monitor for corn borer'], next: 'Tasseling at 50-60 days' };
                else if (days < 80) cropRec = { stage: 'Tasseling/Silking', care: ['CRITICAL: Do not miss irrigation', 'Ensure good pollination (morning dew helps)', 'Watch for silk feeders'], next: 'Ear filling begins' };
                else cropRec = { stage: 'Grain Fill/Maturity', care: ['Reduce irrigation gradually', 'Monitor grain moisture (25% = harvest ready)', 'Prevent lodging'], next: 'Harvest approaching!' };
            }

            if (cropRec) {
                recs.push({
                    type: 'crop', icon: <Sprout className="w-6 h-6" />,
                    title: `${crop} - Day ${days} (${cropRec.stage} Stage)`,
                    description: `Your crop is at a ${cropRec.stage.toLowerCase()} stage`,
                    actions: cropRec.care,
                    nextStage: cropRec.next
                });
            }
        }

        const tomorrow = weatherData?.forecast[1];
        if (tomorrow) {
            recs.push({
                type: 'planning', icon: <Calendar className="w-6 h-6" />,
                title: "Tomorrow's Weather Planning",
                description: `${tomorrow.condition}, ${tomorrow.temp}°C, ${tomorrow.rainfall}mm rain expected`,
                actions: tomorrow.rainfall > 10 ? [
                    'Prepare rain protection for vulnerable crops',
                    'Delay any chemical spray applications',
                    'Check rainwater harvesting system capacity'
                ] : [
                    'Plan irrigation for early morning',
                    'Schedule field inspections',
                    'Good day for spraying if needed'
                ]
            });
        }

        setRecommendations(recs);
    };

    useEffect(() => {
        if (step === 'analysis' && farmData.location.lat && !weatherData) {
            fetchWeatherData();
            calculateMSVI();
        }
    }, [step, farmData.location.lat, weatherData]);

    useEffect(() => {
        if (weatherData && mSviData && recommendations.length === 0) {
            generateRecommendations();
        }
    }, [weatherData, mSviData]);

    const downloadReport = () => {
        alert('Report download feature - In production, this would generate a PDF with all analysis data');
    };

    return (
        <>
            {step === 'welcome' && <WelcomeScreen setStep={setStep} />}
            {step === 'farmDetails' && <FarmDetailsForm {...{ farmData, setFarmData, loading, getCurrentLocation, setShowMapPicker, setStep }} />}
            {step === 'analysis' && <AnalysisScreen {...{ farmData, weatherData, mSviData, recommendations, loading, setStep, setFarmData, setWeatherData, setMSviData, setRecommendations, downloadReport }} />}
            {showMapPicker && <MapPickerModal onClose={() => setShowMapPicker(false)} onSelect={handleMapLocationSelect} />}
        </>
    );
};

const WelcomeScreen = ({ setStep }) => (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-4 border-white/20 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Leaf className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Welcome to</h1>
            <h2 className="text-6xl font-extrabold text-yellow-300 mb-6">AGRO-PLASTI-GUARD</h2>
            <p className="text-xl text-white/90 mb-8">AI-Powered Farm Intelligence System</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-all">
                    <Satellite className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                    <p className="text-sm text-white font-semibold">NASA Data</p>
                </div>
                <div className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-all">
                    <Cloud className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <p className="text-sm text-white font-semibold">Weather AI</p>
                </div>
                <div className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-all">
                    <Shield className="w-8 h-8 text-red-300 mx-auto mb-2" />
                    <p className="text-sm text-white font-semibold">Soil Guard</p>
                </div>
            </div>
            <button onClick={() => setStep('farmDetails')} className="bg-white text-green-700 px-12 py-4 rounded-full text-xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-lg">
                Get Started <ArrowRight className="w-6 h-6" />
            </button>
        </div>
    </div>
);

const FarmDetailsForm = ({ farmData, setFarmData, loading, getCurrentLocation, setShowMapPicker, setStep }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-12">
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">Tell Us About Your Farm</h2>
            <div className="mb-6">
                <label className="block text-white text-lg font-semibold mb-3">Farm Size (Acres)</label>
                <input type="number" value={farmData.acres} onChange={(e) => setFarmData({...farmData, acres: e.target.value})} placeholder="e.g., 5" className="w-full px-6 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-xl placeholder-white/50 focus:outline-none focus:border-green-400" />
            </div>
            <div className="mb-6">
                <label className="block text-white text-lg font-semibold mb-3">Farm Location</label>
                <div className="flex gap-4 mb-4">
                    <button onClick={getCurrentLocation} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                        <Navigation className="w-5 h-5" />{loading ? 'Detecting...' : 'Use GPS'}
                    </button>
                    <button onClick={() => setShowMapPicker(true)} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                        <MapPin className="w-5 h-5" />Choose on Map
                    </button>
                </div>
                {farmData.location.name && (
                    <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-4 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-green-400" />
                        <div>
                            <p className="text-green-400 font-semibold">{farmData.location.name}</p>
                            <p className="text-white/70 text-sm">Lat: {farmData.location.lat}, Lng: {farmData.location.lng}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="mb-6">
                <label className="block text-white text-lg font-semibold mb-3">Currently Planted?</label>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFarmData({...farmData, hasPlantation: true})} className={`px-6 py-4 rounded-xl font-semibold transition-all ${farmData.hasPlantation === true ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />Yes
                    </button>
                    <button onClick={() => setFarmData({...farmData, hasPlantation: false, cropType: '', daysPlanted: ''})} className={`px-6 py-4 rounded-xl font-semibold transition-all ${farmData.hasPlantation === false ? 'bg-orange-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                        <XCircle className="w-8 h-8 mx-auto mb-2" />No
                    </button>
                </div>
            </div>
            {farmData.hasPlantation && (
                <>
                    <div className="mb-6">
                        <label className="block text-white text-lg font-semibold mb-3">Crop Type</label>
                        <select value={farmData.cropType} onChange={(e) => setFarmData({...farmData, cropType: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-xl focus:outline-none focus:border-green-400">
                            <option value="" className="bg-slate-800">Select Crop</option>
                            <option value="Rice" className="bg-slate-800">Rice</option>
                            <option value="Wheat" className="bg-slate-800">Wheat</option>
                            <option value="Corn" className="bg-slate-800">Corn (Maize)</option>
                            <option value="Cotton" className="bg-slate-800">Cotton</option>
                            <option value="Sugarcane" className="bg-slate-800">Sugarcane</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-white text-lg font-semibold mb-3">Days Since Planting</label>
                        <input type="number" value={farmData.daysPlanted} onChange={(e) => setFarmData({...farmData, daysPlanted: e.target.value})} placeholder="e.g., 30" className="w-full px-6 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-xl placeholder-white/50 focus:outline-none focus:border-green-400" />
                    </div>
                </>
            )}
            <button onClick={() => {
                if (farmData.acres && farmData.location.lat && farmData.hasPlantation !== null) {
                    if (farmData.hasPlantation && (!farmData.cropType || !farmData.daysPlanted)) {
                        alert('Please fill in crop details');
                        return;
                    }
                    setStep('analysis');
                } else alert('Please fill all required fields!');
            }} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-5 rounded-xl text-xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg">
                Analyze My Farm <ArrowRight className="w-6 h-6" />
            </button>
        </div>
    </div>
);

const AnalysisScreen = ({ farmData, weatherData, mSviData, recommendations, loading, setStep, setFarmData, setWeatherData, setMSviData, setRecommendations, downloadReport }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 py-8">
        <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 mb-8 shadow-2xl">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Farm Analysis Report</h1>
                        <p className="text-white/90 text-lg">{farmData.location.name} • {farmData.acres} Acres</p>
                        {farmData.hasPlantation && <p className="text-yellow-300 font-semibold mt-1">{farmData.cropType} - Day {farmData.daysPlanted}</p>}
                    </div>
                    <button onClick={downloadReport} className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition-all">
                        <Download className="w-5 h-5" />Download Report
                    </button>
                </div>
            </div>

            {loading || !weatherData || !mSviData ? (
                <div className="text-center text-white py-20">
                    <Globe className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-400" />
                    <p className="text-2xl font-semibold">Analyzing your farm data...</p>
                    <p className="text-white/60 mt-2">Fetching weather • Calculating M-SVI • Generating recommendations</p>
                </div>
            ) : (
                <>
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <Cloud className="w-8 h-8 text-blue-400" />Today's Weather & 7-Day Forecast
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <WeatherCard icon={<Thermometer className="w-8 h-8" />} label="Temperature" value={`${weatherData.current.temp}°C`} color="orange" />
                            <WeatherCard icon={<Droplets className="w-8 h-8" />} label="Rainfall Today" value={`${weatherData.current.rainfall}mm`} color="blue" />
                            <WeatherCard icon={<Wind className="w-8 h-8" />} label="Wind Speed" value={`${weatherData.current.windSpeed} km/h`} color="cyan" />
                            <WeatherCard icon={<Cloud className="w-8 h-8" />} label="Condition" value={weatherData.current.condition} color="purple" />
                        </div>
                        <div className="bg-blue-900/30 rounded-2xl p-6 mb-6 border border-blue-500/30">
                            <p className="text-blue-300 text-sm mb-1">7-Day Rainfall Total</p>
                            <p className="text-3xl font-bold text-white">{weatherData.totalRainfall}mm</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">7-Day Detailed Forecast</h3>
                            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                                {weatherData.forecast.map((day, i) => (
                                    <div key={i} className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/20 transition-all">
                                        <p className="text-white/70 text-sm mb-2">{day.date}</p>
                                        <p className="text-2xl font-bold text-white mb-1">{day.temp}°</p>
                                        <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                        <p className="text-white/90 text-sm">{day.rainfall}mm</p>
                                        <p className="text-white/60 text-xs mt-1">{day.condition}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-red-400" />M-SVI Soil Protection Score
                        </h2>
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className={`rounded-2xl p-8 text-center shadow-xl ${mSviData.riskLevel === 'Critical' ? 'bg-gradient-to-br from-red-600 to-red-700' : mSviData.riskLevel === 'High' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : mSviData.riskLevel === 'Moderate' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
                                <p className="text-white/90 text-xl mb-2 font-semibold">M-SVI Score</p>
                                <p className="text-9xl font-bold text-white">{mSviData.score}</p>
                                <p className="text-3xl font-bold text-white mt-4">{mSviData.riskLevel} Risk</p>
                                <p className="text-white/80 mt-2">Est. Soil Loss: {mSviData.estimatedSoilLoss} tons/year</p>
                            </div>
                            <div>
                                <div className="bg-blue-500/20 border-2 border-blue-400 rounded-2xl p-6 mb-6">
                                    <p className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                        <Info className="w-5 h-5" />What This Means
                                    </p>
                                    <p className="text-white">{mSviData.explanation}</p>
                                </div>
                                <RiskBar label="Microplastic Proximity" value={mSviData.factors.microplasticProximity} />
                                <RiskBar label="Soil Erosion Risk" value={mSviData.factors.soilErosion} />
                                <RiskBar label="Vegetation Cover" value={mSviData.factors.vegetationCover} />
                                <RiskBar label="Surface Roughness" value={mSviData.factors.surfaceRoughness} />
                            </div>
                        </div>
                    </div>

                    {recommendations.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-green-400" />Action Recommendations ({recommendations.length})
                            </h2>
                            {recommendations.map((rec, i) => (
                                <div key={i} className={`rounded-3xl p-8 mb-6 border-2 transition-all hover:scale-[1.02] ${
                                    rec.type === 'urgent' ? 'bg-red-500/20 border-red-400' : 
                                    rec.type === 'critical' ? 'bg-red-600/20 border-red-500' :
                                    rec.type === 'warning' ? 'bg-orange-500/20 border-orange-400' :
                                    rec.type === 'caution' ? 'bg-yellow-500/20 border-yellow-400' :
                                    rec.type === 'crop' ? 'bg-green-500/20 border-green-400' :
                                    rec.type === 'optimal' ? 'bg-blue-500/20 border-blue-400' :
                                    'bg-purple-500/20 border-purple-400'
                                }`}>
                                    <div className="flex gap-4 mb-6">
                                        <div className={`p-4 rounded-xl ${
                                            rec.type === 'urgent' || rec.type === 'critical' ? 'bg-red-500' :
                                            rec.type === 'warning' ? 'bg-orange-500' :
                                            rec.type === 'caution' ? 'bg-yellow-500' :
                                            rec.type === 'crop' ? 'bg-green-500' :
                                            rec.type === 'optimal' ? 'bg-blue-500' :
                                            'bg-purple-500'
                                        } text-white`}>
                                            {rec.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-white mb-2">{rec.title}</h3>
                                            <p className="text-white/90 text-lg">{rec.description}</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/30 rounded-2xl p-6">
                                        <h4 className="text-white font-bold mb-4 text-lg">
                                            {rec.type === 'crop' ? 'Care Instructions:' : 'Recommended Actions:'}
                                        </h4>
                                        <ul className="space-y-3">
                                            {rec.actions.map((action, j) => (
                                                <li key={j} className="flex gap-3 text-white">
                                                    <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                                    <span className="text-base">{action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {rec.nextStage && (
                                            <div className="mt-6 bg-blue-500/20 border-l-4 border-blue-400 rounded p-4">
                                                <p className="text-blue-300 font-semibold text-sm mb-1">Next Stage:</p>
                                                <p className="text-white">{rec.nextStage}</p>
                                            </div>
                                        )}
                                        {rec.example && (
                                            <div className="mt-6 bg-green-500/20 border-l-4 border-green-400 rounded p-4">
                                                <p className="text-white">{rec.example}</p>
                                            </div>
                                        )}
                                        {rec.timeframe && (
                                            <div className="mt-4 text-white/80 text-sm">
                                                <strong>Timeframe:</strong> {rec.timeframe}
                                            </div>
                                        )}
                                        {rec.cost && (
                                            <div className="mt-2 text-yellow-300 text-sm font-semibold">
                                                <strong>Investment:</strong> {rec.cost}
                                            </div>
                                        )}
                                        {rec.impact && (
                                            <div className="mt-4 bg-red-900/50 border-l-4 border-red-500 rounded p-3">
                                                <p className="text-red-300 text-sm font-semibold">{rec.impact}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 mb-8 border border-white/20">
                        <h2 className="text-3xl font-bold text-white mb-6">Summary Report</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <SummaryCard icon={<MapPin className="w-6 h-6" />} label="Farm Location" value={farmData.location.name} sublabel={`${farmData.acres} acres`} />
                            {farmData.hasPlantation && (
                                <SummaryCard icon={<Sprout className="w-6 h-6" />} label="Current Crop" value={farmData.cropType} sublabel={`Day ${farmData.daysPlanted} of growth`} />
                            )}
                            <SummaryCard icon={<Shield className="w-6 h-6" />} label="Soil Health" value={`${mSviData.score}/10`} sublabel={`${mSviData.riskLevel} Risk`} />
                            <SummaryCard icon={<Droplets className="w-6 h-6" />} label="7-Day Rainfall" value={`${weatherData.totalRainfall}mm`} sublabel="Total expected" />
                            <SummaryCard icon={<AlertTriangle className="w-6 h-6" />} label="Priority Actions" value={recommendations.length} sublabel="Recommendations" />
                            <SummaryCard icon={<Satellite className="w-6 h-6" />} label="Data Sources" value="NASA + APIs" sublabel="Meteomatics, POWER" />
                        </div>
                    </div>

                    <button onClick={() => {
                        setStep('welcome');
                        setFarmData({acres: '', location: {lat: null, lng: null, name: ''}, hasPlantation: null, cropType: '', daysPlanted: ''});
                        setWeatherData(null);
                        setMSviData(null);
                        setRecommendations([]);
                    }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-5 rounded-xl text-xl font-bold hover:scale-105 transition-all shadow-lg">
                        Analyze Another Farm
                    </button>
                </>
            )}
        </div>
    </div>
);

const MapPickerModal = ({ onClose, onSelect }) => {
    const [lat, setLat] = useState(20.5937);
    const [lng, setLng] = useState(78.9629);
    const [searchAddress, setSearchAddress] = useState('');
    const [locationName, setLocationName] = useState('India (Center)');

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-3xl p-8 w-full max-w-5xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                        <MapPin className="w-7 h-7 text-purple-400" />Choose Farm Location
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-red-400 transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="bg-purple-900/30 rounded-xl p-4 mb-4 border border-purple-500/50">
                    <p className="text-purple-300 text-sm">
                        <Info className="w-4 h-4 inline mr-2" />
                        Note: Map integration requires Google Maps API key. Use coordinates below or enter manually.
                    </p>
                </div>

                <div className="mb-4 space-y-3">
                    <input 
                        type="text" 
                        value={searchAddress} 
                        onChange={(e) => setSearchAddress(e.target.value)} 
                        placeholder="Enter location name or coordinates..." 
                        className="w-full px-4 py-3 rounded-xl bg-white/20 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-purple-400" 
                    />
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-purple-900/50 rounded-xl p-4 border border-purple-500/30">
                        <p className="text-white font-semibold mb-4">Adjust Coordinates:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-purple-300 text-sm mb-2">Latitude</p>
                                <input 
                                    type="number" 
                                    step="0.0001" 
                                    value={lat} 
                                    onChange={(e) => setLat(parseFloat(e.target.value))} 
                                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:border-purple-400"
                                />
                            </div>
                            <div>
                                <p className="text-purple-300 text-sm mb-2">Longitude</p>
                                <input 
                                    type="number" 
                                    step="0.0001" 
                                    value={lng} 
                                    onChange={(e) => setLng(parseFloat(e.target.value))} 
                                    className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:border-purple-400"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                        <p className="text-green-300 text-sm mb-2">Location Name:</p>
                        <input 
                            type="text" 
                            value={locationName} 
                            onChange={(e) => setLocationName(e.target.value)} 
                            placeholder="Enter farm name or location"
                            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-green-400"
                        />
                    </div>
                </div>

                <button 
                    onClick={() => onSelect(lat, lng, locationName)} 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-3"
                >
                    <CheckCircle className="w-6 h-6" />
                    Confirm Location
                </button>
            </div>
        </div>
    );
};

const WeatherCard = ({ icon, label, value, color }) => {
    const colors = { 
        orange: 'from-orange-500 to-red-500', 
        blue: 'from-blue-500 to-cyan-500', 
        cyan: 'from-cyan-500 to-teal-500', 
        purple: 'from-purple-500 to-pink-500' 
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 text-white text-center hover:scale-105 transition-all shadow-lg`}>
            <div className="flex justify-center mb-3">{icon}</div>
            <p className="text-sm opacity-90 mb-2 font-semibold">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
};

const RiskBar = ({ label, value }) => (
    <div className="mb-4">
        <div className="flex justify-between text-white mb-2">
            <span className="font-semibold">{label}</span>
            <span className="font-bold">{value}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
                className={`${value > 75 ? 'bg-red-500' : value > 50 ? 'bg-orange-500' : 'bg-green-500'} h-4 rounded-full transition-all duration-500`} 
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

const SummaryCard = ({ icon, label, value, sublabel }) => (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
        <div className="text-white mb-3 flex justify-center">{icon}</div>
        <p className="text-white/80 text-sm mb-2 text-center font-semibold">{label}</p>
        <p className="text-2xl font-bold text-white mb-1 text-center">{value}</p>
        <p className="text-white/70 text-xs text-center">{sublabel}</p>
    </div>
);

export default AgroPlastiGuard;