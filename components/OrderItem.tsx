import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteShoppingCartItem from "@/lib/queries/fetchQuery";
import { useToast } from "@/components/ui/use-toast";
import { genericError, deleteSuccess } from "@/lib/utils/userMessage";
import { ApiResponse } from "@/lib/types/global";
import { CartData } from "@/lib/types/global";

interface OrderItemProps {
	username: string;
	cartData: CartData;
	priority: boolean;
}

export default function OderItem({ username, cartData, priority }: OrderItemProps) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const { mutate: shoppingCartMutate } = useMutation({
		mutationFn: () =>
			deleteShoppingCartItem({
				uri: `/user/${username}/shoppingCart/${cartData.product_id}`,
				method: "DELETE",
			}),
		onSuccess: () => {
			toast({
				title: deleteSuccess.title,
				description: deleteSuccess.desc,
				status: deleteSuccess.status,
			});
		},
		onError: () => {
			// invalidate both shoppingCart and shoppingCartTotal query
			queryClient.invalidateQueries({ queryKey: ["shoppingCart"] });
			toast({
				title: "Failed !",
				description: genericError,
				status: "fail",
			});
		},
	});

	const onDelete = () => {
		queryClient.setQueryData(
			["shoppingCart"],
			(oldData: ApiResponse<CartData[]> | undefined): ApiResponse<CartData[]> => {
				return {
					status: "success",
					data: oldData!.data.filter((obj) => obj.product_id !== cartData.product_id),
				};
			},
		);
		queryClient.setQueryData(
			["shoppingCart", "total"],
			(oldData: ApiResponse<number> | undefined): ApiResponse<number> => {
				return { status: "success", data: oldData!.data - 1 };
			},
		);
		shoppingCartMutate();
	};

	return (
		<div className="flex flex-col">
			<Separator />
			<div className="flex items-center justify-between">
				<div className="mt-2 text-sm md:text-base">
					<span>Sending From</span>
					<span className="ml-2 font-bold">@{cartData.seller_name}</span>
				</div>
			</div>
			<div className="mt-5 flex w-full justify-between space-x-1 md:mt-2">
				<div className="flex w-11/12 flex-col md:flex-row">
					<div className="relative aspect-[4/5] w-full shrink-0 md:w-2/5 md:max-w-[160px]">
						<Image
							src={cartData.primary_image}
							fill={true}
							alt="test"
							sizes="(max-width: 768px) 90vw, 33vw"
							priority={priority}
						/>
					</div>
					<div className="flex w-full flex-col justify-between md:ml-4 md:w-3/5">
						<div>
							<div className="mt-4 w-full text-base font-semibold md:mt-0 md:text-lg ">
								{cartData.product_name}
							</div>
							<div className="mb-2 w-full truncate text-xs underline md:my-0 md:text-sm">
								{cartData.Designer?.name}
							</div>
							<div className="my-2 w-full text-xs text-info md:my-0">
								<span>ID</span>
								<span className="ml-2">{cartData.product_id}</span>
							</div>
						</div>

						<Button variant="outline" className="h-4 w-fit p-3 text-sm md:h-8 md:p-4 md:text-base">
							Size {cartData.Size?.name}
						</Button>
					</div>
				</div>
				<div className="flex w-1/12 flex-col items-end justify-between text-sm">
					<XCircle
						onClick={onDelete}
						className="h-5 w-5 hover:cursor-pointer hover:stroke-current hover:text-rose-700"
					/>
					<div className="flex flex-col items-end">
						<div
							className={`ml-1 before:content-['$'] ${
								cartData.Discount || cartData.Offer ? "line-through" : ""
							}`}
						>
							{cartData.price}
						</div>
						{(cartData.Discount || cartData.Offer) && (
							<div className="flex items-center">
								<div className="text-xs">{cartData.Discount ? "(DISCOUNT)" : "(OFFER)"}</div>
								<div className="ml-1 text-red-800 before:content-['$']">
									{(Number(cartData.Discount)
										? Number(cartData.Discount)
										: Number(cartData.Offer)) * Number(cartData.price)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
