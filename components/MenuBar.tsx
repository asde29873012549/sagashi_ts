import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import ListDrawerItem from "./ListDrawer/item";

import getFeaturedDesigners from "@/lib/queries/fetchQuery";
import getTree from "@/lib/queries/fetchQuery";
import ListDrawer from "./ListDrawer";

import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Spinner from "./Spinner";
import { useRouter } from "next/router";

export default function MenuBar() {
	const router = useRouter();
	const menuRef = useRef<HTMLDivElement>(null);
	const initialTouchRef = useRef<number>(0);
	const endingTouchRef = useRef<number>(0);
	const isTouchActiveRef = useRef(false);
	const [open, setOpen] = useState(false);
	const [currentTab, setCurrentTab] = useState<"Menswear" | "Womenswear" | "All">("Menswear");
	const [currentCategory, setCurrentCategory] = useState<string>("");

	const { data: treeData } = useQuery({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree" }),
	});

	const {
		data: designerData,
		isError: designerError,
		isLoading: designerLoading,
	} = useQuery({
		queryKey: ["featuredDesingers"],
		queryFn: () => getFeaturedDesigners({ uri: "/designer/featured" }),
	});

	const category = treeData?.data.Category[currentTab] ?? {};

	const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		e.preventDefault();
		isTouchActiveRef.current = true;
		initialTouchRef.current = e.touches[0].screenY;
	};
	const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		endingTouchRef.current = e.touches[0].screenY;
		let movement = endingTouchRef.current - initialTouchRef.current;
		if (menuRef.current) menuRef.current.style.transform = `translateY(${movement}px)`;
	};

	const onTouchEnd = () => {
		isTouchActiveRef.current = false;
		const distance = endingTouchRef.current - initialTouchRef.current;
		if (menuRef.current)
			menuRef.current.style.transform =
				Math.abs(distance) > 200 ? "translateY(100vh)" : "translateY(0)";
	};

	const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
		if (isTouchActiveRef.current) return;
		if ((e.target as HTMLElement).role && endingTouchRef.current - initialTouchRef.current > 70) {
			setOpen(false);
			setCurrentCategory("");
		}

		initialTouchRef.current = 0;
		endingTouchRef.current = 0;
	};

	const onChangeTab = (e: React.MouseEvent<HTMLButtonElement>) => {
		setCurrentTab((e.target as HTMLElement).id as "Menswear" | "Womenswear" | "All");
	};

	const onGoBack = () => {
		setCurrentCategory("All");
	};

	const onNavigatePage = (page: string) => {
		setOpen(false);
		router.push(page);
	};

	const onOpenChange = () => {
		setOpen(!open);
		setCurrentCategory("");
	};

	return (
		<Sheet open={open} setOpen={onOpenChange}>
			<SheetTrigger className="flex h-6 w-6 flex-col justify-between md:hidden">
				<hr className="h-0.5 w-full border-0 bg-foreground" />
				<hr className="h-0.5 w-full border-0 bg-foreground" />
				<hr className="h-0.5 w-full border-0 bg-foreground" />
				<hr className="h-0.5 w-full border-0 bg-foreground" />
			</SheetTrigger>
			<SheetContent
				side="bottom"
				className="h-[95dvh] w-screen rounded-t-xl px-0 pt-0 transition-transform duration-75"
				ref={menuRef}
				onTransitionEnd={onTransitionEnd}
			>
				{designerLoading ? (
					<Spinner shouldNotCover={true} />
				) : (
					<>
						<div
							className="h-12 w-full"
							onTouchStart={onTouchStart}
							onTouchMove={onTouchMove}
							onTouchEnd={onTouchEnd}
						>
							{currentCategory && (
								<ChevronLeft className="absolute left-4 top-4 h-4 w-4" onClick={onGoBack} />
							)}
							<div className="flex h-full w-full items-center justify-center">
								<span
									className={`text-base transition-opacity duration-200 ${
										currentCategory ? "opacity-1" : "opacity-0"
									}`}
								>
									{currentCategory}
								</span>
							</div>
						</div>
						<SheetHeader>
							<div className={`flex items-center justify-center ${currentCategory && "hidden"}`}>
								<Button
									variant="ghost"
									className={`w-1/2 rounded-b-none ${currentTab === "Menswear" && "bg-gray-200"}`}
									id="Menswear"
									onClick={onChangeTab}
								>
									MENSWEAR
								</Button>
								<Button
									variant="ghost"
									className={`w-1/2 rounded-b-none ${currentTab === "Womenswear" && "bg-gray-200"}`}
									id="Womenswear"
									onClick={onChangeTab}
								>
									WOMENSWEAR
								</Button>
							</div>
						</SheetHeader>
						<Separator />
						<div className="relative h-full w-full overflow-x-hidden overflow-y-scroll font-light">
							<ListDrawerItem
								onNavigatePage={() => onNavigatePage(`/shop/${currentTab.toLowerCase()}`)}
							>
								{currentTab} Homepage
							</ListDrawerItem>
							<ListDrawerItem onNavigatePage={() => onNavigatePage(`/shop/newArrivals`)}>
								New Arrivals
							</ListDrawerItem>
							<ListDrawer
								data={designerData?.data}
								currentCategory={currentCategory}
								setCurrentCategory={setCurrentCategory}
								setOpen={setOpen}
							>
								Designers
							</ListDrawer>
							{Object.keys(category).map((key, index) => (
								<ListDrawer
									key={`${index}-${key}`}
									data={category[key].sub}
									currentCategory={currentCategory}
									setCurrentCategory={setCurrentCategory}
									setOpen={setOpen}
									currentTab={currentTab}
								>
									{key}
								</ListDrawer>
							))}
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
