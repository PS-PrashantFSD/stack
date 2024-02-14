const userDetailsController = require('express').Router();
const Details = require("../model/UserDetailsModel");
const verifyToken = require('../middleware/verifyToken');
const upload = require('../middleware/multerConfig'); // Assuming multerConfig.js is in the config directory
const fs = require('fs');


// Get user details
userDetailsController.get('/view/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const details = await Details.findOne({ userId }).populate('userId', '-password');

        if (!details) {
            return res.status(404).json({ message: "User details not found." });
        }

        // Assuming your server is set up to serve static files from the 'public' directory
        // Adjust the host, port, and paths as necessary based on your actual server setup
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const image = details.image ? `${baseUrl}/images/${details.image}` : null;
        const video = details.video ? `${baseUrl}/video/${details.video}` : null;

        // Return the details along with the accessible URLs for the image and video
        return res.status(200).json({
            ...details.toObject(),
            image,
            video,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Add new details with file upload
userDetailsController.post('/add', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const imagePath = req.files['image'] ? req.files['image'][0].path.replace('public/', '') : null;
        const videoPath = req.files['video'] ? req.files['video'][0].path.replace('public/', '') : null;

        const details = await Details.create({
            ...req.body,
            userId: req.user.id,
            image: imagePath,
            video: videoPath
        });
        return res.status(201).json(details);
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

// Update existing details with file upload
userDetailsController.put('/updatedetails/:id', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const details = await Details.findById(req.params.id);
        if (!details) {
            return res.status(404).json("Details not found");
        }

        if (details.userId.toString() !== req.user.id) {
            return res.status(403).json("You can only update your own details");
        }

        // Delete old files if new ones are uploaded
        const updates = {};
        if (req.files['image']) {
            if (details.image && fs.existsSync(`public/${details.image}`)) {
                fs.unlinkSync(`public/${details.image}`);
            }
            updates.image = req.files['image'][0].path.replace('public/', '');
        }
        if (req.files['video']) {
            if (details.video && fs.existsSync(`public/${details.video}`)) {
                fs.unlinkSync(`public/${details.video}`);
            }
            updates.video = req.files['video'][0].path.replace('public/', '');
        }

        const updatedDetails = await Details.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });

        return res.status(200).json(updatedDetails);
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

module.exports = userDetailsController;
