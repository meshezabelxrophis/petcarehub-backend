#!/usr/bin/env python3
"""
Usage Examples for Disease Prediction System

This file demonstrates various ways to use the disease prediction system,
from simple command-line usage to API integration.

Author: PetCareHub ML Team
Date: October 2025
"""

import json
from predict import predict_diseases

def example_1_basic_usage():
    """Example 1: Basic symptom prediction"""
    print("🔬 EXAMPLE 1: Basic Symptom Prediction")
    print("-" * 40)
    
    # Simple symptom list
    symptoms = ['fever', 'vomiting', 'lethargy']
    result = predict_diseases(symptoms)
    
    print(f"Input: {symptoms}")
    print("Output:")
    print(json.dumps(result, indent=2))
    return result

def example_2_with_animal_info():
    """Example 2: Prediction with animal information"""
    print("\n🐕 EXAMPLE 2: Prediction with Animal Info")
    print("-" * 40)
    
    # Symptoms with animal details
    symptoms = ['coughing', 'nasal discharge', 'eye discharge']
    result = predict_diseases(
        symptoms=symptoms,
        animal_type='Cat',
        age=2,
        weight=4.5,
        breed='Persian'
    )
    
    print(f"Input: {symptoms} (Cat, 2 years, 4.5kg)")
    print("Output:")
    print(json.dumps(result, indent=2))
    return result

def example_3_emergency_case():
    """Example 3: Emergency case detection"""
    print("\n🚨 EXAMPLE 3: Emergency Case Detection")
    print("-" * 40)
    
    # Severe symptoms
    symptoms = ['fever', 'vomiting', 'diarrhea', 'lethargy', 'appetite loss']
    result = predict_diseases(
        symptoms=symptoms,
        animal_type='Dog',
        age=1,  # Puppy - higher risk
        weight=10.0
    )
    
    print(f"Input: {symptoms} (Puppy, 1 year)")
    print("Output:")
    print(json.dumps(result, indent=2))
    
    # Check for emergency conditions
    predictions = result.get('predictions', [])
    if predictions:
        top_prediction = predictions[0]
        if top_prediction.get('severity') == 'Severe':
            print("\n🚨 EMERGENCY ALERT: Severe condition detected!")
            print(f"   Recommendation: {top_prediction.get('recommendation')}")
    
    return result

def example_4_batch_processing():
    """Example 4: Batch processing multiple cases"""
    print("\n📊 EXAMPLE 4: Batch Processing")
    print("-" * 40)
    
    cases = [
        {
            'id': 'case_001',
            'symptoms': ['coughing', 'sneezing'],
            'animal_type': 'Cat',
            'age': 3
        },
        {
            'id': 'case_002', 
            'symptoms': ['lameness', 'fever'],
            'animal_type': 'Dog',
            'age': 5
        },
        {
            'id': 'case_003',
            'symptoms': ['labored breathing', 'nasal discharge'],
            'animal_type': 'Horse',
            'age': 8
        }
    ]
    
    results = []
    for case in cases:
        case_id = case.pop('id')
        result = predict_diseases(**case)
        result['case_id'] = case_id
        results.append(result)
    
    print("Batch Results:")
    for result in results:
        case_id = result['case_id']
        top_disease = result['predictions'][0]['disease'] if result['predictions'] else 'Unknown'
        severity = result['predictions'][0]['severity'] if result['predictions'] else 'Unknown'
        print(f"  {case_id}: {top_disease} ({severity})")
    
    return results

def example_5_api_integration():
    """Example 5: API integration format"""
    print("\n🌐 EXAMPLE 5: API Integration Format")
    print("-" * 40)
    
    # Simulate API request payload
    api_request = {
        "symptoms": ["fever", "coughing", "appetite loss"],
        "animal_type": "Dog",
        "age": 4,
        "weight": 25.0,
        "breed": "Golden Retriever"
    }
    
    print("API Request:")
    print(json.dumps(api_request, indent=2))
    
    # Process request
    symptoms = api_request.pop('symptoms')
    result = predict_diseases(symptoms, **api_request)
    
    print("\nAPI Response:")
    print(json.dumps(result, indent=2))
    
    return result

def example_6_severity_filtering():
    """Example 6: Filter by severity level"""
    print("\n🏥 EXAMPLE 6: Severity-Based Filtering")
    print("-" * 40)
    
    test_cases = [
        ['fever', 'vomiting', 'diarrhea'],  # Likely severe
        ['sneezing', 'nasal discharge'],    # Likely mild
        ['coughing', 'fever']               # Likely moderate
    ]
    
    severity_counts = {'Severe': 0, 'Moderate': 0, 'Mild': 0}
    
    for i, symptoms in enumerate(test_cases, 1):
        result = predict_diseases(symptoms)
        if result['predictions']:
            severity = result['predictions'][0]['severity']
            severity_counts[severity] += 1
            
            print(f"Case {i}: {symptoms}")
            print(f"  → {result['predictions'][0]['disease']} ({severity})")
    
    print(f"\nSeverity Distribution:")
    for severity, count in severity_counts.items():
        print(f"  {severity}: {count} cases")
    
    return severity_counts

def main():
    """Run all examples"""
    print("🎯 DISEASE PREDICTION SYSTEM - USAGE EXAMPLES")
    print("=" * 60)
    
    try:
        # Run all examples
        example_1_basic_usage()
        example_2_with_animal_info()
        example_3_emergency_case()
        example_4_batch_processing()
        example_5_api_integration()
        example_6_severity_filtering()
        
        print(f"\n✅ All examples completed successfully!")
        
        print(f"\n📚 INTEGRATION GUIDE:")
        print("1. Import: from predict import predict_diseases")
        print("2. Call: result = predict_diseases(['fever', 'vomiting'])")
        print("3. Use: result['predictions'][0]['disease']")
        
        print(f"\n🔗 API Usage:")
        print("1. Run: python3 api_example.py")
        print("2. POST to: http://localhost:5000/predict")
        print("3. Send: {\"symptoms\": [\"fever\", \"vomiting\"]}")
        
    except Exception as e:
        print(f"❌ Error in examples: {e}")

if __name__ == "__main__":
    main()
