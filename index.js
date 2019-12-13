const mongodb = require('mongodb')
const Albatross = require('./lib/albatross')

module.exports = (uri) => new Albatross(uri)

module.exports.Binary = mongodb.Binary
module.exports.Code = mongodb.Code
module.exports.DBRef = mongodb.DBRef
module.exports.Decimal128 = mongodb.Decimal128
module.exports.Double = mongodb.Double
module.exports.Int32 = mongodb.Int32
module.exports.Long = mongodb.Long
module.exports.MaxKey = mongodb.MaxKey
module.exports.MinKey = mongodb.MinKey
module.exports.ObjectId = mongodb.ObjectId
module.exports.Timestamp = mongodb.Timestamp
