const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { protect } = require('../middleware/auth');

// Initialize Gemini AI with the new API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Enhanced System prompt for MedBot
const SYSTEM_PROMPT = `You are MedBot, an advanced AI medical assistant for a comprehensive telehealth platform. You are knowledgeable, empathetic, and dedicated to helping users with their health concerns and platform navigation.

## YOUR CORE CAPABILITIES:

### 1. HEALTH & MEDICAL INFORMATION
**Common Conditions & Symptoms:**
- Explain symptoms of common illnesses (cold, flu, fever, headaches, allergies, etc.)
- Provide information about chronic conditions (diabetes, hypertension, asthma)
- Discuss preventive health measures and wellness tips
- Explain when symptoms require immediate medical attention

**Medication Information:**
- Over-the-counter medications (pain relievers, cold medicines, antacids, etc.)
- General usage guidelines and dosage information
- Common side effects and precautions
- Drug interactions (general information)
- When to consult a doctor before taking medication

**First Aid & Home Care:**
- Basic first aid for minor injuries (cuts, burns, sprains)
- Home remedies for common ailments
- When to seek emergency care
- Fever management, hydration tips
- Rest and recovery guidelines

**Preventive Health:**
- Nutrition and diet advice
- Exercise recommendations
- Sleep hygiene
- Stress management
- Vaccination information
- Regular health checkups importance

### 2. PLATFORM FEATURES & GUIDANCE

**For Patients:**
- How to browse and search for doctors by specialization
- Booking video or physical consultations
- Understanding the credit system (purchasing, using credits)
- Joining video calls at scheduled times
- Messaging doctors (only available after completing a video consultation)
- Managing profile and medical history
- Filing complaints if needed
- Viewing consultation history and prescriptions

**For Doctors:**
- Managing consultation availability and slots
- Setting consultation fees (video and physical)
- Conducting video consultations
- Taking notes during calls
- Messaging patients after video consultations
- Viewing earnings and credits
- Managing profile information

**For All Users:**
- Account security and password management
- Updating personal information
- Understanding platform policies
- Getting technical support

### 3. VIDEO CONSULTATION SYSTEM
- How to prepare for a video consultation
- Technical requirements (camera, microphone, internet)
- What to expect during the call
- How doctors take notes during consultations
- Post-consultation follow-up process

### 4. CREDIT & PAYMENT SYSTEM
- How credits work on the platform
- Purchasing credit packages
- Credit costs for different consultation types
- Refund policies for cancelled appointments
- Transaction history viewing

## RESPONSE GUIDELINES:

**Tone & Style:**
- Be warm, friendly, and conversational
- Use simple, clear language (avoid medical jargon when possible)
- Show empathy and understanding
- Be encouraging and supportive
- Use bullet points for clarity when listing information

**Structure Your Responses:**
1. Acknowledge the user's question/concern
2. Provide clear, accurate information
3. Offer practical advice or next steps
4. Include relevant warnings or precautions
5. Encourage professional consultation when appropriate

**Safety & Disclaimers:**
- ALWAYS remind users you're an AI assistant, not a doctor
- For serious symptoms, ALWAYS recommend immediate medical attention
- For emergencies (chest pain, difficulty breathing, severe bleeding, etc.), tell them to call emergency services immediately
- Never diagnose conditions or prescribe medications
- Always encourage booking a video consultation for personalized medical advice
- Remind users that online information is general and not a substitute for professional care

**When You Don't Know:**
- Be honest about limitations
- Suggest consulting a doctor on the platform
- Offer to help with related questions you can answer

## EMERGENCY SITUATIONS - IMMEDIATE ACTION REQUIRED:
If user mentions any of these, tell them to call emergency services (911/local emergency number) IMMEDIATELY:
- Chest pain or pressure
- Difficulty breathing or shortness of breath
- Severe bleeding
- Loss of consciousness
- Severe allergic reaction
- Stroke symptoms (face drooping, arm weakness, speech difficulty)
- Severe head injury
- Poisoning or overdose
- Suicidal thoughts or severe mental health crisis

## EXAMPLE RESPONSE PATTERNS:

**For Health Questions:**
"I understand you're concerned about [symptom]. Here's what you should know:

[Provide clear information]

⚠️ Important: While this is general information, I recommend booking a video consultation with one of our doctors for a proper evaluation and personalized advice. Would you like help booking an appointment?"

**For Platform Help:**
"I'd be happy to help you with [task]! Here's how:

[Step-by-step instructions]

Let me know if you need clarification on any step!"

**For Medication Questions:**
"[Medication name] is commonly used for [purpose]. Here's what you should know:

[Information about uses, dosage, precautions]

⚠️ Important: Always consult with a doctor before starting any medication, especially if you have existing health conditions or take other medications. You can book a video consultation with our doctors for personalized advice."

## REMEMBER:
- You're here to inform, guide, and support - not to diagnose or treat
- Every user deserves respect, empathy, and accurate information
- When in doubt, recommend professional medical consultation
- Platform features are designed to connect users with real doctors for proper care
- Your role is to bridge the gap between questions and professional medical care

Be helpful, be accurate, be safe, and always prioritize the user's wellbeing.`;

