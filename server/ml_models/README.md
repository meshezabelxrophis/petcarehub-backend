# Animal Disease Prediction Model

A machine learning system for predicting animal diseases based on symptoms and clinical data using Random Forest Classification.

## 🎯 Overview

This ML system analyzes animal symptoms, vital signs, and other clinical indicators to predict potential diseases. It supports multiple animal types including dogs, cats, cows, horses, sheep, goats, pigs, and rabbits.

## 📊 Model Performance

- **Training Accuracy**: 96.02%
- **Test Accuracy**: 33.33%
- **Model Type**: Random Forest Classifier
- **Features**: 21 clinical and symptom features
- **Disease Classes**: 52 different animal diseases
- **Training Date**: October 4, 2025

## 🗂️ Files Structure

```
ml_models/
├── train_model.py                  # Main training script
├── predict_disease.py              # Basic inference/prediction script
├── severity_utils.py               # Severity mapping utilities
├── enhanced_prediction_demo.py     # Enhanced prediction with severity
├── disease_model.pkl               # Trained model (joblib format)
├── disease_model_info.txt          # Model metadata
├── severity_mapping.json           # Disease severity and recommendations
├── confusion_matrix.png            # Model evaluation visualization
├── feature_importance.png          # Feature importance plot
├── ml_requirements.txt             # Python dependencies
└── README.md                       # This documentation
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r ml_requirements.txt
```

Required packages:
- scikit-learn >= 1.3.0
- pandas >= 2.0.0
- numpy >= 1.24.0
- matplotlib >= 3.7.0
- seaborn >= 0.12.0
- joblib >= 1.3.0

### 2. Train the Model

```bash
python3 train_model.py
```

This will:
- Load and analyze the dataset (`animal_disease_prediction.csv`)
- Preprocess the data (handle missing values, encode categories)
- Train a Random Forest classifier
- Evaluate performance with accuracy and confusion matrix
- Save the trained model as `disease_model.pkl`

### 3. Make Predictions

**Basic Prediction:**
```bash
python3 predict_disease.py
```

**Enhanced Prediction with Severity Assessment:**
```bash
python3 enhanced_prediction_demo.py
```

**Programmatic Usage:**

Basic prediction:
```python
from predict_disease import DiseasePredictor

predictor = DiseasePredictor()
result = predictor.predict(animal_data)
print(f"Disease: {result['predicted_disease']} ({result['confidence']})")
```

Enhanced prediction with severity:
```python
from severity_utils import EnhancedDiseasePredictor

predictor = EnhancedDiseasePredictor()
result = predictor.predict_with_severity(animal_data)

print(f"Disease: {result['predicted_disease']}")
print(f"Severity: {result['severity']['level']}")
print(f"Urgency: {result['severity']['urgency']}")
print(f"Recommendation: {result['severity']['recommendation']}")
```

## 📋 Input Features

The model uses 21 features for disease prediction:

### Clinical Data
- **Animal_Type**: Dog, Cat, Cow, Horse, Sheep, Goat, Pig, Rabbit
- **Breed**: Specific breed of the animal
- **Age**: Age in years
- **Gender**: Male/Female
- **Weight**: Body weight in kg
- **Body_Temperature**: Temperature (e.g., "39.5°C")
- **Heart_Rate**: Heart rate (beats per minute)

### Symptoms
- **Symptom_1-4**: Primary symptoms (e.g., Fever, Lethargy, Coughing)
- **Duration**: How long symptoms have been present

### Binary Indicators (Yes/No)
- Appetite_Loss
- Vomiting
- Diarrhea
- Coughing
- Labored_Breathing
- Lameness
- Skin_Lesions
- Nasal_Discharge
- Eye_Discharge

## 🎯 Supported Diseases

The model can predict 52 different animal diseases, including:

**Common Diseases:**
- Parvovirus (Dogs)
- Upper Respiratory Infection (Cats)
- Bovine Respiratory Disease (Cattle)
- Equine Influenza (Horses)
- Gastroenteritis
- Pneumonia
- Mastitis

**And many more...**

## 🏥 Severity Mapping System

The system includes comprehensive severity assessments for all 52 diseases:

### Severity Levels
- **🔴 Severe (30 diseases)**: Life-threatening conditions requiring immediate attention
- **🟡 Moderate (18 diseases)**: Conditions requiring veterinary care within 24-48 hours  
- **🟢 Mild (4 diseases)**: Conditions that may resolve with monitoring and supportive care

### Urgency Classifications
- **🚨 Emergency (27 diseases)**: Immediate veterinary attention required
- **🟠 High (11 diseases)**: Veterinary care needed within 24 hours
- **🟡 Medium (10 diseases)**: Veterinary consultation within 2-3 days
- **🟢 Low (4 diseases)**: Monitor symptoms, contact vet if worsening

