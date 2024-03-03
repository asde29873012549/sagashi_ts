import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import followDesigner from "@/lib/queries/fetchQuery";
import { useToast } from "@/components/ui/use-toast";
import { genericError } from "@/lib/utils/userMessage";

import { useState } from "react";
import { Skeleton } from "./ui/skeleton";

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
		onError: () => {
			setIsFollow((prev) => !prev);
			toast({
				title: "Failed !",
				description: genericError,
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

	return (
		<div
			className={`flex h-fit flex-col justify-center rounded-md border pb-4 drop-shadow-lg ${className}`}
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
					variant={
						isFollow === null
							? isFollowed
								? "outline"
								: "default"
							: isFollow
								? "outline"
								: "default"
					}
					className="m-auto w-1/2"
				>
					{isFollow === null
						? isFollowed
							? "Following"
							: "Follow"
						: isFollow
							? "Following"
							: "Follow"}
				</Button>
			)}
		</div>
	);
}
