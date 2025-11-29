# Chatbot Testing Guide - Enhanced Features

## Quick Test Script

Use these test queries to verify the chatbot enhancements are working correctly.

---

## 🕐 Provider Timings Tests

### Test 1: Direct Timing Query
```
User: What are the timings for uzziel jameel?
Expected: Should list business hours by day
```

### Test 2: General Availability
```
User: When are clinics open?
Expected: Should provide overview of clinic hours
```

### Test 3: Weekend Hours
```
User: Do you have clinics open on Sunday?
Expected: Should list providers open on Sunday or mention none available
```

### Test 4: Specific Day
```
User: What time does aman sheikh open on Monday?
Expected: Should give Monday hours specifically
```

### Test 5: Late Hours
```
User: Are there any clinics open after 7 PM?
Expected: Should check and respond based on actual hours
```

---

## 🐾 Animal Type Clarification Tests

### Test 1: Grooming Without Animal Type
```
User: I need grooming services
Expected: "I'd be happy to help! Is this for a dog, cat, or another type of animal?"
```

### Test 2: Veterinary Without Animal Type
```
User: What veterinary services do you have?
Expected: Should ask about animal type
```

### Test 3: Training Without Animal Type
```
User: How much does training cost?
Expected: Should ask about animal type first
```

### Test 4: Service With Animal Type Included
```
User: I need grooming for my dog
Expected: Should NOT ask again, proceed with dog grooming options
```

### Test 5: Follow-up After Clarification
```
User: Tell me about grooming
Bot: [Asks about animal type]
User: It's for my cat
Expected: Should provide cat grooming services
```

### Test 6: Multiple Pet Scenario
```
User: I have both a dog and a cat. What services do you offer?
Expected: Should handle both types gracefully
```

---

## 🔄 Combined Feature Tests

### Test 1: Service + Timing
```
User: When does uzziel jameel offer grooming services?
Expected: Should mention grooming availability AND business hours
```

### Test 2: Provider + Animal Type
```
User: What services does aman sheikh provide?
Expected: May ask about animal type to personalize response
```

### Test 3: Complex Query
```
User: I need a vet for my dog. Who's available on weekends?
Expected: Should filter for weekend availability + dog services
```

---

## ✅ Verification Checklist

### Provider Timings Feature
- [ ] Bot provides business hours when asked
- [ ] Hours are formatted correctly (day: time - time)
- [ ] Closed days are clearly marked
- [ ] Multiple providers' hours can be compared
- [ ] "Not specified" message appears for providers without hours

### Animal Type Feature
- [ ] Bot asks about animal type when appropriate
- [ ] Question is phrased naturally
- [ ] Bot doesn't ask if animal type already mentioned
- [ ] Bot remembers animal type in same conversation
- [ ] Works for common animals (dog, cat)
- [ ] Handles uncommon animals gracefully

### General Chatbot Function
- [ ] Chat window opens/closes properly
- [ ] Messages display correctly
- [ ] Loading indicator shows while processing
- [ ] Responses are relevant and accurate
- [ ] No console errors appear
- [ ] Session persists across page navigation

---

## 🐛 Common Issues & Solutions

### Issue: Bot doesn't ask about animal type
**Solution**: Clear browser cache and reload. Check that the latest `generate-ai-response.js` is deployed.

### Issue: Business hours not showing
**Solution**: Verify providers have `businessHours` field in Firestore. Check browser console for data fetch errors.

### Issue: Bot gives generic answers
**Solution**: Check that Firestore data is being fetched and passed to AI. Look for "Fetched X services and Y providers" in console.

### Issue: Chat doesn't remember context
**Solution**: Verify sessionId is consistent. Check that chat history is being maintained.

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Provider Timings Tests:
[ ] Test 1: Direct Timing Query - PASS / FAIL
[ ] Test 2: General Availability - PASS / FAIL
[ ] Test 3: Weekend Hours - PASS / FAIL
[ ] Test 4: Specific Day - PASS / FAIL
[ ] Test 5: Late Hours - PASS / FAIL

Animal Type Tests:
[ ] Test 1: Grooming Without Type - PASS / FAIL
[ ] Test 2: Veterinary Without Type - PASS / FAIL
[ ] Test 3: Training Without Type - PASS / FAIL
[ ] Test 4: With Type Included - PASS / FAIL
[ ] Test 5: Follow-up - PASS / FAIL
[ ] Test 6: Multiple Pets - PASS / FAIL

Combined Tests:
[ ] Test 1: Service + Timing - PASS / FAIL
[ ] Test 2: Provider + Animal Type - PASS / FAIL
[ ] Test 3: Complex Query - PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🚀 Testing in Production

1. **Open the deployed site** (e.g., https://fyppp-5b4f0.web.app)
2. **Login as a pet owner** (chatbot only shows for pet owners)
3. **Click the chatbot button** (bottom right corner)
4. **Run through test queries** above
5. **Document any issues** found

---

## 📝 Example Perfect Conversation

```
User: Hi
Bot: Hi! Ask me anything about your pet care needs.

User: I need grooming services
Bot: I'd be happy to help! Is this for a dog, cat, or another type of animal?

User: It's for my dog
Bot: Great! We have several dog grooming services available:
     1. Bath and Brush by Pawsome Groomers - ₨1500
     2. Full Grooming Package by Pet Paradise - ₨2500
     Would you like to know more about any of these?

User: When is Pawsome Groomers open?
Bot: Pawsome Groomers is open:
     - Monday to Friday: 9:00 AM to 5:00 PM
     - Saturday: 10:00 AM to 3:00 PM
     - Closed on Sundays
     You can reach them at [phone number].

User: Perfect, thank you!
Bot: You're welcome! Feel free to ask if you need anything else for your dog.
```

---

## 🎯 Success Criteria

The chatbot enhancement is successful if:

✅ **Accuracy**: Timings and service information match Firestore data  
✅ **User Experience**: Conversation flows naturally  
✅ **Completeness**: All requested features work as designed  
✅ **Reliability**: No crashes or errors during normal use  
✅ **Performance**: Responses arrive within 3-5 seconds  

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Review Vercel function logs
3. Verify Firestore data structure
4. Check API key configuration
5. Review the main documentation: `CHATBOT_ENHANCED_FEATURES.md`

---

**Happy Testing! 🎉**


