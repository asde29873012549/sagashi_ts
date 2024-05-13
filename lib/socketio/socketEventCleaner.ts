import Socket from "./client";

export default function socketEventCleaner(socket: typeof Socket) {
	socket.off("connect");
	socket.off("disconnect");
	socket.off("connect_error");
	// socket.off("reconnect");
	// socket.off("reconnect_error");
	// socket.off("reconnect_failed");
	socket.off("clientNew");
	socket.off("getMessage");
	socket.off("userLeft");
	// socket.off("client-count");
}
