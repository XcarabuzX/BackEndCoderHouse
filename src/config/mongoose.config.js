import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ecommerce?directConnection=true';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};
