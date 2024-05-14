import * as dotenv from "dotenv";
import { signOut, useSession } from "next-auth/react";
import Logo from "./Logo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User, Search as SearchIcon } from "lucide-react";
import NotificationHeartIcon from "../header/NotificationHeartIcon";
import MessageIcon from "../messenger/MessageIcon";
import MenuBar from "../mobile/menu/MenuBar";
import Search from "../header/Search";
import ShoppingCartIcon from "../header/ShoppingCartIcon";

import { toggleRegisterForm } from "../../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
	setOnlineMessageReadStatus,
	setLastMessage,
	messageSelector,
	setNotificationReadStatus,
	setChatroom,
} from "@/redux/messageSlice";
import { useQuery } from "@tanstack/react-query";
import getNotification from "@/lib/queries/fetchQuery";
import type { ApiResponse, NotificationType, OnlineNotification } from "@/lib/types/global";
import { cn } from "@/lib/utility/utils";

dotenv.config();

const homepage = process.env.NEXT_PUBLIC_SERVER_DOMAIN;
const NOTIFICATION_SERVER = process.env.NEXT_PUBLIC_NOTIFICATION_SERVER;

export default function Header() {
	const [onlineNotification, setOnlineNotification] = useState<OnlineNotification[]>([]);
	const [notificationActive, setNotificationActive] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { data: session, status } = useSession();
	const onToggleRegisterForm = () => dispatch(toggleRegisterForm());
	const currentActiveChatroom = useSelector(messageSelector).currentActiveChatroom;
	const currentActiveChatroomRef = useRef(currentActiveChatroom);

	const user = session?.user?.username ?? "";

	const { data: notificationData } = useQuery<ApiResponse<NotificationType[]>>({
		queryKey: ["notification"],
		queryFn: () =>
			getNotification({
				uri: "/notification",
			}),
		enabled: session ? true : false,
		refetchOnWindowFocus: false,
		onSuccess: (initialNotificationData) => {
			dispatch(setNotificationReadStatus(initialNotificationData.data));
		},
	});

	useEffect(() => {
		currentActiveChatroomRef.current = currentActiveChatroom;
	}, [currentActiveChatroom]);

	useEffect(() => {
		let eventSource: EventSource;
		if (user) {
			eventSource = new EventSource(`${NOTIFICATION_SERVER}/events`, {
				withCredentials: true,
			});

			eventSource.onmessage = (event) => {
				const newNotification = JSON.parse(event.data);
				if (newNotification.type === "notification.message") {
					const newMessageChatroomId = `${newNotification.listing_id}-${newNotification.seller_name}-${newNotification.buyer_name}`;
					const readStatus =
						currentActiveChatroomRef.current === newMessageChatroomId
							? new Date().toISOString()
							: null;
					// if received new message online
					// check if current opened chatroom is the same as the chatroom id the new message belongs to
					// if true, it means the user is currently in the chatroom, so we automatically set the message as read
					// otherwise, it means the user is not in the chatroom, so we set the message read status as null
					dispatch(
						setOnlineMessageReadStatus({
							chatroom_id: newMessageChatroomId,
							read_at: readStatus,
						}),
					);
					// set message receiver's last message
					dispatch(
						setLastMessage({ chatroom_id: newMessageChatroomId, text: newNotification.text }),
					);

					// update chatroom list's last message and created_at
					dispatch(
						setChatroom({
							type: "getNewMessage",
							newMessageChatroomId,
							newNotification,
						}),
					);
				} else {
					setOnlineNotification((prev) => [newNotification, ...prev]);
					setNotificationActive(true);

					// received new notification online, set read status as null
					dispatch(
						setNotificationReadStatus({
							id: newNotification.id,
							read_at: null,
						}),
					);
				}
			};
		}

		return () => eventSource && eventSource.close();
	}, [user, dispatch]);

	const onLogout = () => {
		signOut({ callbackUrl: homepage });
	};

	const onNotificationHeartIconClick = () => {
		setNotificationActive(false);
	};

	return (
		<div className="top-0 z-[19] hidden w-full bg-background md:sticky md:flex md:h-20 md:items-center md:justify-between md:px-9 md:py-1 md:shadow-none">
			<MenuBar />
			<div className="flex w-1/6 justify-between md:w-1/5 md:text-sm lg:w-1/6 lg:text-base">
				<Link className="mr-2 inline-block w-1/4 hover:cursor-pointer" href="/sell">
					SELL
				</Link>
				<Link className="inline-block w-1/4 hover:cursor-pointer" href="/shop">
					SHOP
				</Link>
				<div
					className={cn(
						"w-1/3 hover:cursor-pointer",
						status === "loading" ? "invisible opacity-0" : "inline-block",
					)}
					onClick={session ? onLogout : onToggleRegisterForm}
				>
					{session ? "LOGOUT" : "LOGIN"}
				</div>
			</div>
			<Logo className="m-auto w-[7vw] md:w-[10vw] lg:w-[7vw]" />
			<div className="text-md flex w-1/6 justify-end">
				<div className="flex w-fit space-x-6">
					<div className="inline-block h-[28px]">
						<Search>
							<SearchIcon className="mx-1 h-7 w-7" />
						</Search>
					</div>
					{session && (
						<NotificationHeartIcon
							onlineNotification={onlineNotification}
							offlineNotification={notificationData?.data ?? []}
							notificationActive={notificationActive}
							onNotificationHeartIconClick={onNotificationHeartIconClick}
						/>
					)}
					{session && <MessageIcon user={user} isMobile={false} />}
					{session && <ShoppingCartIcon user={user} />}
					{session && (
						<Link className="inline-block hover:cursor-pointer" href="/user">
							<User className="h-7 w-7" />
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
