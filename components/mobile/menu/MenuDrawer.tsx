import { cn } from "@/lib/utility/utils";
import MenuDrawerItem from "./MenuDrawerItem";
import { useRouter } from "next/router";

import React, { useRef } from "react";
import { FeaturedDesignerData, MenswearCategory, WomenswearCategory } from "@/lib/types/global";

const slideThreshold = 100;

interface MenuDrawerProps {
	data: (keyof MenswearCategory | keyof WomenswearCategory)[] | FeaturedDesignerData[];
	children: string;
	currentCategory: string;
	setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	currentTab?: "Menswear" | "Womenswear" | "All";
}

export default function MenuDrawer({
	data,
	children,
	currentCategory,
	setCurrentCategory,
	setOpen,
	currentTab,
}: MenuDrawerProps) {
	const router = useRouter();
	const initialTouchRef = useRef<number>(0);
	const endingTouchRef = useRef<number>(0);
	const isTouchActiveRef = useRef<Boolean>(false);
	const pageRef = useRef<HTMLDivElement>(null);

	const onSwitch = () => {
		setCurrentCategory(children);
		if (pageRef.current) pageRef.current.style.transform = `translateX(0px)`;
	};

	const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		isTouchActiveRef.current = true;
		initialTouchRef.current = e.touches[0].screenX;
	};
	const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		endingTouchRef.current = e.touches[0].screenX;
		let movement = endingTouchRef.current - initialTouchRef.current;
		movement = movement > slideThreshold ? movement : 0;
		pageRef.current!.style.transform = `translateX(${movement}px)`;
	};

	const onTouchEnd = () => {
		isTouchActiveRef.current = false;
		const distance = endingTouchRef.current - initialTouchRef.current;
		if (distance > slideThreshold) {
			pageRef.current!.style.transform = `translateX(${pageRef.current!.offsetWidth}px)`;
			setTimeout(() => setCurrentCategory(""), 500);
		} else {
			pageRef.current!.style.transform = "translateX(0px)";
			setTimeout(() => setCurrentCategory(children), 500);
		}

		initialTouchRef.current = 0;
		endingTouchRef.current = 0;
	};

	const onNavigatePage = (
		categoryName: keyof MenswearCategory | keyof WomenswearCategory | number,
	) => {
		setOpen(false);
		if (children === "Designers") {
			return router.push(`/designers/${categoryName}`);
		}

		return router.push(`/shop?dept=${currentTab || ""}&cat=${children}&subCat=${categoryName}`);
	};

	return (
		<div className="font-light" onClick={onSwitch}>
			<MenuDrawerItem>{children}</MenuDrawerItem>
			<div
				className={cn(
					"absolute top-0 box-border h-full w-0 translate-x-full bg-white transition-transform duration-500",
					currentCategory !== children ? "invisible opacity-0" : "w-full",
				)}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				ref={pageRef}
			>
				{children === "Designers" && <MenuDrawerItem>View All</MenuDrawerItem>}
				{data?.map((c, index) => {
					return (
						<MenuDrawerItem
							key={`${c}-${index}`}
							currentCategory={currentCategory}
							item={children}
							onNavigatePage={() => onNavigatePage(typeof c === "string" ? c : c.id)}
						>
							{typeof c === "string" ? c : c.name}
						</MenuDrawerItem>
					);
				})}
			</div>
		</div>
	);
}
