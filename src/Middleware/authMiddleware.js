const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, "SECRET_KEY", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
