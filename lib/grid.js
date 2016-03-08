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

function defaultCallback (err) {
  if (err) throw err
}

function Grid (parent, name) {
  this.name = name
  this.parent = parent
  this.debug = debug('albatross:grid-' + name)
}

Grid.prototype._bucket = function (fn) {
  this.parent._getRawGrid(this.name, fn.bind(this))
  return this
}

Grid.prototype.id = function (hexString) {
  return this.parent.id(hexString)
}

Grid.prototype.upload = function gridUpload (stream, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (typeof cb !== 'function') {
    cb = defaultCallback
  }

  return this._bucket(function (bucket) {
    var upload = bucket.openUploadStream(opts.filename, opts)

    upload.on('error', function (err) { cb(err) })
    upload.on('finish', function (file) { cb(null, fileInfo(file)) })

    stream.pipe(upload)
  })
}

Grid.prototype.download = function gridGet (id, cb) {
  if (typeof cb !== 'function') {
    cb = defaultCallback
  }

  return this._bucket(function (bucket) {
    var download = bucket.openDownloadStream(this.id(id))
    var through = new stream.PassThrough()

    // the download stream won't query the db until piped
    download.pipe(through)

    download.on('error', function (err) {
      if (reFileNotFound.test(err.message)) {
        return cb(null, null)
      } else {
        return cb(err)
      }
    })

    download.on('file', function (file) {
      var info = fileInfo(file)
      info.stream = through
      cb(null, info)
    })
  })
}

Grid.prototype.delete = function gridDelete (id, cb) {
  if (typeof cb !== 'function') {
    cb = defaultCallback
  }

  return this._bucket(function (bucket) {
    bucket.delete(this.id(id), cb)
  })
}

module.exports = Grid
