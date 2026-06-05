import Document from '../models/Document.js';

export default class DocumentController {
  static async getDocument(req, res) {
    try {
      const { room_id } = req.params;
      let doc = await Document.findByRoomId(room_id);
      
      if (!doc) {
        // Create empty document if doesn't exist
        doc = await Document.create(room_id);
      }
      
      res.json(doc);
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({ error: 'Failed to get document' });
    }
  }
}
