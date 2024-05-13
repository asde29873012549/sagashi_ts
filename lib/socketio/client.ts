import { io, Socket } from "socket.io-client";

interface Message {
	created_at: string;
	text: string;
	sender_name: string;
	message_id: string;
}

interface ServerToClientEvents {
	clientNew: (chatroom_id: string[]) => void;
	getMessage: ({ message, sender }: { message: Message; sender: string }) => void;
	userLeft: ({ chatroom_id, user }: { chatroom_id: string; user: string }) => void;
}

interface ClientToServerMessage {
	created_at: string;
	text: string;
	sender_name: string;
	message_id: string;
	chatroom_id: string;
}

interface ClientToServerEvents {
	message: (message: { message: ClientToServerMessage }) => void;
	leave: (cId: { currentActiveChatroom: string }) => void;
	join: (cId: { currentActiveChatroom: string }) => void;
}

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
