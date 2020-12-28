const router = require('express').Router()

router.get('/total_trips', (req, res) => {
    let startDate = req.query.start
    let endDate = req.query.end
    res.json()
})

module.exports = router