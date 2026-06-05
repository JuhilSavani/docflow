import Room from '../models/Room.js';
import Document from '../models/Document.js';

export default class RoomController {
  static async index(req, res) {
    res.json({ message: 'DocFlow API' });
  }
  
  static async createRoom(req, res) {
    try {
      const { title } = req.body;
      const room = await Room.create(title);
      
      // Create empty document for this room
      await Document.create(room.id);
      
      res.json(room);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ error: 'Failed to create room' });
    }
  }
  
  static async getRoom(req, res) {
    try {
      const { room_id } = req.params;
      const room = await Room.findById(room_id);
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      res.json(room);
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(500).json({ error: 'Failed to get room' });
    }
  }
  
  static async updateRoomTitle(req, res) {
    try {
      const { room_id } = req.params;
      const { title = 'Untitled Document' } = req.body;
      
      await Room.updateTitle(room_id, title);
      
      res.json({ success: true, title });
    } catch (error) {
      console.error('Error updating title:', error);
      res.status(500).json({ error: 'Failed to update title' });
    }
  }
}

