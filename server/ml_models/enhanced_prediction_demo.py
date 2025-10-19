#!/usr/bin/env python3
"""
Enhanced Disease Prediction Demo with Severity Mapping

This script demonstrates the complete disease prediction system including
severity levels, urgency assessments, and actionable recommendations.

Author: PetCareHub ML Team
Date: October 2025
"""

from severity_utils import EnhancedDiseasePredictor
import json
from datetime import datetime

def format_prediction_result(result, animal_info):
    """
    Format prediction result for display
    
    Args:
        result (dict): Prediction result
        animal_info (dict): Animal information
    """
    print(f"\n{'='*60}")
    print(f"🐾 DISEASE PREDICTION REPORT")
    print(f"{'='*60}")
    
    # Animal info
    print(f"📋 Animal Information:")
    print(f"   Type: {animal_info.get('Animal_Type', 'Unknown')}")
    print(f"   Breed: {animal_info.get('Breed', 'Unknown')}")
    print(f"   Age: {animal_info.get('Age', 'Unknown')} years")
    print(f"   Weight: {animal_info.get('Weight', 'Unknown')} kg")
    
    # Primary symptoms
    symptoms = [animal_info.get(f'Symptom_{i}', '') for i in range(1, 5) if animal_info.get(f'Symptom_{i}')]
    if symptoms:
        print(f"   Primary Symptoms: {', '.join(symptoms)}")
    
    if result.get('error'):
        print(f"\n❌ Prediction Error: {result['error']}")
        return
    
    # Main prediction
    print(f"\n🎯 PRIMARY PREDICTION:")
    print(f"   Disease: {result['predicted_disease']}")
    print(f"   Confidence: {result['confidence']}")
    
    # Severity information
    severity = result.get('severity', {})
    severity_level = severity.get('level', 'Unknown')
    urgency = severity.get('urgency', 'Unknown')
    
    # Color-code severity
    severity_emoji = {
        'Mild': '🟢',
        'Moderate': '🟡', 
        'Severe': '🔴'
    }.get(severity_level, '⚪')
    
    urgency_emoji = {
        'Low': '🟢',
        'Medium': '🟡',
        'High': '🟠',
        'Emergency': '🚨'
    }.get(urgency, '⚪')
    
    print(f"\n🏥 SEVERITY ASSESSMENT:")
    print(f"   Severity Level: {severity_emoji} {severity_level}")
    print(f"   Urgency: {urgency_emoji} {urgency}")
    print(f"   Description: {severity.get('description', 'No description available')}")
    
    print(f"\n💡 RECOMMENDATION:")
    recommendation = severity.get('recommendation', 'Consult with a veterinarian.')
    print(f"   {recommendation}")
    
    # Alternative predictions
    print(f"\n📊 ALTERNATIVE POSSIBILITIES:")
    for i, pred in enumerate(result.get('top_predictions', [])[:3], 1):
        severity_symbol = {
            'Mild': '🟢',
            'Moderate': '🟡', 
            'Severe': '🔴'
        }.get(pred.get('severity_level', 'Unknown'), '⚪')
        
        print(f"   {i}. {pred['disease']} ({pred['confidence']}) {severity_symbol}")
    
    print(f"\n📅 Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

def main():
    """
    Enhanced disease prediction demonstration
    """
    print("🏥 ENHANCED DISEASE PREDICTION WITH SEVERITY MAPPING")
    print("=" * 70)
    
    try:
        # Initialize enhanced predictor
        print("🔄 Initializing enhanced disease predictor...")
        predictor = EnhancedDiseasePredictor()
        print("✅ Enhanced predictor ready!")
        
        # Test cases with different severity levels
        test_cases = [
            {
                'name': 'Emergency Case - Suspected Parvovirus',
                'data': {
                    'Animal_Type': 'Dog',
                    'Breed': 'Golden Retriever',
                    'Age': 1,
                    'Gender': 'Male',
                    'Weight': 15.0,
                    'Symptom_1': 'Vomiting',
                    'Symptom_2': 'Diarrhea',
                    'Symptom_3': 'Lethargy',
                    'Symptom_4': 'Appetite Loss',
                    'Duration': '2 days',
                    'Appetite_Loss': 'Yes',
                    'Vomiting': 'Yes',
                    'Diarrhea': 'Yes',
                    'Coughing': 'No',
                    'Labored_Breathing': 'No',
                    'Lameness': 'No',
                    'Skin_Lesions': 'No',
                    'Nasal_Discharge': 'No',
                    'Eye_Discharge': 'No',
                    'Body_Temperature': '40.2°C',
                    'Heart_Rate': 140
                }
            },
            {
                'name': 'Mild Case - Upper Respiratory Infection',
                'data': {
                    'Animal_Type': 'Cat',
                    'Breed': 'Persian',
                    'Age': 3,
                    'Gender': 'Female',
                    'Weight': 4.2,
                    'Symptom_1': 'Sneezing',
                    'Symptom_2': 'Nasal Discharge',
                    'Symptom_3': 'Eye Discharge',
                    'Symptom_4': 'No',
                    'Duration': '3 days',
                    'Appetite_Loss': 'No',
                    'Vomiting': 'No',
                    'Diarrhea': 'No',
                    'Coughing': 'Yes',
                    'Labored_Breathing': 'No',
                    'Lameness': 'No',
                    'Skin_Lesions': 'No',
                    'Nasal_Discharge': 'Yes',
                    'Eye_Discharge': 'Yes',
                    'Body_Temperature': '38.8°C',
                    'Heart_Rate': 160
                }
            },
            {
                'name': 'Moderate Case - Respiratory Issues',
                'data': {
                    'Animal_Type': 'Horse',
                    'Breed': 'Thoroughbred',
                    'Age': 8,
                    'Gender': 'Male',
                    'Weight': 500.0,
                    'Symptom_1': 'Coughing',
                    'Symptom_2': 'Nasal Discharge',
                    'Symptom_3': 'Fever',
                    'Symptom_4': 'Lethargy',
                    'Duration': '1 week',
                    'Appetite_Loss': 'Yes',
                    'Vomiting': 'No',
                    'Diarrhea': 'No',
                    'Coughing': 'Yes',
                    'Labored_Breathing': 'Yes',
                    'Lameness': 'No',
                    'Skin_Lesions': 'No',
                    'Nasal_Discharge': 'Yes',
                    'Eye_Discharge': 'No',
                    'Body_Temperature': '39.8°C',
                    'Heart_Rate': 85
                }
            }
        ]
        
        # Process each test case
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🔍 TEST CASE {i}: {test_case['name']}")
            print("-" * 50)
            
            # Make enhanced prediction
            result = predictor.predict_with_severity(test_case['data'])
            
            # Format and display result
            format_prediction_result(result, test_case['data'])
            
            # Add spacing between cases
            if i < len(test_cases):
                print("\n" + "="*70)
        
        print(f"\n✅ Enhanced prediction demonstration completed!")
        print(f"🔬 The system successfully integrates ML predictions with clinical severity assessments")
        
    except Exception as e:
        print(f"❌ Error during demonstration: {e}")
        raise

if __name__ == "__main__":
    main()
