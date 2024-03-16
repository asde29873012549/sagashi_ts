import { MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";
import ItemCard from "../general/ItemCard";
import { received_message } from "@/lib/utility/msg_template";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import getMessages from "@/lib/queries/fetchQuery";
import { useDispatch } from "react-redux";
import { setMessageReadStatus } from "@/redux/messageSlice";
import type { ChatroomType } from "@/lib/types/global";

interface MessageIconProps {
	user: string;
	chatroom: (ChatroomType | MessageNotification)[];
	setChatroom: React.Dispatch<React.SetStateAction<ChatroomType[]>>;
	isMobile: boolean;
}

type MessageNotification = {
	type: "notification.message";
	sender_name: string;
	buyer_name: string;
	seller_name: string;
	listing_id: string;
	text: string;
	image: string;
	created_at: string;
	link: string;
};

export default function MessageIcon({ user, chatroom, setChatroom, isMobile }: MessageIconProps) {
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const { refetch: fetchChatroomList } = useQuery({
		queryKey: ["chatroomList"],
		queryFn: () =>
			getMessages({
				uri: "/message",
			}),
		refetchOnWindowFocus: false,
		onSuccess: (initialChatroomList) => {
			setChatroom(initialChatroomList.data);
			dispatch(
				setMessageReadStatus(
					initialChatroomList.data?.map((c: ChatroomType) => ({
						chatroom_id: c.id,
						read_at: c.read_at,
					})),
				),
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
			return received_message(sender, msg.text, msg.updated_at);
		}
	};

	const onToggleMessageIcon = () => {
		setIsOpen((o) => !o);
	};

	const shouldShowMessageCircle = () => {
		let yes = false;
		chatroom?.forEach((msg) => {
			// if no read_at property means it's online message, then show the unread circle
			// or if read_at is null, also show the unread circle
			if (!("read_at" in msg) || !msg.read_at) yes = true;
		});

		return yes;
	};

	return (
		<Popover open={isOpen} onOpenChange={onToggleMessageIcon}>
			<PopoverTrigger className="relative flex" onClick={() => fetchChatroomList}>
				{/* Notification Circle */}
				<div
					className={`absolute right-[1px] z-50 mb-3 h-2.5 w-2.5 rounded-full bg-red-700 
					${shouldShowMessageCircle() ? "" : "hidden"}`} // Hide on desktop if no new message
				></div>

				{/* Message Icon */}
				<MessageCircle className="h-7 w-7" />
			</PopoverTrigger>

			<PopoverContent
				className={`mr-4 max-h-[70dvh] md:mr-8 ${
					chatroom.length > 0 ? "" : "mr-1"
				} overflow-y-scroll`}
			>
				{chatroom &&
					chatroom.length > 0 &&
					chatroom.map((msg, index) => {
						const content = mes_type_helper(msg);
						return "type" in msg ? (
							<ItemCard
								user={user}
								key={`${msg.created_at}-${index}-msg`}
								src={msg.image}
								link={isMobile ? "" : msg.link}
								setIsOpen={onToggleMessageIcon}
							>
								{content}
							</ItemCard>
						) : (
							<ItemCard
								user={user}
								key={`${msg.updated_at}-${index}-msg`}
								src={msg.chatroom_avatar}
								link={isMobile ? "" : msg.link}
								setIsOpen={onToggleMessageIcon}
								read_at={msg.read_at}
								message_id={msg.last_message}
								chatroom_id={msg.id}
							>
								{content}
							</ItemCard>
						);
					})}
				{!chatroom.length && (
					<div className="flex h-14 w-60 items-center justify-center text-gray-500">
						No new message
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
