/**
 * AI Service
 * Handles Gemini AI interactions via Vercel backend
 */

import { generateAIResponse, analyzeImage, storeToFirestore } from '../config/api';
import { auth } from '../config/firebase';

/**
 * Chat with AI assistant
 * @param {string} message - User message
 * @param {string} sessionId - Chat session ID
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} AI response
 */
export const chatWithAI = async (message, sessionId, context = {}) => {
  try {
    console.log('🤖 Sending message to AI...', { sessionId });
    
    // Generate AI response via Vercel backend
    const response = await generateAIResponse(message, sessionId, context);
    
    // Store conversation via backend (saves to Firestore)
    await storeToFirestore('ai_conversations', {
      sessionId,
      question: message,
      answer: response.reply,
      context,
      timestamp: new Date().toISOString()
    }, {
      sessionId,
      type: 'chat_conversation'
    });
    
    console.log('✅ AI response received and stored');
    
    return {
      success: true,
      reply: response.reply,
      sessionId: response.sessionId
    };
  } catch (error) {
    console.error('❌ AI chat failed:', error);
    return {
      success: false,
      reply: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    };
  }
};

/**
 * Analyze pet image for health or breed identification
 * @param {File|string} image - Image file or base64 data
 * @param {string} analysisType - Type of analysis (health, breed, general)
 * @returns {Promise<Object>} Analysis result
 */
export const analyzePetImage = async (image, analysisType = 'general') => {
  try {
    console.log('🔍 Analyzing image...', { analysisType });
    
    // Convert image to base64 if needed
    let imageData = image;
    if (image instanceof File) {
      imageData = await fileToBase64(image);
    }
    
    // Prepare analysis prompt based on type
    const prompts = {
      health: 'Analyze this pet image for any visible health concerns or abnormalities. Provide observations about the pet\'s condition.',
      breed: 'Identify the breed of this pet. Provide details about the breed characteristics you observe.',
      general: 'Analyze this pet image and provide observations about the pet\'s appearance, breed, and any notable features.'
    };
    
    const prompt = prompts[analysisType] || prompts.general;
    
    // Analyze image via Vercel backend
    const response = await analyzeImage(imageData, prompt);
    
    // Store analysis result via backend
    await storeToFirestore('image_analyses', {
      analysisType,
      result: response.reply,
      imageMetadata: {
        type: analysisType,
        analyzedAt: new Date().toISOString()
      }
    }, {
      sessionId: `image_${Date.now()}`,
      type: 'image_analysis'
    });
    
    console.log('✅ Image analysis complete and stored');
    
    return {
      success: true,
      analysis: response.reply,
      analysisType
    };
  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    return {
      success: false,
      error: error.message,
      analysis: 'Unable to analyze image at this time.'
    };
  }
};

/**
 * Get pet care recommendations
 * @param {Object} petInfo - Pet information
 * @returns {Promise<Object>} Recommendations
 */
export const getPetCareRecommendations = async (petInfo) => {
  const { species, breed, age, symptoms = [] } = petInfo;
  
  const message = `I have a ${age}-year-old ${breed} ${species}. ${
    symptoms.length > 0 
      ? `They're showing these symptoms: ${symptoms.join(', ')}. ` 
      : ''
  }What care recommendations do you have?`;
  
  try {
    const response = await chatWithAI(
      message,
      `pet_care_${auth.currentUser?.uid}_${Date.now()}`,
      {
        type: 'pet_care_recommendation',
        petInfo
      }
    );
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get recommendations:', error);
    throw error;
  }
};

/**
 * Convert File to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default {
  chatWithAI,
  analyzePetImage,
  getPetCareRecommendations
};

