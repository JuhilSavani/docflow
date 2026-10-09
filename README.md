# docflow

A real-time collaborative rich-text editor built with React, Tiptap, Node.js, and Socket.IO.

It features live multiplayer editing via WebSockets, document auto-saving to MongoDB, and PDF export functionality. The interface is built with Tailwind CSS v4 and Radix UI components.

## Quickstart

The easiest way to spin up the entire stack is using Docker Compose.

```sh
# Setup environment variables
cp backend/.env.example backend/.env

# Start the stack
docker compose up -d
```

### Services

Once running, the following services are available:

| Service | Local URL |
| :--- | :--- |
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **MongoDB** | mongodb://localhost:27017 |

## Stopping

To tear down the containers:

```sh
docker compose down
```
