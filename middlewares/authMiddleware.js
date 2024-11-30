const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log("Auth middleware invoked"); // Start log

    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      console.log("No token found");
      return res.status(401).send({
        message: "Auth failed. No token provided.",
        success: false,
      });
    }

    const decoded = jwt.verify(token, "BusKaro");
   

    req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin };
    

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    

    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({
        message: "Auth failed. Token expired.",
        success: false,
      });
    }

    return res.status(401).send({
      message: "Auth failed. Invalid token.",
      success: false,
    });
  }
};
