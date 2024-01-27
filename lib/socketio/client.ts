import { io, Socket } from "socket.io-client";

interface Message {
	created_at: string;
	text: string;
	sender_name: string;
	message_id: string;
}

interface ServerToClientEvents {
	"client-new": (chatroom_id: string) => void;
	getMessage: ({ message, sender }: { message: Message; sender: string }) => void;
}

interface ClientToServerEvents {}

// Setup the Socket
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(":8081", {
	transports: ["websocket", "polling"],
	path: "/api/socketio",
	addTrailingSlash: false,
	withCredentials: true,
	autoConnect: false,
	query: {},
});

export default socket;
