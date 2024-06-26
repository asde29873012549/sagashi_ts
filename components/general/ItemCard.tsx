import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Alert, AlertDescription } from "@/components/base/alert";
import { getDateDistance } from "@/lib/utility/utils";
import { useRef } from "react";
import { Dot } from "lucide-react";
import readMessage from "@/lib/queries/fetchQuery";
import { useDispatch, useSelector } from "react-redux";
import {
	setOnlineMessageReadStatus,
	messageSelector,
	setCurrentActiveChatroom,
	setNotificationReadStatus,
	setCurrentTab,
	setMobileMessageBoxData,
	setMobileMessageBoxOpen,
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
	message_id?: number;
	chatroom_id?: string;
	notification_id?: number | string;
	isDesktop?: boolean;
}

export default function ItemCard({
	user, // only MessageIcon will have user
	src,
	children,
	timing, // only notificationIcon will have timing
	link, // only itemCards in the header messageIcon(only desktop) or notificationIcon will have link
	setIsOpen,
	read_at, // only offline MessageIcon/ ChatSystem and offline notification will have read_at
	message_id, // only offline MessageIcon/ ChatSystem will have message_id
	chatroom_id, // only offline MessageIcon/ ChatSystem will have chatroom_id
	notification_id, // only notificationIcon will have notification_id
	isDesktop, // only Mesages Section on Desktop will have isDesktop to true
}: ItemCardProps) {
	const dispatch = useDispatch();
	const onlineMessageReadMap = useSelector(messageSelector).isOnlineMessageRead;
	const notificationReadMap = useSelector(messageSelector).isNotificationReadMap;
	const currentActiveChatroom = useSelector(messageSelector).currentActiveChatroom;
	const hasMsgSeen = chatroom_id ? onlineMessageReadMap[chatroom_id] : undefined;
	const hasNotiSeen = notification_id ? notificationReadMap[notification_id] : undefined;

	const isNotificationItemCard = useRef(notification_id ? true : false);

	const isItemCardActiveMsgVersion =
		!(currentActiveChatroom === chatroom_id) && !read_at && !hasMsgSeen;
	const isItemCardActiveNotiVersion = !read_at && !hasNotiSeen;

	const onToggleSelect = () => {
		setIsOpen();
		chatroom_id && dispatch(setOnlineMessageReadStatus(chatroom_id));
		chatroom_id && dispatch(setCurrentActiveChatroom(chatroom_id));
		notification_id && dispatch(setNotificationReadStatus(`${notification_id}`));
		user && dispatch(setCurrentTab((chatroom_id?.split("-")[1] ?? "") === user ? "sell" : "buy"));

		if (message_id) {
			readMessage({
				uri: "/message",
				method: "PUT",
				body: {
					message_id,
				},
			});
		} else if (notification_id) {
			readMessage({
				uri: "/notification",
				method: "PUT",
				body: {
					notification_id,
				},
			});
		}
	};

	const [product_id, listingOwner, username] = chatroom_id?.split("-") ?? [];

	const onToggleMobileChatroomSheet = () => {
		dispatch(setMobileMessageBoxOpen(true));
		dispatch(setMobileMessageBoxData({ product_id, listingOwner, username, image: src }));
	};

	return link ? (
		<Link href={link || ""} onClick={onToggleSelect} scroll={false}>
			<Alert>
				<AlertDescription
					className={`flex w-[400px] cursor-pointer items-center justify-between rounded-md p-4 hover:bg-slate-100 ${
						currentActiveChatroom === chatroom_id && !link ? "bg-slate-200 hover:bg-slate-200" : ""
						// use chatroom_id_from_url to check if this itemCard is in the User's page Message section
						// because although hasMsgSeen will turn off the gray background and the dot in the Header MessageIcon part
						// I still want the background to be gray if the user navigate to the User Message section to show which itemCard is currently selected
					} ${hasMsgSeen ? "" : hasNotiSeen ? "" : "bg-slate-100"}`}
				>
					<div className="flex w-full">
						<div className="mr-2 w-2/12 items-center">
							<Avatar>
								<AvatarImage src={src} className="animate-imageEaseIn" />
								<AvatarFallback delayMs={750}>CN</AvatarFallback>
							</Avatar>
						</div>
						<div className="w-[77%]">
							<div className="ml-1 line-clamp-2 w-full whitespace-break-spaces px-2">
								{children}
							</div>
							{timing && (
								<div className="ml-1 shrink-0 px-2 text-xs text-info">
									{getDateDistance(timing)}
								</div>
							)}
						</div>
						{isNotificationItemCard.current
							? isItemCardActiveNotiVersion && (
									<Dot strokeWidth={5} color="#4932f5" className="h-full shrink-0 self-center" />
								)
							: isItemCardActiveMsgVersion && (
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
						currentActiveChatroom === chatroom_id && !link ? "bg-slate-200 hover:bg-slate-200" : ""
						// use chatroom_id_from_url to check if this itemCard is in the User's page Message section
						// because although hasMsgSeen will turn off the gray background and the dot in the Header MessageIcon part
						// I still want the background to be gray if the user navigate to the User Message section to show which itemCard is currently selected
					} ${hasMsgSeen ? "" : hasNotiSeen ? "" : "bg-slate-100"}`}
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
							{timing && (
								<div className="ml-1 shrink-0 px-2 text-xs text-info">
									{getDateDistance(timing)}
								</div>
							)}
						</div>
						{isNotificationItemCard.current
							? isItemCardActiveNotiVersion && (
									<Dot strokeWidth={5} color="#4932f5" className="h-full shrink-0 self-center" />
								)
							: isItemCardActiveMsgVersion && (
									<Dot strokeWidth={5} color="#4932f5" className="h-full shrink-0 self-center" />
								)}
					</div>
				</AlertDescription>
			</Alert>
		</div>
	);
}
