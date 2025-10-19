import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [showMap, setShowMap] = useState(false);
  const [nearbyClinics, setNearbyClinics] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [healthScore, setHealthScore] = useState(null);

  // Comprehensive symptom list from the dataset
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

  // Get current user (you may need to adjust this based on your auth system)
  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 1; // Fallback to user ID 1 for testing
  };

  // Load prediction history on component mount
  useEffect(() => {
    loadPredictionHistory();
    getUserLocation();
  }, []);

  const loadPredictionHistory = async () => {
    try {
      const userId = getCurrentUser();
      const response = await axios.get(`/api/disease-predictions/${userId}`);
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
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Islamabad coordinates
          setUserLocation({
            lat: 33.6844,
            lng: 73.0479
          });
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
    
    // Calculate health score (0-100, where 100 is healthiest)
    let severityMultiplier = 1;
    if (severity === 'Severe') severityMultiplier = 3;
    else if (severity === 'Moderate') severityMultiplier = 2;
    else if (severity === 'Mild') severityMultiplier = 1;
    
    // Higher confidence in severe conditions = lower health score
    const riskScore = confidence * severityMultiplier;
    const healthScore = Math.max(0, Math.min(100, 100 - riskScore));
    
    return Math.round(healthScore);
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

    try {
      const userId = getCurrentUser();
      const response = await axios.post('/api/predict-disease', {
        symptoms: selectedSymptoms.map(s => s.toLowerCase()),
        animal_type: animalType,
        age: parseInt(age),
        weight: parseFloat(weight),
        breed: breed,
        user_id: userId
      });

      setPredictions(response.data.predictions);
      const score = calculateHealthScore(response.data.predictions);
      setHealthScore(score);
      
      // Reload prediction history
      loadPredictionHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyClinics = async () => {
    if (!userLocation) return;
    
    try {
      const response = await axios.get('/api/providers', {
        params: {
          lat: userLocation.lat,
          lon: userLocation.lng,
          radius: 10
        }
      });
      setNearbyClinics(response.data);
      setShowMap(true);
    } catch (error) {
      console.error('Error loading nearby clinics:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Severe': return 'bg-red-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Mild': return 'bg-green-500';
      default: return 'bg-gray-500';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏥 Disease Predictor
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered pet health assessment with severity analysis and recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Golden Retriever, Persian, etc."
                />
              </div>

              {/* Symptoms Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleSymptomAdd(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                </div>

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
                className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                  loading || selectedSymptoms.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  '🔬 Predict Disease'
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">❌</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Prediction Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Health Score */}
            {healthScore !== null && (
              <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
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

            {/* Prediction Results */}
            {predictions && predictions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🎯 Top 3 Predictions
                </h3>
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                        prediction.severity === 'Severe' 
                          ? 'border-red-500' 
                          : prediction.severity === 'Moderate'
                          ? 'border-yellow-500'
                          : 'border-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-xl font-semibold text-gray-800">
                              {prediction.disease}
                            </h4>
                            <span className="ml-3 text-lg font-medium text-gray-600">
                              {prediction.confidence}
                            </span>
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityTextColor(prediction.severity)}`}>
                            {prediction.severity}
                          </span>
                        </div>
                        <div className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {prediction.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Visualization */}
            {predictions && predictions.length > 0 && (
              <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
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

            {/* Find Nearby Clinics */}
            <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📍 Find Nearby Clinics
              </h3>
              <button
                onClick={loadNearbyClinics}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                🗺️ Show Nearby Clinics
              </button>
              
              {showMap && nearbyClinics.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Nearby Clinics Found: {nearbyClinics.length}
                  </h4>
                  <div className="space-y-2">
                    {nearbyClinics.slice(0, 5).map(clinic => (
                      <div key={clinic.id} className="text-sm text-blue-700 p-2 bg-white rounded">
                        <div className="font-medium">📍 {clinic.name}</div>
                        <div>{clinic.address}</div>
                        {clinic.phone && <div>📞 {clinic.phone}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prediction History */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
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
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Medical Disclaimer
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                This AI-powered disease predictor is for educational purposes only and should not replace professional veterinary advice. 
                Always consult with a qualified veterinarian for accurate diagnosis and treatment of your pet's health concerns.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseasePredictor;
