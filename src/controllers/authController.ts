import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, UserRole, UserStatus } from '../models/User.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
}

// In-memory store used as graceful fallback in dev if MongoDB is not yet running/connected
const inMemoryUsers: InMemoryUser[] = [
  {
    id: 'usr-admin-1',
    name: 'Admin User',
    email: 'admin@carehub.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
    status: 'active',
  },
  {
    id: 'usr-doctor-1',
    name: 'Dr. Priya Sharma',
    email: 'doctor@carehub.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'doctor',
    status: 'active',
  },
  {
    id: 'usr-reception-1',
    name: 'Reception Desk',
    email: 'reception@carehub.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'receptionist',
    status: 'active',
  },
];

export const getInMemoryUserById = (id: string) => inMemoryUsers.find((u) => u.id === id);

const isMongoConnected = () => mongoose.connection.readyState === 1;

const generateToken = (id: string, name: string, email: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET || 'carehub_super_secret_jwt_key_2026_clinic_mgmt';
  return jwt.sign({ id, name, email, role }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    const assignedRole: UserRole = ['admin', 'doctor', 'receptionist'].includes(role)
      ? role
      : 'receptionist';

    // If MongoDB is connected, use real Mongoose model
    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'A user with this email already exists.',
        });
        return;
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: assignedRole,
        status: 'active',
      });

      const token = generateToken(user._id.toString(), user.name, user.email, user.role);

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
      return;
    }

    // In-memory fallback
    const existing = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
      return;
    }

    const newUser: InMemoryUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: assignedRole,
      status: 'active',
    };
    inMemoryUsers.push(newUser);

    const token = generateToken(newUser.id, newUser.name, newUser.email, newUser.role);
    res.status(201).json({
      success: true,
      message: 'Registration successful (In-Memory Dev Mode).',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    // If MongoDB is connected, use real Mongoose model
    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      if (user.status === 'inactive') {
        res.status(403).json({
          success: false,
          message: 'Your account is deactivated. Please contact the clinic admin.',
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
        return;
      }

      const token = generateToken(user._id.toString(), user.name, user.email, user.role);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
      return;
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({
        success: false,
        message: 'Your account is deactivated.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user.id, user.name, user.email, user.role);
    res.status(200).json({
      success: true,
      message: 'Login successful (In-Memory Dev Mode).',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized.',
      });
      return;
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
      return;
    }

    // In-memory fallback
    const user = getInMemoryUserById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error.',
    });
  }
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
      return;
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'No account found with this email address.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email address.',
      });
      return;
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email address.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing password reset.',
    });
  }
};

// @desc    Reset password with email and new password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'No account found with this email address.',
        });
        return;
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
      return;
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while resetting password.',
    });
  }
};

// @desc    Update password for logged in user
// @route   PATCH /api/auth/update-password
// @access  Private
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized.',
      });
      return;
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found.',
        });
        return;
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
        return;
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
      });
      return;
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.id === req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating password.',
    });
  }
};


