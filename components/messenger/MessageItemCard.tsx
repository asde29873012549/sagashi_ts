import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Alert, AlertDescription } from "@/components/base/alert";
import { Dot } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
	setOnlineMessageReadStatus,
	messageSelector,
	setCurrentActiveChatroom,
	setCurrentTab,
	setMobileMessageBoxData,
	setMobileMessageBoxOpen,
	setChatroom,
} from "@/redux/messageSlice";

import Link from "next/link";

interface ItemCardProps {
	user?: string;
	src: string;
	children: React.ReactNode;
	timing?: string;
	link?: string;
	setIsOpen: () => void;
	read_at?: string | null;
	chatroom_id?: string;
	isDesktop?: boolean;
}

export default function MessageItemCard({
	user, // only MessageIcon will have user
	src,
	children,
	link, // only itemCards in the header messageIcon(only desktop) or notificationIcon will have link
	setIsOpen,
	read_at, // only offline MessageIcon/ ChatSystem will have read_at
	chatroom_id, // only MessageIcon/ ChatSystem will have chatroom_id
	isDesktop, // only ChatSystem will have isDesktop to true
}: ItemCardProps) {
	const dispatch = useDispatch();
	const onlineMessageReadMap = useSelector(messageSelector).isOnlineMessageRead;
	const currentActiveChatroom = useSelector(messageSelector).currentActiveChatroom;
	// hasOnlineMsgSeen determines if online msg has been seen
	const hasOnlineMsgSeen = chatroom_id && onlineMessageReadMap[chatroom_id];

	const isMessageUnread =
		// Check if the chatroom is not currently opened and displayed
		!(currentActiveChatroom === chatroom_id) &&
		// If onlineMsgSeen, return false because message should not be unread
		// If onlineMsgSeen is null it means the chatroom received online message but haven't been read
		// if undefined means it has no online message
		(hasOnlineMsgSeen ? false : hasOnlineMsgSeen === null || !read_at);

	const onToggleSelect = () => {
		setIsOpen(); //close message dialog
		if (chatroom_id) {
			dispatch(setOnlineMessageReadStatus(chatroom_id));
			dispatch(setCurrentActiveChatroom(chatroom_id));
			dispatch(
				setChatroom({
					type: "updateMessageReadAt",
					chatroom_id,
				}),
			);
		}
		user && dispatch(setCurrentTab((chatroom_id?.split("-")[1] ?? "") === user ? "sell" : "buy"));
	};

	const [product_id, listingOwner, username] = chatroom_id?.split("-") ?? [];

	// execute only is mobile : mobile chatroom sheet
	const onToggleMobileChatroomSheet = () => {
		dispatch(setMobileMessageBoxOpen(true));
		dispatch(setMobileMessageBoxData({ product_id, listingOwner, username, image: src }));
	};

	return link ? (
		<Link href={link || ""} onClick={onToggleSelect} scroll={false}>
			<Alert>
				<AlertDescription
					className={`flex w-[400px] cursor-pointer items-center justify-between rounded-md p-4 hover:bg-slate-100 ${isMessageUnread ? "bg-slate-100" : ""}`}
				>
					<div className="flex w-full">
						<div className="mr-2 w-2/12 items-center">
							<Avatar>
								<AvatarImage src={src} className="animate-imageEaseIn" />
								<AvatarFallback delayMs={750} className="aspect-square">
									CN
								</AvatarFallback>
							</Avatar>
						</div>
						<div className="w-[77%]">
							<div className="ml-1 line-clamp-2 w-full whitespace-break-spaces px-2">
								{children}
							</div>
						</div>
						{isMessageUnread && (
							<Dot strokeWidth={5} color="#4932f5" className="h-full shrink-0 self-center" />
						)}
					</div>
				</AlertDescription>
			</Alert>
		</Link>
	) : (
		<div onClick={isDesktop ? onToggleSelect : onToggleMobileChatroomSheet}>
			<Alert>
				<AlertDescription
					className={`flex w-[400px] cursor-pointer items-center justify-between rounded-md p-4 hover:bg-slate-100 ${
						currentActiveChatroom === chatroom_id ? "bg-slate-200 hover:bg-slate-200" : ""
						// use chatroom_id_from_url to check if this itemCard is in the User's page Message section
						// because although hasOnlineMsgSeen will turn off the gray background and the dot in the Header MessageIcon part
						// I still want the background to be gray if the user navigate to the User Message section to show which itemCard is currently selected
					} ${isMessageUnread ? "bg-slate-100" : ""}`}
				>
					<div className="flex w-full">
						<div className="mr-2 w-2/12 items-center">
							<Avatar>
								<AvatarImage src={src} />
								<AvatarFallback delayMs={750}>CN</AvatarFallback>
							</Avatar>
						</div>
						<div className="w-[77%]">
							<div className="ml-1 line-clamp-2 w-full whitespace-break-spaces px-2">
								{children}
							</div>
						</div>
						{isMessageUnread && (
							<Dot strokeWidth={5} color="#4932f5" className="h-full shrink-0 self-center" />
						)}
					</div>
				</AlertDescription>
			</Alert>
		</div>
	);
}
