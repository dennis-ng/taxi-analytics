const router = require('express').Router()
const trips = require('../models/trips')

router.get('/total_trips', (req, res) => {
    let startDate = req.query.start
    let endDate = req.query.end
    trips.count(startDate, endDate).then(data => {
        res.json({
            "data" : data
        })
    })
})

module.exports = router