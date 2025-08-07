const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../model/UserModel');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.generate2FA = async (req, res) => {
  console.log('2FA generate endpoint called:', {
    userId: req.user?._id,
    email: req.user?.email,
    hasUser: !!req.user
  });

  try {
    const secret = speakeasy.generateSecret({ 
      name: `STPI Hackathon Platform (${req.user.email})`,
      issuer: 'STPI Platform'
    });
    
    req.user.twoFA = { enabled: false, secret: secret.base32 };
    
    // Clean enum fields before saving to prevent validation errors
    if (req.user.courseDuration === '') req.user.courseDuration = undefined;
    if (req.user.currentYear === '') req.user.currentYear = undefined;
    if (req.user.yearsOfExperience === '') req.user.yearsOfExperience = undefined;
    if (req.user.preferredHackathonTypes && req.user.preferredHackathonTypes.includes('')) {
      req.user.preferredHackathonTypes = req.user.preferredHackathonTypes.filter(type => type !== '');
    }
    
    await req.user.save();

    const otpauth_url = secret.otpauth_url;
    qrcode.toDataURL(otpauth_url, (err, data_url) => {
      if (err) {
        console.error('QR code generation error:', err);
        return res.status(500).json({ message: 'QR code generation failed' });
      }
      console.log('2FA generated successfully for user:', req.user.email);
      res.json({ 
        qr: data_url, 
        secret: secret.base32,
        message: '2FA setup initiated successfully'
      });
    });
  } catch (err) {
    console.error('2FA generation error:', err);
    res.status(500).json({ message: 'Failed to generate 2FA', error: err.message });
  }
};

exports.verify2FA = async (req, res) => {
  console.log('2FA verify endpoint called:', {
    userId: req.user?._id,
    email: req.user?.email,
    hasUser: !!req.user
  });

  try {
    const { token } = req.body;
    
    if (!token || token.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid 6-digit code' 
      });
    }

    const user = req.user;
    
    if (!user.twoFA || !user.twoFA.secret) {
      return res.status(400).json({ 
        success: false, 
        message: '2FA not set up for this user' 
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFA.secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });

    if (verified) {
      user.twoFA.enabled = true;
      
      // Clean enum fields before saving to prevent validation errors
      if (user.courseDuration === '') user.courseDuration = undefined;
      if (user.currentYear === '') user.currentYear = undefined;
      if (user.yearsOfExperience === '') user.yearsOfExperience = undefined;
      if (user.preferredHackathonTypes && user.preferredHackathonTypes.includes('')) {
        user.preferredHackathonTypes = user.preferredHackathonTypes.filter(type => type !== '');
      }
      
      await user.save();
      console.log('2FA verified and enabled for user:', user.email);
      return res.json({ 
        success: true, 
        message: '2FA enabled successfully' 
      });
    } else {
      console.log('2FA verification failed for user:', user.email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }
  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(500).json({ 
      message: 'Failed to verify 2FA', 
      error: err.message 
    });
  }
};

exports.login2FA = async (req, res) => {
  console.log('2FA login endpoint called:', req.body);

  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ 
        message: 'User ID and token are required' 
      });
    }

    if (token.length !== 6) {
      return res.status(400).json({ 
        message: 'Please enter a valid 6-digit code' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFA || !user.twoFA.enabled) {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFA.secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid 2FA code' });
    }

    // Generate JWT token
    const authToken = generateToken(user);

    console.log('2FA login successful for user:', user.email);
    res.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted || false,
        twoFA: user.twoFA
      },
      token: authToken,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('2FA login error:', err);
    res.status(500).json({ 
      message: 'Failed to process 2FA login', 
      error: err.message 
    });
  }
};

exports.disable2FA = async (req, res) => {
  console.log('2FA disable endpoint called:', {
    userId: req.user?._id,
    email: req.user?.email,
    hasUser: !!req.user,
    authProvider: req.user?.authProvider,
    body: req.body
  });

  try {
    const { currentPassword } = req.body;
    
    // Verify current password before disabling 2FA (only for email users)
    if (req.user.authProvider === 'email') {
      const bcrypt = require('bcryptjs');
      
      console.log('Fetching full user object for password verification...');
      // Fetch the full user object to get passwordHash (since middleware excludes it)
      const fullUser = await User.findById(req.user._id);
      if (!fullUser) {
        console.log('User not found in database');
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      console.log('User found, checking password...');
      if (!currentPassword) {
        console.log('No password provided');
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is required' 
        });
      }
      
      if (!fullUser.passwordHash) {
        console.log('User has no password hash (OAuth user)');
        return res.status(400).json({ 
          success: false, 
          message: 'Password verification not available for OAuth users' 
        });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, fullUser.passwordHash);
      if (!isPasswordValid) {
        console.log('Password verification failed');
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      console.log('Password verification successful');
    } else {
      console.log('User is OAuth provider, skipping password check');
      // For OAuth users, we can disable 2FA without password verification
      // since they don't have a password
    }

    console.log('Updating user 2FA status...');
    // Update the user's 2FA status
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { twoFA: { enabled: false, secret: null } },
      { new: true }
    );
    
    if (!updatedUser) {
      console.log('Failed to update user');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update user' 
      });
    }
    
    console.log('2FA disabled for user:', req.user.email);
    res.json({ 
      success: true, 
      message: '2FA disabled successfully' 
    });
  } catch (err) {
    console.error('2FA disable error:', err);
    res.status(500).json({ 
      message: 'Failed to disable 2FA', 
      error: err.message 
    });
  }
};

// New endpoint to check 2FA status
exports.get2FAStatus = async (req, res) => {
  console.log('2FA status endpoint called:', {
    userId: req.user?._id,
    email: req.user?.email,
    hasUser: !!req.user
  });

  try {
    const user = await User.findById(req.user._id);
    const status = {
      enabled: user.twoFA?.enabled || false,
      setup: !!(user.twoFA?.secret)
    };
    console.log('2FA status for user:', status);
    res.json(status);
  } catch (err) {
    console.error('2FA status error:', err);
    res.status(500).json({ 
      message: 'Failed to get 2FA status', 
      error: err.message 
    });
  }
}; 