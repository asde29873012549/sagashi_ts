import ListingCard from "../../components/listingDisplay/ListingCard";
import Tree from "@/components/Tree";
import { dehydrate, QueryClient, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import getTree from "@/lib/queries/fetchQuery";
import getProducts from "@/lib/queries/fetchQuery";
import getUserLikedListing from "@/lib/queries/fetchQuery";
import useInterSectionObserver from "@/lib/hooks/useIntersectionObserver";
import reformTree from "@/lib/utility/reformTree";
import { Skeleton } from "@/components/base/skeleton";

import FilterSection from "@/components/FilterSection";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type {
	DeptCategory,
	TreeFilterType,
	FilterOptionType,
	MenswearCategory,
	WomenswearCategory,
	ApiResponse,
	ProductData,
	OriginTreeData,
} from "@/lib/types/global";

interface ShopProps {
	isMenswear?: boolean;
	isWomenswear?: boolean;
	isNewArrival?: boolean;
	designer?: string;
	user?: string;
	treeData: any;
}

export default function Shop({
	isMenswear = false,
	isWomenswear = false,
	isNewArrival = false,
	designer,
	user,
	treeData,
}: ShopProps) {
	const subCat = useRouter().query.subCat as string | undefined;
	const routerCat = useRouter().query.cat;
	const cat = routerCat ? (routerCat as keyof DeptCategory[keyof DeptCategory]) : undefined;
	const dept = useRouter().query.dept as keyof DeptCategory | undefined;

	const { data: OriginTreeData } = useQuery<ApiResponse<OriginTreeData>, Error>({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree" }),
		refetchOnWindowFocus: false,
	});

	const initialFilterState = (): TreeFilterType => {
		if (isMenswear) {
			return { department: ["Menswear"] };
		} else if (isWomenswear) {
			return { department: ["Womenswear"] };
		} else if (designer) {
			return { designers: [designer] };
		} else if (isNewArrival) {
			return { newArrivals: true };
		} else if (subCat && cat && dept) {
			return { subCategory: [{ dept, cat, name: subCat }] };
		} else {
			return {};
		}
	};

	const initialTreeState = () => {
		if (isMenswear) {
			return reformTree(OriginTreeData?.data!, { department: ["Menswear"] });
		} else if (isWomenswear) {
			return reformTree(OriginTreeData?.data!, { department: ["Womenswear"] });
		} else {
			return OriginTreeData?.data || treeData;
		}
	};

	const [filter, setFilter] = useState<TreeFilterType>(initialFilterState());
	const [tree, setTree] = useState(initialTreeState());

	console.log(filter);

	useEffect(() => {
		subCat && cat && dept && setFilter({ subCategory: [{ dept, cat, name: subCat }] });
		designer && setFilter({ designers: [designer] });
	}, [subCat, cat, dept, designer]);

	const createBody = (pageParam: [number], restFilter: TreeFilterType) => {
		if (!pageParam && Object.keys(restFilter).length === 0) return {};

		const filts: TreeFilterType & { cursor?: [number] } = { ...restFilter };

		if (pageParam) {
			filts.cursor = pageParam;
		}

		return filts;
	};

	const {
		data: productData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<ApiResponse<{ total: number; result: ProductData[] }>, Error>({
		queryKey: ["products", filter, user],
		queryFn: ({ pageParam = "", ...restFilter }) =>
			getProducts({
				uri: user ? `/listing?user=${user}` : "/listing",
				method: "POST",
				body: createBody(pageParam, restFilter.queryKey[1] as TreeFilterType),
			}),
		getNextPageParam: (lastPage, pages) =>
			// check if there is a next page by checking the sort property of elastic search result
			lastPage?.data?.result[lastPage.data.result.length - 1]?.sort,
		refetchOnWindowFocus: false,
	});

	const lastProductElement = useInterSectionObserver({
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	});

	const onChangeFilter = (filter: TreeFilterType) => {
		setFilter(filter);
		const department = filter.department ? [...filter.department] : null;
		const category: Partial<FilterOptionType["category"]> = filter.subCategory && {};
		//const subCategory = filter.subCategory ? [...filter.subCategory] : null;

		const menswearSubCategory = filter.subCategory?.filter((obj) => obj.dept === "Menswear") || [];
		if (category && menswearSubCategory.length > 0) {
			category.Menswear = Array.from(
				new Set(menswearSubCategory.map((obj) => obj.cat)),
			) as (keyof MenswearCategory)[];

			if (department) !department.includes("Menswear") && department.push("Menswear");
		}

		const wommenswearSubCategory =
			filter.subCategory?.filter((obj) => obj.dept === "Womenswear") || [];
		if (category && wommenswearSubCategory.length > 0) {
			category.Womenswear = Array.from(
				new Set(wommenswearSubCategory.map((obj) => obj.cat)),
			) as (keyof WomenswearCategory)[];

			if (department) !department.includes("Womenswear") && department.push("Womenswear");
		}

		const reformedTree = reformTree(OriginTreeData?.data!, { department, category });

		setTree(reformedTree);
	};

	const { data: likedListing } = useQuery<ApiResponse<{ product_id: number }[]>, Error>({
		queryKey: ["listing", "liked"],
		queryFn: () => getUserLikedListing({ uri: `/listing/like` }),
		refetchOnWindowFocus: false,
	});

	const liked = likedListing?.data?.map((obj) => obj.product_id);

	return (
		<>
			<h6 className="my-4 p-2 text-sm font-semibold md:px-6">
				{productData?.pages?.[0]?.data?.total} Listings
			</h6>
			{!designer && !isMenswear && !isWomenswear && (
				<FilterSection filter={filter} setFilter={setFilter} />
			)}
			<div className="relative p-2 md:flex md:px-6">
				<div className="no-scrollbar sticky top-0 hidden md:mr-10 md:inline-block md:h-[calc(100dvh-50px)] md:w-1/5 md:overflow-y-scroll">
					<Tree
						isDesigner={!!designer}
						isMenswear={isMenswear}
						isWomenswear={isWomenswear}
						treeData={tree}
						onChangeFilter={onChangeFilter}
						filter={filter}
					/>
				</div>
				<div className="relative grid grid-cols-2 gap-2 md:w-4/5 md:grid-cols-4">
					{(productData?.pages ?? []).map((page) => {
						const pageData = page.data.result || [];
						if (productData?.pages[0].data.result.length === 0)
							return (
								<div key="noresultsfound" className="absolute">
									<p className="text-xl font-semibold">Sorry, no results found.</p>
									<p>
										Please consider modifying your search or filters to explore different results.
									</p>
								</div>
							);
						return pageData.map((obj, index) => (
							<ListingCard
								key={`${obj.prod_id}-listingData`}
								src={obj.primary_image}
								prod_id={obj.prod_id}
								product_data={obj}
								likedListing={liked}
								className="w-full"
								lastProductElement={
									productData?.pages?.[0]?.data?.result.length === index + 1
										? lastProductElement
										: null
								}
							/>
						));
					})}
					{isFetchingNextPage &&
						[...Array(4)].map((_, index) => (
							<div className="mb-5 w-full animate-delaySkeleton space-y-3" key={index}>
								<Skeleton className="h-80" />
								<div className="space-y-2">
									<span className="flex justify-between">
										<Skeleton className="h-5 w-5/6" />
										<Skeleton className="h-5 w-5 rounded-full" />
									</span>
									<Skeleton className="h-5 w-2/3" />
								</div>
							</div>
						))}
				</div>
			</div>
		</>
	);
}

export async function getStaticProps() {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree", server: true }),
	});

	await queryClient.prefetchQuery({
		queryKey: ["products", {}],
		queryFn: () => getProducts({ uri: "/listing", method: "POST", body: {}, server: true }),
	});

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
		},
	};
}
