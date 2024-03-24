import { expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// Components
import Tree from "./Tree";
import type { FilteredTreeData, OriginTreeData } from "@/lib/types/global";
// Libs
import { renderWithClient } from "@/test/queryClientWrapper";
import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import reformTree from "@/lib/utility/reformTree";

function MockParentComponent() {
	const [filter, setFilter] = useState({});
	const [treeData, setTreeData] = useState<OriginTreeData | FilteredTreeData>(TreeData);

	const onChangeFilter = (newFilter: Record<string, Set<string>>) => {
		setFilter(newFilter);
		const reformedTree = reformTree(TreeData, newFilter);
		setTreeData(reformedTree as OriginTreeData | FilteredTreeData);
	};

	return (
		<Tree
			treeData={treeData}
			isMenswear={false}
			isWomenswear={false}
			isDesigner={false}
			onChangeFilter={onChangeFilter}
			filter={filter}
		/>
	);
}

const setUp = () => {
	const user = userEvent.setup();
	const queryClient = new QueryClient();
	renderWithClient(queryClient, <MockParentComponent />);

	return { user };
};

test("Check Department only display according Category and Sizes", async () => {
	const { user } = setUp();

	const departmentButton = screen.getByRole("button", { name: /department/i });
	await user.click(departmentButton);

	const menswear = screen.getByLabelText("Menswear");
	await user.click(menswear);

	const categoryButton = screen.getByRole("button", { name: /category/i });
	await user.click(categoryButton);

	const sizeButton = screen.getByRole("button", { name: /size/i });
	await user.click(sizeButton);

	Object.keys(TreeData.Category.Menswear).forEach((item) => {
		const mensCategory = screen.getByTestId(`Menswear-${item}`);
		const womenCategory = screen.queryByTestId(`Womenswear-${item}`);

		expect(mensCategory).toBeInTheDocument();
		expect(womenCategory).not.toBeInTheDocument();
	});
});

test("Check/Uncheck 'All Categories checkbox' indeed checks/uncheck all categories", async () => {
	const { user } = setUp();

	const categoryButton = screen.getByRole("button", { name: /category/i });
	await user.click(categoryButton);

	const tops = screen.getByTestId("Menswear-Tops");
	await user.click(tops);

	const allTops = screen.getByLabelText(/all tops/i);
	await user.click(allTops);

	TreeData.Category.Menswear.Tops.forEach(async (item) => {
		const category = screen.getByLabelText(item);
		expect(category).toBeChecked();
	});

	await user.click(allTops);

	TreeData.Category.Menswear.Tops.forEach(async (item) => {
		const category = screen.getByLabelText(item);
		expect(category).not.toBeChecked();
	});
});

test("Correctly Display Size According to Category", async () => {
	const { user } = setUp();

	const categoryButton = screen.getByRole("button", { name: /category/i });
	await user.click(categoryButton);

	const tops = screen.getByTestId("Menswear-Tops");
	await user.click(tops);
	const mensAllTops = screen.getByLabelText(/all tops/i);
	await user.click(mensAllTops);

	const tailoring = screen.getByTestId("Menswear-Tailoring");
	await user.click(tailoring);
	const mensBlazer = screen.getByLabelText("Blazers");
	await user.click(mensBlazer);

	const bottoms = screen.getByTestId("Womenswear-Bottoms");
	await user.click(bottoms);
	const womensAllBottoms = screen.getByLabelText(/all bottoms/i);
	await user.click(womensAllBottoms);

	const sizeButton = screen.getByRole("button", { name: /size/i });
	await user.click(sizeButton);

	const topsSize = screen.getByTestId("Menswear-Tops-size");
	const tailoringSize = screen.getByTestId("Menswear-Tailoring-size");
	const bottomsSize = screen.getByTestId("Womenswear-Bottoms-size");

	expect(topsSize).toBeInTheDocument();
	expect(tailoringSize).toBeInTheDocument();
	expect(bottomsSize).toBeInTheDocument();

	Object.keys(TreeData.Sizes.Menswear)
		.filter((item) => item !== "Tops" && item !== "Tailoring")
		.forEach((item) => {
			const mensCategory = screen.queryByTestId(`Menswear-${item}-size`);
			expect(mensCategory).not.toBeInTheDocument();
		});
	Object.keys(TreeData.Sizes.Womenswear)
		.filter((item) => item !== "Bottoms")
		.forEach((item) => {
			const mensCategory = screen.queryByTestId(`Womenswear-${item}-size`);
			expect(mensCategory).not.toBeInTheDocument();
		});
});

const TreeData: OriginTreeData = {
	Department: ["Menswear", "Womenswear"],
	NewArrivals: null,
	Category: {
		Menswear: {
			Tops: [
				"Long Sleeve T-Shirts",
				"Polos",
				"Shirts",
				"Short Sleeve T-Shirts",
				"Sweaters & Knitwear",
				"Sweatshirts & Hoodies",
				"Tank Tops & Sleeveless",
				"Jerseys",
			],
			Bottoms: [
				"Casual Pants",
				"Cropped Pants",
				"Denim",
				"Overalls & Jumpsuits",
				"Shorts",
				"Sweatpants & Joggers",
				"Swimwear",
			],
			Outerwear: [
				"Bombers",
				"Cloaks & Capes",
				"Denim Jackets",
				"Heavy Coats",
				"Leather Jackets",
				"Light Jackets",
				"Parkas",
				"Raincoats",
				"Vests",
			],
			Footwear: [
				"Boots",
				"Casual Leather Shoes",
				"Formal Shoes",
				"Hi-Top Sneakers",
				"Low-Top Sneakers",
				"Sandals",
				"Slip Ons",
			],
			Tailoring: ["Blazers"],
			Accessories: [
				"Bags & Luggage",
				"Belts",
				"Glasses",
				"Gloves & Scarves",
				"Hats",
				"Jewelry & Watches",
				"Wallets",
				"Socks & Underwear",
				"Sunglasses",
			],
		},
		Womenswear: {
			Tops: [
				"Blouses",
				"Button Ups",
				"Crop Tops",
				"Hoodies",
				"Long Sleeve T-Shirts",
				"Short Sleeve T-Shirts",
				"Sweaters",
				"Sweatshirts",
				"Tank Tops",
			],
			Bottoms: ["Jeans", "Midi Skirts", "Mini Skirts", "Pants", "Shorts"],
			Outerwear: [
				"Blazers",
				"Bombers",
				"Coats",
				"Denim Jackets",
				"Down Jackets",
				"Jackets",
				"Leather Jackets",
				"Vests",
			],
			Dresses: ["Mini Dresses", "Midi Dresses", "Maxi Dresses"],
			Footwear: ["Boots", "Heels", "Flats", "Hi-Top Sneakers", "Low-Top Sneakers", "Sandals"],
			Accessories: ["Belts", "Glasses", "Hats", "Scarves", "Sunglasses", "Wallets", "Watches"],
			"Bags & Lugguage": [
				"Backpacks",
				"Bucket Bags",
				"Clutches",
				"Crossbody Bags",
				"Handle Bags",
				"Hobo Bags",
				"Luggage & Travel",
				"Messengers & Satchels",
			],
		},
	},
	Sizes: {
		Menswear: {
			Tops: ["XXS", "XS", "S", "M", "L", "XL"],
			Bottoms: ["28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"],
			Outerwear: ["40", "42", "44", "46", "48"],
			Footwear: [
				"7",
				"7.5",
				"8",
				"8.5",
				"9",
				"9.5",
				"10",
				"10.5",
				"11",
				"11.5",
				"12",
				"12.5",
				"13",
			],
			Tailoring: ["38R", "40R", "42R", "44R"],
			Accessories: ["OS"],
		},
		Womenswear: {
			Tops: ["XS", "S", "M", "L", "XL", "XXL"],
			Bottoms: ["24", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"],
			Outerwear: ["S", "M", "L", "XL", "XXL"],
			Dresses: ["S", "M", "L", "XL", "XXL"],
			Footwear: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
			Accessories: ["OS"],
			"Bags & Lugguage": ["OS"],
		},
	},
	Designer: [
		"Raf Simons",
		"Our Legacy",
		"Ann Demeulemeester",
		"Rick Owens",
		"Versace",
		"Valentino",
		"Calvin Klein",
		"Levi's",
		"Maison Margiela",
		"Prada",
		"Chanel",
		"LOEWE",
		"Beams",
		"United Arrows",
		"Dior",
		"Sacai",
		"Helmut Lang",
		"Visvim",
		"Kiko Kostadinov",
		"Simone Rocha",
		"Lemaire",
		"UNIQLO",
		"Acne Studios",
		"UNDERCOVER",
	],
	Condition: ["New/Never Worn", "Gently Used", "Used", "Very Worn"],
};
