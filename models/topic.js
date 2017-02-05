const mysql = require('../stores/mysql');

class Topic {
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
    //return new Promise((resolve, reject) => {
    //  mysql.getConnection((err, conn) => {
    //    if (err) return reject(err);
    //    try {
    //      const user = new this(params);
    //      const sql = "insert into users (name,email,uid) values (?,?,?);";
    //      conn.query(sql, [ user.name, user.email, user.uid ], (err) => {
    //        if (err) return reject(err);
    //        const sql = "SELECT LAST_INSERT_ID() AS id;";
    //        conn.query(sql, [], (err, result) => {
    //          if (err) return reject(err);
    //          user.id = result[0].id;
    //          resolve(user);
    //          conn.release();
    //        });
    //      });
    //    }
    //    catch(err) {
    //      conn.release();
    //      reject(err);
    //    }
    //  });
    //});
  }
}

Topic._table = {
  name: 'topics',
  pk: 'id',
}

module.exports = Topic;
