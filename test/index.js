const chai = require('chai');
const chaiHttp = require('chai-http')
const should = chai.should()

// We use the same bigquery env as production in this case. Otherwise, uncomment the following to set a test environment.
// process.env.NODE_ENV = 'test'
// Some of the historical data used for comparison in these tests are determined by running the expected queries directly
// in the Google Cloud BigQuery console.
const server = require('../server')

chai.use(chaiHttp)

describe('/GET total_trips', () => {
    it('should get the total number of trips in the date range based on pickup time', async () => {
        let res = await chai.request(server)
            .get('/total_trips?start=2016-01-01&end=2016-01-01')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        // Historical data should not change
        res.body.data.should.eql([
            {
                "date": "2016-01-01",
                "total_trips": 339286
            }
        ])

        res = await chai.request(server)
            .get('/total_trips?start=2016-01-01&end=2016-01-07')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        // Historical data should not change
        res.body.data.should.eql([
            {
                "date": "2016-01-01",
                "total_trips": 339286
            },
            {
                "date": "2016-01-02",
                "total_trips": 306251
            },
            {
                "date": "2016-01-03",
                "total_trips": 298529
            },
            {
                "date": "2016-01-04",
                "total_trips": 311973
            },
            {
                "date": "2016-01-05",
                "total_trips": 338814
            },
            {
                "date": "2016-01-06",
                "total_trips": 343879
            },
            {
                "date": "2016-01-07",
                "total_trips": 359397
            }
        ])
    }).timeout(10000)

    it('should return empty array when date range is valid but not in our database', async() => {
        let res = await chai.request(server)
            .get('/total_trips?start=1990-01-01&end=1990-01-07')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        res.body.data.should.be.empty
    })

    it('should tell user if the start to end date range is invalid', async () =>{
        let res = await chai.request(server)
            .get('/total_trips')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?start=2016-01-02')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?end=2016-01-01')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?start=hello&end=world')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?start=123&end=123')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?start=2016-01-07&end=2016-01-01') // End date is earlier than start date
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?start=2016-01-02&end=2016-01-01')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/total_trips?start=2016-01-02T00:00:00&end=2016-01-01T00:00:00') // Not expecting time
        res.should.have.status(400)
    })
})

describe('/GET average_fare_heatmap', () => {
    it('should get the average <fare_amount> per S2 ID at level 16, formatted in base16, for a given pickup date', async () => {
        let res = await chai.request(server)
            .get('/average_fare_heatmap?date=2016-01-01')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        // Historical data should not change.
        res.body.data.length.should.be.equal(7622)
        // Check a random subset of the results
        res.body.data.should.deep.include({
            "s2id": "89c243545",
            "fare": 6.0
        })
        res.body.data.should.deep.include({
            "s2id": "8995713f3",
            "fare": 36.5
        })
        res.body.data.should.deep.include({
            "s2id": "89c2f6a05",
            "fare": 12.875
        })
    }).timeout(10000)

    it('should return empty array when date is valid but not in our database', async() => {
        let res = await chai.request(server)
            .get('/average_fare_heatmap?date=1990-01-01')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        res.body.data.should.be.empty
    })

    it('should tell user if the date is invalid', async () =>{
        let res = await chai.request(server)
            .get('/average_fare_heatmap')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_fare_heatmap?dead=2016-01-01')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_fare_heatmap?date=helloworld')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_fare_heatmap?date=123')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_fare_heatmap?date=2016-01-02T00:00:00') // Not expecting time
        res.should.have.status(400)
    })
})

describe('/GET average_speed_24hrs', () => {
    it('should get the average speed of trips that ended on a given dropoff date', async () => {
        let res = await chai.request(server)
            .get('/average_speed_24hrs?date=2016-01-02')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        // Historical data should not change.
        res.body.data.length.should.be.equal(306251)
        // Check a random subset of the results
        res.body.data.should.deep.include({
            "average_speed" : 36.809726443769
        })
        res.body.data.should.deep.include({
            "average_speed" : 78.0
        })
    }).timeout(10000)

    it('should return empty array when date is valid but not in our database', async() => {
        let res = await chai.request(server)
            .get('/average_speed_24hrs?date=1990-01-01')
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.contain.key('data')
        res.body.data.should.be.an('array')
        res.body.data.should.be.empty
    })

    it('should tell user if the date is invalid', async () =>{
        let res = await chai.request(server)
            .get('/average_speed_24hrs')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_speed_24hrs?dead=2016-01-01')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_speed_24hrs?date=helloworld')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_speed_24hrs?date=123')
        res.should.have.status(400)

        res = await chai.request(server)
            .get('/average_speed_24hrs?date=2016-01-02T00:00:00') // Not expecting time
        res.should.have.status(400)
    })
})
