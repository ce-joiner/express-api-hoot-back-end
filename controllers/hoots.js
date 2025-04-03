const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();


// CREATE/POST HOOTS 

router.post("/", verifyToken, async (req, res) => {
    try {
      // Add the authenticated user's ID as the author of the hoot
      req.body.author = req.user._id;
      
      // Create a new Hoot document in the database using the request body data
      const hoot = await Hoot.create(req.body);
      
      // Replace the author ID with the full user object in the response
      // This provides more user details in the API response
      hoot._doc.author = req.user;
      
      // Send a successful response with status code 201 (Created)
      // Include the newly created hoot object in the response
      res.status(201).json(hoot);
    } catch (err) {
      // If an error occurs during hoot creation:
      // Send an error response with status code 500 (Internal Server Error)
      // Include the error message in the response
      res.status(500).json({ err: err.message });
    }
  });


// INDEX / GET HOOTS

router.get("/", verifyToken, async (req, res) => {
    try {
      // Query the database for all hoots
      // .find({}) with empty criteria returns all documents in the collection
      const hoots = await Hoot.find({})
        // Populate the author field with the full user document instead of just the ID
        // This replaces author references with complete user objects
        .populate("author")
        // Sort the results by createdAt field in descending order
        // This returns the newest hoots first
        .sort({ createdAt: "desc" });
      
      // Send a successful response with status code 200 (OK)
      // Include the array of hoots in the response
      res.status(200).json(hoots);
    } catch (err) {
      // If an error occurs during the database query:
      // Send an error response with status code 500 (Internal Server Error)
      // Include the error message in the response
      res.status(500).json({ err: err.message });
    }
  });


// SHOW / GET HOOTS/:HOOTID 

// Define a GET route handler for a specific hoot using a route parameter ":hootId"
router.get("/:hootId", verifyToken, async (req, res) => {
    try {
      // Query the database to find a single hoot by its ID
      // req.params.hootId retrieves the ID from the URL parameter
      const hoot = await Hoot.findById(req.params.hootId)
        // Populate the author field with the full user document
        // This replaces the author ID with the complete user object
        .populate("author");
      
      // Send a successful response with status code 200 (OK)
      // Include the found hoot object in the response
      res.status(200).json(hoot);
    } catch (err) {
      // If an error occurs during the database query:
      // Send an error response with status code 500 (Internal Server Error)
      // Include the error message in the response
      res.status(500).json({ err: err.message });
    }
   });


// UPDATE / PUT /hoots/:hootId 

// Define a PUT route handler for updating a specific hoot using route parameter ":hootId"
router.put("/:hootId", verifyToken, async (req, res) => {
    try {
      // Find the hoot by ID to check ownership before updating
      // This is a security step to verify the user has permission to edit
      const hoot = await Hoot.findById(req.params.hootId);
   
      // Check if the authenticated user is the author of the hoot
      // The equals() method safely compares MongoDB ObjectIDs
      if (!hoot.author.equals(req.user._id)) {
        // If user is not the author, return a 403 Forbidden status
        // This prevents unauthorized users from modifying other users' hoots
        return res.status(403).send("You're not allowed to do that!");
      }
   
      // Update the hoot document with the data from request body
      // The {new: true} option returns the updated document instead of the original
      const updatedHoot = await Hoot.findByIdAndUpdate(
        req.params.hootId,
        req.body,
        { new: true }
      );
   
      // Replace the author ID with the full user object in the response
      // This provides more detailed user information in the API response
      updatedHoot._doc.author = req.user;
   
      // Send a successful response with status code 200 (OK)
      // Include the updated hoot object in the response
      res.status(200).json(updatedHoot);
    } catch (err) {
      // If an error occurs during the process:
      // Send an error response with status code 500 (Internal Server Error)
      // Include the error message in the response
      res.status(500).json({ err: err.message });
    }
   });


// DELETE /hoots/:hootId 

// Define a DELETE route handler for removing a specific hoot using route parameter ":hootId"
router.delete("/:hootId", verifyToken, async (req, res) => {
    try {
      // Find the hoot by ID to verify ownership before deletion
      // This is a security check to ensure user has permission to delete
      const hoot = await Hoot.findById(req.params.hootId);
   
      // Check if the authenticated user is the author of the hoot
      // The equals() method safely compares MongoDB ObjectIDs
      if (!hoot.author.equals(req.user._id)) {
        // If user is not the author, return a 403 Forbidden status
        // This prevents unauthorized users from deleting others' hoots
        return res.status(403).send("You're not allowed to do that!");
      }
   
      // Delete the hoot document from the database
      // findByIdAndDelete removes the document and returns the deleted document
      const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
   
      // Send a successful response with status code 200 (OK)
      // Include the deleted hoot object in the response for confirmation
      res.status(200).json(deletedHoot);
    } catch (err) {
      // If an error occurs during the process:
      // Send an error response with status code 500 (Internal Server Error)
      // Include the error message in the response
      res.status(500).json({ err: err.message });
    }
   });


//  hoot.author contains the ObjectId of the user who created the hoot


module.exports = router;
