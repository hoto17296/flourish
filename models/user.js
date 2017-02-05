const ORM = require('../lib/orm');
const mysql = require('../stores/mysql');

class User extends ORM {
  static create(params) {
    return new Promise((resolve, reject) => {
      mysql.getConnection((err, conn) => {
        if (err) return reject(err);
        try {
          const user = new this(params);
          const sql = "insert into users (name,email,uid) values (?,?,?);";
          conn.query(sql, [ user.name, user.email, user.uid ], (err) => {
            if (err) return reject(err);
            const sql = "SELECT LAST_INSERT_ID() AS id;";
            conn.query(sql, [], (err, result) => {
              if (err) return reject(err);
              user.id = result[0].id;
              resolve(user);
              conn.release();
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

User._table = {
  name: 'users',
  pk: 'id',
}

module.exports = User;
