const STATIC_TOKEN = "sdnkke4iyby8YHGUYGUY44"; // Replace with your actual token

const staticTokenAuth = (req, res, next) => {
  const token = req.headers["x-api-key"]; // Use a custom header like 'x-api-key'

  if (token && token === STATIC_TOKEN) {
    return next();
  }

  return res
    .status(401)
    .json({ message: "Unauthorized. Invalid or missing token." });
};

module.exports = staticTokenAuth;
