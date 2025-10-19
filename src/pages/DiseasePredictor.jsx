import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { prefersReducedMotion } from '../animations/animationConfig';
import { loadLottie } from '../utils/animationLoader';
import { API_ENDPOINTS } from '../config/backend';

const Lottie = lazy(() => import('lottie-react'));

const DiseasePredictor = () => {
  // State management
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [animalType, setAnimalType] = useState('Dog');
  const [age, setAge] = useState(3);
  const [weight, setWeight] = useState(20);
  const [breed, setBreed] = useState('Mixed');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);
  const [nearbyClinics, setNearbyClinics] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [showAiScan, setShowAiScan] = useState(false);
  const [aiScanAnimation, setAiScanAnimation] = useState(null);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [resultCards, setResultCards] = useState([]);

  // Comprehensive symptom list
  const availableSymptoms = [
    'Fever', 'Lethargy', 'Appetite Loss', 'Vomiting', 'Diarrhea', 'Coughing', 
    'Sneezing', 'Nasal Discharge', 'Eye Discharge', 'Labored Breathing', 
    'Lameness', 'Skin Lesions', 'Hair Loss', 'Excessive Scratching',
    'Weight Loss', 'Increased Thirst', 'Frequent Urination', 'Difficulty Urinating',
    'Abdominal Pain', 'Bloating', 'Constipation', 'Blood in Stool', 'Blood in Urine',
    'Pale Gums', 'Jaundice', 'Seizures', 'Tremors', 'Loss of Coordination',
    'Behavioral Changes', 'Aggression', 'Hiding', 'Restlessness', 'Weakness',
    'Collapse', 'Difficulty Swallowing', 'Drooling', 'Bad Breath', 'Tooth Pain',
    'Swollen Joints', 'Stiffness', 'Limping', 'Head Shaking', 'Ear Discharge',
    'Red Eyes', 'Cloudy Eyes', 'Blindness', 'Deafness', 'Swollen Lymph Nodes'
  ];

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 1;
  };

  useEffect(() => {
    loadPredictionHistory();
    getUserLocation();
    setShouldReduceMotion(prefersReducedMotion());
    
    // Load AI scan animation
    loadLottie('/animations/aiScan.json')
      .then(setAiScanAnimation)
      .catch(() => console.warn('AI scan animation not found'));

    // Listen for animation playground triggers
    const handleAiScanTrigger = () => {
      if (selectedSymptoms.length === 0) {
        // Add sample symptoms for demo
        setSelectedSymptoms(['Fever', 'Lethargy', 'Appetite Loss']);
      }
      setTimeout(() => handlePredict(), 100);
    };

    window.addEventListener('triggerAiScan', handleAiScanTrigger);
    return () => window.removeEventListener('triggerAiScan', handleAiScanTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPredictionHistory = async () => {
    try {
      const userId = getCurrentUser();
      const response = await axios.get(API_ENDPOINTS.DISEASE_HISTORY(userId));
      setPredictionHistory(response.data);
    } catch (error) {
      console.error('Error loading prediction history:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: 33.6844, lng: 73.0479 });
        }
      );
    }
  };

  const handleSymptomAdd = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSymptomRemove = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const calculateHealthScore = (predictions) => {
    if (!predictions || predictions.length === 0) return 100;
    
    const topPrediction = predictions[0];
    const confidence = parseFloat(topPrediction.confidence.replace('%', ''));
    const severity = topPrediction.severity;
    
    let severityMultiplier = 1;
    if (severity === 'Severe') severityMultiplier = 3;
    else if (severity === 'Moderate') severityMultiplier = 2;
    
    const riskScore = confidence * severityMultiplier;
    return Math.max(0, Math.min(100, 100 - riskScore));
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions(null);
    setHealthScore(null);
    setResultCards([]);
    
    // Show AI scan overlay
    if (!shouldReduceMotion) {
      setShowAiScan(true);
    }

    try {
      const userId = getCurrentUser();
      const response = await axios.post(API_ENDPOINTS.PREDICT_DISEASE, {
        symptoms: selectedSymptoms.map(s => s.toLowerCase()),
        animal_type: animalType,
        age: parseInt(age),
        weight: parseFloat(weight),
        breed: breed,
        user_id: userId
      });

      const predictions = response.data.predictions;
      setPredictions(predictions);
      const score = calculateHealthScore(predictions);
      setHealthScore(score);
      
      // Animate result cards reveal
      if (!shouldReduceMotion) {
        setResultCards(predictions.map((pred, index) => ({ ...pred, index })));
      } else {
        setResultCards(predictions.map((pred, index) => ({ ...pred, index })));
      }
      
      loadPredictionHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
      // Hide AI scan overlay after a brief delay
      setTimeout(() => setShowAiScan(false), 500);
    }
  };

  const loadNearbyClinics = async () => {
    if (!userLocation) return;
    
    try {
      const response = await axios.get(API_ENDPOINTS.PROVIDERS, {
        params: {
          lat: userLocation.lat,
          lon: userLocation.lng,
          radius: 10
        }
      });
      setNearbyClinics(response.data);
      setShowClinicModal(true);
    } catch (error) {
      console.error('Error loading nearby clinics:', error);
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'Severe': return 'text-red-600 bg-red-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Mild': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatChartData = () => {
    if (!predictions) return [];
    return predictions.map(pred => ({
      disease: pred.disease.length > 15 ? pred.disease.substring(0, 15) + '...' : pred.disease,
      confidence: parseFloat(pred.confidence.replace('%', '')),
      fullName: pred.disease
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏥 Disease Predictor
            </h1>
            <p className="text-gray-600">
              AI-powered pet health assessment with severity analysis
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Pet Information
              </h2>

              {/* Animal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Type
                </label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Horse">Horse</option>
                  <option value="Cow">Cow</option>
                  <option value="Sheep">Sheep</option>
                  <option value="Goat">Goat</option>
                  <option value="Pig">Pig</option>
                  <option value="Rabbit">Rabbit</option>
                </select>
              </div>

              {/* Age and Weight */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Breed */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Golden Retriever, Persian, etc."
                />
              </div>

              {/* Symptoms Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSymptomAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a symptom...</option>
                  {availableSymptoms
                    .filter(symptom => !selectedSymptoms.includes(symptom))
                    .map(symptom => (
                      <option key={symptom} value={symptom}>
                        {symptom}
                      </option>
                    ))}
                </select>

                {/* Selected Symptoms */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSymptoms.map(symptom => (
                    <span
                      key={symptom}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {symptom}
                      <button
                        onClick={() => handleSymptomRemove(symptom)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Predict Button */}
              <button
                onClick={handlePredict}
                disabled={loading || selectedSymptoms.length === 0}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  loading || selectedSymptoms.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                aria-label={loading ? 'Analyzing symptoms...' : 'Predict disease'}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    {!shouldReduceMotion ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    Analyzing...
                  </span>
                ) : (
                  '🔬 Predict Disease'
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <span className="text-red-400 mr-3">❌</span>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Prediction Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Health Score */}
            {healthScore !== null && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🎯 Pet Health Score
                </h3>
                <div className="flex items-center mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${getHealthScoreColor(healthScore)}`}
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {healthScore}/100
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {healthScore >= 80 && "🟢 Good health indicators"}
                  {healthScore >= 60 && healthScore < 80 && "🟡 Monitor symptoms closely"}
                  {healthScore >= 40 && healthScore < 60 && "🟠 Veterinary consultation recommended"}
                  {healthScore < 40 && "🔴 Immediate veterinary attention needed"}
                </p>
              </div>
            )}

            {/* Animated Prediction Results */}
            {resultCards && resultCards.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🎯 Top 3 Predictions
                </h3>
                <div className="space-y-4">
                  <AnimatePresence>
                    {resultCards.map((prediction, index) => (
                      <AnimatedResultCard
                        key={index}
                        prediction={prediction}
                        index={index}
                        shouldReduceMotion={shouldReduceMotion}
                        getSeverityTextColor={getSeverityTextColor}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Find Nearby Clinic Button */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="mt-6 pt-4 border-t border-gray-200"
                >
                  <button
                    onClick={loadNearbyClinics}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    🗺️ Find Nearby Clinic
                  </button>
                </motion.div>
              </div>
            )}

            {/* Confidence Visualization */}
            {predictions && predictions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📊 Confidence Levels
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="disease" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis 
                        label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}%`, 
                          props.payload.fullName
                        ]}
                      />
                      <Bar 
                        dataKey="confidence" 
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Standalone Find Nearby Clinics (when no predictions) */}
            {(!predictions || predictions.length === 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📍 Find Nearby Clinics
                </h3>
                <button
                  onClick={loadNearbyClinics}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  🗺️ Show Nearby Clinics
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prediction History */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Prediction History
          </h3>
          {predictionHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symptoms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Top Disease
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictionHistory.slice(0, 10).map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {record.symptoms.slice(0, 3).map(symptom => (
                            <span key={symptom} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {symptom}
                            </span>
                          ))}
                          {record.symptoms.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{record.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.predictions[0]?.disease || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSeverityTextColor(record.predictions[0]?.severity)}`}>
                          {record.predictions[0]?.severity || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {record.predictions[0]?.recommendation || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No prediction history available. Make your first prediction above!
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <span className="text-yellow-400 mr-3">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Medical Disclaimer</h3>
              <p className="mt-1 text-sm text-yellow-700">
                This AI-powered disease predictor is for educational purposes only and should not replace professional veterinary advice. 
                Always consult with a qualified veterinarian for accurate diagnosis and treatment of your pet's health concerns.
              </p>
            </div>
          </div>
        </div>
        
        {/* AI Scan Overlay */}
        <AnimatePresence>
          {showAiScan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
              >
                <div className="w-24 h-24 mx-auto mb-4">
                  {aiScanAnimation && !shouldReduceMotion ? (
                    <Suspense fallback={<div className="w-24 h-24 bg-blue-100 rounded-full animate-pulse" />}>
                      <Lottie
                        animationData={aiScanAnimation}
                        loop={true}
                        autoplay={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Suspense>
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                      🔍
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  AI Analysis in Progress
                </h3>
                <p className="text-gray-600">
                  Analyzing symptoms and generating predictions...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Clinic Modal - Enhanced with teal theme */}
        <AnimatePresence>
          {showClinicModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              style={{ backdropFilter: 'blur(6px)' }}
              onClick={() => setShowClinicModal(false)}
            >
              <motion.div
                initial={shouldReduceMotion ? false : { 
                  scale: 0.9, 
                  y: 30,
                  rotateX: -10
                }}
                animate={shouldReduceMotion ? false : { 
                  scale: 1, 
                  y: 0,
                  rotateX: 0
                }}
                exit={shouldReduceMotion ? false : { 
                  scale: 0.95, 
                  y: 20,
                  opacity: 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-teal-100"
                style={{
                  boxShadow: '0 25px 50px rgba(15, 118, 110, 0.15)',
                  transformStyle: 'preserve-3d'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.h3 
                    className="text-xl font-semibold text-teal-800 flex items-center gap-2"
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-2xl">🏥</span>
                    Nearby Veterinary Clinics
                  </motion.h3>
                  <motion.button
                    onClick={() => setShowClinicModal(false)}
                    className="text-gray-400 hover:text-teal-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-teal-50 transition-all duration-200"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 90 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                    initial={shouldReduceMotion ? false : { opacity: 0, rotate: -90 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    ✕
                  </motion.button>
                </div>
                
                {nearbyClinics.length > 0 ? (
                  <motion.div 
                    className="space-y-3"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {nearbyClinics.slice(0, 10).map((clinic, index) => (
                      <motion.div
                        key={clinic.id}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                        animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        className="p-4 border-2 border-teal-100 rounded-lg hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 cursor-pointer"
                        whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
                        style={{
                          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.08)'
                        }}
                      >
                        <div className="font-semibold text-teal-800 mb-1 flex items-center gap-2">
                          <span className="text-teal-600">📍</span>
                          {clinic.name}
                        </div>
                        <div className="text-gray-600 text-sm mb-2">
                          {clinic.address}
                        </div>
                        {clinic.phone && (
                          <div className="text-teal-600 text-sm flex items-center gap-1">
                            <span>📞</span>
                            {clinic.phone}
                          </div>
                        )}
                        {clinic.rating && (
                          <div className="text-yellow-600 text-sm mt-1 flex items-center gap-1">
                            <span>⭐</span>
                            {clinic.rating}/5
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-gray-500 text-lg mb-2">🔍</div>
                    <p className="text-gray-600">No clinics found in your area.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try expanding your search radius or check your location settings.
                    </p>
                  </motion.div>
                )}
                
                <motion.div 
                  className="mt-6 pt-4 border-t border-teal-100"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-xs text-gray-500 text-center">
                    💡 Tip: Call ahead to confirm availability and emergency services
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Animated Result Card Component
const AnimatedResultCard = ({ prediction, index, shouldReduceMotion, getSeverityTextColor }) => {
  const cardAnimation = useAnimation();
  const [showPulse, setShowPulse] = useState(false);
  
  useEffect(() => {
    if (!shouldReduceMotion) {
      // Staggered reveal animation
      cardAnimation.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          delay: index * 0.2,
          duration: 0.5,
          ease: "easeOut"
        }
      });
      
      // Severity pulse effect - trigger after reveal
      const pulseTimeout = setTimeout(() => {
        console.log(`🎭 Checking ${prediction.severity} pulse for card ${index}: ${prediction.disease}`);
        
        if (prediction.severity === 'Severe') {
          setShowPulse(true);
          console.log(`🔴 Triggering SEVERE pulse for card ${index}`);
          // Red pulse animation
          cardAnimation.start({
            scale: [1, 1.02, 1],
            boxShadow: [
              '0 4px 6px rgba(0, 0, 0, 0.1)',
              '0 8px 25px rgba(239, 68, 68, 0.4)',
              '0 4px 6px rgba(0, 0, 0, 0.1)'
            ],
            transition: { 
              duration: 1.2, 
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }
          });
          
          // Reset pulse flag after animation
          setTimeout(() => {
            setShowPulse(false);
            console.log(`✅ SEVERE pulse completed for ${prediction.disease}`);
          }, 1200);
          
        } else if (prediction.severity === 'Mild') {
          setShowPulse(true);
          console.log(`🟢 Triggering MILD pulse for card ${index}`);
          // Green pulse animation
          cardAnimation.start({
            scale: [1, 1.02, 1],
            boxShadow: [
              '0 4px 6px rgba(0, 0, 0, 0.1)',
              '0 8px 25px rgba(34, 197, 94, 0.4)',
              '0 4px 6px rgba(0, 0, 0, 0.1)'
            ],
            transition: { 
              duration: 1.2, 
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }
          });
          
          // Reset pulse flag after animation
          setTimeout(() => {
            setShowPulse(false);
            console.log(`✅ MILD pulse completed for ${prediction.disease}`);
          }, 1200);
          
        } else {
          console.log(`⚪ No pulse for ${prediction.severity} severity`);
        }
      }, (index * 200) + 800);
      
      return () => clearTimeout(pulseTimeout);
    }
  }, [cardAnimation, index, prediction.severity, prediction.disease, shouldReduceMotion]);
  
  // Get pulse color for visual debugging
  const getPulseColor = () => {
    if (prediction.severity === 'Severe') return 'rgba(239, 68, 68, 0.1)';
    if (prediction.severity === 'Mild') return 'rgba(34, 197, 94, 0.1)';
    return 'transparent';
  };
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : {
        opacity: 0,
        scale: 0.96,
        y: 8
      }}
      animate={cardAnimation}
      className={`p-4 rounded-lg border-l-4 ${
        prediction.severity === 'Severe' 
          ? 'border-red-500 bg-red-50' 
          : prediction.severity === 'Moderate'
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-green-500 bg-green-50'
      }`}
      style={{
        position: 'relative',
        // Add a subtle background pulse indicator during animation
        backgroundColor: showPulse ? getPulseColor() : undefined
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="text-lg font-semibold text-gray-800">
              {prediction.disease}
            </h4>
            <span className="ml-3 text-lg font-medium text-gray-600">
              {prediction.confidence}
            </span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityTextColor(prediction.severity)}`}>
            {prediction.severity}
            {/* Debug indicator for pulse */}
            {process.env.NODE_ENV === 'development' && showPulse && (
              <span className="ml-2 text-xs opacity-60">
                {prediction.severity === 'Severe' ? '🔴' : prediction.severity === 'Mild' ? '🟢' : ''}
              </span>
            )}
          </span>
        </div>
        <div className="text-2xl">
          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed">
        {prediction.recommendation}
      </p>
    </motion.div>
  );
};

export default DiseasePredictor;