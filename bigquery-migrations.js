require('dotenv').config()
// Import the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery')
const bigquery = new BigQuery()
const SOURCE_TABLES = [
  'tlc_green_trips_2014', 'tlc_green_trips_2015', 'tlc_green_trips_2016', 'tlc_green_trips_2017',
  'tlc_yellow_trips_2015', 'tlc_yellow_trips_2016', 'tlc_yellow_trips_2017'
]
const TARGET_DATASET = process.env.TAXI_DATASET
const TARGET_TABLE = process.env.TAXI_TABLE

async function createTablePartitioned() {

  const schema = 'pickup_datetime:datetime, dropoff_datetime:datetime, pickup_s2_key:string, fare_amount:float64, trip_distance:float64';

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema,
    timePartitioning: {
      type: 'DAY',
      field: 'pickup_datetime',
    },
    clustering: {
      'fields': [
        'pickup_s2_key'
      ]
    }
  }

  // Create a new table in the dataset
  const [table] = await bigquery
    .dataset(TARGET_DATASET)
    .createTable(TARGET_TABLE, options)
  console.log(`Table ${table.id} created with partitioning: `)
  console.log(table.metadata.timePartitioning)
  return table
}

async function insertFromAggregation(sourceTable) {
  let year = sourceTable.split('_').pop()
  const dataset = bigquery.dataset(TARGET_DATASET)
  const destinationTable = dataset.table(TARGET_TABLE)
  let query =
    `
    INSERT INTO ${TARGET_DATASET}.${TARGET_TABLE}
    (pickup_datetime, dropoff_datetime, trip_distance, fare_amount, pickup_s2_key)
    SELECT
      pickup_datetime, dropoff_datetime, trip_distance, fare_amount,
      \`jslibs.s2.latLngToKey\`(pickup_latitude, pickup_longitude, 16)  AS pickup_s2_key
    FROM
      \`bigquery-public-data.new_york_taxi_trips.${sourceTable}\`
    WHERE
      (pickup_datetime < dropoff_datetime)
      AND
      (pickup_latitude BETWEEN -90 AND 90)
      AND
      (pickup_longitude BETWEEN -180 AND 180)
      AND
      (trip_distance > 0)
      AND
      (fare_amount > 0)
      AND
      (DATETIME_DIFF(dropoff_datetime, pickup_datetime, DAY) < 1)
      AND EXTRACT(YEAR FROM pickup_datetime)=${year}`

  const options = {
    query: query,
    useLegacySql: false,
  }

  const [job] = await bigquery.createQueryJob(options)
  console.log(`Job ${job.id} started.`)
  job.on('complete', (metadata) =>{
    console.log(`Job ${job.id} completed.`)
  })
  job.on('error', (err) => {
    console.log(`Job ${job.id} error:`, err.message)
  })
}

createTablePartitioned().then((table) =>
  Promise.all(SOURCE_TABLES.map(insertFromAggregation))
)