const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Get the book list available in the shop (using Axios + async/await)
public_users.get('/', async function (req, res) {
    try {
        // Call your own API endpoint (adjust port if needed)
        const response = await axios.get('http://localhost:5000/');
        
        // Return only the data part
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN (using Axios + async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching book details",
            error: error.message
        });
    }
});
  
// Get book details based on author (using Axios + async/await)
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        const response = await axios.get(`http://localhost:5000/author/${author}`);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books by author",
            error: error.message
        });
    }
});

// Get book details based on title (using Axios + async/await)
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;

        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books by title",
            error: error.message
        });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const number = req.params.isbn;
    if (parseInt(number) < 1 || parseInt(number) > 10) {
      return res.status(401).json({ message: "Such book does not exist."})
    }
    return res.send(JSON.stringify(books[number].reviews));
});

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

module.exports.general = public_users;
