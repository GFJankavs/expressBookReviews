const express = require('express');
const axios = require('axios');

// Local dataset of books (used for direct lookup in one route)
let books = require("./booksdb.js");

// Imported authentication utilities (not heavily used in this file yet)
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

// Router instance for public API endpoints
const public_users = express.Router();

/**
 * Utility function to check whether a username already exists
 * This prevents duplicate registrations in the users array
 */
const doesExist = (username) => {
    // Using .some() for better readability and early exit performance
    return users.some(user => user.username === username);
};


/**
 * GET /
 * Returns the full list of books available in the system
 * This uses Axios to simulate a real API call instead of direct access
 */
public_users.get('/', async function (req, res) {
    try {
        // Internal API call to retrieve all books
        const response = await axios.get('http://localhost:5000/');

        // Send only the data payload back to the client
        return res.status(200).json(response.data);

    } catch (error) {
        // Handles network/server errors gracefully
        return res.status(500).json({
            message: "Error fetching books list",
            error: error.message
        });
    }
});


/**
 * GET /isbn/:isbn
 * Retrieves details of a book based on its ISBN identifier
 * Uses Axios instead of direct object lookup to follow async pattern
 */
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        // Call the internal API endpoint for ISBN lookup
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

        return res.status(200).json(response.data);

    } catch (error) {
        // Handles cases like invalid ISBN or server issues
        return res.status(500).json({
            message: "Error fetching book by ISBN",
            error: error.message
        });
    }
});


/**
 * GET /author/:author
 * Returns all books written by a specific author
 * Demonstrates handling route parameters + encoded URLs for safety
 */
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        // encodeURIComponent ensures special characters/spaces don't break the URL
        const response = await axios.get(
            `http://localhost:5000/author/${encodeURIComponent(author)}`
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books by author",
            error: error.message
        });
    }
});


/**
 * GET /title/:title
 * Retrieves books matching exact or partial title
 * Delegates filtering logic to backend API
 */
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        // API handles matching logic (exact or partial depending on backend)
        const response = await axios.get(
            `http://localhost:5000/title/${encodeURIComponent(title)}`
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books by title",
            error: error.message
        });
    }
});


/**
 * GET /review/:isbn
 * Returns reviews for a specific book
 * This route directly accesses local dataset (no Axios needed)
 */
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Basic validation to prevent invalid index access
    if (parseInt(isbn) < 1 || parseInt(isbn) > 10) {
        return res.status(404).json({
            message: "Such book does not exist."
        });
    }

    // Return review object for the selected book
    return res.json(books[isbn].reviews);
});


/**
 * POST /register
 * Registers a new user in the system
 * Ensures no duplicate usernames exist
 */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Validate input completeness
    if (!username || !password) {
        return res.status(400).json({
            message: "Unable to register user."
        });
    }

    // Prevent duplicate user registration
    if (doesExist(username)) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    // Store new user in memory (note: not persistent storage)
    users.push({ username, password });

    return res.status(201).json({
        message: "User successfully registered. Now you can login"
    });
});


module.exports.general = public_users;
