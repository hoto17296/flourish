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
    return new Promise((resolve, reject) => {
      mysql.getConnection((err, conn) => {
        if (err) return reject(err);
        try {
          const obj = new this(params);
          var columns = this._table.schema.filter((column) => params[column]);
          const values = columns.map((column) => conn.escape( params[column] )).join(',');
          columns = columns.map((column) => conn.escapeId(column)).join(',');
          const sql = 'insert into ?? (' + columns + ') values (' + values + ');';
          conn.query(sql, [ this._table.name ], (err) => {
            if (err) throw new Error(err);
            const sql = 'SELECT LAST_INSERT_ID() AS id;';
            conn.query(sql, [], (err, result) => {
              if (err) throw new Error(err);
              obj[ this._table.pk ] = result[0].id;
              conn.release();
              resolve(obj);
            });
          });
        }
        catch(err) {
          conn.release();
          reject(err);
        }
      });
    });
  }
}

ORM._table = {};

module.exports = ORM;
