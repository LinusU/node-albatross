var debug = require('debug')
var stream = require('stream')

var reFileNotFound = /^FileNotFound: /

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
    this.debug = debug('albatross:grid-' + name)
  }

  _bucket () {
    return this.parent._getRawGrid(this.name)
  }

  id (hexString) {
    return this.parent.id(hexString)
  }

  upload (stream, opts = {}) {
    return this._bucket().then((bucket) => {
      return new Promise((resolve, reject) => {
        const upload = bucket.openUploadStream(opts.filename, opts)

        upload.on('error', reject)
        upload.on('finish', (file) => resolve(fileInfo(file)))

        stream.pipe(upload)
      })
    })
  }

  download (id) {
    return this._bucket().then((bucket) => {
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
    return this._bucket().then((bucket) => {
      bucket.delete(this.id(id))
    })
  }
}

module.exports = Grid
