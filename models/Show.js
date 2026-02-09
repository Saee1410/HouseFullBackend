const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    slot: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening'],
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    tiketPrice: {
        type: Number,
        required: true,
    },

    seats: [{
         seatNumber: String,
           isBooked: {
            type: Boolean,
            default: false
           },
           bookedBy: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            default: null
           }
    }]
        
});

module.exports = mongoose.model('Show', showSchema);    