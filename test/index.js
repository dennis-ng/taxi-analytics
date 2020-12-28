const chai = require('chai');
const chaiHttp = require('chai-http')
const should = chai.should()

// We use the same bigquery env as production in this case. Otherwise, uncomment the following to set a test environment.
// process.env.NODE_ENV = 'test'
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
                "total_trips": 342460
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
                "total_trips": 342460
            },
            {
                "date": "2016-01-02",
                "total_trips": 310838
            },
            {
                "date": "2016-01-03",
                "total_trips": 300670
            },
            {
                "date": "2016-01-04",
                "total_trips": 314059
            },
            {
                "date": "2016-01-05",
                "total_trips": 341083
            },
            {
                "date": "2016-01-06",
                "total_trips": 346390
            },
            {
                "date": "2016-01-07",
                "total_trips": 362721
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
        // Historical data should not change. Check a random subset of the results
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
