
var util = require('util');
var debug = require('debug');

var Request = require('./request');

function Collection (parent, name) {
  this.name = name;
  this.parent = parent;
  this.debug = debug('albatross:' + name);
}

Collection.prototype._request = function (op, args, opts, cb) {

  var req = new Request(this, op, args, opts, cb);

  this.parent._getRawCollection(this.name, req.dispatch.bind(req));

  return this;
};

Collection.prototype.id = function (hexString) {
  return this.parent.id(hexString);
};

Collection.prototype.findById = function (id, opts, cb) {
  return this._request('findById', [id], opts, cb);
};

Collection.prototype.findOne = function (query, opts, cb) {
  return this._request('findOne', [query], opts, cb);
};

Collection.prototype.find = function (query, opts, cb) {
  return this._request('find', [query], opts, cb);
};

Collection.prototype.count = function (query, opts, cb) {
  return this._request('count', [query], opts, cb);
};

Collection.prototype.insert = function (docs, opts, cb) {
  return this._request('insert', [docs], opts, cb);
};

Collection.prototype.update = function (selector, document, opts, cb) {

  if (opts && opts.hasOwnProperty('single')) {
    throw new Error('update dosen\'t support single, use multi');
  }

  return this._request('update', [selector, document], opts, cb);
};

Collection.prototype.remove = function (selector, opts, cb) {

  if (opts && opts.hasOwnProperty('multi')) {
    throw new Error('remove dosen\'t support multi, use single');
  }

  return this._request('remove', [selector], opts, cb);
};

module.exports = Collection;
