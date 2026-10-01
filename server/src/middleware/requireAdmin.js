const requireAdmin = (req, res, next) => {
  // verifyFirebaseToken middleware runs before this and sets req.user
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Not authenticated',
      error: 'UNAUTHORIZED'
    });
  }

  // Check the custom claim "admin"
  if (user.admin === true || (process.env.NODE_ENV === 'development' && user.uid === 'mock-user-123')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Admin access required',
    error: 'FORBIDDEN'
  });
};

module.exports = requireAdmin;
