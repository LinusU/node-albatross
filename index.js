
var mongodb = require('mongodb');
var Albatross = require('./lib/albatross');

module.exports = function (uri) {
  return new Albatross(uri);
};

module.exports.BSON = mongodb.BSON;
module.exports.Binary = mongodb.Binary;
module.exports.Code = mongodb.Code;
module.exports.DBRef = mongodb.DBRef;
module.exports.Double = mongodb.Double;
module.exports.Long = mongodb.Long;
module.exports.MaxKey = mongodb.MaxKey;
module.exports.MinKey = mongodb.MinKey;
module.exports.ObjectID = mongodb.ObjectID;
module.exports.Symbol = mongodb.Symbol;
module.exports.Timestamp = mongodb.Timestamp;
