const jwt = require('jsonwebtoken');

const jwtSecret = 'cant you appprehend not being bound by anything is the greatest limitation';

 module.exports = (req, _res, next) => {
  const token = req.headers.authorization;
  if (!token) return next('missing auth token');

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return next('jwt malformed');
  }
 };
