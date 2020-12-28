const {BigQuery} = require('@google-cloud/bigquery')
const { options } = require('superagent')
const bigquery = new BigQuery()
const TARGET_DATASET = process.env.TAXI_DATASET
const TARGET_TABLE = process.env.TAXI_TABLE
const TABLE = `${TARGET_DATASET}.${TARGET_TABLE}`

let count = async (startDate, endDate) => {
    const query =
    `SELECT
        DATE(pickup_datetime) as date, COUNT(*) as total_trips
    FROM
        \`${TABLE}\`
    WHERE
        (DATE(pickup_datetime) BETWEEN @startDate AND @endDate)
    GROUP BY
        date
    ORDER BY
        date ASC`

    const options = {
        query: query,
        params: {startDate: startDate, endDate: endDate},
    }

    const [rows] = await bigquery.query(options);
    return rows
}

module.exports = {
    count,
}