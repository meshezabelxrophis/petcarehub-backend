/**
 * Vercel Serverless Function: Generate AI Caption for Pet Photos
 * Uses Gemini API to generate captions for uploaded pet images
 * 
 * Endpoint: POST /api/generateCaption
 * Body: { imageUrl: string }
 * Response: { caption: string, confidence: number }
 */

import { GoogleGenerativeAI } from '@google/genai';

// CORS headers for frontend
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

export default async function handler(req, res) {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      ...corsHeaders 
    });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ 
        error: 'imageUrl is required',
        ...corsHeaders 
      });
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not configured, returning mock caption');
      return res.status(200).json({
        caption: "Cute pet having a great day! 🐾",
        confidence: 0.5,
        mock: true,
        ...corsHeaders
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Fetch the image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from URL');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    
    // Determine mime type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Create the prompt for caption generation
    const prompt = `You are a creative social media caption writer for pet photos. 
    
Generate a short, engaging, and heartwarming caption for this pet photo. The caption should be:
- Between 10-30 words
- Friendly and upbeat
- Include 1-2 relevant emojis
- Sound natural and authentic (not overly promotional)
- Focus on the pet's mood, activity, or personality

Just provide the caption text directly, nothing else.`;

    // Generate caption using Gemini Vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: contentType,
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const caption = response.text().trim();

    // Calculate a simple confidence score based on response quality
    const confidence = caption.length > 10 && caption.length < 200 ? 0.9 : 0.7;

    console.log('✅ Caption generated successfully');
    
    return res.status(200).json({
      caption,
      confidence,
      mock: false,
      ...corsHeaders
    });

  } catch (error) {
    console.error('❌ Error generating caption:', error);
    
    // Return a friendly fallback caption on error
    return res.status(200).json({
      caption: "Loving every moment with my best friend! 🐾❤️",
      confidence: 0.5,
      error: error.message,
      fallback: true,
      ...corsHeaders
    });
  }
}

