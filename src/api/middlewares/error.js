module.exports = (err, _req, res, _next) => {
  const code = {
    'Invalid entries. Try again.': 400,
    'Email already registered': 409,
    'All fields must be filled': 401,
    'Incorrect username or password': 401,
    'jwt malformed': 401,
    'Internal server error': 500,
  };

  return res.status(code[err]).json({
    message: err,
  });
};