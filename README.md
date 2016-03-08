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
var albatross = require('albatross')

var db = albatross('mongodb://localhost/test')
var user = db.collection('user')

user
  .insert({ name: 'Linus', born: 1992 })
  .insert({ name: 'Steve', born: 1955 })
  .findOne({ born: 1992 }, function (err, doc) {
    if (err) throw err

    console.log('Hello ' + doc.name)
  })

var fs = require('fs')
var grid = db.grid()

var input = fs.createReadStream('README.md')
var opts = { filename: 'README.md', contentType: 'text/plain' }

grid.upload(input, opts, function (err, id) {
  if (err) throw err

  grid.download(id, function (err, result) {
    if (err) throw err

    result.filename // 'README.md'
    result.contentType // 'text/plain'

    result.stream.pipe(process.stdout)
  })
})
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
BSON
Binary
Code
DBRef
Double
Long
MaxKey
MinKey
ObjectID
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

#### `.close([cb])`

Closes the connection to the server and calls callback with potential error
as first argument.

### Collection

#### `.id(strOrObjectID)`

Makes sure that the given argument is an ObjectID.

#### `findById(id[, opts][, cb]) -> (err, doc)`

Find one document with the specified `id`.

#### `findOne(query[, opts][, cb]) -> (err, doc)`

Find the first document that matches `query`.

#### `find(query[, opts][, cb]) -> (err, docs)`

Find all records that matches `query`.

#### `count(query[, opts][, cb]) -> (err, count)`

Count number of documents matching the query.

#### `distinct(key[, query[, opts]][, cb]) -> (err, list)`

Finds a list of distinct values for the given key.

*note: if you specify `opts` you also need to specify `query`*

#### `insert(docs[, opts][, cb]) -> (err, docs)`

Inserts a single document or a an array of documents.

Second argument to callback is the documents that was inserted. When called
with an object instead of an array as the first argument, the callback receives
an object instead of an array as well.

#### `update(selector, document[, opts][, cb]) -> (err, nUpdated)`

Update documents matching `selector`.

*note: to update more than one document, specify `multi: true` in `opts`*

#### `remove(selector[, opts][, cb]) -> (err, nRemoved)`

Removes documents specified by `selector`.

*note: to only remove one document, specify `single: true` in `opts`*

### Grid

#### `id(strOrObjectID)`

Makes sure that the given argument is an ObjectID.

#### `upload(stream[, opts][, cb]) -> (err, result)`

Store the `stream` as a file in the grid store, `opts` is a object with the
following properties. All options are optionally.

- `filename`: The value of the `filename` key in the files doc
- `chunkSizeBytes`: Overwrite this bucket's `chunkSizeBytes` for this file
- `metadata`: Object to store in the file document's `metadata` field
- `contentType`: String to store in the file document's `contentType` field
- `aliases`: Array of strings to store in the file document's `aliases` field

The `result` object has the following properties:

- `id`: The id of the file
- `md5`: The md5 hash of the file
- `length`: The length of the file
- `chunkSize`: The size of each chunk in bytes
- `filename`: The value of the `filename` key in the files doc
- `metadata`: An object with the metadata associated with the file
- `contentType`: The value of the `contentType` key in the files doc

#### `download(id[, cb]) -> (err, result)`

Get the file with the specified `id` from the grid store. The callback will
receive a `result` object with the following properties. If no file with the
indicated `id` was found, `result` will be `null`.

- `id`: The id of the file
- `md5`: The md5 hash of the file
- `length`: The length of the file
- `chunkSize`: The size of each chunk in bytes
- `filename`: The value of the `filename` key in the files doc
- `metadata`: An object with the metadata associated with the file
- `contentType`: The value of the `contentType` key in the files doc
- `stream`: The stream with the data that was inside the file

#### `delete(id[, cb]) -> (err)`

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
