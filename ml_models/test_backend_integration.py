#!/usr/bin/env python3
"""
Test script for Node.js backend integration

This script tests the disease prediction API endpoint to ensure 
the Node.js backend correctly integrates with the Python ML system.

Usage:
    python3 test_backend_integration.py

Author: PetCareHub ML Team
Date: October 2025
"""

import requests
import json
import time
from datetime import datetime

# API base URL
BASE_URL = 'http://localhost:5001'
API_ENDPOINT = f'{BASE_URL}/api/predict-disease'

def test_disease_prediction_api():
    """Test the disease prediction API endpoint"""
    print("🧪 TESTING NODE.JS BACKEND INTEGRATION")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            'name': 'Basic Symptom Prediction',
            'payload': {
                'symptoms': ['fever', 'vomiting', 'lethargy'],
                'user_id': 1
            }
        },
        {
            'name': 'Detailed Animal Information',
            'payload': {
                'symptoms': ['coughing', 'nasal discharge'],
                'animal_type': 'Cat',
                'age': 3,
                'weight': 4.5,
                'breed': 'Persian',
                'user_id': 2
            }
        },
        {
            'name': 'Emergency Case',
            'payload': {
                'symptoms': ['fever', 'vomiting', 'diarrhea', 'appetite loss'],
                'animal_type': 'Dog',
                'age': 1,
                'weight': 15.0,
                'user_id': 1
            }
        },
        {
            'name': 'Respiratory Symptoms',
            'payload': {
                'symptoms': ['coughing', 'labored breathing', 'fever'],
                'animal_type': 'Horse',
                'age': 8,
                'weight': 500.0,
                'user_id': 3
            }
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 TEST {i}: {test_case['name']}")
        print("-" * 30)
        
        try:
            # Make API request
            print(f"📤 Request: {test_case['payload']['symptoms']}")
            
            response = requests.post(
                API_ENDPOINT,
                json=test_case['payload'],
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Display results
                print("✅ SUCCESS!")
                print(f"📋 Predictions:")
                
                if 'predictions' in result and result['predictions']:
                    for j, pred in enumerate(result['predictions'][:3], 1):
                        disease = pred.get('disease', 'Unknown')
                        confidence = pred.get('confidence', '0%')
                        severity = pred.get('severity', 'Unknown')
                        
                        severity_emoji = {
                            'Severe': '🔴',
                            'Moderate': '🟡',
                            'Mild': '🟢'
                        }.get(severity, '⚪')
                        
                        print(f"   {j}. {disease} ({confidence}) {severity_emoji}")
                    
                    # Check if saved to database
                    if result.get('saved'):
                        print("💾 Saved to database: ✅")
                    else:
                        print("💾 Saved to database: ❌")
                    
                    results.append({
                        'test': test_case['name'],
                        'status': 'success',
                        'top_disease': result['predictions'][0]['disease'],
                        'severity': result['predictions'][0]['severity']
                    })
                else:
                    print("⚠️  No predictions returned")
                    results.append({
                        'test': test_case['name'],
                        'status': 'no_predictions'
                    })
            
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                print(f"❌ FAILED: {error_data}")
                results.append({
                    'test': test_case['name'],
                    'status': 'failed',
                    'error': str(error_data)
                })
        
        except requests.exceptions.ConnectionError:
            print("❌ FAILED: Cannot connect to server")
            print("   Make sure the Node.js server is running on http://localhost:5001")
            results.append({
                'test': test_case['name'],
                'status': 'connection_error'
            })
        
        except requests.exceptions.Timeout:
            print("❌ FAILED: Request timeout")
            results.append({
                'test': test_case['name'],
                'status': 'timeout'
            })
        
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            results.append({
                'test': test_case['name'],
                'status': 'error',
                'error': str(e)
            })
        
        # Small delay between requests
        if i < len(test_cases):
            time.sleep(1)
    
    # Summary
    print(f"\n📊 TEST SUMMARY")
    print("=" * 30)
    
    successful = len([r for r in results if r['status'] == 'success'])
    total = len(results)
    
    print(f"✅ Successful: {successful}/{total}")
    print(f"❌ Failed: {total - successful}/{total}")
    
    if successful == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check server logs for details.")
    
    return results

def test_prediction_history_api():
    """Test the prediction history API"""
    print(f"\n🔍 TESTING PREDICTION HISTORY API")
    print("-" * 40)
    
    try:
        # Test getting prediction history for user 1
        response = requests.get(f'{BASE_URL}/api/disease-predictions/1', timeout=10)
        
        if response.status_code == 200:
            history = response.json()
            print(f"✅ Retrieved {len(history)} predictions for user 1")
            
            if history:
                latest = history[0]
                print(f"   Latest: {latest.get('symptoms')} → {latest.get('predictions', [{}])[0].get('disease', 'Unknown')}")
        else:
            print(f"❌ Failed to get history: {response.status_code}")
    
    except Exception as e:
        print(f"❌ History API error: {e}")

def test_stats_api():
    """Test the statistics API"""
    print(f"\n📊 TESTING STATISTICS API")
    print("-" * 30)
    
    try:
        # Test getting stats for user 1
        response = requests.get(f'{BASE_URL}/api/disease-stats/1', timeout=10)
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statistics retrieved:")
            print(f"   Total predictions: {stats.get('total_predictions', 0)}")
            
            if stats.get('by_animal_type'):
                print("   By animal type:")
                for animal_stat in stats['by_animal_type']:
                    print(f"     {animal_stat.get('animal_type', 'Unknown')}: {animal_stat.get('count', 0)}")
        else:
            print(f"❌ Failed to get stats: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Stats API error: {e}")

def main():
    """Run all integration tests"""
    print("🏥 NODE.JS BACKEND INTEGRATION TESTS")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test main prediction API
    results = test_disease_prediction_api()
    
    # Test additional APIs
    test_prediction_history_api()
    test_stats_api()
    
    print(f"\n🏁 INTEGRATION TESTS COMPLETED")
    print("=" * 40)
    print(f"🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Return results for programmatic use
    return results

if __name__ == "__main__":
    main()
