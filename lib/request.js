
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

  function cbWriteCount (err, res) {
    if (err) return cb(err);
    cb(null, res.result.n);
  }

  function cbFirstOp (err, res) {
    if (err) return cb(err);
    cb(null, res.ops[0]);
  }

  function cbAllOps (err, res) {
    if (err) return cb(err);
    cb(null, res.ops);
  }

  switch (this.op) {

    case 'findById':
      debug('findOne({ _id: %s })', this.args[0].toString());
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

    case 'distinct':
      debug('distinct(%s, %o)', this.args[0], this.args[1]);
      col.distinct(this.args[0], this.args[1], this.opts, cb);
      break;

    case 'insert':
      if (Array.isArray(this.args[0])) {
        debug('insertMany(%o)', this.args[0]);
        col.insertMany(this.args[0], this.opts, cbAllOps);
      } else {
        debug('insertOne(%o)', this.args[0]);
        col.insertOne(this.args[0], this.opts, cbFirstOp);
      }
      break;

    case 'update':
      if (this.opts.multi === true) {
        debug('updateMany(%o, %o)', this.args[0], this.args[1]);
        col.updateMany(this.args[0], this.args[1], this.opts, cbWriteCount);
      } else {
        debug('updateOne(%o, %o)', this.args[0], this.args[1]);
        col.updateOne(this.args[0], this.args[1], this.opts, cbWriteCount);
      }
      break;

    case 'remove':
      if (this.opts.single === true) {
        debug('removeOne(%o)', this.args[0]);
        col.removeOne(this.args[0], this.opts, cbWriteCount);
      } else {
        debug('removeMany(%o)', this.args[0]);
        col.removeMany(this.args[0], this.opts, cbWriteCount);
      }
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
