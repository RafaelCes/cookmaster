module.exports = (err, _req, res, _next) => {
  console.log(err);
  if (err.isJoi) {
    return res.status(400).json({
       message: 'Invalid entries. Try again.',
    });
  }
  const message = {
    409: 'Email already registered',
    500: 'Internal server error',
  };

  return res.status(err.status).json({
    message: message[err.status],
  });
};