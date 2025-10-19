#!/usr/bin/env python3
"""
Disease Prediction Script

This script loads the trained model and severity mapping to predict diseases
from a list of symptoms and return structured JSON results with top 3 predictions.

Usage:
    python3 predict.py
    
    Or import and use programmatically:
    from predict import predict_diseases
    result = predict_diseases(['fever', 'vomiting', 'lethargy'])

Author: PetCareHub ML Team
Date: October 2025
"""

import joblib
import json
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import warnings
warnings.filterwarnings('ignore')

class DiseasePredictor:
    """
    Streamlined disease predictor for symptom-based predictions
    """
    
    def __init__(self, model_path='disease_model.pkl', severity_path='severity_mapping.json'):
        """
        Initialize the predictor
        
        Args:
            model_path (str): Path to trained model
            severity_path (str): Path to severity mapping JSON
        """
        self.model_path = model_path
        self.severity_path = severity_path
        self.model_package = None
        self.severity_data = {}
        
        self.load_model()
        self.load_severity_mapping()
    
    def load_model(self):
        """Load the trained model and preprocessing components"""
        try:
            self.model_package = joblib.load(self.model_path)
            self.model = self.model_package['model']
            self.label_encoders = self.model_package['label_encoders']
            self.target_encoder = self.model_package['target_encoder']
            self.feature_columns = self.model_package['feature_columns']
            # Suppress print statements when called from API
            if not hasattr(self, '_suppress_output'):
                print(f"✅ Model loaded successfully from {self.model_path}")
        except Exception as e:
            if not hasattr(self, '_suppress_output'):
                print(f"❌ Error loading model: {e}")
            raise
    
    def load_severity_mapping(self):
        """Load severity mapping from JSON"""
        try:
            with open(self.severity_path, 'r', encoding='utf-8') as f:
                self.severity_data = json.load(f)
            # Suppress print statements when called from API
            if not hasattr(self, '_suppress_output'):
                print(f"✅ Severity mapping loaded: {len(self.severity_data)} diseases")
        except Exception as e:
            if not hasattr(self, '_suppress_output'):
                print(f"❌ Error loading severity mapping: {e}")
            raise
    
    def preprocess_symptoms(self, symptoms: List[str], animal_type='Dog', age=3, weight=20.0, 
                          gender='Male', breed='Mixed', duration='3 days', heart_rate=120, 
                          temperature=39.0) -> np.ndarray:
        """
        Preprocess symptoms into model input format
        
        Args:
            symptoms (List[str]): List of symptoms
            animal_type (str): Type of animal (default: Dog)
            age (int): Age in years
            weight (float): Weight in kg
            gender (str): Gender
            breed (str): Breed
            duration (str): Duration of symptoms
            heart_rate (int): Heart rate
            temperature (float): Body temperature in Celsius
            
        Returns:
            np.ndarray: Preprocessed feature vector
        """
        # Create base animal data
        animal_data = {
            'Animal_Type': animal_type,
            'Breed': breed,
            'Age': age,
            'Gender': gender,
            'Weight': weight,
            'Duration': duration,
            'Heart_Rate': heart_rate,
            'Body_Temperature_Numeric': temperature
        }
        
        # Process symptoms - map to symptom slots and binary indicators
        symptom_mapping = {
            'fever': 'Fever',
            'lethargy': 'Lethargy', 
            'vomiting': 'Vomiting',
            'diarrhea': 'Diarrhea',
            'coughing': 'Coughing',
            'appetite loss': 'Appetite Loss',
            'nasal discharge': 'Nasal Discharge',
            'eye discharge': 'Eye Discharge',
            'skin lesions': 'Skin Lesions',
            'lameness': 'Lameness',
            'labored breathing': 'Labored Breathing',
            'sneezing': 'Sneezing'
        }
        
        # Normalize symptoms to lowercase for matching
        normalized_symptoms = [s.lower().strip() for s in symptoms]
        
        # Fill symptom slots (1-4)
        mapped_symptoms = []
        for symptom in normalized_symptoms[:4]:  # Take first 4 symptoms
            mapped_symptom = symptom_mapping.get(symptom, symptom.title())
            mapped_symptoms.append(mapped_symptom)
        
        # Pad with 'No' if less than 4 symptoms
        while len(mapped_symptoms) < 4:
            mapped_symptoms.append('No')
        
        # Assign to symptom slots
        animal_data['Symptom_1'] = mapped_symptoms[0]
        animal_data['Symptom_2'] = mapped_symptoms[1] 
        animal_data['Symptom_3'] = mapped_symptoms[2]
        animal_data['Symptom_4'] = mapped_symptoms[3]
        
        # Set binary indicators based on symptoms
        binary_symptoms = {
            'Appetite_Loss': 'appetite loss' in normalized_symptoms or 'lethargy' in normalized_symptoms,
            'Vomiting': 'vomiting' in normalized_symptoms,
            'Diarrhea': 'diarrhea' in normalized_symptoms,
            'Coughing': 'coughing' in normalized_symptoms,
            'Labored_Breathing': 'labored breathing' in normalized_symptoms or 'breathing difficulty' in normalized_symptoms,
            'Lameness': 'lameness' in normalized_symptoms or 'limping' in normalized_symptoms,
            'Skin_Lesions': 'skin lesions' in normalized_symptoms or 'rash' in normalized_symptoms,
            'Nasal_Discharge': 'nasal discharge' in normalized_symptoms or 'runny nose' in normalized_symptoms,
            'Eye_Discharge': 'eye discharge' in normalized_symptoms or 'watery eyes' in normalized_symptoms
        }
        
        for symptom, present in binary_symptoms.items():
            animal_data[symptom] = 'Yes' if present else 'No'
        
        # Convert to DataFrame for processing
        df = pd.DataFrame([animal_data])
        
        # Encode categorical variables using saved encoders
        categorical_cols = ['Animal_Type', 'Breed', 'Gender', 'Symptom_1', 'Symptom_2', 
                           'Symptom_3', 'Symptom_4', 'Duration', 'Appetite_Loss', 'Vomiting',
                           'Diarrhea', 'Coughing', 'Labored_Breathing', 'Lameness', 
                           'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge']
        
        for col in categorical_cols:
            if col in df.columns and col in self.label_encoders:
                le = self.label_encoders[col]
                value = str(df[col].iloc[0])
                try:
                    if value in le.classes_:
                        df[col + '_encoded'] = le.transform([value])
                    else:
                        # Use most common class (usually index 0) for unknown values
                        df[col + '_encoded'] = 0
                except:
                    df[col + '_encoded'] = 0
        
        # Create feature vector matching training format
        feature_vector = []
        for feature in self.feature_columns:
            if feature in df.columns:
                feature_vector.append(df[feature].iloc[0])
            else:
                feature_vector.append(0)  # Default for missing features
        
        return np.array(feature_vector).reshape(1, -1)
    
    def predict_diseases(self, symptoms: List[str], **kwargs) -> Dict[str, Any]:
        """
        Predict diseases from symptoms and return structured JSON
        
        Args:
            symptoms (List[str]): List of symptoms
            **kwargs: Additional animal parameters
            
        Returns:
            Dict: JSON response with top 3 predictions
        """
        try:
            # Preprocess symptoms
            X = self.preprocess_symptoms(symptoms, **kwargs)
            
            # Get predictions and probabilities
            probabilities = self.model.predict_proba(X)[0]
            
            # Get top 3 predictions
            top_indices = np.argsort(probabilities)[-3:][::-1]
            
            predictions = []
            for idx in top_indices:
                disease = self.target_encoder.classes_[idx]
                confidence = probabilities[idx]
                
                # Get severity info
                severity_info = self.severity_data.get(disease, {})
                severity = severity_info.get('severity', 'Unknown')
                recommendation = severity_info.get('recommendation', 
                    'Consult with a veterinarian for proper diagnosis and treatment.')
                
                predictions.append({
                    'disease': disease,
                    'confidence': f"{confidence*100:.0f}%",
                    'severity': severity,
                    'recommendation': recommendation
                })
            
            return {
                'predictions': predictions
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'predictions': []
            }

