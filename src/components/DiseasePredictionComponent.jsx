import React, { useState } from 'react';
import axios from 'axios';

const DiseasePredictionComponent = () => {
  const [symptoms, setSymptoms] = useState('');
  const [animalType, setAnimalType] = useState('Dog');
  const [age, setAge] = useState(3);
  const [weight, setWeight] = useState(20);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      setError('Please enter symptoms');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const symptomsList = symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await axios.post('/api/predict-disease', {
        symptoms: symptomsList,
        animal_type: animalType,
        age: parseInt(age),
        weight: parseFloat(weight),
        user_id: 1 // For testing - in real app, get from auth context
      });

      setPredictions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Severe': return 'text-red-600 bg-red-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Mild': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityEmoji = (severity) => {
    switch (severity) {
      case 'Severe': return '🔴';
      case 'Moderate': return '🟡';
      case 'Mild': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🏥 Disease Prediction System
      </h2>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms (comma-separated)
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., fever, vomiting, lethargy"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div>
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

          <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        disabled={loading || !symptoms.trim()}
        className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
          loading || !symptoms.trim()
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

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
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

      {/* Results Display */}
      {predictions && predictions.predictions && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 Prediction Results
          </h3>

          <div className="space-y-4">
            {predictions.predictions.map((prediction, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  prediction.severity === 'Severe' 
                    ? 'border-red-500 bg-red-50' 
                    : prediction.severity === 'Moderate'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">
                        {getSeverityEmoji(prediction.severity)}
                      </span>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {prediction.disease}
                      </h4>
                      <span className="ml-2 text-sm text-gray-600">
                        ({prediction.confidence})
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(prediction.severity)}`}>
                        {prediction.severity}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {prediction.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {predictions.saved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">💾</span>
                <span className="text-sm text-green-700">
                  Prediction saved to your history
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 How to Use
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter symptoms separated by commas (e.g., "fever, vomiting, lethargy")</li>
          <li>• Select the correct animal type for better accuracy</li>
          <li>• Provide age and weight if known</li>
          <li>• Review the top 3 predictions with severity levels</li>
          <li>• Always consult a veterinarian for proper diagnosis</li>
        </ul>
      </div>
    </div>
  );
};

export default DiseasePredictionComponent;
