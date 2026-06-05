import { MongoClient } from 'mongodb';

let database = null;

export const connectMongo = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URL);
    database = client.db(process.env.DATABASE_NAME);
    console.log('Connected to MongoDB');
    return database;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};


export const getDatabaseConnection = () => {
  if (!database) {
    throw new Error('Database not initialized. Call connectMongo first.');
  }
  return database;
};


