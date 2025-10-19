#!/usr/bin/env python3
"""
Animal Disease Prediction - Model Inference Script

This script demonstrates how to load and use the trained disease prediction model
for making predictions on new animal data.

Usage:
    python3 predict_disease.py

Author: PetCareHub ML Team
Date: October 2025
"""

import joblib
import pandas as pd
import numpy as np
from datetime import datetime

class DiseasePredictor:
    """
    Disease prediction inference class
    """
    
    def __init__(self, model_path='disease_model.pkl'):
        """
        Initialize predictor by loading trained model
        
        Args:
            model_path (str): Path to the saved model file
        """
        self.model_path = model_path
        self.model_package = None
        self.load_model()
    
    def load_model(self):
        """
        Load the trained model and preprocessing components
        """
        try:
            print(f"🔄 Loading model from: {self.model_path}")
            self.model_package = joblib.load(self.model_path)
            
            # Extract components
            self.model = self.model_package['model']
            self.label_encoders = self.model_package['label_encoders']
            self.target_encoder = self.model_package['target_encoder']
            self.feature_columns = self.model_package['feature_columns']
            self.classes = self.model_package['classes']
            
            print(f"✅ Model loaded successfully!")
            print(f"📊 Model Info:")
            print(f"  - Type: {self.model_package['model_type']}")
            print(f"  - Features: {len(self.feature_columns)}")
            print(f"  - Classes: {len(self.classes)}")
            print(f"  - Training Date: {self.model_package['training_date']}")
            
        except FileNotFoundError:
            print(f"❌ Error: Model file '{self.model_path}' not found!")
            print("Please run train_model.py first to create the model.")
            raise
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise
    
    def preprocess_input(self, animal_data):
        """
        Preprocess input data to match training format
        
        Args:
            animal_data (dict): Dictionary containing animal features
            
        Returns:
            np.array: Preprocessed feature vector
        """
        # Create DataFrame from input
        df = pd.DataFrame([animal_data])
        
        # Process temperature if present
        if 'Body_Temperature' in df.columns:
            df['Body_Temperature_Numeric'] = df['Body_Temperature'].str.extract(r'(\d+\.?\d*)').astype(float)
            df.drop('Body_Temperature', axis=1, inplace=True)
        
        # Encode categorical variables
        categorical_cols = ['Animal_Type', 'Breed', 'Gender', 'Symptom_1', 'Symptom_2', 
                           'Symptom_3', 'Symptom_4', 'Duration', 'Appetite_Loss', 'Vomiting',
                           'Diarrhea', 'Coughing', 'Labored_Breathing', 'Lameness', 
                           'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge']
        
        for col in categorical_cols:
            if col in df.columns and col in self.label_encoders:
                try:
                    # Handle unknown categories
                    le = self.label_encoders[col]
                    value = str(df[col].iloc[0])
                    if value in le.classes_:
                        df[col + '_encoded'] = le.transform([value])
                    else:
                        # Use most common class for unknown values
                        df[col + '_encoded'] = 0
                        print(f"⚠️  Unknown value '{value}' for {col}, using default encoding")
                except Exception as e:
                    print(f"⚠️  Error encoding {col}: {e}")
                    df[col + '_encoded'] = 0
        
        # Select only the features used during training
        feature_vector = []
        for feature in self.feature_columns:
            if feature in df.columns:
                feature_vector.append(df[feature].iloc[0])
            else:
                feature_vector.append(0)  # Default value for missing features
                print(f"⚠️  Missing feature {feature}, using default value 0")
        
        return np.array(feature_vector).reshape(1, -1)
    
    def predict(self, animal_data, return_probabilities=False):
        """
        Predict disease for given animal data
        
        Args:
            animal_data (dict): Dictionary containing animal features
            return_probabilities (bool): Whether to return prediction probabilities
            
        Returns:
            dict: Prediction results
        """
        try:
            # Preprocess input
            X = self.preprocess_input(animal_data)
            
            # Make prediction
            prediction = self.model.predict(X)[0]
            predicted_disease = self.target_encoder.classes_[prediction]
            
            # Get prediction probabilities
            probabilities = self.model.predict_proba(X)[0]
            confidence = np.max(probabilities)
            
            # Get top 3 predictions
            top_indices = np.argsort(probabilities)[-3:][::-1]
            top_predictions = []
            for idx in top_indices:
                disease = self.target_encoder.classes_[idx]
                prob = probabilities[idx]
                top_predictions.append({
                    'disease': disease,
                    'probability': prob,
                    'confidence': f"{prob*100:.1f}%"
                })
            
            result = {
                'predicted_disease': predicted_disease,
                'confidence': f"{confidence*100:.1f}%",
                'top_predictions': top_predictions,
                'timestamp': datetime.now().isoformat()
            }
            
            if return_probabilities:
                result['all_probabilities'] = {
                    self.target_encoder.classes_[i]: prob 
                    for i, prob in enumerate(probabilities)
                }
            
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'predicted_disease': None,
                'confidence': '0%',
                'timestamp': datetime.now().isoformat()
            }
    
    def get_model_info(self):
        """
        Get information about the loaded model
        
        Returns:
            dict: Model information
        """
        return {
            'model_type': self.model_package['model_type'],
            'training_date': self.model_package['training_date'],
            'features': len(self.feature_columns),
            'classes': len(self.classes),
            'available_diseases': self.classes
        }

