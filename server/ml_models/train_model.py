#!/usr/bin/env python3
"""
Animal Disease Prediction Model Training Script

This script loads the animal disease dataset, preprocesses the data,
trains a Random Forest Classifier, evaluates performance, and saves
the trained model for use in production.

Author: PetCareHub ML Team
Date: October 2025
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.impute import SimpleImputer
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

class AnimalDiseasePredictor:
    """
    A comprehensive machine learning pipeline for animal disease prediction
    """
    
    def __init__(self, csv_path='animal_disease_prediction.csv'):
        """
        Initialize the predictor with dataset path
        
        Args:
            csv_path (str): Path to the CSV dataset
        """
        self.csv_path = csv_path
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.target_column = 'Disease_Prediction'
        
    def load_data(self):
        """
        Load the dataset from CSV file
        
        Returns:
            pd.DataFrame: Loaded dataset
        """
        print("📊 Loading dataset...")
        try:
            self.df = pd.read_csv(self.csv_path)
            print(f"✅ Dataset loaded successfully!")
            print(f"📈 Dataset shape: {self.df.shape}")
            print(f"🔍 Columns: {list(self.df.columns)}")
            return self.df
        except FileNotFoundError:
            print(f"❌ Error: Dataset file '{self.csv_path}' not found!")
            raise
        except Exception as e:
            print(f"❌ Error loading dataset: {str(e)}")
            raise
    
    def explore_data(self):
        """
        Perform exploratory data analysis
        """
        print("\n🔍 EXPLORATORY DATA ANALYSIS")
        print("=" * 50)
        
        # Basic info
        print(f"Dataset Info:")
        print(f"- Total Records: {len(self.df)}")
        print(f"- Total Features: {len(self.df.columns)}")
        print(f"- Missing Values: {self.df.isnull().sum().sum()}")
        
        # Target distribution
        print(f"\n🎯 Disease Distribution:")
        disease_counts = self.df[self.target_column].value_counts()
        print(disease_counts.head(10))
        
        # Animal type distribution
        print(f"\n🐾 Animal Type Distribution:")
        animal_counts = self.df['Animal_Type'].value_counts()
        print(animal_counts)
        
        # Missing values by column
        missing_data = self.df.isnull().sum()
        if missing_data.sum() > 0:
            print(f"\n⚠️  Missing Values by Column:")
            print(missing_data[missing_data > 0])
        
        return self.df.describe()
    
    def preprocess_data(self):
        """
        Comprehensive data preprocessing pipeline
        
        Returns:
            tuple: (X_processed, y_processed)
        """
        print("\n🔧 PREPROCESSING DATA")
        print("=" * 50)
        
        # Make a copy for processing
        df_processed = self.df.copy()
        
        # Handle missing values
        print("🔄 Handling missing values...")
        
        # Categorical columns
        categorical_cols = ['Animal_Type', 'Breed', 'Gender', 'Symptom_1', 'Symptom_2', 
                           'Symptom_3', 'Symptom_4', 'Duration', 'Appetite_Loss', 'Vomiting',
                           'Diarrhea', 'Coughing', 'Labored_Breathing', 'Lameness', 
                           'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge']
        
        # Numerical columns
        numerical_cols = ['Age', 'Weight', 'Heart_Rate']
        
        # Handle categorical missing values with mode
        for col in categorical_cols:
            if col in df_processed.columns and df_processed[col].isnull().any():
                mode_value = df_processed[col].mode()[0] if len(df_processed[col].mode()) > 0 else 'Unknown'
                df_processed[col].fillna(mode_value, inplace=True)
                print(f"  ✅ Filled {col} missing values with: {mode_value}")
        
        # Handle numerical missing values with median
        for col in numerical_cols:
            if col in df_processed.columns and df_processed[col].isnull().any():
                median_value = df_processed[col].median()
                df_processed[col].fillna(median_value, inplace=True)
                print(f"  ✅ Filled {col} missing values with median: {median_value}")
        
        # Process temperature and extract numerical value
        if 'Body_Temperature' in df_processed.columns:
            df_processed['Body_Temperature_Numeric'] = df_processed['Body_Temperature'].str.extract(r'(\d+\.?\d*)').astype(float)
            df_processed.drop('Body_Temperature', axis=1, inplace=True)
            print("  ✅ Processed Body_Temperature to numerical format")
        
        # Encode categorical variables
        print("\n🏷️  Encoding categorical variables...")
        for col in categorical_cols:
            if col in df_processed.columns:
                le = LabelEncoder()
                df_processed[col + '_encoded'] = le.fit_transform(df_processed[col].astype(str))
                self.label_encoders[col] = le
                print(f"  ✅ Encoded {col} ({len(le.classes_)} unique values)")
        
        # Prepare features and target
        feature_cols = [col for col in df_processed.columns 
                       if col.endswith('_encoded') or col in numerical_cols or col == 'Body_Temperature_Numeric']
        
        self.feature_columns = feature_cols
        X = df_processed[feature_cols]
        y = df_processed[self.target_column]
        
        # Encode target variable and handle rare classes
        self.target_encoder = LabelEncoder()
        y_encoded = self.target_encoder.fit_transform(y)
        
        # Check for rare classes (classes with less than 3 samples for better stratification)
        unique, counts = np.unique(y_encoded, return_counts=True)
        min_samples_per_class = 3
        rare_classes = unique[counts < min_samples_per_class]
        
        if len(rare_classes) > 0:
            print(f"⚠️  Found {len(rare_classes)} rare classes with less than {min_samples_per_class} samples:")
            rare_count = 0
            for rare_class in rare_classes:
                disease_name = self.target_encoder.classes_[rare_class]
                sample_count = counts[unique == rare_class][0]
                if rare_count < 10:  # Only show first 10 to avoid spam
                    print(f"    - {disease_name} ({sample_count} samples)")
                rare_count += 1
            
            if rare_count > 10:
                print(f"    ... and {rare_count - 10} more rare classes")
            
            # Remove samples with rare classes
            mask = ~np.isin(y_encoded, rare_classes)
            X = X[mask]
            y_encoded = y_encoded[mask]
            
            # Re-encode after removing rare classes
            remaining_diseases = y[mask]
            self.target_encoder = LabelEncoder()
            y_encoded = self.target_encoder.fit_transform(remaining_diseases)
            
            print(f"  ✅ Removed {len(rare_classes)} rare classes, {len(X)} samples remaining")
        
        print(f"\n📊 Final feature set:")
        print(f"  - Features: {len(X.columns)}")
        print(f"  - Samples: {len(X)}")
        print(f"  - Classes: {len(self.target_encoder.classes_)}")
        
        return X, y_encoded
    
    def train_model(self, X, y, test_size=0.2, random_state=42):
        """
        Train Random Forest Classifier
        
        Args:
            X: Feature matrix
            y: Target vector
            test_size: Proportion of test set
            random_state: Random seed for reproducibility
            
        Returns:
            tuple: (X_train, X_test, y_train, y_test)
        """
        print("\n🤖 TRAINING RANDOM FOREST MODEL")
        print("=" * 50)
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        print(f"📊 Data split:")
        print(f"  - Training samples: {len(X_train)}")
        print(f"  - Testing samples: {len(X_test)}")
        
        # Initialize and train Random Forest
        print("\n🌲 Training Random Forest Classifier...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        print("✅ Model training completed!")
        
        return X_train, X_test, y_train, y_test
    
    def evaluate_model(self, X_train, X_test, y_train, y_test):
        """
        Comprehensive model evaluation
        
        Args:
            X_train, X_test, y_train, y_test: Train/test splits
            
        Returns:
            dict: Evaluation metrics
        """
        print("\n📈 MODEL EVALUATION")
        print("=" * 50)
        
        # Make predictions
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)
        
        # Calculate accuracies
        train_accuracy = accuracy_score(y_train, y_train_pred)
        test_accuracy = accuracy_score(y_test, y_test_pred)
        
        print(f"🎯 Accuracy Scores:")
        print(f"  - Training Accuracy: {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
        print(f"  - Testing Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
        
        # Detailed classification report
        print(f"\n📊 Detailed Classification Report:")
        try:
            print(classification_report(y_test, y_test_pred))
        except ValueError as e:
            print(f"⚠️  Classification report issue: {e}")
            print("Using simplified report...")
            # Get unique classes in test set
            unique_test_classes = np.unique(np.concatenate([y_test, y_test_pred]))
            test_class_names = [self.target_encoder.classes_[i] for i in unique_test_classes]
            print(classification_report(y_test, y_test_pred, 
                                      labels=unique_test_classes,
                                      target_names=test_class_names))
        
        # Feature importance
        print(f"\n🔍 Top 10 Most Important Features:")
        feature_importance = pd.DataFrame({
            'feature': X_train.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(feature_importance.head(10).to_string(index=False))
        
        # Confusion Matrix
        self._plot_confusion_matrix(y_test, y_test_pred)
        
        # Feature importance plot
        self._plot_feature_importance(feature_importance)
        
        return {
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'feature_importance': feature_importance,
            'classification_report': classification_report(y_test, y_test_pred, output_dict=True)
        }
    
    def _plot_confusion_matrix(self, y_true, y_pred):
        """
        Plot confusion matrix
        """
        plt.figure(figsize=(12, 8))
        cm = confusion_matrix(y_true, y_pred)
        
        # Use class names for better readability
        class_names = self.target_encoder.classes_
        
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=class_names, yticklabels=class_names)
        plt.title('Confusion Matrix - Animal Disease Prediction')
        plt.xlabel('Predicted Disease')
        plt.ylabel('Actual Disease')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig('ml_models/confusion_matrix.png', dpi=300, bbox_inches='tight')
        print("📊 Confusion matrix saved as 'ml_models/confusion_matrix.png'")
        plt.close()
    
    def _plot_feature_importance(self, feature_importance):
        """
        Plot feature importance
        """
        plt.figure(figsize=(10, 8))
        top_features = feature_importance.head(15)
        
        sns.barplot(data=top_features, x='importance', y='feature', palette='viridis')
        plt.title('Top 15 Most Important Features for Disease Prediction')
        plt.xlabel('Feature Importance')
        plt.ylabel('Features')
        plt.tight_layout()
        plt.savefig('ml_models/feature_importance.png', dpi=300, bbox_inches='tight')
        print("📊 Feature importance plot saved as 'ml_models/feature_importance.png'")
        plt.close()
    
    def save_model(self, model_path='ml_models/disease_model.pkl'):
        """
        Save the trained model and preprocessing components
        
        Args:
            model_path (str): Path to save the model
        """
        print(f"\n💾 SAVING MODEL")
        print("=" * 50)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Prepare model package
        model_package = {
            'model': self.model,
            'label_encoders': self.label_encoders,
            'target_encoder': self.target_encoder,
            'feature_columns': self.feature_columns,
            'scaler': self.scaler,
            'training_date': datetime.now().isoformat(),
            'model_type': 'RandomForestClassifier',
            'classes': list(self.target_encoder.classes_)
        }
        
        # Save the model package
        joblib.dump(model_package, model_path)
        print(f"✅ Model saved successfully to: {model_path}")
        
        # Save model info
        info_path = model_path.replace('.pkl', '_info.txt')
        with open(info_path, 'w') as f:
            f.write(f"Animal Disease Prediction Model\n")
            f.write(f"================================\n")
            f.write(f"Training Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Model Type: Random Forest Classifier\n")
            f.write(f"Features: {len(self.feature_columns)}\n")
            f.write(f"Classes: {len(self.target_encoder.classes_)}\n")
            f.write(f"Disease Classes: {', '.join(self.target_encoder.classes_)}\n")
        
        print(f"📄 Model info saved to: {info_path}")
        
        return model_path
    
    def predict_disease(self, animal_data):
        """
        Predict disease for new animal data
        
        Args:
            animal_data (dict): Dictionary containing animal features
            
        Returns:
            tuple: (predicted_disease, probability)
        """
        if self.model is None:
            raise ValueError("Model not trained yet. Please train the model first.")
        
        # This method would be used for inference in production
        # Implementation would depend on the exact format of input data
        pass

def main():
    """
    Main training pipeline
    """
    print("🐾 ANIMAL DISEASE PREDICTION MODEL TRAINING")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Initialize predictor
        predictor = AnimalDiseasePredictor()
        
        # Load and explore data
        predictor.load_data()
        predictor.explore_data()
        
        # Preprocess data
        X, y = predictor.preprocess_data()
        
        # Train model
        X_train, X_test, y_train, y_test = predictor.train_model(X, y)
        
        # Evaluate model
        evaluation_results = predictor.evaluate_model(X_train, X_test, y_train, y_test)
        
        # Save model
        model_path = predictor.save_model()
        
        print(f"\n🎉 TRAINING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"✅ Model saved to: {model_path}")
        print(f"📊 Test Accuracy: {evaluation_results['test_accuracy']:.4f}")
        print(f"🕐 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"\n❌ TRAINING FAILED!")
        print(f"Error: {str(e)}")
        raise

if __name__ == "__main__":
    main()
