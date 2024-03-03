import { Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ItemCard from "./ItemCard";
import { likeListing, gotFollowed, receivedOrder, uploadListing } from "@/lib/utils/msg_template";
import { useState } from "react";
import { OnlineNotification, NotificationType } from "@/lib/types/global";

interface NotificationHeartIconProps {
	notificationActive: boolean;
	onNotificationHeartIconClick: () => void;
	onlineNotification: OnlineNotification[];
	offlineNotification: NotificationType[];
}

export default function NotificationHeartIcon({
	notificationActive,
	onNotificationHeartIconClick,
	onlineNotification,
	offlineNotification,
}: NotificationHeartIconProps) {
	const [isOpen, setIsOpen] = useState(false);
	const mes_type_helper = (msg: OnlineNotification | NotificationType): React.ReactNode => {
		let content: React.ReactNode = "";
		const USERNAME = "username" in msg ? msg.username : msg.sender_name;
		const LISTING_NAME =
			"listing_name" in msg
				? msg.listing_name
				: JSON.parse((msg as NotificationType).content).listing_name;
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
					className={`absolute right-[-2px] top-[0px] z-50 mb-3 h-2.5 w-2.5 rounded-full bg-red-700 
					${!onlineNotification?.length || !notificationActive ? "hidden" : ""}`} // Hide if no new message
				></div>

				{/* Message Icon */}
				<Heart className="h-7 w-7" onClick={onNotificationHeartIconClick} />
			</PopoverTrigger>

			<PopoverContent
				className={`mr-4 max-h-[70dvh] md:mr-8 ${
					onlineNotification?.length > 0 ? "" : "mr-1"
				} overflow-y-scroll`}
			>
				{onlineNotification?.map((msg, index) => {
					const content = mes_type_helper(msg);
					return (
						<ItemCard
							key={`${msg.created_at}-${index}-online`}
							src={msg.image}
							timing={msg.created_at}
							link={msg.link}
							setIsOpen={onToggleMessageIcon}
							notification_id={msg.id}
							// read_at={msg.read_at}
						>
							{content}
						</ItemCard>
					);
				})}
				{offlineNotification &&
					offlineNotification.length > 0 &&
					offlineNotification.map((msg, index) => {
						const content = mes_type_helper(msg);
						return (
							<ItemCard
								key={`${msg.created_at}-${index}-offline`}
								src={msg.image}
								timing={msg.created_at}
								link={msg.link}
								setIsOpen={onToggleMessageIcon}
								notification_id={msg.id}
								read_at={msg.read_at}
							>
								{content}
							</ItemCard>
						);
					})}
				{!onlineNotification?.length && !offlineNotification?.length && (
					<div className="flex h-14 w-60 items-center justify-center text-gray-500">
						No new message
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
