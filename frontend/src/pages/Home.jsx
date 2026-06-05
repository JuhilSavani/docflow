import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { FileText, Users, Zap } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [roomTitle, setRoomTitle] = useState("Untitled Document");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/rooms`, {
        title: roomTitle || "Untitled Document"
      });
      const newRoomId = response.data.id;
      toast.success("Room created successfully!");
      navigate(`/room/${newRoomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/rooms/${roomId}`);
      if (response.data.error) {
        toast.error("Room not found");
        return;
      }
      toast.success("Joining room...");
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            DocFlow
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real-time collaborative document editing. Create, share, and edit together.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Rich Text Editor</h3>
            <p className="text-sm text-slate-600">
              Format text, add headings, lists, and more with an intuitive interface
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Live Collaboration</h3>
            <p className="text-sm text-slate-600">
              See who's online and watch edits happen in real-time
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Export Options</h3>
            <p className="text-sm text-slate-600">
              Download your documents as TXT, MD, HTML, or PDF
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room */}
          <Card data-testid="create-room-card" className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Room</CardTitle>
              <CardDescription>
                Start a new collaborative document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-title">Document Title (Optional)</Label>
                <Input
                  id="room-title"
                  data-testid="room-title-input"
                  type="text"
                  placeholder="Enter document title"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createRoom()}
                />
              </div>
              <Button
                data-testid="create-room-button"
                onClick={createRoom}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card data-testid="join-room-card" className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Join Existing Room</CardTitle>
              <CardDescription>
                Enter a room ID to collaborate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">Room ID</Label>
                <Input
                  id="room-id"
                  data-testid="room-id-input"
                  type="text"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                />
              </div>
              <Button
                data-testid="join-room-button"
                onClick={joinRoom}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;