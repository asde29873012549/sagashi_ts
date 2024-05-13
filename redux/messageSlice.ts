import { ChatroomType, MessageNotification } from "@/lib/types/global";
import { createSlice } from "@reduxjs/toolkit";

interface message {
	chatroom: ChatroomType[] | MessageNotification[];
	isOnlineMessageRead: { [key: string]: string | null };
	isNotificationReadMap: { [key: string]: string | null };
	lastMessage: { [key: string]: { text: string; updated_at: string } };
	currentActiveChatroom: string | null;
	currentTab: "sell" | "buy";
	isMobileMessageBoxOpen: boolean;
	mobileMessageBoxData: {
		product_id?: string;
		listingOwner?: string;
		username?: string;
		image?: string;
		date?: string;
		listing_name?: string;
		listing_designer?: string;
	};
}

interface messageState {
	message: message;
}

type Chatroom = ChatroomType[] | MessageNotification[];

let initialState: message = {
	chatroom: [],
	isOnlineMessageRead: {},
	isNotificationReadMap: {},
	lastMessage: {},
	currentActiveChatroom: null,
	currentTab: "sell",
	isMobileMessageBoxOpen: false,
	mobileMessageBoxData: {},
};

const findElemtAndIndex = (
	arr: Chatroom,
	predicate: (c: ChatroomType | MessageNotification) => boolean,
) => {
	const index = arr.findIndex(predicate);
	if (index !== -1) {
		return { element: arr[index], index };
	}
	return { element: undefined, index: -1 };
};

const messageSlice = createSlice({
	name: "message",
	initialState,
	reducers: {
		setChatroom: (state, action) => {
			switch (action.payload.type) {
				case "getNewMessage":
					const { element: chatroom, index } = findElemtAndIndex(state.chatroom, (c) => {
						const cId =
							"id" in c
								? c.id
								: "listing_id" in c && `${c.listing_id}-${c.seller_name}-${c.buyer_name}`;
						return cId === action.payload.newMessageChatroomId;
					});

					if (chatroom) {
						state.chatroom = [
							action.payload.newNotification,
							...state.chatroom.toSpliced(index, 1),
						];
					} else {
						state.chatroom = [action.payload.newNotification, ...state.chatroom];
					}
					break;
				case "updateMessageReadAt":
					state.chatroom = state.chatroom.map((msg) => {
						if ("read_at" in msg && !msg.read_at && msg.id === action.payload.chatroom_id) {
							return { ...msg, read_at: new Date().toISOString() };
						}
						return msg;
					}) as ChatroomType[] | MessageNotification[];
					break;
				case "getInitialChatroomList":
					state.chatroom = action.payload.initialChatroomList.map((msg: ChatroomType) => {
						// If the last sent user is the current user, there's no need to mark it as unread
						// Because the user who sent the message will definitely read it
						if ("read_at" in msg && !msg.read_at && msg.last_sent_user_name === action.payload.user)
							return { ...msg, read_at: new Date().toISOString() };
						return msg;
					});
					break;
			}
		},
		setOnlineMessageReadStatus: (state, action) => {
			// change read status when clicking on itemCard
			// if typeof payload is string (passed in chatroom_id), means that specific chatroom is clicked and read
			if (typeof action.payload === "string") {
				state.isOnlineMessageRead = {
					...state.isOnlineMessageRead,
					[action.payload]: new Date().toISOString(),
				};
				// initialize read status when fetching chatroom list, depending on the read_at field
			} else {
				// if received new message from eventSource
				// 1. receive message from currentActive chatroom, then the message will be initially read, so should have read_at data
				// 2. receive messsage but was not current active chatroom, then the message will be initially unread, so should not have read_at data
				state.isOnlineMessageRead = {
					...state.isOnlineMessageRead,
					[action.payload.chatroom_id]: action.payload.read_at || null,
				};
			}
		},
		setLastMessage: (state, action) => {
			// set last message when initially received chatroom list
			if (Array.isArray(action.payload)) {
				if (Object.keys(state.lastMessage).length === 0) {
					const temp = { ...state.lastMessage };
					action.payload.forEach((obj) => {
						temp[obj.chatroom_id] = { text: obj.text, updated_at: obj.updated_at };
					});

					state.lastMessage = temp;
				}
			} else {
				// if received new message from eventSource, or user input message, reset the new message as chatroom's last message
				state.lastMessage = {
					...state.lastMessage,
					[action.payload.chatroom_id]: {
						text: action.payload.text,
						updated_at: new Date().toISOString(),
					},
				};
			}
		},
		setNotificationReadStatus: (state, action) => {
			// change read status when clicking on itemCard
			if (typeof action.payload === "string") {
				state.isNotificationReadMap = {
					...state.isNotificationReadMap,
					[action.payload]: new Date().toISOString(),
				};
				// initialize read status when fetching chatroom list, depending on the read_at field
			} else {
				if (Object.keys(state.isNotificationReadMap || {}).length === 0) {
					const temp: { [key: string]: string | null } = {};
					action.payload.forEach(
						(obj: { id?: string; chatroom_id: string; read_at: string | null }) => {
							if (obj.id) temp[obj.id] = obj.read_at;
							if (obj.chatroom_id) temp[obj.chatroom_id] = obj.read_at;
						},
					);

					state.isNotificationReadMap = temp;
				}
			}
		},
		// global state of which chatroom is currently active
		setCurrentActiveChatroom: (state, action) => {
			state.currentActiveChatroom = action.payload;
		},
		setCurrentTab: (state, action) => {
			state.currentTab = action.payload;
		},
		setMobileMessageBoxOpen: (state, action) => {
			state.isMobileMessageBoxOpen = action.payload;
		},
		setMobileMessageBoxData: (state, action) => {
			state.mobileMessageBoxData = action.payload;
		},
	},
});

export const {
	setOnlineMessageReadStatus,
	setLastMessage,
	setCurrentActiveChatroom,
	setNotificationReadStatus,
	setCurrentTab,
	setMobileMessageBoxOpen,
	setMobileMessageBoxData,
	setChatroom,
} = messageSlice.actions;
export const messageSelector = (state: messageState) => state.message;
export default messageSlice.reducer;
