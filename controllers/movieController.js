const Movie = require('../models/Movie');
const axios = require('axios');

// TMDB Settings (.env madhun yetat)
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// 1. Helper Function: TMDB data la aaplya database format madhe basvne
const mapTMDBMovieToSchema = (movie) => ({
    tmdbId: movie.id.toString(),
    title: movie.title,
    poster: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
    backdrop: movie.backdrop_path ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}` : null,
    description: movie.overview,
    rating: movie.vote_average,
    releaseDate: movie.release_date,
    category: "Movie",
    theaters: ["Cineplex Nashik"] 
});

// 2. MAIN SYNC: Frontend kadhun aalela data DB madhe store karne
exports.syncFromFrontend = async (req, res) => {
    try {
        const { movies } = req.body;

        if (!movies || movies.length === 0) {
            return res.status(400).json({ success: false, message: "No movies provided from frontend" });
        }

        const savedMovies = [];

        for (const movie of movies) {
            const movieData = mapTMDBMovieToSchema(movie);

            // UPSERT Logic: Movie asel tar update, nasel tar navin insert
            const updatedMovie = await Movie.findOneAndUpdate(
                { tmdbId: movieData.tmdbId }, 
                movieData,
                { upsert: true, new: true }
            );
            savedMovies.push(updatedMovie.title);
        }

        console.log(`✅ ${savedMovies.length} Movies synced to MongoDB successfully!`);
        res.status(200).json({ 
            success: true, 
            message: "Database Updated Successfully!", 
            count: savedMovies.length 
        });
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. GET ALL: Database madhun sarya movies Home page sathi aanne
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch movies", error: error.message });
    }
};

// 4. GET SINGLE: ID pramane movie chi details ghene
exports.getMovieByTmdbId = async (req, res) => {
    try {
        const movie = await Movie.findOne({ tmdbId: req.params.tmdbId });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found in database" });
        }
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



