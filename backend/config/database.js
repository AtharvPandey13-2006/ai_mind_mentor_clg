import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mind_mentor';
    
    const options = {
      // useNewUrlParser: true, // These options are no longer needed in Mongoose 6+
      // useUnifiedTopology: true,
    };
    
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

export default { connectDatabase, disconnectDatabase };
