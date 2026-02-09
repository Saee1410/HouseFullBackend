const mongoose = require('mongoose');

const LiveShowSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String,
    },
    trailerId: {
        type: String
    },
    totalSeats: {
        type: Number,
        default: 50
    },
    videoUrl: {
        type: String,
        default: ""
    },

});

module.exports = mongoose.model('LiveShow', LiveShowSchema); 