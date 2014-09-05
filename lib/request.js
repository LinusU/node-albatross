
function Request (collection, op, args, opts, cb) {

  this.collection = collection;
  this.op = op;
  this.args = args;

  if (typeof opts === 'function') {
    this.cb = opts;
    this.opts = {};
  } else {
    this.opts = (opts || {});
    this.cb = cb;
  }

}

Request.prototype.dispatch = function (col) {

  var cb = this.done.bind(this);
  var debug = this.collection.debug.bind(this.collection);

  function returnFirst (err, res) {
    if (err) { return cb(err); }
    cb(null, res.length > 0 ? res[0] : null);
  }

  switch (this.op) {

    case 'findById':
      debug('findById(%s)', this.args[0].toString());
      col.findOne({ _id: this.args[0] }, null, this.opts, cb);
      break;

    case 'findOne':
      debug('findOne(%o)', this.args[0]);
      col.findOne(this.args[0], null, this.opts, cb);
      break;

    case 'find':
      debug('find(%o)', this.args[0]);
      col.find(this.args[0], null, this.opts).toArray(cb);
      break;

    case 'count':
      debug('count(%o)', this.args[0]);
      col.count(this.args[0], this.opts, cb);
      break;

    case 'insert':
      debug('insert(%o)', this.args[0]);
      col.insert(this.args[0], this.opts, (Array.isArray(this.args[0]) ? cb : returnFirst));
      break;

    case 'update':
      debug('update(%o, %o)', this.args[0], this.args[1]);
      col.update(this.args[0], this.args[1], this.opts, cb);
      break;

    case 'remove':
      debug('remove(%o)', this.args[0]);
      col.remove(this.args[0], this.opts, cb);
      break;

    default:
      throw new Error('Unknown op: ' + this.op);
  }

};

Request.prototype.done = function (err, res) {

  this.collection.debug('reply ' + (err ? 'ERR' : 'OK'));

  if (this.cb) {
    this.cb(err, res);
  } else if (err) {
    this.collection.parent.emit('error', err);
  }

};

module.exports = Request;
