import { cn } from "@/lib/utility/utils";

interface MessageProps {
	className?: string;
	children: React.ReactNode;
	selfMessage?: boolean;
	lastMessageElement?: (node: HTMLDivElement) => void;
}

export default function ChatroomThumbnailCard({
	className = "",
	children,
	selfMessage,
	lastMessageElement,
}: MessageProps) {
	return (
		<div
			className={cn("flex w-full", selfMessage ? "justify-end" : "justify-start")}
			ref={lastMessageElement}
		>
			<span
				className={cn(
					"my-0.5 inline-block w-fit max-w-[60%] text-balance break-words rounded-3xl border-2 px-3 py-1 text-sm",
					className,
				)}
			>
				{children}
			</span>
		</div>
	);
}
