import ListDrawerItem from "./item";
import { useRouter } from "next/router";

import React, { useRef } from "react";

const slideThreshold = 100;

type ListDrawerData =
	| { id: number; name: string }
	| { id: number; name: string; logo: string | null; created_at: string };

interface ListDrawerProps {
	data: ListDrawerData[];
	children: string;
	currentCategory: string;
	setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	currentTab?: "Menswear" | "Womenswear" | "All";
}

export default function ListDrawer({
	data,
	children,
	currentCategory,
	setCurrentCategory,
	setOpen,
	currentTab,
}: ListDrawerProps) {
	const router = useRouter();
	const initialTouchRef = useRef<number>(0);
	const endingTouchRef = useRef<number>(0);
	const isTouchActiveRef = useRef<Boolean>(false);
	const pageRef = useRef<HTMLDivElement>(null);
	const pageRefCurrent = pageRef.current!;

	const onSwitch = () => {
		setCurrentCategory(children);
		pageRefCurrent.style.transform = `translateX(0px)`;
	};

	const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		e.preventDefault();

		isTouchActiveRef.current = true;
		initialTouchRef.current = e.touches[0].screenX;
	};
	const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		endingTouchRef.current = e.touches[0].screenX;
		let movement = endingTouchRef.current - initialTouchRef.current;
		movement = movement > slideThreshold ? movement : 0;
		pageRefCurrent.style.transform = `translateX(${movement}px)`;
	};

	const onTouchEnd = () => {
		isTouchActiveRef.current = false;
		const distance = endingTouchRef.current - initialTouchRef.current;
		if (distance > slideThreshold) {
			pageRefCurrent.style.transform = `translateX(${pageRefCurrent.offsetWidth}px)`;
			setTimeout(() => setCurrentCategory(""), 500);
		} else {
			pageRefCurrent.style.transform = "translateX(0px)";
			setTimeout(() => setCurrentCategory(children), 500);
		}

		initialTouchRef.current = 0;
		endingTouchRef.current = 0;
	};

	const onNavigatePage = (obj: ListDrawerData) => {
		setOpen(false);
		if (children === "Designers") {
			return router.push(`/designers/${obj?.id}`);
		}

		return router.push(`/shop?dept=${currentTab || ""}&cat=${children}&subCat=${obj.name}`);
	};

	return (
		<div className="font-light" onClick={onSwitch}>
			<ListDrawerItem>{children}</ListDrawerItem>
			<div
				className={`absolute top-0 box-border h-full w-0 translate-x-full bg-white transition-transform duration-500 ${
					currentCategory !== children ? "invisible opacity-0" : "w-full"
				}`}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				ref={pageRef}
			>
				{children === "Designers" && <ListDrawerItem>View All</ListDrawerItem>}
				{data &&
					data.map((obj) => (
						<ListDrawerItem
							key={obj.id}
							currentCategory={currentCategory}
							item={children}
							onNavigatePage={() => onNavigatePage(obj)}
						>
							{obj.name}
						</ListDrawerItem>
					))}
			</div>
		</div>
	);
}
