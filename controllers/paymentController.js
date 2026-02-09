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
            console.error("❌ ERROR: RAZORPAY_KEY_SECRET is not defined in .env");
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
            console.error("❌ Signature Mismatch! Check if Secret Key is correct.");
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












// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const sendTicketEmail = require('../utils/sendEmail');

// const razorpayInstanse = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// exports.createOrder = async (req, res) => {
//     try {
//         const option = {
//             amount: Math.round(req.body.amount * 100), // Amount lagesach round kar
//             currency: "INR",
//             receipt: `rcpt_${Date.now()}`,
//         };

//         const order = await razorpayInstanse.orders.create(option);
//         res.status(200).json({ success: true, order });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// exports.verifyPayment = async (req, res) => {
//     try {
//         const { 
//             razorpay_order_id, 
//             razorpay_payment_id, 
//             razorpay_signature,
//             email, 
//             movieName, 
//             showTime, 
//             seats, 
//             totalAmount 
//         } = req.body;

//         if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//             return res.status(400).json({ success: false, message: "Payment details missing!" });
//         }

//         const secret = process.env.RAZORPAY_KEY_SECRET.trim();
        
//         // --- SIGNATURE GENERATION ---
//         const generated_signature = crypto
//             .createHmac('sha256', secret)
//             .update(razorpay_order_id + "|" + razorpay_payment_id)
//             .digest('hex');

//         // --- COMPARISON ---
//         if (generated_signature === razorpay_signature) {
//             console.log("✅ Signature Matched!");

//             // Email async pathva जेणेकरून response la ushir honar nahi
//             sendTicketEmail(email, { 
//                 movieName,
//                 showTime, 
//                 seats, 
//                 totalAmount,
//                 snacks: req.body.snacks || [],
//                 paymentId: razorpay_payment_id 
//             })
//             .then(() => console.log("📧 Email Sent!"))
//             .catch(err => console.log("📧 Email Error:", err.message));

//             return res.status(200).json({ 
//                 success: true, 
//                 message: "Payment Verified & Ticket Sent!" 
//             });

//         } else {
//             // DEBUGGING: Terminal madhe check kara kay mismatch hotay
//             console.log("❌ Signature Mismatch!");
//             console.log("Secret used (trimmed):", secret);
//             console.log("Generated:", generated_signature);
//             console.log("Received from Frontend:", razorpay_signature);

//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Invalid Payment Signature" 
//             });
//         }

//     } catch (error) {
//         console.error("Internal Error:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const sendTicketEmail = require('../utils/sendEmail');


// // Initialize Razorpay instance
// const razorpayInstanse = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Create Order
// exports.createOrder = async (req, res) => {
//    try {
//     const option = {
//         amount: req.body.amount * 100,
//         currency: "INR",
//         receipt: `rcpt_${Date.now()}`,
//     };

//     const order = await razorpayInstanse.orders.create(option);
//     res.status(200).json({ success: true, order });
//    } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//    }
// };


// exports.verifyPayment = async (req, res) => {
//     try {
//         // 1. Frontend kadhun alela sagla data gheṇe
//         const { 
//             razorpay_order_id, 
//             razorpay_payment_id, 
//             razorpay_signature,
//             email, 
//             movieName, 
//             showTime, 
//             seats, 
//             totalAmount 
//         } = req.body;

//         // Validation: Sagla data milala ka?
//         if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//             return res.status(400).json({ success: false, message: "Payment details missing!" });
//         }

//         // 2. Signature Generate Karne
//         const secret = process.env.RAZORPAY_KEY_SECRET.trim();

//         const hmac = crypto.createHmac("sha256", secret);

//         hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//         const generated_signature = hmac.digest("hex");
//         const body = razorpay_order_id + "|" + razorpay_payment_id;

//         const expectedSignature = crypto
//             .createHmac('sha256', secret)
//             .update(body.toString())
//             .digest('hex');

//         // 3. Comparison Logic
//         const isValid = expectedSignature.toString().trim() === razorpay_signature.toString().trim();

//         if (isValid) {
//             console.log("✅ Payment Verified!");

//             // 4. Email Pathvne (Ithe logic call kara)
//             try {
//                 await sendTicketEmail(email, { 
//                     movieName: movieName,
//                     showTime, 
//                     seats, 
//                     totalAmount,
//                     snacks: req.body.snacks || [],
//                     paymentId: razorpay_payment_id 
//                 });
//                 console.log("📧 Email Sent Successfully!");
//             } catch (emailErr) {
//                 console.log(" Payment ok pan Email failed:", emailErr);
//                 // Email fail jhala tari payment success dakhvne garjeche aahe
//             }

//             // 5. Success Response
//             return res.status(200).json({ 
//                 success: true, 
//                 message: "Payment Verified & Ticket Sent!" 
//             });

//         } else {
//             console.log("Signature Mismatch!");
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Invalid Payment Signature" 
//             });
//         }

//     } catch (error) {
//         console.error("Internal Error:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


