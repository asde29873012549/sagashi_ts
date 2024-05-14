import ShopPage from "./index";
import getTree from "@/lib/queries/fetchQuery";
import { useQuery, QueryClient, dehydrate } from "@tanstack/react-query";

export default function FeaturedDesigners() {
	const { data: OriginTreeData } = useQuery({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree" }),
		refetchOnWindowFocus: false,
	});

	return <ShopPage treeData={OriginTreeData?.data} />;
}

export async function getServerSideProps() {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["tree"],
		queryFn: () => getTree({ uri: "/tree", server: true }),
	});

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
		},
	};
}
