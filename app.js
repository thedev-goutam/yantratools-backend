const express = require('express');
const mongoose = require('mongoose');
const app = express();
const routes = require('./routes/routes');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

const allowedOrigins = [
  'http://localhost:4200',
  'http://31.97.207.9:4000',
  'https://yantratools.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, 'public')));

// MongoDB Connection
// const username = 'yantra-user';
// const password = 'YantraDb_54321';
// const host = '31.97.207.9';
// const port = '27017';
// const dbName = 'yantra-tools-live';
const username = 'yantra-user';
const password = 'YantraDb_54321';
const host = 'localhost';
const port = '27017';
const dbName = 'yantratools';
const uri = `mongodb+srv://${username}:${encodeURIComponent(password)}@cluster0.3nizni8.mongodb.net/${dbName}?retryWrites=true&w=majority`;
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Database connected');

    // Start HTTP Server on localhost
    app.listen(3000, () => {
      console.log('🚀 Server is running at http://localhost:3000');
    });
  })
  .catch((error) => {
    console.log('❌ Database connection failed');
    console.error(error);
  });

// Routes
app.use('/api/v1', routes);
