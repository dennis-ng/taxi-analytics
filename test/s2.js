const chai = require('chai');
const should = chai.should()

// We use the same bigquery env as production in this case. Otherwise, uncomment the following to set a test environment.
// process.env.NODE_ENV = 'test'

const s2 = require('../app/models/s2')

describe('Custom S2 id', () => {
    it('should return a base16 s2 id from a valid hilbert curve quad key regardless of level', () => {
        s2.keyToHexId('7/333333333333333333333333333333')
            .should.eql('ffffffffffffffff') // 16 'F' / 64bits of 1
        s2.keyToHexId('0/000000000000000000000000000000')
            .should.eql('0000000000000001') // Last bit of s2 id is always a 1 to mark the level
        s2.keyToHexId('0/0000000000000000') // 16 Levels
            .should.eql('0000000010000000') // 3 bits used for face id, so '1' will appear on the 9th hexadecimal place
        s2.keyToHexId('4/1032011323103333') // 16 Levels
        .should.eql('89c2f69ff0000000')
        s2.keyToHexId('2/1231122230110112') // 16 Levels
        .should.eql('4dad58a2d0000000')
    })
})