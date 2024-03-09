import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/base/separator";
import { cn } from "@/lib/utility/utils";

export default function MenuDrawerItem({
	children,
	currentCategory,
	item,
	onNavigatePage,
}: {
	children: React.ReactNode;
	currentCategory?: string;
	item?: string;
	onNavigatePage?: () => void;
}) {
	return (
		<div
			onClick={onNavigatePage}
			className={cn("w-full hover:bg-slate-100", currentCategory !== item ? "h-0" : "")}
		>
			<div className="box-border flex justify-between px-4 py-3 text-accent-foreground">
				<span>{children}</span>
				<ChevronRight strokeWidth={1} />
			</div>
			<Separator className="w-full" />
		</div>
	);
}
