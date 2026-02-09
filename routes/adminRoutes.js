const express = require('express');
const router = express.Router();
const LiveShow = require('../models/LiveShow');


//this is for show adding by admin
router.post('/add-show', async (req, res) => {
    try{
        const {title, category, artist, price, date, time, venue, posterUrl, trailerId, videoUrl} = req.body;

        const newShow = new LiveShow({
            title, category, artist, price, date, time, venue, posterUrl, trailerId, videoUrl
        });
        
        await newShow.save();
        res.status(201).json({ success: true, message: "Show added successfully!"});
    }catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

//this is for getting all shows
router.get('/get-shows', async (req, res) => {
    try {
        const shows = await LiveShow.find({});
        res.status(200).json(shows);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message});
    }
});

//update
router.put('/update-show/:id', async (req,res) =>{
    try {
        const { id } = req.params;
        const updateedData = req.body;

        const updatedShow = await LiveShow.findByIdAndUpdate(
            id,
            { $set: updateedData},
            { new: true}
        );

        if(!updatedShow) {
            return res.status(404).json({ success: false, error: "Show not found"});
        }
        res.status(200).json({ success: true, message: "Show updated successfully!", show: updatedShow });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });     
    }
});

//delete

router.delete('/delete-show/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedShow = await LiveShow.findByIdAndDelete(id);

        if (!deletedShow) {
            return res.status(404).json({ success: false, error: "Show not found" });
        }
        res.status(200).json({ success: true, message: "Show deleted successfully!" });
    } catch (error) {
        // Backend madhun error message proper pathva
        res.status(400).json({ success: false, error: error.message }); 
    }
});
module.exports = router;