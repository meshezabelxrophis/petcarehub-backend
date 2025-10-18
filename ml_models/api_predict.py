#!/usr/bin/env python3
"""
API-only Disease Prediction Script

Clean version for API calls that only outputs JSON without any print statements.
"""

import sys
import json
import warnings
warnings.filterwarnings('ignore')

# Suppress all output except final JSON
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Import and suppress output
import joblib
import pandas as pd
import numpy as np

class APIPredictor:
    def __init__(self):
        self.model_package = joblib.load('disease_model.pkl')
        self.model = self.model_package['model']
        self.label_encoders = self.model_package['label_encoders']
        self.target_encoder = self.model_package['target_encoder']
        self.feature_columns = self.model_package['feature_columns']
        
        with open('severity_mapping.json', 'r') as f:
            self.severity_data = json.load(f)
    
    def preprocess_symptoms(self, symptoms, animal_type='Dog', age=3, weight=20.0, 
                          gender='Male', breed='Mixed', duration='3 days', heart_rate=120, 
                          temperature=39.0):
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
        
        # Process symptoms
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
        
        normalized_symptoms = [s.lower().strip() for s in symptoms]
        
        # Fill symptom slots
        mapped_symptoms = []
        for symptom in normalized_symptoms[:4]:
            mapped_symptom = symptom_mapping.get(symptom, symptom.title())
            mapped_symptoms.append(mapped_symptom)
        
        while len(mapped_symptoms) < 4:
            mapped_symptoms.append('No')
        
        animal_data['Symptom_1'] = mapped_symptoms[0]
        animal_data['Symptom_2'] = mapped_symptoms[1] 
        animal_data['Symptom_3'] = mapped_symptoms[2]
        animal_data['Symptom_4'] = mapped_symptoms[3]
        
        # Set binary indicators
        binary_symptoms = {
            'Appetite_Loss': 'appetite loss' in normalized_symptoms or 'lethargy' in normalized_symptoms,
            'Vomiting': 'vomiting' in normalized_symptoms,
            'Diarrhea': 'diarrhea' in normalized_symptoms,
            'Coughing': 'coughing' in normalized_symptoms,
            'Labored_Breathing': 'labored breathing' in normalized_symptoms,
            'Lameness': 'lameness' in normalized_symptoms,
            'Skin_Lesions': 'skin lesions' in normalized_symptoms,
            'Nasal_Discharge': 'nasal discharge' in normalized_symptoms,
            'Eye_Discharge': 'eye discharge' in normalized_symptoms
        }
        
        for symptom, present in binary_symptoms.items():
            animal_data[symptom] = 'Yes' if present else 'No'
        
        # Convert to DataFrame
        df = pd.DataFrame([animal_data])
        
        # Encode categorical variables
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
                        df[col + '_encoded'] = 0
                except:
                    df[col + '_encoded'] = 0
        
        # Create feature vector
        feature_vector = []
        for feature in self.feature_columns:
            if feature in df.columns:
                feature_vector.append(df[feature].iloc[0])
            else:
                feature_vector.append(0)
        
        return np.array(feature_vector).reshape(1, -1)
    
    def predict(self, symptoms, **kwargs):
        try:
            X = self.preprocess_symptoms(symptoms, **kwargs)
            probabilities = self.model.predict_proba(X)[0]
            top_indices = np.argsort(probabilities)[-3:][::-1]
            
            predictions = []
            for idx in top_indices:
                disease = self.target_encoder.classes_[idx]
                confidence = probabilities[idx]
                
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
            
            return {'predictions': predictions}
            
        except Exception as e:
            return {'error': str(e), 'predictions': []}

if __name__ == "__main__":
    try:
        # Read input from stdin or command line
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            input_data = json.loads(sys.stdin.read())
        
        predictor = APIPredictor()
        result = predictor.predict(
            symptoms=input_data['symptoms'],
            animal_type=input_data.get('animal_type', 'Dog'),
            age=input_data.get('age', 3),
            weight=input_data.get('weight', 20.0),
            gender=input_data.get('gender', 'Male'),
            breed=input_data.get('breed', 'Mixed')
        )
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e), 'predictions': []}))
