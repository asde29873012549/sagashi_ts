import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/base/button";
import { useMutation } from "@tanstack/react-query";
import followDesigner from "@/lib/queries/fetchQuery";
import { useToast } from "@/components/base/use-toast";
import { genericError, unAuthorizedError } from "@/lib/utility/userMessage";
import { cn } from "@/lib/utility/utils";

import { useState } from "react";
import { Skeleton } from "../base/skeleton";

interface DesignerCardProps {
	src: string;
	className?: string;
	name: string;
	designer_id: string;
	isFollowed: boolean;
	isLoading: boolean;
}

export default function DesignerCard({
	src,
	className,
	name,
	designer_id,
	isFollowed,
	isLoading,
}: DesignerCardProps) {
	const [isFollow, setIsFollow] = useState<boolean | null>(null);
	const [loaded, setLoaded] = useState<boolean>(false);
	const { toast } = useToast();

	const { mutate: followMutate, isLoading: isLoadingFollowState } = useMutation({
		mutationFn: () =>
			followDesigner({
				uri: "/designer",
				method: "POST",
				body: {
					designer_id,
				},
			}),
		onError: (err: Error) => {
			setIsFollow((prev) => !prev);
			toast({
				title: "Failed !",
				description:
					err.message === unAuthorizedError.title ? unAuthorizedError.desc : genericError,
				status: "fail",
			});
		},
	});

	const onFollow = () => {
		setIsFollow((prev) => !prev);
		followMutate();
	};

	const onImageLoad = () => {
		setLoaded(true);
	};

	const [followBtnStyle, isDesignerFollowed]: ["outline" | "default", "Following" | "Follow"] =
		isFollow === null
			? isFollowed
				? ["outline", "Following"]
				: ["default", "Follow"]
			: isFollow
				? ["outline", "Following"]
				: ["default", "Follow"];

	return (
		<div
			className={cn(
				"flex h-fit flex-col justify-center rounded-md border pb-4 drop-shadow-lg",
				className,
			)}
		>
			<Link href={`/designers/${designer_id}`}>
				<div
					className={`relative aspect-[4/5] w-full rounded-md opacity-0 ${
						loaded ? "animate-imageEaseIn" : ""
					}`}
				>
					<Image
						src={src}
						fill={true}
						alt="pic"
						onLoad={onImageLoad}
						sizes="(max-width: 620px) 80vw, 20vw"
					/>
				</div>
			</Link>
			<div className="flex w-full flex-col items-center justify-center">
				<Link href={`/designers/${designer_id}`}>
					<div className="mb-1 mt-2 truncate text-xl font-bold text-foreground md:text-base lg:text-xl">
						{name}
					</div>
				</Link>
			</div>
			<span className="m-auto mb-2 text-sm underline">1.3k listings</span>
			{isLoading ? (
				<Skeleton className="m-auto h-10 w-1/2" />
			) : (
				<Button
					onClick={onFollow}
					disabled={isLoadingFollowState}
					// for initail load, check the isFollowed state from API, after that, check the state of the local isFollow state
					variant={followBtnStyle}
					id="followBtn"
					className="m-auto w-1/2"
				>
					{isDesignerFollowed}
				</Button>
			)}
		</div>
	);
}
