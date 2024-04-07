import { expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DesignerComboBox from "./DesignerComboBox";
import { useRef } from "react";
import { renderWithClient } from "@/test/queryClientWrapper";
import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createServer } from "@/test/mockServer";
import { JsonBodyType } from "msw";
import getAllDesigners from "@/lib/queries/fetchQuery";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

interface HandlerConfig {
	url: string;
	method?: "get" | "post" | "put" | "delete" | "patch";
	res: (args: {
		request: Request;
		params: Record<string, string | readonly string[]>;
		cookies: Record<string, string>;
	}) => JsonBodyType;
}

const pageParam = [undefined, [43], [54]];

const cursorHandler: HandlerConfig[] = pageParam.map(() => {
	return {
		url: "/api/proxy/designer",
		method: "get",
		res: ({ request }) => {
			const cursor = new URL(request.url).searchParams.get("cursor");
			const startIndex = cursor
				? pageParam.findIndex((param) => JSON.stringify(param) === decodeURIComponent(cursor)) * 10
				: 0;
			return {
				status: "success",
				data: designerData.slice(startIndex, startIndex + 10),
			};
		},
	};
});

createServer(cursorHandler);

const MockParentComponent = () => {
	const {
		data: designerData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["designer", "infinite"],
		queryFn: ({ pageParam = "" }) =>
			getAllDesigners({
				uri: `/designer?cursor=${pageParam && encodeURI(JSON.stringify(pageParam))}&limit=10`,
			}),
		getNextPageParam: (lastPage, pages) => lastPage?.data?.[lastPage.data?.length - 1]?.sort,
		refetchOnWindowFocus: false,
	});

	return (
		<Provider store={store}>
			<DesignerComboBox
				ref={useRef()}
				data={designerData?.pages ?? []}
				fetchNextPage={fetchNextPage}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				setFormInput={() => {}}
			/>
		</Provider>
	);
};

const setUp = () => {
	const user = userEvent.setup();
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});
	const result = renderWithClient(queryClient, <MockParentComponent />);

	return { user };
};

test("Infinitive scroll should work", async () => {
	const { user } = setUp();

	const designerComboInput = screen.getByRole("combobox");
	await user.click(designerComboInput);

	const scrollArea = await screen.findByTestId("scrollArea");

	designerData.slice(0, 10).forEach((designer) => {
		const designerName = screen.getByText(designer.name);
		expect(designerName).toBeInTheDocument();
	});

	designerData.slice(11).forEach((designer) => {
		expect(screen.queryByText(designer.name)).not.toBeInTheDocument();
	});

	// can't test infinite-scroll due to the limitation on jsdom's implemetation on layout

	// fireEvent.scroll(scrollArea, { target: { scrollTop: 1000 } });

	// screen.debug(scrollArea);

	// await waitFor(() => {
	// 	designerData.slice(0, 20).forEach((designer) => {
	// 		const designerName = screen.getByText(designer.name);
	// 		expect(designerName).toBeInTheDocument();
	// 	});
	// });

	// designerData.slice(21).forEach((designer) => {
	// 	expect(screen.queryByText(designer.name)).not.toBeInTheDocument();
	// });

	// fireEvent.scroll(commandGroup, { target: { scrollY: commandGroup.scrollHeight } });

	// await waitFor(() => {
	// 	designerData.slice(0, 30).forEach((designer) => {
	// 		const designerName = screen.getByText(designer.name);
	// 		expect(designerName).toBeInTheDocument();
	// 	});
	// });
});

const designerData = [
	{
		designer_id: "34",
		name: "Raf Simons",
		sort: [34],
	},
	{
		designer_id: "35",
		name: "Our Legacy",
		sort: [35],
	},
	{
		designer_id: "36",
		name: "Ann Demeulemeester",
		sort: [36],
	},
	{
		designer_id: "37",
		name: "Rick Owens",
		sort: [37],
	},
	{
		designer_id: "38",
		name: "Versace",
		sort: [38],
	},
	{
		designer_id: "39",
		name: "Valentino",
		sort: [39],
	},
	{
		designer_id: "40",
		name: "Calvin Klein",
		sort: [40],
	},
	{
		designer_id: "41",
		name: "Levi's",
		sort: [41],
	},
	{
		designer_id: "42",
		name: "Maison Margiela",
		sort: [42],
	},
	{
		designer_id: "43",
		name: "Prada",
		sort: [43],
	},
	{
		designer_id: "44",
		name: "Chanel",
		sort: [44],
	},
	{
		designer_id: "45",
		name: "LOEWE",
		sort: [45],
	},
	{
		designer_id: "46",
		name: "Beams",
		sort: [46],
	},
	{
		designer_id: "47",
		name: "United Arrows",
		sort: [47],
	},
	{
		designer_id: "48",
		name: "Dior",
		sort: [48],
	},
	{
		designer_id: "49",
		name: "Sacai",
		sort: [49],
	},
	{
		designer_id: "50",
		name: "Helmut Lang",
		sort: [50],
	},
	{
		designer_id: "51",
		name: "Visvim",
		sort: [51],
	},
	{
		designer_id: "53",
		name: "Simone Rocha",
		sort: [53],
	},
	{
		designer_id: "54",
		name: "Lemaire",
		sort: [54],
	},
	{
		designer_id: "55",
		name: "UNIQLO",
		sort: [55],
	},
	{
		designer_id: "56",
		name: "Acne Studios",
		sort: [56],
	},
	{
		designer_id: "57",
		name: "UNDERCOVER",
		sort: [57],
	},
	{
		designer_id: "58",
		name: "Maison Kitsuné",
		sort: [58],
	},
	{
		designer_id: "59",
		name: "Maison Mihara Yasuhiro",
		sort: [59],
	},
];
