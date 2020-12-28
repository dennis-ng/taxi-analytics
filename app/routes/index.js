const router = require('express').Router()
const { checkSchema, validationResult } = require('express-validator')
const trips = require('../models/trips')
const tripsValidation = require('./tripsValidation')

router.get('/total_trips', checkSchema(tripsValidation.totalTripsSchema), (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) })
    }
    let startDate = req.query.start
    let endDate = req.query.end
    if (endDate < startDate) {
        return res.status(400).json({errors: "<start> must be earlier than <end>"})
    }
    trips.count(startDate, endDate).then(data => {
        res.json({
            "data" : data,
        })
    })
})

router.get('/average_fare_heatmap', checkSchema(tripsValidation.fareHeatmapSchema), (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array({ onlyFirstError: true }) })
    }
    let date = req.query.date
    trips.getAverageFare(date).then(data => {
        res.json({
            "data" : data,
        })
    })
})

module.exports = router