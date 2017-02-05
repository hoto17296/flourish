const ORM = require('../lib/orm');
const mysql = require('../stores/mysql');

class User extends ORM {
}

User._table = {
  name: 'users',
  pk: 'id',
  schema: ['id', 'name', 'email', 'organization', 'uid', 'is_admin', 'notify'],
}

module.exports = User;
