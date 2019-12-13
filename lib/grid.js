const debug = require('debug')
const { GridFSBucket } = require('mongodb')
const stream = require('stream')

const reFileNotFound = /^FileNotFound: /

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
  constructor (parent, name) {
    this.name = name
    this.parent = parent
    this[kDebug] = debug('albatross:grid-' + name)
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  async upload (stream, opts = {}) {
    const db = await this.parent.db()

    return new Promise((resolve, reject) => {
      const bucket = new GridFSBucket(db, { bucketName: this.name })
      const upload = bucket.openUploadStream(opts.filename, opts)

      upload.on('error', reject)
      upload.on('finish', (file) => resolve(fileInfo(file)))

      stream.pipe(upload)
    })
  }

  async download (id) {
    const db = await this.parent.db()

    return new Promise((resolve, reject) => {
      const bucket = new GridFSBucket(db, { bucketName: this.name })
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
  }

  async delete (id) {
    const db = await this.parent.db()

    return new Promise((resolve, reject) => {
      const bucket = new GridFSBucket(db, { bucketName: this.name })
      bucket.delete(this.id(id), (err) => err ? reject(err) : resolve())
    })
  }
}

module.exports = Grid
