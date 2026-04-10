const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'User role is not authorized or not an admin' });
  }
};

module.exports = { authorizeAdmin };
