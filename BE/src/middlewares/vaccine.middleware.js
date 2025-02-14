import jwt from "jsonwebtoken";
import "dotenv/config";

export const verifyVaccineAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "You're not authenticated" });
    }
    const accessToken = token.split(" ")[1];

    jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid" });
      }
      if (user.role !== "admin") {
        return res.status(403).json({ message: "You do not have Admin privileges" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const validateVaccineData = (req, res, next) => {
  const { vaccineName, price, quantity, mfgDate, expDate } = req.body;
  
  if (!vaccineName || !price || !quantity || !mfgDate || !expDate) {
    return res.status(400).json({ 
      message: "Please provide all required vaccine information" 
    });
  }

  if (price <= 0) {
    return res.status(400).json({ message: "Price must be greater than 0" });
  }

  if (quantity < 0) {
    return res.status(400).json({ message: "Quantity cannot be negative" });
  }

  next();
}; 