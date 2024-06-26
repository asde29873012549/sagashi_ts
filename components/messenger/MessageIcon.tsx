import { MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";
import MessageItemCard from "./MessageItemCard";
import { received_message } from "@/lib/utility/msg_template";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import getMessages from "@/lib/queries/fetchQuery";
import type { ApiResponse, ChatroomType, MessageNotification } from "@/lib/types/global";
import { useDispatch, useSelector } from "react-redux";
import { messageSelector, setChatroom } from "@/redux/messageSlice";
import { cn } from "@/lib/utility/utils";

interface MessageIconProps {
	user: string;
	isMobile: boolean;
	className?: string;
}

export default function MessageIcon({ user, isMobile, className }: MessageIconProps) {
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const onlineMessageReadMap = useSelector(messageSelector).isOnlineMessageRead;
	const lastMessageMap = useSelector(messageSelector).lastMessage;
	const chatroom = useSelector(messageSelector).chatroom;

	const { refetch: fetchChatroomList } = useQuery<ApiResponse<ChatroomType[]>>({
		queryKey: ["chatroomList"],
		queryFn: () =>
			getMessages({
				uri: "/message",
			}),
		refetchOnWindowFocus: false,
		onSuccess: (initialChatroomList) => {
			dispatch(
				setChatroom({
					type: "getInitialChatroomList",
					user,
					initialChatroomList: initialChatroomList.data,
				}),
			);
		},
	});

	const mes_type_helper = (msg: ChatroomType | MessageNotification) => {
		let sender: string;
		if ("sender_name" in msg) {
			sender = msg.sender_name === user ? "You" : msg.sender_name;
			return received_message(sender, msg.text, msg.created_at);
		} else {
			sender = msg.last_sent_user_name === user ? "You" : msg.last_sent_user_name;
			return received_message(
				sender,
				lastMessageMap[msg.id]?.text || msg?.text,
				lastMessageMap[msg.id]?.updated_at || msg?.updated_at,
			);
		}
	};

	const onToggleMessageIcon = () => {
		setIsOpen((o) => !o);
	};

	const shouldShowMessageCircle = useMemo(() => {
		let yes = false;
		chatroom?.some((msg) => {
			if ("listing_id" in msg) {
				const chatroom_id = `${msg.listing_id}-${msg.seller_name}-${msg.buyer_name}`;
				"type" in msg && !onlineMessageReadMap[chatroom_id] && (yes = true);
			}
			// if no read_at property means it's online message, then show the unread circle
			// or if read_at is null, also show the unread circle
			if ("read_at" in msg && !msg.read_at) yes = true;
		});
		return yes;
	}, [chatroom, onlineMessageReadMap]);

	return (
		<Popover open={isOpen} onOpenChange={onToggleMessageIcon}>
			<PopoverTrigger className={cn("relative flex", className)} onClick={() => fetchChatroomList}>
				{/* Notification Circle */}
				<div
					className={`absolute right-px top-px z-50 mb-3 h-2.5 w-2.5 rounded-full bg-red-700 
					${shouldShowMessageCircle ? "" : "hidden"}`} // Hide on desktop if no new message
				></div>

				{/* Message Icon */}
				<MessageCircle className="h-7 w-7" />
			</PopoverTrigger>

			<PopoverContent
				className={`mr-4 max-h-[70dvh] md:mr-8 ${
					chatroom?.length > 0 ? "" : "mr-1"
				} overflow-y-scroll`}
			>
				{chatroom &&
					chatroom.length > 0 &&
					chatroom.map((msg, index) => {
						const content = mes_type_helper(msg);
						return "type" in msg ? (
							<MessageItemCard
								user={user}
								key={`${msg.created_at}-${index}-msg`}
								src={msg.image}
								link={isMobile ? "" : msg.link}
								setIsOpen={onToggleMessageIcon}
								chatroom_id={`${msg.listing_id}-${msg.seller_name}-${msg.buyer_name}`}
							>
								{content}
							</MessageItemCard>
						) : (
							<MessageItemCard
								user={user}
								key={`${msg.updated_at}-${index}-msg`}
								src={msg.chatroom_avatar}
								link={isMobile ? "" : msg.link}
								setIsOpen={onToggleMessageIcon}
								read_at={msg.read_at}
								chatroom_id={msg.id}
							>
								{content}
							</MessageItemCard>
						);
					})}
				{!chatroom?.length && (
					<div className="flex h-14 w-60 items-center justify-center text-gray-500">
						No new message
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
