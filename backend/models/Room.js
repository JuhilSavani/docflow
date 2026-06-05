import { v4 as uuidv4 } from 'uuid';
import { getDatabaseConnection } from '../config/database.js';

export default class Room {
  static async create(title = 'Untitled Document') {
    const db = getDatabaseConnection();
    const room = {
      id: uuidv4(),
      title,
      created_at: new Date().toISOString()
    };
    
    await db.collection('rooms').insertOne(room);
    return room;
  }
  
  static async findById(roomId) {
    const db = getDatabaseConnection();
    return await db.collection('rooms').findOne(
      { id: roomId },
      { projection: { _id: 0 } }
    );
  }
  
  static async updateTitle(roomId, title) {
    const db = getDatabaseConnection();
    return await db.collection('rooms').updateOne(
      { id: roomId },
      { $set: { title } }
    );
  }
}

