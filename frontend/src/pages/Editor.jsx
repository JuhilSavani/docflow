import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "sonner";
import Toolbar from "../components/Toolbar";
import UserList from "../components/UserList";
import ExportMenu from "../components/ExportMenu";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Editor = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [roomTitle, setRoomTitle] = useState("Untitled Document");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [userColor] = useState(() => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  });
  
  // Use ref to track if we're updating from remote
  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none',
      },
    },
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      // Only emit if this is a local update (not from remote)
      if (!isRemoteUpdate.current && socket && connected) {
        const content = editor.getHTML();
        console.log('Emitting document_change, content length:', content.length);
        socket.emit('document_change', {
          roomId,
          content
        });
      }
    },
  });

  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        editor.commands.focus('end');
      }, 100);
    }
  }, [editor]);

  // Load initial document
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const [docResponse, roomResponse] = await Promise.all([
          axios.get(`${API}/rooms/${roomId}/document`),
          axios.get(`${API}/rooms/${roomId}`)
        ]);
        
        if (roomResponse.data.error) {
          toast.error("Room not found");
          navigate("/");
          return;
        }

        if (editor && docResponse.data.content) {
          isRemoteUpdate.current = true;
          editor.commands.setContent(docResponse.data.content);
          isRemoteUpdate.current = false;
        }
        
        setRoomTitle(roomResponse.data.title || "Untitled Document");
      } catch (error) {
        console.error("Error loading document:", error);
        toast.error("Failed to load document");
      }
    };

    if (editor) {
      loadDocument();
    }
  }, [editor, roomId, navigate]);

  // Socket.IO connection - REMOVED editor from dependencies
  useEffect(() => {
    // Get username before connecting
    const name = localStorage.getItem('docflow_username') || 
                 prompt("Enter your name:") || 
                 "Anonymous";
    
    if (name && name !== "Anonymous") {
      localStorage.setItem('docflow_username', name);
    }
    setUserName(name);

    const newSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      upgrade: false, 
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5, 
    });

    newSocket.on('connect', () => {
      console.log('Connected to server via WebSocket');
      console.log('Transport:', newSocket.io.engine.transport.name); // Should log 'websocket'
      setConnected(true);
      
      // Join room
      newSocket.emit('join_room', {
        roomId,
        userName: name,
        userId,
        color: userColor
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('document-update', (data) => {
      console.log('Received document-update, content length:', data.content.length);
      if (editor && data.content !== editor.getHTML()) {
        isRemoteUpdate.current = true;
        const { from, to } = editor.state.selection;
        editor.commands.setContent(data.content, false);
        editor.commands.setTextSelection({ from, to });
        isRemoteUpdate.current = false;
      }
    });

    newSocket.on('users-update', (usersList) => {
      console.log('Received users-update:', usersList);
      setUsers(usersList);
    });

    newSocket.on('user-connected', (userData) => {
      toast.success(`${userData.userName} joined`);
    });

    newSocket.on('user-disconnected', (userData) => {
      toast.info(`${userData.userName} left`);
    });

    newSocket.on('title-update', (data) => {
      setRoomTitle(data.title);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_room', { roomId });
      newSocket.close();
    };
  }, [roomId, userId, userColor]); // Removed editor from dependencies

  const handleTitleChange = useCallback((newTitle) => {
    setRoomTitle(newTitle);
    if (socket && connected) {
      socket.emit('title_change', {
        roomId,
        title: newTitle
      });
    }
  }, [socket, connected, roomId]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!roomTitle.trim()) {
      setRoomTitle("Untitled Document");
      handleTitleChange("Untitled Document");
    } else {
      handleTitleChange(roomTitle);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              data-testid="back-home-button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            {isEditingTitle ? (
              <Input
                data-testid="title-input"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleBlur();
                  }
                }}
                className="text-base sm:text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-2 w-full max-w-[120px] sm:max-w-[200px] md:max-w-xs"
                autoFocus
              />
            ) : (
              <h1
                data-testid="document-title"
                className="text-base sm:text-lg font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs"
                onClick={() => setIsEditingTitle(true)}
              >
                {roomTitle}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              {connected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600 hidden sm:inline">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-slate-600 hidden sm:inline">Disconnected</span>
                </>
              )}
            </div>

            {/* Export Menu */}
            <ExportMenu editor={editor} title={roomTitle} />
            
            {/* User List */}
            <UserList users={users} currentUserId={userId} />
          </div>
        </div>

        {/* Toolbar */}
        <Toolbar editor={editor} />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div 
          className="p-4 sm:p-8 max-w-full"
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent 
            data-testid="editor-content" 
            editor={editor}
            onClick={() => editor?.commands.focus()}
          />
        </div>
      </div>

      {/* Room ID Footer */}
      <div className="border-t border-slate-200 bg-slate-50 px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between text-sm text-slate-600 gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-medium shrink-0">Room ID:</span>
            <code 
              data-testid="copy-room-id-button"
              className="bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer px-2 py-1 rounded text-xs font-mono truncate max-w-[120px] sm:max-w-[200px] md:max-w-none select-none"
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                toast.success("Room ID copied to clipboard");
              }}
              title="Click to copy"
            >
              {roomId}
            </code>
          </div>
          <div className="text-xs text-slate-500 whitespace-nowrap shrink-0">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;