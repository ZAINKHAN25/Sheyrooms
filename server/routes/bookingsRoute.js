const express = require('express')
const router = express.Router()
const Booking = require('../models/booking')
const Room = require('../models/room')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const stripe = require('stripe')(process.env.STRIPE_SERVER_URL)

router.post('/bookroom', async (req, res) => {
    const { room, checkIn, checkOut, amount, days, userId, token } = req.body

    try {
        const customer = await stripe.customers.create(
            { email: token.email, source: token.id }
        )

        const payment = await stripe.charges.create(
            {
                amount: amount * 100,
                customer: customer.id,
                currency: 'BDT',
                receipt_email: token.email
            }, { idempotencyKey: uuidv4() }
        )

        if (payment) {
            const newBooking = new Booking({
                room: room.name, roomId: room._id, userId,
                checkIn: moment(checkIn).format('DD-MM-YYYY'),
                checkOut: moment(checkOut).format('DD-MM-YYYY'),
                amount, days, txnId: '1234'
            })
            const booking = await newBooking.save()
            const temp = await Room.findOne({ _id: room._id })
            temp.currentBookings.push({
                bookingId: booking._id, userId: userId,
                checkIn: moment(checkIn).format('DD-MM-YYYY'),
                checkOut: moment(checkOut).format('DD-MM-YYYY'),
                status: booking.status
            })
            await temp.save()
        }
        res.send('Payment Successfull!, Your Romm is Booked!')
    } catch (error) { console.log(error, "==> Errr") }
})

router.post('/getbookingsbyuserid', async (req, res) => {
    const userId = req.body.userId

    try {
        const bookings = await Booking.find({ userId: userId })
        res.send(bookings)
    } catch (error) { console.log(error) }
})

router.post('/cancelbooking', async (req, res) => {
    const { bookingId, roomId } = req.body

    try {
        const bookingItem = await Booking.findOne({ _id: bookingId })
        bookingItem.status = 'cancelled'
        await bookingItem.save()
        const room = await Room.findOne({ _id: roomId })
        const bookings = room.currentBookings
        const temp = bookings.filter(booking => booking.bookingId.toString() !== bookingId)
        room.currentBookings = temp
        await room.save()
        res.send('Your booking cancelled successfully!')
    } catch (error) { console.log(error) }
})

router.get('/getallbookings', async (req, res) => {
    try {
        const bookings = await Booking.find()
        res.send(bookings)
    } catch (error) {console.log(error)}
})

module.exports = router;