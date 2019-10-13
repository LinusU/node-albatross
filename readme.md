# ![Albatross](/header.png?raw=true "Albatross")

Albatross is a small library that makes accessing MongoDB from Node.js a
breeze. It's goal is to be a thin wrapper that enables you to forget about
connection state and get right to accessing your data.

## Installation

```sh
npm install --save albatross
```

## Usage

```js
const albatross = require('albatross')

const db = albatross('mongodb://localhost/test')
const user = db.collection('user')

await user.insert({ name: 'Linus', born: 1992 })
await user.insert({ name: 'Steve', born: 1955 })

const doc = await user.findOne({ born: 1992 })
console.log('Hello ' + doc.name)
//=> Hello Linus

const fs = require('fs')
const grid = db.grid()

const input = fs.createReadStream('readme.md')
const opts = { filename: 'readme.md', contentType: 'text/plain' }

const id = await grid.upload(input, opts)
const result = await grid.download(id)

result.filename // 'readme.md'
result.contentType // 'text/plain'

result.stream.pipe(process.stdout)
```

You can start querying the database right away, as soon as a connection is
established it will start sending your commands to the server.

## API

### Module

The module exposes a single function to create a new `Albatross` instance. It
also exposes the BSON Binary API on this function.

#### `albatross(uri)`

Creates a new instance of `Albatross` and connect to the specified uri.

#### BSON Binary API

The following functions are exposed on the module:

```text
Admin
AggregationCursor
BSONRegExp
Binary
Chunk
Code
Collection
CommandCursor
CoreConnection
CoreServer
Cursor
DBRef
Db
Decimal128
Double
GridFSBucket
GridStore
Int32
Logger
Long
Map
MaxKey
MinKey
MongoClient
MongoError
MongoNetworkError
MongoTimeoutError
Mongos
ObjectID
ObjectId
ReadPreference
ReplSet
Server
Symbol
Timestamp
```

### Albatross

#### `.collection(name)`

Returns a new instance of Collection bound to the collection named `name`.

#### `.grid([name])`

Returns a new instance of Grid, optionally using the supplied `name` as the
name of the root collection.

#### `.id(strOrObjectID)`

Makes sure that the given argument is an ObjectID.

#### `.close(): Promise<void>`

Closes the connection to the server.

### Collection

#### `.id(strOrObjectID)`

Makes sure that the given argument is an ObjectID.

#### `findOne(query[, opts]): Promise<object>`

Find the first document that matches `query`.

#### `find(query[, opts]): Promise<object[]>`

Find all records that matches `query`.

#### `count(query[, opts]): Promise<number>`

Count number of documents matching the query.

#### `distinct(key[, query[, opts]]): Promise<any[]>`

Finds a list of distinct values for the given key.

*note: if you specify `opts` you also need to specify `query`*

#### `insert(docs[, opts]): Promise<object | object[]>`

Inserts a single document or a an array of documents.

The Promise will resolve with the documents that was inserted. When called
with an object instead of an array as the first argument, the Promise resolves
with an object instead of an array as well.

#### `updateOne(filter, update[, opts]): Promise<UpdateResult>`

Updates a single document matching `filter`. Resolves with an object with the following properties:

- `matched`: Number of documents that matched the query
- `modified`: Number of documents that was modified

#### `updateMany(filter, update[, opts]): Promise<UpdateResult>`

Updates multiple documents matching `filter`. Resolves with an object with the following properties:

- `matched`: Number of documents that matched the query
- `modified`: Number of documents that was modified

#### `deleteOne(filter[, opts]): Promise<number>`

Deletes a single document matching `filter`. Resolves with the number of documents deleted.

#### `deleteMany(filter[, opts]): Promise<number>`

Deletes multiple documents matching `filter`. Resolves with the number of documents deleted.

### Grid

#### `id(strOrObjectID)`

Makes sure that the given argument is an ObjectID.

#### `upload(stream[, opts]): Promise<FileInfo>`

Store the `stream` as a file in the grid store, `opts` is a object with the
following properties. All options are optionally.

- `filename`: The value of the `filename` key in the files doc
- `chunkSizeBytes`: Overwrite this bucket's `chunkSizeBytes` for this file
- `metadata`: Object to store in the file document's `metadata` field
- `contentType`: String to store in the file document's `contentType` field
- `aliases`: Array of strings to store in the file document's `aliases` field

The `FileInfo` object has the following properties:

- `id`: The id of the file
- `md5`: The md5 hash of the file
- `length`: The length of the file
- `chunkSize`: The size of each chunk in bytes
- `filename`: The value of the `filename` key in the files doc
- `metadata`: An object with the metadata associated with the file
- `contentType`: The value of the `contentType` key in the files doc

#### `download(id): Promise<FileInfo>`

Get the file with the specified `id` from the grid store. The Promise will
resolve with an object with the following properties. If no file with the
indicated `id` was found, the Promise will resolve to `null`.

- `id`: The id of the file
- `md5`: The md5 hash of the file
- `length`: The length of the file
- `chunkSize`: The size of each chunk in bytes
- `filename`: The value of the `filename` key in the files doc
- `metadata`: An object with the metadata associated with the file
- `contentType`: The value of the `contentType` key in the files doc
- `stream`: The stream with the data that was inside the file

#### `delete(id): Promise<void>`

Delete the file with the specified `id` from the grid store.

## In depth documentation

For more in depth documentation please see the [mongodb module](http://mongodb.github.io/node-mongodb-native/)
which Albatross wraps, especially the [Collection object](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html).

## Contributing

Pull requests are always welcome, please make sure to add tests and run
`mocha` before submitting.

The tests requiers a MongoDB server running at `localhost`.

## License

Albatross is licensed under the MIT license.
