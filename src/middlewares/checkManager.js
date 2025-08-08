const checkManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ message: "Access denied. Managers only." });
  }
  next();
};

module.exports = checkManager;
