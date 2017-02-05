const mysql = require('../stores/mysql');

class ORM {
  constructor(params) {
    Object.assign(this, params);
  }

  static all() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM ?? WHERE deleted = 0 ORDER BY convened_at ASC';
      mysql.query(sql, [ this._table.name ], (err, result) => err ? reject(err) : resolve(result));
    });
  }

  static find(pk) {
    return this.findBy(this._table.pk, pk);
  }

  static findBy(key, val) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from ?? where ?? = ?;';
      mysql.query(sql, [ this._table.name, key, val ], (err, result) => {
        if (err) return reject(err);
        if ( result.length === 0 ) return resolve(null);
        resolve( new this( result[0] ) );
      });
    });
  }

  static findAllBy(key, val) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from ?? where ?? = ?;';
      mysql.query(sql, [ this._table.name, key, val ], (err, result) => {
        if (err) return reject(err);
        resolve( result.map((item) => new this(item)) );
      });
    });
  }

  static create(params) {
    var conn;
    // Get Connection
    return new Promise((resolve, reject) => {
      mysql.getConnection((err, _conn) => {
        if (err) return reject(err);
        conn = _conn;
        resolve();
      });
    })
    // Insert Record
    .then(() => {
      return new Promise((resolve, reject) => {
        var columns = this._table.schema.filter((column) => params[column]);
        const values = columns.map((column) => conn.escape( params[column] )).join(',');
        columns = columns.map((column) => conn.escapeId(column)).join(',');
        const sql = 'insert into ?? (' + columns + ') values (' + values + ');';
        conn.query(sql, [ this._table.name ], (err) => err ? reject(err) : resolve());
      });
    })
    // Get ID
    .then(() => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT LAST_INSERT_ID() AS id;';
        conn.query(sql, (err, result) => err ? reject(err) : resolve( result[0].id ));
      });
    })
    // create Object
    .then((id) => {
      conn.release();
      const obj = new this(params);
      obj[ this._table.pk ] = id;
      return Promise.resolve(obj);
    })
    .catch((err) => {
      if (conn) conn.release();
      throw err;
    });
  }
}

ORM._table = {};

module.exports = ORM;
