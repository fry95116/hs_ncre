var admin_passport = require('./user_config').admin_passport;

console.log(admin_passport.username);
console.log(admin_passport.password);

admin_passport.password = 'test';

console.log(admin_passport.username);
console.log(admin_passport.password);