const Show = require('../models/Show');

exports.confirmBooking = async (req, res) => {
    try {
        const { showId, selectedSeats } = req.body;

        // 1. Show shodha DB madhe
        const show = await Show.findById(showId);
        if (!show) return res.status(404).json({ message: "Show sapdla nahi!" });

        // 2. Check (Double check)
        const isAlreadyBooked = show.seats.some(seat => 
            selectedSeats.includes(seat.seatNumber) && seat.isBooked
        );

        if (isAlreadyBooked) {
            return res.status(400).json({ message: "Kahi seats aadhich book jhalya aahet!" });
        }

        // 3. Status update kara 
        show.seats.forEach(seat => {
            if (selectedSeats.includes(seat.seatNumber)) {
                seat.isBooked = true; // Payment success nantar he permanent hoil
            }
        });

        await show.save();

        res.status(200).json({ 
            success: true, 
            message: "Seats temporary book go to payment!", 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};