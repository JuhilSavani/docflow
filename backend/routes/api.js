import express from 'express';
import RoomController from '../controllers/roomController.js';
import DocumentController from '../controllers/documentController.js';

const router = express.Router();

router.get('/', RoomController.index);
router.post('/rooms', RoomController.createRoom);
router.get('/rooms/:room_id', RoomController.getRoom);
router.get('/rooms/:room_id/document', DocumentController.getDocument);
router.put('/rooms/:room_id/title', RoomController.updateRoomTitle);

export default router;