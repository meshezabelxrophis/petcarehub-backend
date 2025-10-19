#!/usr/bin/env python3
"""
Severity Mapping Utility

This script provides utilities to work with disease severity mappings,
including loading severity data and integrating it with disease predictions.

Author: PetCareHub ML Team
Date: October 2025
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple

class SeverityMapper:
    """
    Utility class for working with disease severity mappings
    """
    
    def __init__(self, mapping_file='severity_mapping.json'):
        """
        Initialize severity mapper
        
        Args:
            mapping_file (str): Path to severity mapping JSON file
        """
        self.mapping_file = mapping_file
        self.severity_data = {}
        self.load_mapping()
    
    def load_mapping(self):
        """
        Load severity mapping from JSON file
        """
        try:
            with open(self.mapping_file, 'r', encoding='utf-8') as f:
                self.severity_data = json.load(f)
            print(f"✅ Loaded severity mapping for {len(self.severity_data)} diseases")
        except FileNotFoundError:
            print(f"❌ Severity mapping file '{self.mapping_file}' not found!")
            raise
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON file: {e}")
            raise
        except Exception as e:
            print(f"❌ Error loading severity mapping: {e}")
            raise
    
    def get_severity_info(self, disease_name: str) -> Optional[Dict]:
        """
        Get severity information for a specific disease
        
        Args:
            disease_name (str): Name of the disease
            
        Returns:
            dict: Severity information or None if not found
        """
        return self.severity_data.get(disease_name)
    
    def get_severity_level(self, disease_name: str) -> str:
        """
        Get severity level for a disease
        
        Args:
            disease_name (str): Name of the disease
            
        Returns:
            str: Severity level (Severe, Moderate, Mild) or Unknown
        """
        info = self.get_severity_info(disease_name)
        return info.get('severity', 'Unknown') if info else 'Unknown'
    
    def get_recommendation(self, disease_name: str) -> str:
        """
        Get recommendation for a disease
        
        Args:
            disease_name (str): Name of the disease
            
        Returns:
            str: Recommendation text or default message
        """
        info = self.get_severity_info(disease_name)
        return info.get('recommendation', 'Consult with a veterinarian for proper diagnosis and treatment.') if info else 'Consult with a veterinarian for proper diagnosis and treatment.'
    
    def get_urgency_level(self, disease_name: str) -> str:
        """
        Get urgency level for a disease
        
        Args:
            disease_name (str): Name of the disease
            
        Returns:
            str: Urgency level (Emergency, High, Medium, Low) or Unknown
        """
        info = self.get_severity_info(disease_name)
        return info.get('urgency', 'Unknown') if info else 'Unknown'
    
    def get_diseases_by_severity(self, severity_level: str) -> List[str]:
        """
        Get all diseases with a specific severity level
        
        Args:
            severity_level (str): Severity level to filter by
            
        Returns:
            list: List of disease names
        """
        return [disease for disease, info in self.severity_data.items() 
                if info.get('severity') == severity_level]
    
    def get_diseases_by_urgency(self, urgency_level: str) -> List[str]:
        """
        Get all diseases with a specific urgency level
        
        Args:
            urgency_level (str): Urgency level to filter by
            
        Returns:
            list: List of disease names
        """
        return [disease for disease, info in self.severity_data.items() 
                if info.get('urgency') == urgency_level]
    
    def get_diseases_by_animal(self, animal_type: str) -> List[str]:
        """
        Get diseases that typically affect a specific animal type
        
        Args:
            animal_type (str): Animal type (e.g., 'Dog', 'Cat')
            
        Returns:
            list: List of disease names
        """
        return [disease for disease, info in self.severity_data.items() 
                if animal_type in info.get('typical_animals', [])]
    
    def add_disease(self, disease_name: str, severity_info: Dict):
        """
        Add a new disease to the severity mapping
        
        Args:
            disease_name (str): Name of the disease
            severity_info (dict): Severity information dictionary
        """
        self.severity_data[disease_name] = severity_info
        print(f"✅ Added {disease_name} to severity mapping")
    
    def update_disease(self, disease_name: str, severity_info: Dict):
        """
        Update existing disease information
        
        Args:
            disease_name (str): Name of the disease
            severity_info (dict): Updated severity information
        """
        if disease_name in self.severity_data:
            self.severity_data[disease_name].update(severity_info)
            print(f"✅ Updated {disease_name} in severity mapping")
        else:
            print(f"⚠️  Disease {disease_name} not found. Use add_disease() to add new diseases.")
    
    def save_mapping(self, output_file: Optional[str] = None):
        """
        Save severity mapping to JSON file
        
        Args:
            output_file (str, optional): Output file path. Uses original file if None.
        """
        output_path = output_file or self.mapping_file
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.severity_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved severity mapping to {output_path}")
        except Exception as e:
            print(f"❌ Error saving severity mapping: {e}")
            raise
    
    def get_statistics(self) -> Dict:
        """
        Get statistics about the severity mapping
        
        Returns:
            dict: Statistics about diseases, severities, and urgencies
        """
        severity_counts = {}
        urgency_counts = {}
        animal_counts = {}
        
        for disease, info in self.severity_data.items():
            # Count severities
            severity = info.get('severity', 'Unknown')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # Count urgencies
            urgency = info.get('urgency', 'Unknown')
            urgency_counts[urgency] = urgency_counts.get(urgency, 0) + 1
            
            # Count animals
            for animal in info.get('typical_animals', []):
                animal_counts[animal] = animal_counts.get(animal, 0) + 1
        
        return {
            'total_diseases': len(self.severity_data),
            'severity_distribution': severity_counts,
            'urgency_distribution': urgency_counts,
            'animal_distribution': animal_counts
        }
    
    def print_statistics(self):
        """
        Print detailed statistics about the severity mapping
        """
        stats = self.get_statistics()
        
        print(f"\n📊 SEVERITY MAPPING STATISTICS")
        print("=" * 50)
        print(f"Total Diseases: {stats['total_diseases']}")
        
        print(f"\n🚨 Severity Distribution:")
        for severity, count in sorted(stats['severity_distribution'].items()):
            print(f"  - {severity}: {count} diseases")
        
        print(f"\n⏰ Urgency Distribution:")
        for urgency, count in sorted(stats['urgency_distribution'].items()):
            print(f"  - {urgency}: {count} diseases")
        
        print(f"\n🐾 Animal Distribution:")
        for animal, count in sorted(stats['animal_distribution'].items(), key=lambda x: x[1], reverse=True):
            print(f"  - {animal}: {count} diseases")

class EnhancedDiseasePredictor:
    """
    Enhanced disease predictor that includes severity mapping
    """
    
    def __init__(self, model_path='disease_model.pkl', severity_mapping_path='severity_mapping.json'):
        """
        Initialize enhanced predictor
        
        Args:
            model_path (str): Path to trained model
            severity_mapping_path (str): Path to severity mapping JSON
        """
        # Import the original predictor
        try:
            from predict_disease import DiseasePredictor
            self.predictor = DiseasePredictor(model_path)
        except ImportError:
            print("❌ Could not import DiseasePredictor. Make sure predict_disease.py is available.")
            raise
        
        # Initialize severity mapper
        self.severity_mapper = SeverityMapper(severity_mapping_path)
    
    def predict_with_severity(self, animal_data: Dict) -> Dict:
        """
        Make disease prediction with severity information
        
        Args:
            animal_data (dict): Animal data for prediction
            
        Returns:
            dict: Enhanced prediction results with severity info
        """
        # Get base prediction
        prediction_result = self.predictor.predict(animal_data)
        
        if prediction_result.get('error'):
            return prediction_result
        
        # Enhance with severity information
        predicted_disease = prediction_result['predicted_disease']
        severity_info = self.severity_mapper.get_severity_info(predicted_disease)
        
        # Add severity information to result
        prediction_result['severity'] = {
            'level': self.severity_mapper.get_severity_level(predicted_disease),
            'urgency': self.severity_mapper.get_urgency_level(predicted_disease),
            'recommendation': self.severity_mapper.get_recommendation(predicted_disease),
            'description': severity_info.get('description', 'No description available') if severity_info else 'No description available'
        }
        
        # Enhance top predictions with severity
        enhanced_predictions = []
        for pred in prediction_result.get('top_predictions', []):
            disease = pred['disease']
            enhanced_pred = pred.copy()
            enhanced_pred['severity_level'] = self.severity_mapper.get_severity_level(disease)
            enhanced_pred['urgency'] = self.severity_mapper.get_urgency_level(disease)
            enhanced_predictions.append(enhanced_pred)
        
        prediction_result['top_predictions'] = enhanced_predictions
        
        return prediction_result

def main():
    """
    Demonstration of severity mapping functionality
    """
    print("🏥 DISEASE SEVERITY MAPPING SYSTEM")
    print("=" * 60)
    
    # Initialize severity mapper
    mapper = SeverityMapper()
    
    # Print statistics
    mapper.print_statistics()
    
    # Demonstrate severity queries
    print(f"\n🔍 SEVERITY EXAMPLES")
    print("-" * 30)
    
    example_diseases = ['Parvovirus', 'Kennel Cough', 'Pneumonia', 'Upper Respiratory Infection']
    
    for disease in example_diseases:
        severity = mapper.get_severity_level(disease)
        urgency = mapper.get_urgency_level(disease)
        recommendation = mapper.get_recommendation(disease)
        
        print(f"\n🦠 {disease}:")
        print(f"   Severity: {severity}")
        print(f"   Urgency: {urgency}")
        print(f"   Recommendation: {recommendation[:100]}...")
    
    # Show emergency diseases
    print(f"\n🚨 EMERGENCY DISEASES:")
    emergency_diseases = mapper.get_diseases_by_urgency('Emergency')
    print(f"Found {len(emergency_diseases)} emergency diseases:")
    for disease in emergency_diseases[:10]:  # Show first 10
        print(f"  - {disease}")
    
    # Show diseases by animal type
    print(f"\n🐕 DOG-SPECIFIC DISEASES:")
    dog_diseases = mapper.get_diseases_by_animal('Dog')
    print(f"Found {len(dog_diseases)} diseases affecting dogs:")
    for disease in dog_diseases[:8]:  # Show first 8
        print(f"  - {disease}")
    
    print(f"\n✅ Severity mapping demonstration completed!")

if __name__ == "__main__":
    main()
