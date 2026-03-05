const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    title: String,
    poster: String,
    backdrop: String,
    description: String,
    rating: Number,
    category: { type: String, default: 'Movie'},
    releaseDate: String,
    theaters: [String]
});




module.exports = mongoose.model('Movie', movieSchema);