def main():
    """
    Demonstration of disease prediction
    """
    print("🐾 ANIMAL DISEASE PREDICTION - INFERENCE DEMO")
    print("=" * 60)
    
    # Initialize predictor
    predictor = DiseasePredictor()
    
    # Example animal data for prediction
    sample_animals = [
        {
            'Animal_Type': 'Dog',
            'Breed': 'Labrador',
            'Age': 4,
            'Gender': 'Male',
            'Weight': 25.0,
            'Symptom_1': 'Fever',
            'Symptom_2': 'Lethargy',
            'Symptom_3': 'Appetite Loss',
            'Symptom_4': 'Vomiting',
            'Duration': '3 days',
            'Appetite_Loss': 'Yes',
            'Vomiting': 'Yes',
            'Diarrhea': 'No',
            'Coughing': 'No',
            'Labored_Breathing': 'No',
            'Lameness': 'No',
            'Skin_Lesions': 'No',
            'Nasal_Discharge': 'No',
            'Eye_Discharge': 'No',
            'Body_Temperature': '39.5°C',
            'Heart_Rate': 120
        },
        {
            'Animal_Type': 'Cat',
            'Breed': 'Siamese',
            'Age': 2,
            'Gender': 'Female',
            'Weight': 4.5,
            'Symptom_1': 'Coughing',
            'Symptom_2': 'Sneezing',
            'Symptom_3': 'Eye Discharge',
            'Symptom_4': 'Nasal Discharge',
            'Duration': '1 week',
            'Appetite_Loss': 'No',
            'Vomiting': 'No',
            'Diarrhea': 'No',
            'Coughing': 'Yes',
            'Labored_Breathing': 'No',
            'Lameness': 'No',
            'Skin_Lesions': 'No',
            'Nasal_Discharge': 'Yes',
            'Eye_Discharge': 'Yes',
            'Body_Temperature': '38.9°C',
            'Heart_Rate': 150
        }
    ]
    
    # Make predictions
    for i, animal in enumerate(sample_animals, 1):
        print(f"\n🔍 PREDICTION {i}")
        print("-" * 30)
        print(f"Animal: {animal['Animal_Type']} ({animal['Breed']})")
        print(f"Symptoms: {animal['Symptom_1']}, {animal['Symptom_2']}, {animal['Symptom_3']}")
        
        result = predictor.predict(animal)
        
        if result.get('error'):
            print(f"❌ Prediction failed: {result['error']}")
        else:
            print(f"🎯 Predicted Disease: {result['predicted_disease']}")
            print(f"📊 Confidence: {result['confidence']}")
            print(f"📋 Top 3 Predictions:")
            for j, pred in enumerate(result['top_predictions'], 1):
                print(f"   {j}. {pred['disease']} ({pred['confidence']})")
    
    print(f"\n✅ Prediction demo completed!")
    print(f"📄 Model Info: {predictor.get_model_info()['features']} features, {predictor.get_model_info()['classes']} classes")

if __name__ == "__main__":
    main()
