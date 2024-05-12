import * as dotenv from "dotenv";
import socket from "@/lib/socketio/client";
import { useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "../types/global";
import socketEventCleaner from "./socketEventCleaner";

dotenv.config();

interface SocketInitializer {
	queryClient: ReturnType<typeof useQueryClient>;
	chatroom_id: string;
	setId?: React.Dispatch<React.SetStateAction<string[]>>;
	fetchQuery: () => Promise<ApiResponse<number[]>>;
}

export default async function socketInitializer({
	queryClient,
	chatroom_id,
	setId,
	fetchQuery,
}: SocketInitializer) {
	// ping the server to setup a socket if not already running
	// await fetch(`${NEXT_PUBLIC_SERVER_DOMAIN}/api/ws`);
	socket.removeAllListeners();

	// Standard socket management
	socket.on("connect", async () => {
		console.log("Connected to the server");

		try {
			const result = await fetchQuery();
			if (result.status === "fail") throw new Error();
		} catch (err) {
			console.log(err);
		}
	});

	socket.on("disconnect", async () => {
		console.log("Disconnected from the server");

		try {
			const result = await fetchQuery();
			if (result.status === "fail") throw new Error();
		} catch (err) {
			console.log(err);
		} finally {
			socketEventCleaner(socket);
		}
	});

	socket.on("connect_error", (error) => {
		console.log("Connection error:", error);
	});

	// socket.on("reconnect", (attemptNumber) => {
	// 	console.log("Reconnected to the server. Attempt:", attemptNumber);
	// });

	// socket.on("reconnect_error", (error) => {
	// 	console.log("Reconnection error:", error);
	// });

	// socket.on("reconnect_failed", () => {
	// 	console.log("Failed to reconnect to the server");
	// });

	// Manage socket message events
	socket.on("client-new", (chatroom_id) => {
		console.log(`Recieved 'client-new' event with chatroom_id: ${chatroom_id}`);
		chatroom_id && setId && setId(chatroom_id);
	});

	socket.on("getMessage", ({ message }) => {
		queryClient.invalidateQueries({ queryKey: ["messages", chatroom_id] });
		console.log("getMessage: ", message);
	});

	// socket.on("client-count", (count) => {
	// 	console.log("clientCount", count);
	// });

	return socket;
}
