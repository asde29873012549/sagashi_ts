import * as dotenv from "dotenv";
import { signOut, useSession } from "next-auth/react";
import Logo from "./Logo";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User, Search as SearchIcon, CircleDollarSign, LogIn, LogOut } from "lucide-react";
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
import MessageBoxMobile from "../mobile/MessageBoxMobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";

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
	const isMobileMessageBoxOpen = useSelector(messageSelector).isMobileMessageBoxOpen;

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
		<div className="sticky top-0 z-[19] w-full bg-background shadow-md md:flex md:h-20 md:items-center md:justify-between md:px-4 md:py-1 md:shadow-none">
			<div className="flex h-14 w-full items-center justify-between px-3 py-2 md:px-9 md:py-0">
				<MenuBar />
				<div className="hidden w-full justify-between md:flex md:text-sm lg:text-base">
					<div className="flex items-center space-x-3 md:space-x-6">
						<Link className="hidden w-1/4 hover:cursor-pointer md:inline-block" href="/sell">
							SELL
						</Link>
						<Link className="hidden w-1/4 hover:cursor-pointer md:inline-block" href="/shop">
							SHOP
						</Link>
						<div
							className={cn(
								"hover:cursor-pointer",
								status === "loading" ? "invisible opacity-0" : "inline-block",
							)}
							onClick={session ? onLogout : onToggleRegisterForm}
						>
							{session ? "LOGOUT" : "LOGIN"}
						</div>
					</div>
					<div className="flex w-fit space-x-1 md:space-x-6">
						<div className="h-[28px] hover:cursor-pointer">
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
				<Logo className="absolute inset-0 m-auto h-fit w-[35vw] md:w-[10vw]" />
				{session && <MessageIcon user={user} isMobile={true} className="md:hidden" />}
			</div>
			{/* Mobile-specific components */}
			<div className="text-md fixed bottom-0 right-0 z-8 flex w-full items-center justify-between bg-background px-1 py-1 md:hidden">
				<div className="flex w-full items-center justify-around">
					<Link
						className="flex flex-col items-center hover:cursor-pointer md:hidden"
						href="/sell/mobile/stageFirst"
					>
						<CircleDollarSign />
						<div className="text-[10px]">SELL</div>
					</Link>
					<div
						className={cn(
							"flex flex-col items-center hover:cursor-pointer",
							status === "loading" ? "invisible opacity-0" : "",
						)}
						onClick={session ? onLogout : onToggleRegisterForm}
					>
						{session ? <LogOut /> : <LogIn />}
						<div className="text-[10px]">{session ? "LOGOUT" : "LOGIN"}</div>
					</div>
					{session && (
						<Link className="flex flex-col items-center hover:cursor-pointer" href="/user/mobile">
							<Avatar className="h-7 w-7">
								<AvatarImage src={session?.user?.avatar} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<div className="text-[10px]">PROFILE</div>
						</Link>
					)}
					<div className="flex flex-col items-center hover:cursor-pointer">
						<Search>
							<SearchIcon className="mx-1 h-7 w-7" />
						</Search>
						<div className="text-[10px]">DISCOVER</div>
					</div>
					{session && (
						<div className="flex flex-col items-center">
							<ShoppingCartIcon user={user} />
							<div className="text-[10px]">CART</div>
						</div>
					)}
				</div>
			</div>
			{session && isMobileMessageBoxOpen && (
				<MessageBoxMobile className="w-full md:hidden" user={user} />
			)}
		</div>
	);
}
