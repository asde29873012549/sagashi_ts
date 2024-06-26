import Image from "next/image";
import Link from "next/link";
import { Separator } from "../base/separator";
import { Heart } from "lucide-react";
import { cn, getDateDistance } from "@/lib/utility/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createLike from "@/lib/queries/fetchQuery";
import { useToast } from "@/components/base/use-toast";
import { genericError } from "@/lib/utility/userMessage";
import type { ProductData, ApiResponse, RecentlyViewedProductData } from "@/lib/types/global";

import { useState } from "react";
import { toggleRegisterForm } from "@/redux/userSlice";
import { useDispatch } from "react-redux";

interface ListingCardProps {
	src: string;
	prod_id: number;
	product_data: ProductData | RecentlyViewedProductData;
	lastProductElement?: null | ((node: HTMLElement | null) => void);
	likedListing: number[] | undefined;
	className: string;
	priority?: boolean;
	isUserLoggedIn: boolean;
}

export default function ListingCard({
	src,
	prod_id,
	product_data,
	lastProductElement,
	likedListing,
	className,
	priority,
	isUserLoggedIn,
}: ListingCardProps) {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const [loaded, setLoaded] = useState<boolean>(false);
	const { toast } = useToast();

	const { mutate: likeMutate } = useMutation({
		mutationFn: () =>
			createLike({
				uri: "/listing/like",
				method: "POST",
				body: {
					listing_id: prod_id,
					listing_name: product_data?.name,
					seller_name: product_data?.seller_name,
					listing_image: src,
				},
			}),
		onMutate: () => {
			// snapshot previous value
			const previousLiked = queryClient.getQueryData<ApiResponse<{ product_id: number }[]>>([
				"listing",
				"liked",
			]);

			// optimistically update
			queryClient.setQueryData<ApiResponse<{ product_id: number }[]>>(
				["listing", "liked"],
				(): ApiResponse<{ product_id: number }[]> => {
					const hasLiked = previousLiked?.data.find(
						(obj) => Number(obj.product_id) === Number(prod_id),
					);
					if (hasLiked) {
						return {
							status: "success",
							data: previousLiked!.data.filter((obj) => Number(obj.product_id) !== Number(prod_id)),
						};
					} else {
						return {
							status: "success",
							data: [...(previousLiked?.data ?? []), { product_id: prod_id }],
						};
					}
				},
			);

			// return rollback snapshot
			return previousLiked;
		},
		onError: (error, newLikes, context) => {
			// rollback to previous value
			queryClient.setQueryData(["listing", "liked"], context);

			toast({
				title: "Failed !",
				description: genericError,
				status: "fail",
			});
		},
	});

	const onLike = async () => {
		try {
			if (!isUserLoggedIn) {
				dispatch(toggleRegisterForm());
				return;
			}
			likeMutate();
		} catch (err) {
			console.log(err);
		}
	};

	const onImageLoad = () => {
		setLoaded(true);
	};

	return (
		<div
			className={cn("mb-5 h-fit", className)}
			ref={lastProductElement ? lastProductElement : null}
		>
			<Link href={`/shop/${prod_id}`}>
				<div
					className={cn(
						"relative aspect-[4/5] w-full opacity-0",
						loaded ? "animate-imageEaseIn" : "",
					)}
				>
					<Image
						src={src}
						fill={true}
						alt="pic"
						sizes="(max-width: 768px) 50vw, 20vw"
						onLoad={onImageLoad}
						priority={priority}
					/>
				</div>
			</Link>
			<div className="text-sm text-gray-500">{getDateDistance(product_data?.created_at)}</div>
			<Separator />
			<div className="flex w-full items-center justify-between">
				<Link href={`/shop/${prod_id}`} className="w-5/6">
					<div className="truncate text-base font-semibold text-foreground">
						{product_data?.name}
					</div>
				</Link>
				<div className="flex w-1/6 justify-end text-sm text-foreground">
					{product_data && "size" in product_data ? product_data.size : product_data?.Size?.name}
				</div>
			</div>
			<div className="truncate text-xs text-foreground">
				{product_data && "designer" in product_data && product_data.designer}
			</div>
			<div className="flex items-center justify-between text-sm text-foreground">
				<div className="before:content-['$']">{product_data?.price}</div>
				{likedListing?.includes(prod_id) ? (
					<FilledHeart onClick={onLike} className="h-5 w-5 fill-red-700 hover:cursor-pointer" />
				) : (
					<Heart onClick={onLike} className="h-5 w-5 hover:cursor-pointer" />
				)}
			</div>
		</div>
	);
}

function FilledHeart({ onClick, className }: { onClick: () => void; className: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="#B91C1C"
			stroke="#B91C1C"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn("lucide lucide-heart hover:cursor-pointer", className)}
			onClick={onClick}
		>
			<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
		</svg>
	);
}
