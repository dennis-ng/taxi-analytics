const {BigQuery} = require('@google-cloud/bigquery')
const s2 = require('./s2')
const dayjs = require('dayjs')

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
    return await rows.map(row => {
        return {...row, date: row['date']['value']}
    })
}

let getAverageFare = async (day) => {
    const query =
    `SELECT
        pickup_s2_key, AVG(fare_amount) as fare
    FROM
        \`${TABLE}\`
    WHERE
        (DATE(pickup_datetime) = @day)
    GROUP BY
        pickup_s2_key
    ORDER BY
        pickup_s2_key`

    const options = {
        query: query,
        params: {day: day},
    }

    const [rows] = await bigquery.query(options);
    return await rows.map(row => {
        return {
            's2id': s2.keyToHexId(row['pickup_s2_key']).slice(0, 9), // The example shown for the assignment was a 9 characters hexadecimal string
            'fare': row['fare'],
        }
    })
}

let getAverageSpeed = async (endDate) => {
    const query =
    `SELECT
        (trip_distance / DATETIME_DIFF(dropoff_datetime, pickup_datetime, SECOND) * 60 * 60) AS average_speed
    FROM
        \`${TABLE}\`
    WHERE
        (DATE(pickup_datetime) BETWEEN @start AND @end)
        AND
        (DATE(dropoff_datetime) = @end)`

    const startDate = dayjs(endDate).subtract(1, 'day').format('YYYY-MM-DD')
    const options = {
        query: query,
        params: {
            start: startDate,
            end: endDate,
        },
    }

    const [rows] = await bigquery.query(options);
    return rows
}
module.exports = {
    count,
    getAverageFare,
    getAverageSpeed,
}