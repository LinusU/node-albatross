const debug = require('debug')
const stream = require('stream')

const reFileNotFound = /^FileNotFound: /

const kBucket = Symbol('bucket')
const kDebug = Symbol('debug')

function fileInfo (file) {
  return {
    id: file._id,
    md5: file.md5,
    length: file.length,
    chunkSize: file.chunkSize,
    uploadDate: file.uploadDate,
    contentType: (file.contentType || ''),
    filename: (file.filename || ''),
    metadata: (file.metadata || {})
  }
}

class Grid {
  constructor (parent, name, bucketPromise) {
    this.name = name
    this.parent = parent
    this[kBucket] = bucketPromise
    this[kDebug] = debug('albatross:grid-' + name)
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  upload (stream, opts = {}) {
    return this[kBucket].then((bucket) => {
      return new Promise((resolve, reject) => {
        const upload = bucket.openUploadStream(opts.filename, opts)

        upload.on('error', reject)
        upload.on('finish', (file) => resolve(fileInfo(file)))

        stream.pipe(upload)
      })
    })
  }

  download (id) {
    return this[kBucket].then((bucket) => {
      return new Promise((resolve, reject) => {
        const download = bucket.openDownloadStream(this.id(id))
        const through = new stream.PassThrough()

        // the download stream won't query the db until piped
        download.pipe(through)

        download.on('error', function (err) {
          if (reFileNotFound.test(err.message)) {
            return resolve(null)
          } else {
            return reject(err)
          }
        })

        download.on('file', (file) => {
          resolve(Object.assign(fileInfo(file), { stream: through }))
        })
      })
    })
  }

  delete (id) {
    return this[kBucket].then((bucket) => {
      bucket.delete(this.id(id))
    })
  }
}

module.exports = Grid