### Example Severity Mappings

```json
{
  "Parvovirus": {
    "severity": "Severe",
    "urgency": "Emergency", 
    "recommendation": "Take your pet to the nearest emergency clinic immediately. Parvovirus can be fatal within hours."
  },
  "Kennel Cough": {
    "severity": "Mild",
    "urgency": "Low",
    "recommendation": "Symptoms may resolve in 1-2 weeks with rest. Contact your veterinarian if coughing persists or worsens."
  },
  "Upper Respiratory Infection": {
    "severity": "Mild", 
    "urgency": "Low",
    "recommendation": "Monitor symptoms for 3-5 days. If they worsen or persist beyond a week, contact your veterinarian."
  }
}
```

### Adding New Diseases

The severity mapping system is designed to be easily extensible:

```python
from severity_utils import SeverityMapper

mapper = SeverityMapper()
mapper.add_disease("New Disease", {
    "severity": "Moderate",
    "urgency": "Medium",
    "recommendation": "Schedule veterinary visit within 2-3 days.",
    "description": "Description of the new disease",
    "typical_animals": ["Dog", "Cat"]
})
mapper.save_mapping()
```

## 📈 Feature Importance

Top 10 most important features for disease prediction:

1. **Weight** (13.9%)
2. **Heart_Rate** (11.8%)
3. **Animal_Type** (10.6%)
4. **Breed** (8.4%)
5. **Age** (6.6%)
6. **Symptom_1** (6.5%)
7. **Body_Temperature** (5.9%)
8. **Symptom_2** (5.0%)
9. **Symptom_3** (4.4%)
10. **Duration** (4.2%)

## ⚠️ Important Notes

### Model Limitations
- **Test accuracy is 33.33%** - This indicates the model may overfit to training data
- The model should be used as a **diagnostic aid**, not a replacement for veterinary expertise
- Always consult with a qualified veterinarian for accurate diagnosis

### Data Quality
- The model was trained on 314 samples after removing rare diseases
- Some disease classes had very few samples, which may affect prediction quality
- Real-world performance may vary from training metrics

### Recommendations for Improvement
1. **Collect more data** - Especially for rare diseases
2. **Feature engineering** - Add more clinical indicators
3. **Cross-validation** - Use k-fold CV for better evaluation
4. **Ensemble methods** - Combine multiple models
5. **Regular retraining** - Update model with new data

## 🔧 Technical Details

### Preprocessing Pipeline
1. **Missing Value Handling**: 
   - Categorical: Mode imputation
   - Numerical: Median imputation
2. **Feature Encoding**:
   - Label encoding for categorical variables
   - Temperature parsing (extract numerical value)
3. **Rare Class Removal**: 
   - Remove diseases with < 3 samples for better stratification

### Model Configuration
```python
RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
```

## 📞 Integration with PetCareHub

This ML system can be integrated into the PetCareHub platform to provide:

1. **Symptom Checker**: Help pet owners identify potential issues with severity assessment
2. **Veterinary Decision Support**: Assist vets with preliminary diagnoses and urgency levels
3. **Emergency Triage**: Prioritize cases based on predicted severity and urgency
4. **Health Monitoring**: Track pet health trends over time with risk assessment

### API Integration Example

```python
# In your Flask/Express API
from severity_utils import EnhancedDiseasePredictor

@app.route('/api/predict-disease', methods=['POST'])
def predict_disease():
    data = request.json
    predictor = EnhancedDiseasePredictor()
    result = predictor.predict_with_severity(data)
    
    # Enhanced response with severity info
    return jsonify({
        'prediction': result['predicted_disease'],
        'confidence': result['confidence'],
        'severity': result['severity']['level'],
        'urgency': result['severity']['urgency'],
        'recommendation': result['severity']['recommendation'],
        'alternatives': result['top_predictions']
    })
```

### Frontend Integration

```javascript
// Example frontend usage
const predictDisease = async (animalData) => {
  const response = await fetch('/api/predict-disease', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(animalData)
  });
  
  const result = await response.json();
  
  // Display severity-based UI
  if (result.urgency === 'Emergency') {
    showEmergencyAlert(result.recommendation);
  } else if (result.urgency === 'High') {
    showUrgentNotification(result.recommendation);
  } else {
    showGeneralAdvice(result.recommendation);
  }
};
```

## 📝 License & Disclaimer

This model is for educational and research purposes. It should not be used as the sole basis for medical decisions. Always consult with qualified veterinary professionals for accurate diagnosis and treatment.

---

**PetCareHub ML Team**  
October 2025
