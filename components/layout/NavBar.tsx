//ui
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/base/navigation-menu";
import { Skeleton } from "@/components/base/skeleton";
import { Dot } from "lucide-react";
import { MoveRight } from "lucide-react";

//libs
import getFeaturedDesigners from "@/lib/queries/fetchQuery";
import getAllCategories from "@/lib/queries/fetchQuery";
import { genericError } from "@/lib/utility/userMessage";

//frameworks
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import type { SubCategorySubType } from "@/lib/types/global";

interface DesignerData {
	id: number;
	name: string;
	logo: string;
	created_at: string;
}

export default function NavBar() {
	const { data: designerData, isError: designerError } = useQuery({
		queryKey: ["featuredDesingers"],
		queryFn: () => getFeaturedDesigners({ uri: "/designer/featured" }),
	});

	const {
		data: categoryData,
		isError: categoryError,
		isLoading: categoryLoading,
	} = useQuery({
		queryKey: ["category"],
		queryFn: () => getAllCategories({ uri: "/category" }),
	});

	return (
		<NavigationMenu>
			<div className="hidden md:block md:w-full md:py-2">
				<NavigationMenuList className="md:flex md:w-full md:justify-around">
					<NavigationMenuItem>
						<NavigationMenuTrigger className="font-light md:text-lg">
							DESIGNERS
						</NavigationMenuTrigger>
						<NavigationMenuContent className="flex h-96 w-screen items-center px-9 py-5">
							<NavigationMenuLink className="text-lg font-normal hover:bg-white md:w-60" asChild>
								<Link href="/designers" className="hover:underline">
									Designers A-Z
								</Link>
							</NavigationMenuLink>
							<div className="flex h-5/6 w-10/12 flex-col">
								<div className="mx-5 mb-4 text-lg font-normal">Featured Designers</div>
								<div className="mx-auto my-0 grid grid-cols-4 text-lg">
									{designerError && <span className="m-auto">{genericError}</span>}
									{designerError
										? new Array(25).map((_, index) => (
												<Skeleton key={`${index}-designer`} className="mx-5 my-2 h-8 w-44" />
											))
										: designerData?.data.map((obj: DesignerData) => (
												<NavigationMenuLink key={obj.id} asChild>
													<Link
														href={`/designers/${obj.id}`}
														className="group mx-5 my-0.5 flex w-60 translate-y-0 transform items-center font-light text-gray-600 transition-transform duration-300 ease-in-out hover:translate-y-0.5 hover:underline"
													>
														<span>{obj.name}</span>
														<span className="hidden group-hover:block group-hover:text-cyan-700">
															<Dot />
														</span>
													</Link>
												</NavigationMenuLink>
											))}
								</div>
								<div className="mx-auto mt-4 grid w-full grid-cols-4 text-lg font-normal hover:cursor-pointer hover:underline">
									<NavigationMenuLink asChild>
										<Link
											href="/designers"
											className="col-start-4 mx-5 flex w-60 items-center space-x-3"
										>
											<span className="self-start">View All</span>
											<MoveRight size={20} strokeWidth={1.5} className="animate-horizontalBounce" />
										</Link>
									</NavigationMenuLink>
								</div>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger className="font-light md:text-lg">
							MENSWEAR
						</NavigationMenuTrigger>
						<NavigationMenuContent className="flex h-96 w-screen items-center px-9 py-7">
							<div className="mx-auto my-0 flex h-full w-11/12 flex-col flex-wrap text-lg">
								{categoryError && <span className="m-auto">{genericError}</span>}
								{categoryLoading
									? new Array(30).map((_, index) => (
											<Skeleton key={`${index}-m-category`} className="mx-5 my-2 h-8 w-48" />
										))
									: Object.keys(categoryData?.data.Menswear ?? {}).map((cat, index) => (
											<div className="flex flex-col" key={`${index}-${cat}`}>
												<div className="my-2 w-52 font-normal">{cat}</div>
												<div className="flex flex-col">
													{categoryData?.data.Menswear[cat].sub.map(
														(subCat: SubCategorySubType, index: number) => (
															<NavigationMenuLink key={`${index}-${subCat}`} asChild>
																<Link
																	href={`/shop?subCat=${encodeURIComponent(
																		subCat.name,
																	)}&cat=${cat}&dept=Menswear`}
																>
																	<div className="my-1 flex translate-y-0 transform text-base font-light transition-transform duration-300 ease-in-out hover:translate-y-0.5 hover:cursor-pointer hover:underline">
																		<span>{subCat.name}</span>
																	</div>
																</Link>
															</NavigationMenuLink>
														),
													)}
												</div>
											</div>
										))}
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger className="font-light md:text-lg">
							WOMENSWEAR
						</NavigationMenuTrigger>
						<NavigationMenuContent className="flex h-96 w-screen items-center px-9 py-7">
							<div className="mx-auto my-0 flex h-full w-11/12 flex-col flex-wrap text-lg">
								{categoryError && <span className="m-auto">{genericError}</span>}
								{categoryLoading
									? new Array(30).map((_, index) => (
											<Skeleton key={`${index}-w-category`} className="mx-5 my-2 h-8 w-48" />
										))
									: Object.keys(categoryData?.data.Womenswear ?? {}).map((cat, index) => (
											<div className="flex flex-col" key={`${index}-${cat}`}>
												<div className="my-2 w-44 font-normal">{cat}</div>
												<div className="flex flex-col">
													{categoryData?.data.Womenswear[cat].sub.map(
														(subCat: SubCategorySubType, index: number) => (
															<NavigationMenuLink key={`${index}-${subCat}`} asChild>
																<Link
																	href={`/shop?subCat=${encodeURIComponent(
																		subCat.name,
																	)}&cat=${cat}&dept=Womenswear`}
																>
																	<div className="my-1 flex translate-y-0 transform text-base font-light transition-transform duration-300 ease-in-out hover:translate-y-0.5 hover:cursor-pointer hover:underline">
																		<span>{subCat.name}</span>
																	</div>
																</Link>
															</NavigationMenuLink>
														),
													)}
												</div>
											</div>
										))}
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink className="font-light md:text-lg">STAFF PICKS</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink className="font-light md:text-lg">ARTICLES</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</div>
		</NavigationMenu>
	);
}
