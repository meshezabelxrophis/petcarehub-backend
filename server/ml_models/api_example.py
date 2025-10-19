#!/usr/bin/env python3
"""
Flask API Example for Disease Prediction

Simple web API that accepts symptoms and returns disease predictions
with severity and recommendations.

Usage:
    python3 api_example.py
    
    Then test with:
    curl -X POST http://localhost:5000/predict \
         -H "Content-Type: application/json" \
         -d '{"symptoms": ["fever", "vomiting", "lethargy"]}'

Author: PetCareHub ML Team
Date: October 2025
"""

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False

from predict import predict_diseases
import json

def create_app():
    """Create Flask application"""
    if not FLASK_AVAILABLE:
        print("❌ Flask not available. Install with: pip install flask flask-cors")
        return None
    
    app = Flask(__name__)
    CORS(app)  # Enable CORS for frontend integration
    
    @app.route('/predict', methods=['POST'])
    def predict_endpoint():
        """
        Predict diseases from symptoms
        
        Expected JSON input:
        {
            "symptoms": ["fever", "vomiting", "lethargy"],
            "animal_type": "Dog",  // optional
            "age": 3,              // optional
            "weight": 20.0         // optional
        }
        """
        try:
            data = request.get_json()
            
            if not data or 'symptoms' not in data:
                return jsonify({
                    'error': 'Missing symptoms in request body',
                    'predictions': []
                }), 400
            
            symptoms = data['symptoms']
            if not isinstance(symptoms, list) or not symptoms:
                return jsonify({
                    'error': 'Symptoms must be a non-empty list',
                    'predictions': []
                }), 400
            
            # Extract optional parameters
            kwargs = {}
            if 'animal_type' in data:
                kwargs['animal_type'] = data['animal_type']
            if 'age' in data:
                kwargs['age'] = data['age']
            if 'weight' in data:
                kwargs['weight'] = data['weight']
            if 'gender' in data:
                kwargs['gender'] = data['gender']
            if 'breed' in data:
                kwargs['breed'] = data['breed']
            
            # Make prediction
            result = predict_diseases(symptoms, **kwargs)
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({
                'error': str(e),
                'predictions': []
            }), 500
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'Disease Prediction API',
            'version': '1.0.0'
        })
    
    @app.route('/diseases', methods=['GET'])
    def list_diseases():
        """List all available diseases"""
        try:
            from predict import get_predictor
            predictor = get_predictor()
            diseases = list(predictor.target_encoder.classes_)
            return jsonify({
                'diseases': diseases,
                'count': len(diseases)
            })
        except Exception as e:
            return jsonify({
                'error': str(e),
                'diseases': []
            }), 500
    
    return app

def main():
    """Run the API server"""
    print("🌐 DISEASE PREDICTION API")
    print("=" * 40)
    
    if not FLASK_AVAILABLE:
        print("❌ Flask not installed. To run the API server:")
        print("   pip install flask flask-cors")
        print("   python3 api_example.py")
        print("\n📝 But you can still use the predict.py script directly!")
        return
    
    app = create_app()
    if app is None:
        return
    
    print("🚀 Starting API server...")
    print("📍 Endpoints:")
    print("   POST /predict - Predict diseases from symptoms")
    print("   GET  /health  - Health check")
    print("   GET  /diseases - List all diseases")
    print("\n🔗 Test examples:")
    print('   curl -X POST http://localhost:5000/predict \\')
    print('        -H "Content-Type: application/json" \\')
    print('        -d \'{"symptoms": ["fever", "vomiting"]}\'')
    print("\n📱 The API is CORS-enabled for frontend integration")
    print("🌐 Server starting on http://localhost:5000")
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n👋 API server stopped")

if __name__ == "__main__":
    main()
