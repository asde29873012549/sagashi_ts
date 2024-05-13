import * as dotenv from "dotenv";
import Message from "../user/message/ChatroomThumbnailCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { X as Xicon } from "lucide-react";
import { motion } from "framer-motion";
import socketInitializer from "@/lib/socketio/socketInitializer";
import socket from "@/lib/socketio/client";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setLastMessage } from "@/redux/messageSlice";
import useInterSectionObserver from "@/lib/hooks/useIntersectionObserver";
import ChatboxInput from "./ChatboxInput";

import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import getMessages from "@/lib/queries/fetchQuery";
import readMessage from "@/lib/queries/fetchQuery";
import createMessage from "@/lib/queries/fetchQuery";
import DOMPurify from "dompurify";

import { getDateDistance, parseISODate, timeDifference } from "@/lib/utility/utils";
import type { WebSocketData, InfiniteQueryType, ApiResponse } from "@/lib/types/global";

dotenv.config();

interface MessageBoxDesktopProps {
	wsData: WebSocketData;
	onCloseMessageBox: () => void;
	image: string;
	listing_name: string;
	listing_designer: string;
	date: string;
}

type MessageData = InfiniteQueryType<
	ApiResponse<{ created_at: string; text: string; sender_name: string }[]>
>;

export default function MessageBoxDesktop({
	wsData,
	onCloseMessageBox,
	image,
	listing_name,
	listing_designer,
	date,
}: MessageBoxDesktopProps) {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const [id, setId] = useState<string[]>([]);
	const messageBoxContainer = useRef<HTMLDivElement>(null);
	const childValStateRef = useRef<{
		val: string;
		setVal: React.Dispatch<React.SetStateAction<string>>;
	}>();

	const chatroom_id = `${wsData.product_id}-${wsData.listingOwner}-${wsData.username}`;

	const {
		data: messageData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["messages", chatroom_id],
		queryFn: ({ pageParam = "" }) => {
			const uri = `/message/${chatroom_id}` + (pageParam ? `?cursor=${pageParam}` : "");
			return getMessages({ uri });
		},
		getNextPageParam: (lastPage, pages) => lastPage.data?.[lastPage.data.length - 1]?.id,
		refetchOnWindowFocus: false,
	});

	const flattenMessageData:
		| {
				id: number;
				text: string;
				sender_name: string;
				created_at: string;
		  }[]
		| undefined = messageData?.pages?.map((pageObj) => pageObj.data).flat();

	const lastMessageElement = useInterSectionObserver({
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	});

	const { mutate: messageMutate } = useMutation({
		mutationFn: (inputValue: {
			val: string;
			product_id: string;
			listingOwner: string;
			recipient: string;
		}) =>
			createMessage({
				uri: "/message",
				method: "POST",
				body: {
					product_id: wsData.product_id,
					seller_name: wsData.listingOwner,
					buyer_name: wsData.username,
					image,
					text: DOMPurify.sanitize(inputValue.val),
					isRead: false,
				},
			}),
		onMutate: async () => {
			// Snapshot the previous value
			const previousMessage = queryClient.getQueryData<MessageData>(["messages", chatroom_id]);

			// clear input
			if (childValStateRef.current) childValStateRef.current.setVal("");

			// Optimistically update to the new value
			queryClient.setQueryData(
				["messages", chatroom_id],
				(oldData: MessageData | undefined): MessageData => {
					const newData = oldData;
					newData?.pages[0].data.unshift({
						created_at: new Date().toISOString(),
						text: childValStateRef.current?.val ?? "",
						sender_name: wsData.username,
					});
					return newData!;
				},
			);
			// Return a context object with the snapshotted value
			return { previousMessage };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(["messages", chatroom_id], context?.previousMessage);
		},
		onSuccess: (msgData) => {
			const client = id[0]?.split("-")[2];
			// if the mutation succeeds, emit message to ws server and proceed
			socket.emit("message", {
				message: {
					created_at: new Date().toISOString(),
					text: msgData?.data?.text,
					sender_name: wsData.username,
					message_id: msgData?.data?.id,
					chatroom_id,
				},
			});

			// set local user's last message state
			dispatch(setLastMessage({ chatroom_id, text: msgData?.data?.text }));
		},
	});

	useEffect(() => {
		if (!socket.connected) {
			socketInitializer({
				queryClient,
				chatroom_id: `${wsData.product_id}-${wsData.listingOwner}-${wsData.username}`,
				setId,
				fetchQuery: async () =>
					await readMessage({
						uri: "/message/all",
						method: "PUT",
						body: {
							time: new Date().toISOString(),
							chatroom_id: `${wsData.product_id}-${wsData.listingOwner}-${wsData.username}`,
						},
					}),
			});
		}

		// Update socket query parameters
		socket.io.opts.query = {
			user: wsData.username,
			listingOwner: wsData.listingOwner,
			productId: wsData.product_id,
		};

		if (!socket.connected) {
			console.log("Socket connecting...");
			socket.connect();
		}

		return () => {
			if (socket.connected) {
				console.log("Cleaning up socket...");
				socket.disconnect();
			}
		};
	}, [wsData.username, wsData.listingOwner, wsData.product_id, queryClient]);

	const updateMessageInput = (valStateFromChild: {
		val: string;
		setVal: React.Dispatch<React.SetStateAction<string>>;
	}) => {
		childValStateRef.current = valStateFromChild;
	};

	return (
		<motion.div
			className="fixed bottom-0 right-[8%] z-20 h-3/5 w-80 rounded-t-lg bg-background shadow-lg"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<header className="sticky top-0 z-2 flex h-14 w-full items-center border-b border-slate-200 bg-gray-50 px-2">
				<div className="flex w-full items-center justify-between">
					<Avatar className="h-10 w-10">
						<AvatarImage src={image} />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="ml-2 w-9/12 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold">
						{listing_name}
					</div>
					<Xicon className="h-5 w-5 hover:cursor-pointer " onClick={onCloseMessageBox} />
				</div>
			</header>
			<main
				className={`relative flex h-[calc(100%-7rem)] w-full flex-col overflow-scroll ${
					flattenMessageData && flattenMessageData.length > 0
						? "items-end justify-start"
						: "items-center justify-center"
				}`}
			>
				<div
					className="flex h-fit w-full flex-col-reverse overflow-scroll px-3"
					ref={messageBoxContainer}
				>
					{flattenMessageData && flattenMessageData?.length > 0 ? (
						flattenMessageData.map((msg, index) => {
							const ISOdate = msg.created_at;
							const prevDate = flattenMessageData[index + 1]?.created_at;
							const currDate = parseISODate(ISOdate);
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
										selfMessage={msg.sender_name === wsData.username}
									>
										{msg.text}
									</Message>
								</div>
							);
						})
					) : (
						<div className="flex flex-col">
							<Avatar className="mx-auto h-24 w-24">
								<AvatarImage src={image} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<div className="mt-2 flex flex-col items-center justify-center text-xs text-slate-400">
								<div>{listing_designer}</div>
								<div>{listing_name}</div>
								<div>Listed {getDateDistance(date)}</div>
							</div>
						</div>
					)}
				</div>
			</main>
			<footer className="fixed bottom-0 w-80 bg-background p-2">
				<ChatboxInput
					updateMessageInput={updateMessageInput}
					currentActiveChatroom={chatroom_id}
					messageMutate={messageMutate}
					isSmallMsgBox={true}
				/>
			</footer>
		</motion.div>
	);
}
