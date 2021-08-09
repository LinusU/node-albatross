import debug from 'debug'
import mongodb from 'mongodb'
import { PassThrough } from 'node:stream'

const reFileNotFound = /^FileNotFound: /

const kDebug = Symbol('debug')

function fileInfo (file) {
  return {
    id: file._id,
    length: file.length,
    chunkSize: file.chunkSize,
    uploadDate: file.uploadDate,
    contentType: (file.contentType || ''),
    filename: (file.filename || ''),
    metadata: (file.metadata || {})
  }
}

export default class Grid {
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
      const bucket = new mongodb.GridFSBucket(db, { bucketName: this.name })
      const upload = bucket.openUploadStream(opts.filename || '', opts)

      upload.on('error', reject)
      upload.on('finish', (file) => resolve(fileInfo(file)))

      stream.pipe(upload)
    })
  }

  async download (id) {
    const db = await this.parent.db()

    return new Promise((resolve, reject) => {
      const bucket = new mongodb.GridFSBucket(db, { bucketName: this.name })
      const download = bucket.openDownloadStream(this.id(id))
      const through = new PassThrough()

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
      const bucket = new mongodb.GridFSBucket(db, { bucketName: this.name })
      bucket.delete(this.id(id), (err) => err ? reject(err) : resolve())
    })
  }
}
