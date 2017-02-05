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
}

ORM._table = {};

module.exports = ORM;
