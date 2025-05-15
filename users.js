const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only jpg and png
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max file size
});

// Validation rules
const userValidation = [
  body('username')
    .isLength({ min: 4, max: 20 })
    .withMessage('Username must be between 4 and 20 characters')
    .matches(/^\S+$/)
    .withMessage('Username cannot contain spaces')
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one number and one special character'),
  body('profession')
    .isIn(['Student', 'Developer', 'Entrepreneur'])
    .withMessage('Invalid profession selected'),
  body('companyName')
    .if(body('profession').equals('Entrepreneur'))
    .not()
    .isEmpty()
    .withMessage('Company name is required for entrepreneurs'),
  body('addressLine1')
    .not()
    .isEmpty()
    .withMessage('Address is required'),
  body('country')
    .not()
    .isEmpty()
    .withMessage('Country is required'),
  body('state')
    .not()
    .isEmpty()
    .withMessage('State is required'),
  body('city')
    .not()
    .isEmpty()
    .withMessage('City is required'),
  body('subscriptionPlan')
    .isIn(['Basic', 'Pro', 'Enterprise'])
    .withMessage('Invalid subscription plan'),
  body('gender')
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender selected'),
  body('customGender')
    .if(body('gender').equals('Other'))
    .not()
    .isEmpty()
    .withMessage('Custom gender is required when selecting "Other"')
];

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (username.length < 4 || username.length > 20) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be between 4 and 20 characters' 
      });
    }
    
    if (!/^\S+$/.test(username)) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username cannot contain spaces' 
      });
    }
    
    const existingUser = await User.findOne({ username });
    
    return res.json({
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ 
      error: 'Server error while checking username availability' 
    });
  }
});

// Password change validation route
router.post('/check-password', [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one number and one special character')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { password } = req.body;
  
  // Calculate password strength
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Complexity checks
  if (/[0-9]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  // Determine strength level
  let strengthLevel = 'weak';
  if (strength >= 4) strengthLevel = 'medium';
  if (strength >= 6) strengthLevel = 'strong';
  
  return res.json({
    valid: true,
    strength: strengthLevel,
    score: strength
  });
});

// Register new user
router.post('/register', upload.single('profilePhoto'), userValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there was a file upload, delete it on validation error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      password,
      profession,
      companyName,
      addressLine1,
      country,
      state,
      city,
      subscriptionPlan,
      newsletter,
      gender,
      customGender
    } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // If there was a file upload, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        errors: [{ msg: 'Username already taken' }]
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      profession,
      companyName,
      addressLine1,
      country,
      state,
      city,
      subscriptionPlan: subscriptionPlan || 'Basic',
      newsletter: newsletter === 'true' || newsletter === true,
      gender,
      customGender,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : null
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    // If there was a file upload, delete it on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      error: 'Server error during registration'
    });
  }
});

// Verify password (for password change)
router.post('/verify-password', async (req, res) => {
  try {
    const { username, currentPassword } = req.body;
    
    if (!username || !currentPassword) {
      return res.status(400).json({
        error: 'Username and current password are required'
      });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }
    
    return res.json({
      message: 'Password verified successfully'
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({
      error: 'Server error during password verification'
    });
  }
});

// Update user profile
router.put('/:username', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = { ...req.body };
    
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      // If there was a file upload, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    // Handle password update
    if (updateData.newPassword) {
      // Verify current password
      const isMatch = await user.comparePassword(updateData.currentPassword);
      if (!isMatch) {
        // If there was a file upload, delete it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          error: 'Current password is incorrect'
        });
      }
      
      // Update password
      user.password = updateData.newPassword;
      
      // Remove password fields from updateData
      delete updateData.currentPassword;
      delete updateData.newPassword;
    }
    
    // Handle profile photo
    if (req.file) {
      // Delete old profile photo if exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Update with new photo
      user.profilePhoto = `/uploads/${req.file.filename}`;
    }
    
    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'profilePhoto' && key !== 'password') {
        user[key] = updateData[key];
      }
    });
    
    // Update timestamps
    user.updatedAt = Date.now();
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    // If there was a file upload, delete it on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      error: 'Server error during profile update'
    });
  }
});

module.exports = router; 