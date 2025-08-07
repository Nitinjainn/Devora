const mongoose = require('mongoose');
const User = require('../model/UserModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stpi-hackathon', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixEmptyDomainFields() {
  try {
    console.log('🔍 Searching for users with empty domain fields...');
    
    // Find users with empty domain fields
    const usersWithEmptyDomain = await User.find({ domain: '' });
    console.log(`Found ${usersWithEmptyDomain.length} users with empty domain fields`);
    
    if (usersWithEmptyDomain.length > 0) {
      // Update all users with empty domain to have undefined domain
      const result = await User.updateMany(
        { domain: '' },
        { $unset: { domain: 1 } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} users with empty domain fields`);
    } else {
      console.log('✅ No users found with empty domain fields');
    }
    
    // Also fix any other empty enum fields
    console.log('🔍 Checking for other empty enum fields...');
    
    const updatePromises = [];
    
    // Fix courseDuration
    const courseDurationResult = await User.updateMany(
      { courseDuration: '' },
      { $unset: { courseDuration: 1 } }
    );
    if (courseDurationResult.modifiedCount > 0) {
      console.log(`✅ Fixed ${courseDurationResult.modifiedCount} users with empty courseDuration`);
    }
    
    // Fix currentYear
    const currentYearResult = await User.updateMany(
      { currentYear: '' },
      { $unset: { currentYear: 1 } }
    );
    if (currentYearResult.modifiedCount > 0) {
      console.log(`✅ Fixed ${currentYearResult.modifiedCount} users with empty currentYear`);
    }
    
    // Fix yearsOfExperience
    const yearsOfExperienceResult = await User.updateMany(
      { yearsOfExperience: '' },
      { $unset: { yearsOfExperience: 1 } }
    );
    if (yearsOfExperienceResult.modifiedCount > 0) {
      console.log(`✅ Fixed ${yearsOfExperienceResult.modifiedCount} users with empty yearsOfExperience`);
    }
    
    console.log('✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error fixing empty domain fields:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixEmptyDomainFields();
