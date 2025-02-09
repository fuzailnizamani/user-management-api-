require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');

// Connect to MongoDB
console.log("Database URI:", process.env.DATABASE_URI);
connectDB();

const PORT = process.env.PORT || 3500;

// cutom middleeware logger
app.use(logger);

// this will throw a error for testing
app.use('/test', require('./Routes/errorRoute'));

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// bulti-in middleware to handle urlencoded data
// in other words, from data:
// 'content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

//Serve static files
app.use(express.static(path.join(__dirname, '/public')));

// Routes
app.use('/', require('./Routes/root'));
app.use('/register', require('./Routes/register'));
app.use('/auth', require('./Routes/auth'));
app.use('/refresh', require('./Routes/refresh'));
app.use('/logout', require('./Routes/logout'));

app.use(verifyJWT);
app.use('/employees', require('./Routes/api/employees'));
app.use('/user', require('./Routes/api/users'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepted('json')) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connented to MongoDB');
    app.listen(PORT, (() => console.log(`Server running on port ${PORT}`)));
});