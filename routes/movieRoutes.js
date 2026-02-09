const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const bookingController = require('../controllers/bookingController');


router.post('/sync-from-frontend', movieController.syncFromFrontend);


router.get('/all-movies', movieController.getAllMovies);
router.get('/details/:tmdbId', movieController.getMovieByTmdbId);


router.get('/get-show/:tmdbId/:time', async (req, res) => {
    try {
        const { tmdbId, time } = req.params;
        
        let show = await Show.findOne({
            tmdbId: Number(tmdbId),
            time
        });

        if (!show) {
            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            const seats = [];

            rows.forEach(r => {
                for (let i = 1; i <= 10; i++) {
                    seats.push({ seatNumber: `${r}${i}`, isBooked: false, bookedBy: null });
                }
            });

            // Determine slot based on time
            const getSlot = (timeStr) => {
                const hour = parseInt(timeStr.split(':')[0]);
                if (hour < 12) return 'Morning';
                if (hour < 17) return 'Afternoon';
                return 'Evening';
            };

            show = new Show({
                tmdbId: Number(tmdbId),
                time,
                slot: getSlot(time),
                seats,
                tiketPrice: 250,
                city: "Nashik",
                date: new Date()
            });

            await show.save();
            console.log("✅ New show created with seats!");
        }

        res.json(show);
    } catch (err) {
        console.error("Get Show Error:", err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/book-seats', async (req, res) => {
    try {
        const { showId, selectedSeats, userId } = req.body;
        const show = await Show.findById(showId);

        if (!show) {
            return res.status(404).json({ message: "Show not found" });
        }

        show.seats.forEach(seat => {
            if (selectedSeats.includes(seat.seatNumber)) {
                seat.isBooked = true;
                seat.bookedBy = userId;
            }
        });

        await show.save();
        res.status(200).json({ message: "Booking Successful!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//  3. ITHE PASTE KARA (module.exports chya agadi)
router.post('/confirm-booking', bookingController.confirmBooking);
router.post('/confirm-booking', async (req, res) => {
    try {
        const { showId, selectedSeats } = req.body;
        const show = await Show.findById(showId);

        if (!show) return res.status(404).json({ message: "Show not found" });

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
        res.status(200).json({ 
            success: true, 
            message: "Seats locked successfully!" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

