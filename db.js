const mongoose = require('mongoose');
require('dotenv').config();

// Define mongoDB URL
const mongoURL = process.env.DB_LOCAL;
// mongoose.set('debug', true);


// // online hosted db
// const mongoURL = process.env.DB_URL;

// // Setup mongoDB connection for online db
// mongoose.connect(mongoURL, {
//     tls: true,
//     autoSelectFamily: false,
//     serverSelectionTimeoutMS: 3000,
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     ssl: true
// });

mongoose.connect(mongoURL,{});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('MongoDB connected');
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
})

db.on('error', () => {
    console.log('MongoDB error');
})

// Export DB connection
module.exports = db;