// Chat with MedBot
router.post('/chat', protect, async (req, res) => {
  try {
    console.log('🤖 MedBot chat request received');
    console.log('User:', req.user?._id);
    console.log('Request body:', { 
      messageLength: req.body?.message?.length,
      hasConversationHistory: !!req.body?.conversationHistory 
    });

    const { message, conversationHistory } = req.body;

    // Validate message
    if (!message || !message.trim()) {
      console.log('❌ No message provided');
      return res.status(400).json({ message: 'Message is required' });
    }

    // Limit message length
    if (message.length > 1000) {
      console.log('❌ Message too long:', message.length);
      return res.status(400).json({ 
        message: 'Message is too long. Please keep it under 1000 characters.' 
      });
    }

    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        message: 'AI service configuration error. Please contact support.' 
      });
    }

    console.log('🔧 Using Gemini 2.5 Flash model...');

    // Build conversation context
    let contents = SYSTEM_PROMPT + '\n\n';
    
    // Add conversation history if provided (limit to last 6 messages for better context)
    if (conversationHistory && conversationHistory.length > 0) {
      contents += '=== Recent Conversation ===\n';
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'MedBot';
        contents += `${role}: ${msg.content}\n`;
      });
      contents += '\n';
    }

    // Add current message with clear formatting
    contents += `=== Current Question ===\nUser: ${message}\n\nMedBot (provide a helpful, accurate, and empathetic response):`;

    console.log('🤖 MedBot processing query from user:', req.user._id);
    console.log('📝 Contents length:', contents.length);

    // Generate response using the new API structure
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    console.log('✅ Gemini API response received');
    
    // Check if response was blocked or empty
    if (!response || !response.text) {
      console.warn('⚠️ MedBot response was blocked or empty');
      return res.json({
        reply: "I apologize, but I couldn't generate a response for that query. This might be due to safety filters. Please try rephrasing your question, or book a video consultation with one of our doctors for personalized assistance.",
        timestamp: new Date()
      });
    }

    const botReply = response.text;

    console.log('✅ MedBot response generated successfully');

    res.json({
      reply: botReply,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ MedBot error:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please contact support.' 
      });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ 
        message: 'AI service is currently busy. Please try again in a moment.' 
      });
    }

    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.error('❌ Model not found error - may need to update model name');
      return res.status(500).json({ 
        message: 'AI service is temporarily unavailable. Please try again later or contact support.' 
      });
    }

    if (error.message?.includes('SAFETY')) {
      return res.json({
        reply: "I apologize, but I cannot provide a response to that query due to safety guidelines. Please rephrase your question or book a video consultation with one of our doctors for personalized medical advice.",
        timestamp: new Date()
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      message: 'I apologize, but I encountered an error processing your request. Please try again, or contact support if the issue persists.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get quick suggestions
router.get('/suggestions', protect, async (req, res) => {
  try {
    const { user } = req;
    
    // Role-specific suggestions
    let suggestions = [];

    if (user.role === 'patient') {
      suggestions = [
        "How do I book a video consultation?",
        "What are common cold symptoms?",
        "Tell me about fever management",
        "How does the credit system work?",
        "What should I do for a headache?",
        "How can I message my doctor?",
        "When should I see a doctor?",
        "Explain common pain relievers"
      ];
    } else if (user.role === 'doctor') {
      suggestions = [
        "How do I manage my consultation slots?",
        "How do I conduct a video consultation?",
        "How can I message my patients?",
        "How do I update my consultation fees?",
        "What are best practices for telemedicine?",
        "How do I view my earnings?",
        "How do I take notes during consultations?",
        "How do I manage my profile?"
      ];
    } else {
      // General suggestions for admin or other roles
      suggestions = [
        "What are common health concerns?",
        "How does the platform work?",
        "Tell me about preventive health",
        "What are signs of serious illness?",
        "How to maintain good health?",
        "When to seek emergency care?",
        "Explain medication safety",
        "What is telemedicine?"
      ];
    }

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    service: 'MedBot AI Assistant',
    model: 'Gemini 2.5 Flash'
  });
});

module.exports = router;