# Global predictor instance
_predictor = None

def get_predictor():
    """Get or create predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = DiseasePredictor()
    return _predictor

def predict_diseases(symptoms: List[str], **kwargs) -> Dict[str, Any]:
    """
    Convenience function for disease prediction
    
    Args:
        symptoms (List[str]): List of symptoms
        **kwargs: Additional parameters (animal_type, age, weight, etc.)
        
    Returns:
        Dict: JSON response with predictions
    """
    predictor = get_predictor()
    return predictor.predict_diseases(symptoms, **kwargs)

def main():
    """
    Interactive demonstration of the prediction script
    """
    print("🏥 DISEASE PREDICTION FROM SYMPTOMS")
    print("=" * 50)
    
    # Initialize predictor
    predictor = DiseasePredictor()
    
    # Example test cases
    test_cases = [
        {
            'name': 'Severe Case - Parvovirus Symptoms',
            'symptoms': ['fever', 'vomiting', 'diarrhea', 'lethargy'],
            'animal_type': 'Dog',
            'age': 1,
            'weight': 15.0
        },
        {
            'name': 'Mild Case - Upper Respiratory',
            'symptoms': ['coughing', 'nasal discharge', 'sneezing'],
            'animal_type': 'Cat',
            'age': 3,
            'weight': 4.5
        },
        {
            'name': 'Moderate Case - Respiratory Issues',
            'symptoms': ['coughing', 'fever', 'labored breathing'],
            'animal_type': 'Horse',
            'age': 8,
            'weight': 500.0
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 TEST CASE {i}: {test_case['name']}")
        print(f"Symptoms: {', '.join(test_case['symptoms'])}")
        print(f"Animal: {test_case['animal_type']}")
        print("-" * 40)
        
        # Make prediction
        result = predictor.predict_diseases(
            symptoms=test_case['symptoms'],
            animal_type=test_case['animal_type'],
            age=test_case['age'],
            weight=test_case['weight']
        )
        
        # Display JSON result
        print("📋 PREDICTION RESULT:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if i < len(test_cases):
            print("\n" + "="*50)
    
    print(f"\n✅ Disease prediction demonstration completed!")
    
    # Interactive mode
    print(f"\n🎯 INTERACTIVE MODE")
    print("Enter symptoms separated by commas (or 'quit' to exit):")
    
    while True:
        try:
            user_input = input("\nSymptoms: ").strip()
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            if not user_input:
                continue
            
            symptoms = [s.strip() for s in user_input.split(',')]
            result = predictor.predict_diseases(symptoms)
            
            print("\n📋 PREDICTION:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n👋 Goodbye!")

if __name__ == "__main__":
    main()
