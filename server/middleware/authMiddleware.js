import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from "../models/Worker.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        // Check if the token belongs to a Worker
        const worker = await Worker.findById(decoded.id).select('-password');
        if (worker) {
          req.user = worker;
        }
      }
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      return next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

{/*  WORKER AUTH MIDDLEWARE*/}

export const protectWorker = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(
      "Bearer"
    )
  ) {
    try {
      token =
        req.headers.authorization.split(
          " "
        )[1];

      // VERIFY TOKEN
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // GET WORKER
      req.worker =
        await Worker.findById(
          decoded.id
        ).select("-password");

      if (!req.worker) {
        return res.status(401).json({
          success: false,
          message: "Worker not found",
        });
      }

      return next();

    } catch (error) {

      return res.status(401).json({
        success: false,
        message:
          "Not authorized, invalid token",
      });

    }
  }

  return res.status(401).json({
    success: false,
    message: "Not authorized, no token",
  });
};


export default protect;
