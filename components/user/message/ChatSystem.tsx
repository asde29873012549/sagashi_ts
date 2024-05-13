import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/base/tabs";
import { Skeleton } from "@/components/base/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import Message from "@/components/user/message/ChatroomThumbnailCard";
import { useState, useRef, useEffect } from "react";
import MessageItemCard from "@/components/messenger/MessageItemCard";
import { useQuery, useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import getChatrooms from "@/lib/queries/fetchQuery";
import getMessages from "@/lib/queries/fetchQuery";
import createMessage from "@/lib/queries/fetchQuery";
import { received_message } from "@/lib/utility/msg_template";
import readMessage from "@/lib/queries/fetchQuery";
import useInterSectionObserver from "@/lib/hooks/useIntersectionObserver";
import ChatboxInput from "@/components/messenger/ChatboxInput";

import socket from "@/lib/socketio/client";
import socketInitializer from "@/lib/socketio/socketInitializer";
import DOMPurify from "dompurify";
import { useRouter } from "next/router";

import { setLastMessage, messageSelector, setCurrentTab } from "@/redux/messageSlice";
import { useDispatch, useSelector } from "react-redux";

import { parseISODate, timeDifference } from "@/lib/utility/utils";
import type { ApiResponse, ChatroomType, InfiniteQueryType } from "@/lib/types/global";

interface MessageData {
	id: string;
	buyer_name: string;
	seller_name: string;
	last_sent_user_name: string;
	chatroom_avatar: string;
	last_message: number;
	text: string;
	link: string;
	read_at: string | null;
	updated_at: string;
}

type ChildStateRef =
	| ""
	| {
			val: string;
			setVal: React.Dispatch<React.SetStateAction<string>>;
	  };

interface MessageType {
	id?: number;
	text: string;
	sender_name: string;
	created_at: string;
}

export default function Messages({ user }: { user: string }) {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const { chatroom_id: chatroom_id_from_url } = useRouter().query;
	// const [val, setVal] = useState("");
	// const { toast } = useToast();
	const [shouldBeInitialChatroomDisplay, setShouldBeInitialChatroomDisplay] = useState(
		chatroom_id_from_url ? false : true,
	);
	const lastMessageMap = useSelector(messageSelector).lastMessage;
	const currentActiveChatroom = useSelector(messageSelector).currentActiveChatroom;
	const currentTab = useSelector(messageSelector).currentTab;
	const currentChatroom_avatar = useRef<string | null>(null);
	const sellContainer = useRef<HTMLDivElement>(null);
	const buyContainer = useRef<HTMLDivElement>(null);
	const lastMessageRef = useRef<HTMLDivElement>(null);
	const childValStateRef = useRef<ChildStateRef>("");

	const { data: chatroomList } = useQuery({
		queryKey: ["chatroomList", currentTab],
		queryFn: () =>
			getChatrooms({
				uri: "/message?tab=" + currentTab,
			}),
		refetchOnWindowFocus: false,
		onSuccess: (initialChatroomList: ApiResponse<ChatroomType[]>) => {
			// on successfully fetch chatroom list, populate the initial state of last message and read status
			dispatch(
				setLastMessage(initialChatroomList.data?.map((c) => ({ chatroom_id: c.id, text: c.text }))),
			);
		},
	});

	const {
		data: messageData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch: fetchMessageData,
		isInitialLoading: isMessageDataLoading,
	} = useInfiniteQuery({
		queryKey: ["messages", currentActiveChatroom],
		queryFn: ({ pageParam = "" }: { pageParam?: string }) => {
			const uri = `/message/${currentActiveChatroom}` + (pageParam ? `?cursor=${pageParam}` : "");
			return getMessages({ uri });
		},
		enabled: currentActiveChatroom ? true : false,
		getNextPageParam: (lastPage: { data: unknown[] }, pages: unknown[]) =>
			(lastPage.data?.[lastPage.data.length - 1] as { id: string })?.id,
		refetchOnWindowFocus: false,
	});

	const flattenMessageData = messageData?.pages?.map((pageObj) => pageObj.data).flat();

	const lastMessageElement = useInterSectionObserver({
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	});

	// There are two possible ways to initialize the websocket
	// 1. clikced on the MessageitemCard on header messageIcon and navigate to user page's message section
	// the chatroom_id_from_url url query will be available and
	// thus caused the useEffect to run and initiate the websocket connection
	// 2. directly clicked MessageitemCard when in the user's page message section
	// this will also triggered onOpenChatroom and set the currentActiveChatroom_id
	// thus caused the useEffect to run and initiate the websocket connection
	useEffect(() => {
		if (!currentActiveChatroom) return;
		const [product_id, listingOwner, client] = currentActiveChatroom.split("-");

		if (socket.connected) {
			socket.emit("join", { currentActiveChatroom });
		}

		socketInitializer({
			queryClient,
			chatroom_id: currentActiveChatroom,
			fetchQuery: async () =>
				await readMessage({
					uri: "/message/all",
					method: "PUT",
					body: { time: new Date().toISOString(), chatroom_id: currentActiveChatroom },
				}),
		});

		// Update socket query parameters
		socket.io.opts.query = {
			user: client,
			listingOwner: listingOwner,
			productId: product_id,
		};

		// Initialize socket only if not already connected or if explicitly needed
		if (!socket.connected) {
			console.log("Socket connecting...");
			socket.connect();
		}

		return () => {
			socket.emit("leave", { currentActiveChatroom });
		};
	}, [currentActiveChatroom, queryClient]);

	// scroll to bottom when switching charoom or tabs
	useEffect(() => {
		if (currentTab === "sell" && sellContainer.current) {
			sellContainer.current.scrollTop =
				sellContainer.current.scrollHeight - sellContainer.current.clientHeight;
		} else if (currentTab === "buy" && buyContainer.current) {
			buyContainer.current.scrollTop =
				buyContainer.current.scrollHeight - buyContainer.current.clientHeight;
		}
	}, [currentTab]);

	useEffect(() => {
		return () => {
			if (socket.connected) {
				console.log("Cleaning up socket...");
				socket.disconnect();
			}
		};
	}, []);

	const offlineChatroom =
		chatroomList?.data?.map((msg) => {
			if (!msg.read_at && msg.last_sent_user_name === user)
				return { ...msg, read_at: new Date().toISOString() };
			return msg;
		}) ?? [];

	const mes_type_helper = (msg: MessageData) => {
		// check if last_sent_user_name(from message table) is the same as user
		const sender = msg.last_sent_user_name === user ? "You" : msg.last_sent_user_name;
		return received_message(
			sender,
			// check if the chatroom has received online new messages, if true, take the new messages from redux global store
			// otherwise, take the messages from the database
			lastMessageMap[msg.id]?.text || msg?.text,
			lastMessageMap[msg.id]?.updated_at || msg?.updated_at,
		);
	};

	const onOpenChatroom = (chatroom_avatar: string) => {
		currentChatroom_avatar.current = chatroom_avatar;
		fetchMessageData();
		setShouldBeInitialChatroomDisplay(false);
	};

	const { mutate: messageMutate } = useMutation({
		mutationFn: ({
			val,
			product_id,
			listingOwner,
			recipient,
		}: {
			val: string;
			product_id: string;
			listingOwner: string;
			recipient: string;
		}) => {
			return createMessage({
				uri: "/message",
				method: "POST",
				body: {
					product_id,
					seller_name: listingOwner,
					buyer_name: recipient,
					image: currentChatroom_avatar.current,
					text: DOMPurify.sanitize(val),
					isRead: false,
				},
			});
		},
		onMutate: async () => {
			// Snapshot the previous value
			const previousMessage = queryClient.getQueryData(["messages", currentActiveChatroom]);

			// clear input
			if (childValStateRef.current) childValStateRef.current.setVal("");

			// Optimistically update to the new value
			queryClient.setQueryData(
				["messages", currentActiveChatroom],
				(oldData: InfiniteQueryType<ApiResponse<MessageType[]>> | undefined) => {
					const newData = oldData;
					newData &&
						newData.pages[0].data.unshift({
							created_at: new Date().toISOString(),
							text: childValStateRef.current && childValStateRef.current.val,
							sender_name: user,
						});
					return newData;
				},
			);
			// Return a context object with the snapshotted value
			return previousMessage;
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(["messages", currentActiveChatroom], context);
		},
		onSuccess: (messageData) => {
			if (currentActiveChatroom) {
				const client = currentActiveChatroom?.split("-")[2];
				// if the mutation succeeds, emit message to ws server and proceed
				socket.emit("message", {
					message: {
						created_at: new Date().toISOString(),
						text: messageData.data?.text,
						sender_name: user,
						message_id: messageData.data?.id,
						chatroom_id: currentActiveChatroom,
					},
				});

				// set local user's last message state
				dispatch(
					setLastMessage({ chatroom_id: currentActiveChatroom, text: messageData.data?.text }),
				);
			}
		},
	});

	const onChangeTab = (tab: string) => {
		dispatch(setCurrentTab(tab));
		setShouldBeInitialChatroomDisplay(true);
	};

	const updateMessageInput = (valStateFromChild: {
		val: string;
		setVal: React.Dispatch<React.SetStateAction<string>>;
	}) => {
		childValStateRef.current = valStateFromChild;
	};

	return (
		<Tabs value={currentTab} onValueChange={onChangeTab} className="w-full">
			<TabsList className="h-14 w-full bg-sky-950/90">
				<TabsTrigger
					value="sell"
					className="h-12 w-1/2 text-background data-[state=active]:text-foreground"
				>
					SELL Messages
				</TabsTrigger>
				<TabsTrigger
					value="buy"
					className="h-12 w-1/2 text-background data-[state=active]:text-foreground"
				>
					BUY Messages
				</TabsTrigger>
			</TabsList>
			<TabsContent
				value="sell"
				className="relative box-border flex space-x-6 rounded-lg data-[state=inactive]:mt-0"
			>
				<aside
					className={`relative box-content flex h-[500px] w-[400px] shrink-0 flex-col items-center justify-start overflow-scroll rounded-lg border-2 border-sky-900`}
				>
					{offlineChatroom && offlineChatroom.length > 0 ? (
						offlineChatroom.map((msg: MessageData, index) => {
							const content = mes_type_helper(msg);
							return (
								<MessageItemCard
									key={`message-${msg.updated_at}-${index}-offline`}
									src={msg.chatroom_avatar}
									setIsOpen={() => onOpenChatroom(msg.chatroom_avatar)}
									read_at={msg.read_at}
									chatroom_id={msg.id}
									// chatroom_id_from_url={currentActiveChatroom}
									isDesktop={true}
								>
									{content}
								</MessageItemCard>
							);
						})
					) : (
						<div className="flex h-14 w-full items-center justify-center text-sm text-info">
							No Message Available
						</div>
					)}
				</aside>
				<div
					className={`relative flex h-[500px] grow flex-col overflow-scroll rounded-lg border-2 border-sky-900 ${
						flattenMessageData?.length && flattenMessageData?.length > 0
							? "items-start"
							: "items-center justify-center"
					}`}
				>
					<div
						className="mb-14 flex h-fit w-full flex-col-reverse overflow-y-scroll px-3 py-2"
						ref={sellContainer}
					>
						{isMessageDataLoading && <MessageLoadingSkeleton />}
						{!isMessageDataLoading && shouldBeInitialChatroomDisplay ? (
							<div className="flex flex-col items-center justify-center">
								<Avatar className="mx-auto h-24 w-24">
									<AvatarImage src="/defaultProfile.webp" />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<div className="mt-4 flex flex-col items-center justify-center text-sm text-slate-400">
									Start a New Converation !
								</div>
							</div>
						) : (
							flattenMessageData?.length &&
							flattenMessageData?.length > 0 &&
							flattenMessageData.map((msg, index) => {
								const ISOdate = msg.created_at;
								const prevDate = flattenMessageData[index - 1]?.created_at;
								const currDate = parseISODate(ISOdate || null);
								return (
									<div key={`${msg.text}-${index}`} className="w-full">
										{(timeDifference(prevDate, ISOdate) > 5 || index === 0) && (
											<div className="mb-1 mt-4 flex w-full justify-center text-xs text-info">
												{currDate}
											</div>
										)}
										<Message
											lastMessageElement={
												index === flattenMessageData?.length - 1 ? lastMessageElement : undefined
											}
											selfMessage={msg.sender_name === user}
										>
											{msg.text}
										</Message>
									</div>
								);
							})
						)}
					</div>
					<span className="invisible opacity-0" ref={lastMessageRef}></span>
					<footer className="absolute bottom-0 w-full rounded-lg bg-background p-2">
						<ChatboxInput
							updateMessageInput={updateMessageInput}
							currentActiveChatroom={currentActiveChatroom || ""}
							messageMutate={messageMutate}
						/>
					</footer>
				</div>
			</TabsContent>
			<TabsContent
				value="buy"
				className="relative box-border flex space-x-6 rounded-lg data-[state=inactive]:mt-0"
			>
				<aside
					className={`relative box-content flex h-[500px] w-[400px] shrink-0 flex-col items-center justify-start overflow-scroll rounded-lg border-2 border-sky-900`}
				>
					{offlineChatroom && offlineChatroom.length > 0 ? (
						offlineChatroom.map((msg, index) => {
							const content = mes_type_helper(msg);
							return (
								<MessageItemCard
									key={`message-${msg.updated_at}-${index}-offline`}
									src={msg.chatroom_avatar}
									setIsOpen={() => onOpenChatroom(msg.chatroom_avatar)}
									read_at={msg.read_at}
									chatroom_id={msg.id}
									// chatroom_id_from_url={chatroom_id_from_url}
									isDesktop={true}
								>
									{content}
								</MessageItemCard>
							);
						})
					) : (
						<div className="flex h-14 w-full items-center justify-center text-sm text-info">
							No Message Available
						</div>
					)}
				</aside>
				<div
					className={`relative flex h-[500px] grow flex-col overflow-scroll rounded-lg border-2 border-sky-900 ${
						flattenMessageData?.length && flattenMessageData?.length > 0
							? "items-start"
							: "items-center justify-center"
					}`}
				>
					<div
						className="mb-14 flex h-fit w-full flex-col-reverse overflow-y-scroll px-3 py-2"
						ref={buyContainer}
					>
						{isMessageDataLoading && <MessageLoadingSkeleton />}
						{!isMessageDataLoading && shouldBeInitialChatroomDisplay ? (
							<div className="flex flex-col items-center justify-center">
								<Avatar className="mx-auto h-24 w-24">
									<AvatarImage src="/defaultProfile.webp" />
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<div className="mt-4 flex flex-col items-center justify-center text-sm text-slate-400">
									Start a New Converation !
								</div>
							</div>
						) : (
							flattenMessageData?.length &&
							flattenMessageData?.length > 0 &&
							flattenMessageData.map((msg, index) => {
								const ISOdate = msg.created_at;
								const prevDate = flattenMessageData[index + 1]?.created_at;
								const currDate = parseISODate(ISOdate || null);
								return (
									<div key={`${msg.text}-${index}`} className="w-full">
										{(timeDifference(ISOdate, prevDate) > 5 ||
											index === flattenMessageData.length - 1) && (
											<div className="mb-1 mt-4 flex w-full justify-center text-xs text-info">
												{currDate}
											</div>
										)}
										<Message
											lastMessageElement={
												index === flattenMessageData?.length - 1 ? lastMessageElement : undefined
											}
											selfMessage={msg.sender_name === user}
										>
											{msg.text}
										</Message>
									</div>
								);
							})
						)}
					</div>
					<span className="invisible opacity-0" ref={lastMessageRef}></span>
					<footer className="absolute bottom-0 w-full rounded-lg bg-background p-2">
						<ChatboxInput
							updateMessageInput={updateMessageInput}
							currentActiveChatroom={currentActiveChatroom || ""}
							messageMutate={messageMutate}
						/>
					</footer>
				</div>
			</TabsContent>
		</Tabs>
	);
}

function MessageLoadingSkeleton() {
	return (
		<div className="h-full w-full space-y-3">
			<div className="flex w-full justify-end">
				<Skeleton className="h-8 w-60 rounded-3xl" />
			</div>
			<div className="flex w-full justify-end">
				<Skeleton className="h-8 w-40 rounded-3xl" />
			</div>
			<div className="flex w-full justify-start">
				<Skeleton className="h-8 w-40 rounded-3xl" />
			</div>
			<div className="flex w-full justify-end">
				<Skeleton className="h-8 w-32 rounded-3xl" />
			</div>
			<div className="flex w-full justify-start">
				<Skeleton className="w-62 h-8 rounded-3xl" />
			</div>
			<div className="flex w-full justify-start">
				<Skeleton className="h-8 w-32 rounded-3xl" />
			</div>
			<div className="flex w-full justify-end">
				<Skeleton className="h-8 w-40 rounded-3xl" />
			</div>
			<div className="flex w-full justify-end">
				<Skeleton className="h-8 w-60 rounded-3xl" />
			</div>
			<div className="flex w-full justify-start">
				<Skeleton className="h-8 w-20 rounded-3xl" />
			</div>
		</div>
	);
}
