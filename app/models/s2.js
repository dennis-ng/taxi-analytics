const { S2 } = require('s2-geometry')
const long = require('long')

let keyToHexId = (key) => {
    let base10Id = S2.keyToId(key)
    return long.fromString(base10Id, true).toString(16).padStart(16, '0')
}

module.exports = {
    keyToHexId
}