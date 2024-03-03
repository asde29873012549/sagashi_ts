import ListingCard from "../../components/ListingCard";
import Tree from "@/components/Tree";
import { dehydrate, QueryClient, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import getTree from "@/lib/queries/fetchQuery";
import getProducts from "@/lib/queries/fetchQuery";
import getUserLikedListing from "@/lib/queries/fetchQuery";
import useInterSectionObserver from "@/lib/hooks/useIntersectionObserver";
import reformTree from "@/lib/utils/reformTree";
import { Skeleton } from "@/components/ui/skeleton";

import FilterSection from "@/components/FilterSection";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";

import {
	ApiResponse,
	Condition,
	FilterOptionType,
	MenswearCategory,
	OriginTreeData,
	ProductData,
	TreeFilterType,
	WomenswearCategory,
	FilteredTreeData,
} from "@/lib/types/global";

export default function ShopSearch({ treeData }: { treeData: OriginTreeData }) {
	const router = useRouter();
	const { data: OriginTreeData } = useQuery<ApiResponse<OriginTreeData>, Error>({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree" }),
		refetchOnWindowFocus: false,
	});

	const keyword = router.query.keyword;

	const [filter, setFilter] = useState({});
	const [tree, setTree] = useState<OriginTreeData | FilteredTreeData>(
		OriginTreeData?.data || treeData,
	);

	const createBody = (pageParam: [number], restFilter: TreeFilterType) => {
		if (!pageParam && Object.keys(restFilter).length === 0) return {};

		const filts: TreeFilterType & { cursor?: [number] } = { ...restFilter };

		if (pageParam) {
			filts.cursor = pageParam;
		}

		return filts;
	};

	const {
		data: searchResult,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<ApiResponse<{ total: number; result: ProductData[] }>, Error>({
		queryKey: ["products", filter, keyword],
		queryFn: ({ pageParam = "", ...restFilter }) =>
			getProducts({
				uri: `/search?keyword=${keyword}`,
				method: "POST",
				body: createBody(pageParam, restFilter.queryKey[1] as TreeFilterType),
			}),
		getNextPageParam: (lastPage, pages) =>
			// check if there is a next page by checking the sort property of elastic search result
			lastPage?.data?.result[lastPage.data.result?.length - 1]?.sort,
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

		setTree(reformedTree as FilteredTreeData);
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
				{searchResult?.pages?.[0]?.data?.total} Listings
			</h6>
			<FilterSection filter={filter} setFilter={setFilter} />
			<div className="relative p-2 md:flex md:px-6">
				<div className="no-scrollbar sticky top-0 hidden md:mr-10 md:inline-block md:h-[calc(100dvh-50px)] md:w-1/5 md:overflow-y-scroll">
					<Tree treeData={tree} onChangeFilter={onChangeFilter} filter={filter} />
				</div>
				<div className="relative grid grid-cols-2 gap-2 md:w-4/5 md:grid-cols-4">
					{(searchResult?.pages ?? []).map((page) => {
						const pageData = page.data.result || [];
						if (searchResult?.pages[0].data.result.length === 0)
							return (
								<div key={"noresultsfound"} className="absolute">
									<p className="text-xl font-semibold">Sorry, no results found.</p>
									<p>
										Please consider modifying your search or filters to explore different results.
									</p>
								</div>
							);
						return pageData.map((obj, index) => (
							<ListingCard
								key={`${index}-${obj.prod_id}`}
								src={obj.primary_image}
								prod_id={obj.prod_id}
								product_data={obj}
								likedListing={liked}
								className="w-full"
								lastProductElement={
									searchResult?.pages?.[0]?.data?.result.length === index + 1
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

export async function getServerSideProps({ query }: { query: { keyword: string } }) {
	const queryClient = new QueryClient();
	const keyword = query.keyword;

	await queryClient.prefetchQuery({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree", server: true }),
	});

	/*await queryClient.prefetchQuery({
		queryKey: ["listing", "liked"],
		queryFn: () => getUserLikedListing({ uri: `/listing/like` }),
	});*/

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
		},
	};
}
