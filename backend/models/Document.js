import { getDatabaseConnection } from '../config/database.js';

export default class Document {
  static async create(roomId) {
    const db = getDatabaseConnection();
    const doc = {
      room_id: roomId,
      content: '',
      updated_at: new Date().toISOString()
    };
    
    await db.collection('documents').insertOne(doc);
    return doc;
  }
  
  static async findByRoomId(roomId) {
    const db = getDatabaseConnection();
    return await db.collection('documents').findOne(
      { room_id: roomId },
      { projection: { _id: 0 } }
    );
  }
  
  static async updateContent(roomId, content) {
    const db = getDatabaseConnection();
    return await db.collection('documents').updateOne(
      { room_id: roomId },
      {
        $set: {
          content,
          updated_at: new Date().toISOString()
        }
      },
      { upsert: true }
    );
  }
}

