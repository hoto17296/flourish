const ORM = require('../lib/ORM');

class User extends ORM {
}

User.prototype._table = {
  name: 'users',
  pk: 'id',
  schema: ['id', 'name', 'email', 'organization', 'uid', 'is_admin', 'notify'],
}

module.exports = User;
