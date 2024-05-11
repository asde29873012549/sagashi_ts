import { Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";
import { Alert, AlertDescription } from "@/components/base/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { likeListing, gotFollowed, uploadListing } from "@/lib/utility/msg_template";
import { useState } from "react";
import type { OnlineNotification, NotificationType, ApiResponse } from "@/lib/types/global";
import { cn, getDateDistance } from "@/lib/utility/utils";
import { Dot } from "lucide-react";
import readNotification from "@/lib/queries/fetchQuery";
import { useDispatch, useSelector } from "react-redux";
import { messageSelector, setNotificationReadStatus } from "@/redux/messageSlice";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NotificationHeartIconProps {
	notificationActive: boolean;
	onNotificationHeartIconClick: () => void;
	onlineNotification: OnlineNotification[];
	offlineNotification: NotificationType[];
}

interface ItemCardProps {
	src: string;
	children: React.ReactNode;
	timing?: string;
	link: string;
	setIsOpen: () => void;
	read_at?: string | null;
	message_id?: number;
	notification_id: number[] | string;
}

export default function NotificationHeartIcon({
	notificationActive,
	onNotificationHeartIconClick,
	// instant notifications
	onlineNotification,
	// offline notification from Database
	offlineNotification,
}: NotificationHeartIconProps) {
	const [isOpen, setIsOpen] = useState(false);

	const mes_type_helper = (msg: OnlineNotification | NotificationType): React.ReactNode => {
		let content: React.ReactNode = "";
		const USERNAME = "username" in msg ? msg.username : msg.sender_name;
		const LISTING_NAME =
			"content" in msg ? msg.content.listing_name : "listing_name" in msg ? msg.listing_name : "";
		switch (msg.type) {
			case "notification.like":
				content = likeListing(USERNAME, LISTING_NAME);
				break;
			case "notification.follow":
				content = gotFollowed(USERNAME);
				break;
			case "notification.uploadListing":
				content = uploadListing(USERNAME, LISTING_NAME);
				break;
			// case "notification.order":
			// 	content = receivedOrder(USERNAME, LISTING_NAME);
			// 	break;
		}

		return content;
	};

	const onToggleMessageIcon = () => {
		setIsOpen((o) => !o);
	};

	return (
		<Popover open={isOpen} onOpenChange={onToggleMessageIcon}>
			<PopoverTrigger className="relative flex">
				{/* Notification Circle */}
				<div
					className={cn(
						"absolute right-[-2px] top-[0px] z-50 mb-3 h-2.5 w-2.5 rounded-full bg-red-700",
						(!onlineNotification?.length || !notificationActive) && "hidden",
					)} // Hide if no new message
				></div>

				{/* Message Icon */}
				<Heart className="h-7 w-7" onClick={onNotificationHeartIconClick} />
			</PopoverTrigger>

			<PopoverContent
				className={cn(
					"mr-4 max-h-[70dvh] overflow-y-scroll md:mr-8",
					onlineNotification?.length > 0 ? "" : "mr-1",
				)}
			>
				{onlineNotification.map((msg, index) => {
					const content = mes_type_helper(msg);
					return (
						<NotificationItemCard
							key={`${msg.created_at}-${index}-online`}
							src={msg.image}
							timing={msg.created_at}
							link={msg.link}
							setIsOpen={onToggleMessageIcon}
							notification_id={msg.id}
							// read_at={msg.read_at}
						>
							{content}
						</NotificationItemCard>
					);
				})}
				{offlineNotification.map((msg, index) => {
					const content = mes_type_helper(msg);
					return (
						<NotificationItemCard
							key={`${msg.created_at}-${index}-offline`}
							src={msg.image}
							timing={msg.created_at}
							link={msg.link}
							setIsOpen={onToggleMessageIcon}
							notification_id={msg.id}
							read_at={msg.read_at}
						>
							{content}
						</NotificationItemCard>
					);
				})}
				{!onlineNotification.length && !offlineNotification.length && (
					<div className="flex h-14 w-60 items-center justify-center text-gray-500">
						No new message
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}

function NotificationItemCard({
	src,
	children,
	timing, // only notificationIcon will have timing
	link, // only notificationIcon will have link
	setIsOpen,
	read_at, // only offline notification will have read_at
	notification_id, // only notificationIcon will have notification_id
}: ItemCardProps) {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const notificationReadMap = useSelector(messageSelector).isNotificationReadMap;
	const hasOnlineNotiSeen =
		notification_id && !Array.isArray(notification_id)
			? notificationReadMap[notification_id]
			: undefined;

	const isNotificationUnread = hasOnlineNotiSeen ? false : hasOnlineNotiSeen === null || !read_at;

	const { mutate: readNotificationMutate } = useMutation({
		mutationFn: () =>
			readNotification({
				uri: "/notification",
				method: "PUT",
				body: {
					notification_id,
				},
			}),
		onMutate: async () => {
			// Snapshot the previous value
			const previousMessage = queryClient.getQueryData<ApiResponse<NotificationType[]>>([
				"notification",
			]);

			// Optimistically update to the new value
			queryClient.setQueryData(
				["notification"],
				(oldData: ApiResponse<NotificationType[]> | undefined): ApiResponse<NotificationType[]> => {
					return {
						status: oldData!.status,
						data:
							oldData?.data.map((obj) =>
								JSON.stringify(obj.id) === JSON.stringify(notification_id)
									? { ...obj, read_at: new Date().toISOString() }
									: obj,
							) ?? [],
					};
				},
			);
			// Return a context object with the snapshotted value
			return { previousMessage };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(["notification"], context?.previousMessage);
		},
	});

	const onToggleSelect = () => {
		setIsOpen();
		if (!notification_id) return;
		if (isNotificationUnread) {
			readNotificationMutate();
			!Array.isArray(notification_id) && dispatch(setNotificationReadStatus(`${notification_id}`));
		}
	};

	return (
		<Link href={link || ""} onClick={onToggleSelect} scroll={false}>
			<Alert>
				<AlertDescription
					className={`flex w-[400px] cursor-pointer items-center justify-between rounded-md p-4 hover:bg-slate-100 ${isNotificationUnread ? "bg-slate-100" : ""}`}
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
						{isNotificationUnread && (
							<Dot strokeWidth={5} color="#4932f5" className="h-full shrink-0 self-center" />
						)}
					</div>
				</AlertDescription>
			</Alert>
		</Link>
	);
}
