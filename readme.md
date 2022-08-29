# ![Albatross](/header.png?raw=true "Albatross")

Albatross is a small library that makes accessing MongoDB from Node.js a breeze. It's goal is to be a thin wrapper that enables you to forget about connection state and get right to accessing your data.

## Installation

```sh
npm install --save albatross
```

## Usage

```js
import albatross from 'albatross'
import fs from 'node:fs'

const db = albatross('mongodb://localhost/test')
const user = db.collection('user')

await user.insert({ name: 'Linus', born: 1992 })
await user.insert({ name: 'Steve', born: 1955 })

const doc = await user.findOne({ born: 1992 })
console.log('Hello ' + doc.name)
//=> Hello Linus

const grid = db.grid()

const input = fs.createReadStream('readme.md')
const opts = { filename: 'readme.md', contentType: 'text/plain' }

const id = await grid.upload(input, opts)
const result = await grid.download(id)

result.filename // 'readme.md'
result.contentType // 'text/plain'

result.stream.pipe(process.stdout)
```

You can start querying the database right away, as soon as a connection is established it will start sending your commands to the server.

## API

### Module

The module default exports a single function to create a new `Albatross` instance. It also exports the BSON Binary API as named exports.

#### `albatross(uri)`

Creates a new instance of `Albatross` and connect to the specified uri.

**Note:** Albatross creates the MongoDB client with `ignoreUndefined: true`, which means that `undefined` values will not be stored in the database. This is the new default in the BSON library, and is also how the standard `JSON.stringify` works.

#### BSON Binary API

The following functions are exported from the module:

```text
Binary
Code
Decimal128
Double
Int32
Long
MaxKey
MinKey
ObjectId
Timestamp
```

### Albatross

#### `.collection(name)`

Returns a new instance of Collection bound to the collection named `name`.

#### `.grid([name])`

Returns a new instance of Grid, optionally using the supplied `name` as the name of the root collection.

#### `.id(strOrObjectId)`

Makes sure that the given argument is an ObjectId.

#### `.ping([timeout]): Promise<void>`

Send the `ping` command to the server, to check that the connection is still intact.

Optionally accepts a timeout in milliseconds.

#### `.transaction(fn): Promise`

Runs a provided function within a transaction, retrying either the commit operation or entire transaction as needed (and when the error permits) to better ensure that the transaction can complete successfully.

Example:

```js
const user = db.collection('user')

const result = await db.transaction(async (session) => {
    await user.insert({ name: 'Linus', born: 1992 }, { session })
    await user.insert({ name: 'Steve', born: 1955 }, { session })

    return await user.findOne({ born: 1992 }, { session })
})

console.log('Hello ' + result.name)
//=> Hello Linus
```

#### `.close(): Promise<void>`

Closes the connection to the server.

### Collection

#### `.id(strOrObjectId)`

Makes sure that the given argument is an ObjectId.

#### `findOne(query[, opts]): Promise<object>`

Find the first document that matches `query`.

#### `find(query[, opts]): Promise<object[]>`

Find all records that matches `query`.

#### `count(query[, opts]): Promise<number>`

Count number of documents matching the query.

#### `distinct(key[, query[, opts]]): Promise<any[]>`

Finds a list of distinct values for the given key.

*note: if you specify `opts` you also need to specify `query`*

#### `exists(query): Promise<boolean>`

Check if at least one document is matching the query.

#### `insert(docs[, opts]): Promise<object | object[]>`

Inserts a single document or a an array of documents.

The Promise will resolve with the documents that was inserted. When called with an object instead of an array as the first argument, the Promise resolves with an object instead of an array as well.

**Note:** Contrary to the standard MongoDB Node.js driver, this function will *not modify* any objects that are passed in. Instead, the returned documents from this function are what was saved in the database.

### `findOneAndUpdate(filter, update[, opts]): Promise<object>`

Finds a document and updates it in one atomic operation.

By default, the document _before_ the update is returned. To return the document _after_ the update, pass `returnDocument: 'after'` in the options.

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

#### `aggregate(pipeline[, opts]): Promise<object[]>`

Executes an aggregation framework pipeline against the collection. Resolves with the aggregated objects.

### Grid

#### `id(strOrObjectId)`

Makes sure that the given argument is an ObjectId.

#### `upload(stream[, opts]): Promise<FileInfo>`

Store the `stream` as a file in the grid store, `opts` is a object with the following properties. All options are optionally.

- `filename`: The value of the `filename` key in the files doc
- `chunkSizeBytes`: Overwrite this bucket's `chunkSizeBytes` for this file
- `metadata`: Object to store in the file document's `metadata` field
- `contentType`: String to store in the file document's `contentType` field
- `aliases`: Array of strings to store in the file document's `aliases` field

The `FileInfo` object has the following properties:

- `id`: The id of the file
- `length`: The length of the file
- `chunkSize`: The size of each chunk in bytes
- `filename`: The value of the `filename` key in the files doc
- `metadata`: An object with the metadata associated with the file
- `contentType`: The value of the `contentType` key in the files doc

#### `download(id): Promise<FileInfo>`

Get the file with the specified `id` from the grid store. The Promise will resolve with an object with the following properties. If no file with the indicated `id` was found, the Promise will resolve to `null`.

- `id`: The id of the file
- `length`: The length of the file
- `chunkSize`: The size of each chunk in bytes
- `filename`: The value of the `filename` key in the files doc
- `metadata`: An object with the metadata associated with the file
- `contentType`: The value of the `contentType` key in the files doc
- `stream`: The stream with the data that was inside the file

#### `delete(id): Promise<void>`

Delete the file with the specified `id` from the grid store.

## In depth documentation

For more in depth documentation please see the [mongodb module](http://mongodb.github.io/node-mongodb-native/) which Albatross wraps, especially the [Collection object](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html).

## Contributing

Pull requests are always welcome, please make sure to add tests and run `mocha` before submitting.

The tests requiers a MongoDB server running at `localhost`.

## License

Albatross is licensed under the MIT license.
