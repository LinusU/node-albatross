const mongodb = require('mongodb')
const Albatross = require('./lib/albatross')

module.exports = (uri) => new Albatross(uri)

module.exports.Albatross = Albatross

module.exports.Admin = mongodb.Admin
module.exports.AggregationCursor = mongodb.AggregationCursor
module.exports.BSONRegExp = mongodb.BSONRegExp
module.exports.Binary = mongodb.Binary
module.exports.Chunk = mongodb.Chunk
module.exports.Code = mongodb.Code
module.exports.Collection = mongodb.Collection
module.exports.CommandCursor = mongodb.CommandCursor
module.exports.CoreConnection = mongodb.CoreConnection
module.exports.CoreServer = mongodb.CoreServer
module.exports.Cursor = mongodb.Cursor
module.exports.DBRef = mongodb.DBRef
module.exports.Db = mongodb.Db
module.exports.Decimal128 = mongodb.Decimal128
module.exports.Double = mongodb.Double
module.exports.GridFSBucket = mongodb.GridFSBucket
module.exports.GridStore = mongodb.GridStore
module.exports.Int32 = mongodb.Int32
module.exports.Logger = mongodb.Logger
module.exports.Long = mongodb.Long
module.exports.Map = mongodb.Map
module.exports.MaxKey = mongodb.MaxKey
module.exports.MinKey = mongodb.MinKey
module.exports.MongoClient = mongodb.MongoClient
module.exports.MongoError = mongodb.MongoError
module.exports.MongoNetworkError = mongodb.MongoNetworkError
module.exports.MongoTimeoutError = mongodb.MongoTimeoutError
module.exports.Mongos = mongodb.Mongos
module.exports.ObjectID = mongodb.ObjectID
module.exports.ObjectId = mongodb.ObjectId
module.exports.ReadPreference = mongodb.ReadPreference
module.exports.ReplSet = mongodb.ReplSet
module.exports.Server = mongodb.Server
module.exports.Symbol = mongodb.Symbol
module.exports.Timestamp = mongodb.Timestamp
