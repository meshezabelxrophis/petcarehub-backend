#!/bin/bash

echo "🧪 Stripe Payment Testing Script"
echo "================================"

# Check if server is running
if pgrep -f "node.*index.js" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with 'npm run dev'"
    exit 1
fi

# Check database state
echo ""
echo "📊 Current Confirmed Bookings (Ready for Payment):"
sqlite3 database.sqlite "SELECT id, service_id, status, payment_status FROM bookings WHERE status = 'confirmed';"

echo ""
echo "💳 How to Test Payments:"
echo "1. Go to http://localhost:3000/my-bookings"
echo "2. Find a booking with status 'confirmed'"
echo "3. Click the 'Pay $XX.XX' button"
echo "4. Use test card: 4242 4242 4242 4242"
echo "5. Expiry: 12/25 (any future date)"
echo "6. CVC: 123 (any 3 digits)"
echo "7. Complete payment"
echo ""

echo "🔍 After payment, run this script again to verify:"
echo "./test_payment.sh"
