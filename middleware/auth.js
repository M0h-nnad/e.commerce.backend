const jwt = require("jsonwebtoken");
const config = process.env;
const verfiyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) return res.status(401).send({ messages: "Please Login First" });
  try {
    const decoded = await jwt.verify(token, config.Secret);
    req.user = decoded;
    req.decToken = await jwt.decode(token)
  } catch (err) {
    return res.status(401).send({ messages: "Invalid Token" });
  }

  return next();
};

module.exports = verfiyToken;
