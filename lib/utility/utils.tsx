import * as dotenv from "dotenv";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { centerCrop, makeAspectCrop } from "react-image-crop";
import { Shirt, Wallet } from "lucide-react";
import { formatDistanceToNow, parseISO, differenceInMinutes, format } from "date-fns";
import { ApiResponse, MenswearCategory, UserJWT, WomenswearCategory } from "../types/global";
import Dress from "@/components/svg/Dress";
import HandBag from "@/components/svg/HandBag";
import Hoodie from "@/components/svg/Hoodie";
import Pants from "@/components/svg/Pants";
import ShirtFolded from "@/components/svg/Shirt";
import Shoes from "@/components/svg/Shoes";

dotenv.config();

const backend_server = process.env.BACKEND_SERVER;

type IconCategory = keyof MenswearCategory | keyof WomenswearCategory;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: "%",
				width: 90,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	);
}

export function generateCategoryIcon(category: IconCategory) {
	let icon = null;

	switch (category) {
		case "Tops":
			icon = <Shirt className="pointer-events-none" />;
			break;
		case "Bottoms":
			icon = <Pants />;
			break;
		case "Outerwear":
			icon = <Hoodie />;
			break;
		case "Footwear":
			icon = <Shoes />;
			break;
		case "Tailoring":
			icon = <ShirtFolded />;
			break;
		case "Accessories":
			icon = <Wallet className="pointer-events-none" />;
			break;
		case "Dresses":
			icon = <Dress />;
			break;
		case "Bags & Lugguage":
			icon = <HandBag />;
			break;
	}

	return icon;
}

export async function refreshAccessToken(token: UserJWT): Promise<UserJWT> {
	const response = await fetch(`${backend_server}/user/refreshToken`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ token }),
	});

	const res: ApiResponse<UserJWT> = await response.json();
	const newToken = res.data;

	return newToken;
}

export function debounce<F extends () => void>(fn: F, duration: number) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return function () {
		timer && clearTimeout(timer);
		timer = setTimeout(() => {
			fn();
		}, duration);
	};
}

export const getDateDistance = (isoDate: string) => {
	try {
		const date = parseISO(isoDate);
		const distance = formatDistanceToNow(date, { addSuffix: true });

		return distance;
	} catch (err) {
		console.log(err);
		return "Invalid Date";
	}
};

export const parseISODate = (isoDate: string) => {
	try {
		const date = parseISO(isoDate);
		const formattedDate = format(date, "yyyy/MM/dd HH:mm:ss");

		return formattedDate;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const timeDifference = (current: string, previous: string) => {
	const startDate = parseISO(current);
	const endDate = parseISO(previous);

	return differenceInMinutes(startDate, endDate);
};

export const formattedMoney = (amount: number) =>
	amount.toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
