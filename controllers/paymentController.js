const Razorpay = require('razorpay');
const crypto = require('crypto');
const sendTicketEmail = require('../utils/sendEmail');

// Initialize Razorpay
const razorpayInstanse = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

        const option = {
            amount: Math.round(Number(amount) * 100), // Convert to paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpayInstanse.orders.create(option);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            email, 
            movieName, 
            showTime, 
            seats, 
            totalAmount 
        } = req.body;

        // 1. Basic Validation
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment parameters missing!" });
        }

        // 2. Secret Check (Crucial for Mismatch issue)
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error(" ERROR: RAZORPAY_KEY_SECRET is not defined in .env");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        // 3. Signature Verification Logic
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret.trim())
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log("✅ Payment Verified Successfully!");

            // 4. Async Email Trigger (Don't wait for email to respond to user)
            sendTicketEmail(email, { 
                movieName,
                showTime, 
                seats: Array.isArray(seats) ? seats : [seats], 
                totalAmount,
                paymentId: razorpay_payment_id 
            })
            .then(() => console.log("📧 Ticket email sent to:", email))
            .catch(err => console.error("📧 Email failed but payment was OK:", err.message));

            return res.status(200).json({ 
                success: true, 
                message: "Payment Verified & Ticket Sent!" 
            });

        } else {
            console.error(" Signature Mismatch! Check if Secret Key is correct.");
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Payment Signature" 
            });
        }

    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};