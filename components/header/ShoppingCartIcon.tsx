import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getShoppingCart from "@/lib/queries/fetchQuery";

export default function ShoppingCartIcon({ user }: { user: string }) {
	const { data: shoppingCartData } = useQuery({
		queryKey: ["shoppingCart", "total"],
		queryFn: () => getShoppingCart({ uri: `/user/${user}/shoppingCart/total` }),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		enabled: user ? true : false,
	});

	return (
		<Link href={"/shoppingCart"}>
			<div className="relative">
				{shoppingCartData?.data > 0 && (
					<div className="absolute right-[-4px] top-[-3px] z-50 mb-3 h-4 w-4 animate-opacityTransition rounded-full bg-red-700 text-center text-[10px] leading-4 text-white">
						{shoppingCartData.data}
					</div>
				)}
				<ShoppingCart className="h-7 w-7 hover:cursor-pointer" />
			</div>
		</Link>
	);
}
