import * as dotenv from "dotenv";
import { signOut, useSession } from "next-auth/react";
import Logo from "../layout/Logo";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { User, Search as SearchIcon } from "lucide-react";
import MenuBar from "./menu/MenuBar";
import Search from "../header/Search";
import MessageBoxMobile from "./MessageBoxMobile";

import { toggleRegisterForm } from "../../redux/userSlice";
import { setChatroom } from "@/redux/messageSlice";

import NotificationHeartIcon from "../header/NotificationHeartIcon";
import MessageIcon from "../messenger/MessageIcon";
import ShoppingCartIcon from "../header/ShoppingCartIcon";

import { useDispatch, useSelector } from "react-redux";
import {
	setOnlineMessageReadStatus,
	setLastMessage,
	messageSelector,
	setNotificationReadStatus,
} from "@/redux/messageSlice";
import { useQuery } from "@tanstack/react-query";
import getNotification from "@/lib/queries/fetchQuery";
import type { OnlineNotification } from "@/lib/types/global";

dotenv.config();

const homepage = process.env.NEXT_PUBLIC_SERVER_DOMAIN;
const NOTIFICATION_SERVER = process.env.NEXT_PUBLIC_NOTIFICATION_SERVER;

export default function MobileHeader() {
	const [onlineNotification, setOnlineNotification] = useState<OnlineNotification[]>([]);
	const [notificationActive, setNotificationActive] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { data: session } = useSession();
	const onToggleRegisterForm = () => dispatch(toggleRegisterForm());
	const currentActiveChatroom = useSelector(messageSelector).currentActiveChatroom;
	const currentActiveChatroomRef = useRef(currentActiveChatroom);

	const user = session?.user?.username ?? "";

	const { data: notificationData } = useQuery({
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
		<Fragment>
			<div className="sticky top-0 z-[19] flex h-16 w-full items-center justify-between bg-background px-3 py-2 shadow-md sm:px-6 sm:py-4 md:hidden">
				<MenuBar />
				<Logo className="mx-auto w-[17vw]" />
				{session && <MessageIcon user={user} isMobile={true} />}
				<div className="text-md fixed bottom-0 right-0 z-8 flex w-full items-center justify-between bg-background px-5 py-3">
					<div className="flex w-full items-center justify-around">
						<Link
							className="inline-block text-base hover:cursor-pointer"
							href="/sell/mobile/stageFirst"
						>
							SELL
						</Link>
						<div
							className="inline-block text-base hover:cursor-pointer"
							onClick={session ? onLogout : onToggleRegisterForm}
						>
							{session ? "LOGOUT" : "LOGIN"}
						</div>
						<div className="inline-block h-[28px] hover:cursor-pointer">
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
						{session && (
							<ShoppingCartIcon user={user} /*className="h-7 w-7 hover:cursor-pointer"*/ />
						)}
						{session && (
							<Link className="inline-block hover:cursor-pointer" href="/user/mobile">
								<User className="h-7 w-7" />
							</Link>
						)}
					</div>
				</div>
			</div>
			<MessageBoxMobile className="w-full md:hidden" user={user} />
		</Fragment>
	);
}
