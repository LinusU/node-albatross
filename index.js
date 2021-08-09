import Albatross from './lib/albatross.js'

import mongodb from 'mongodb'

const { Binary, Code, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp } = mongodb

export { Binary, Code, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp }

export default function albatross (uri) {
  return new Albatross(uri)
}
