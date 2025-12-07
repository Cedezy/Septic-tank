const bcrypt = require('bcrypt');

bcrypt.hash('juneru12', 10).then(hash => {
  console.log('Hashed password:', hash);
});
