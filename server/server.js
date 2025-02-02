const express = require('express');
require('dotenv').config();

const app = express();

const cors = require('cors');

app.use(express.urlencoded({ extended: true }));

const dbConfig = require('./db');

const roomsRoute = require('./routes/roomsRoute');
const usersRoute = require('./routes/usersRoute');
const bookingsRoute = require('./routes/bookingsRoute');

app.use(express.json());

app.use(cors());

app.use('/api/rooms', roomsRoute);
app.use('/api/users', usersRoute);
app.use('/api/bookings', bookingsRoute);


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port} 🔥`));

module.export = app;