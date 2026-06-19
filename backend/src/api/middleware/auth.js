const { expressjwt } = require('express-jwt');
module.exports = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
});
