const Show = require('../models/Show');
const sendTicketEmail = require('../utils/sendTicketEmail'); // १. ईमेल फंक्शन इम्पोर्ट करा

exports.confirmBooking = async (req, res) => {
    try {
        const { showId, selectedSeats, userEmail, movieName, showTime, totalAmount } = req.body; // २. जास्तीचा डेटा घ्या

        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show sapdla nahi!" });

        const isAlreadyBooked = show.seats.some(seat => 
            selectedSeats.includes(seat.seatNumber) && seat.isBooked
        );

        if (isAlreadyBooked) {
            return res.status(400).json({ message: "Kahi seats aadhich book jhalya aahet!" });
        }

        show.seats.forEach(seat => {
            if (selectedSeats.includes(seat.seatNumber)) {
                seat.isBooked = true; 
            }
        });

        await show.save();

        // ३. ईमेल पाठवण्याचे लॉजिक (Await वापरणे गरजेचे)
        // लक्षात ठेवा: frontend कडून email आणि details पाठवावे लागतील
        if (userEmail) {
            const ticketDetails = {
                movieName: movieName || "Movie Name Not Found",
                showTime: showTime || "Time Not Specified",
                seats: selectedSeats,
                totalAmount: totalAmount || 0
            };
            
            await sendTicketEmail(userEmail, ticketDetails); 
            console.log("Email sent to:", userEmail);
        }

        res.status(200).json({ 
            success: true, 
            message: "Seats booked & Confirmation email sent!", 
        });

    } catch (error) {
        console.error("Booking/Email Error:", error);
        res.status(500).json({ error: error.message });
    }
};


// const Show = require('../models/Show');

// exports.confirmBooking = async (req, res) => {
//     try {
//         const { showId, selectedSeats } = req.body;

//         // 1. Show shodha DB madhe
//         const show = await Show.findById(showId);
//         if (!show) return res.status(404).json({ message: "Show sapdla nahi!" });

//         // 2. Check (Double check)
//         const isAlreadyBooked = show.seats.some(seat => 
//             selectedSeats.includes(seat.seatNumber) && seat.isBooked
//         );

//         if (isAlreadyBooked) {
//             return res.status(400).json({ message: "Kahi seats aadhich book jhalya aahet!" });
//         }

//         // 3. Status update kara 
//         show.seats.forEach(seat => {
//             if (selectedSeats.includes(seat.seatNumber)) {
//                 seat.isBooked = true; // Payment success nantar he permanent hoil
//             }
//         });

//         await show.save();

//         res.status(200).json({ 
//             success: true, 
//             message: "Seats temporary book go to payment!", 
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };