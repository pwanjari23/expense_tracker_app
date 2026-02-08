const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  console.log("🔐 Auth middleware triggered");

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.warn("⚠️ Authorization header missing");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.warn("⚠️ Bearer token missing in Authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  console.log("🧾 Token received (length):", token.length);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ JWT verification failed:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;

    console.log("✅ JWT verified successfully", {
      userId: user.id,
      email: user.email,
    });

    next();
  });
};

module.exports = authenticateToken;
