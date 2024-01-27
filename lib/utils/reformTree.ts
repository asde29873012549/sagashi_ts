interface SubCategoryArrayType {
	id: number;
	name: string;
}

interface SubCategoryType {
	id: number;
	sub: SubCategoryArrayType[];
}

interface CommonCategory {
	Tops: SubCategoryType;
	Bottoms: SubCategoryType;
	Outerwear: SubCategoryType;
	Footwear: SubCategoryType;
	Accessories: SubCategoryType;
}

interface WomenswearCategory extends CommonCategory {
	Dresses: SubCategoryType;
	"Bags & Lugguage": SubCategoryType;
}

interface MenswearCategory extends CommonCategory {
	Tailoring: SubCategoryType;
}

type MenswearSizeType = {
	[S in keyof MenswearCategory]: string[];
};

type WomenswearSizeType = {
	[S in keyof WomenswearCategory]: string[];
};

interface OriginTreeData {
	Department: ["Menswear", "Womenswear"];
	NewArrivals: null;
	Category: {
		Menswear: MenswearCategory;
		Womenswear: WomenswearCategory;
	};
	Sizes: {
		Menswear: MenswearSizeType;
		Womenswear: WomenswearSizeType;
	};
	Designer: string[];
	Condition: ["New/Never Worn", "Gently Used", "Used", "Very Worn"];
}

interface FilterOptionType {
	department: ("Menswear" | "Womenswear")[] | null;
	category: {
		Menswear?: (keyof MenswearCategory)[];
		Womenswear?: (keyof WomenswearCategory)[];
	};
}

interface FilteredTreeData {
	Department: ("Menswear" | "Womenswear")[] | null;
	NewArrivals: null;
	Category: {
		Menswear?: MenswearCategory;
		Womenswear?: WomenswearCategory;
	};
	Sizes: {
		Menswear?: { [S in keyof MenswearCategory]?: string[] };
		Womenswear?: { [S in keyof WomenswearCategory]?: string[] };
	};
	Designer: string[];
	Condition: ("New/Never Worn" | "Gently Used" | "Used" | "Very Worn")[];
}

export default function reformTree(treeData: OriginTreeData, opts: FilterOptionType) {
	const { department, category } = opts;
	if (!department && !category) return treeData;

	const filteredTree: FilteredTreeData = { ...treeData };

	const treeCategory: { Menswear?: MenswearCategory; Womenswear?: WomenswearCategory } = {};
	const treeSize: {
		Menswear?: { [S in keyof MenswearCategory]?: string[] };
		Womenswear?: { [S in keyof WomenswearCategory]?: string[] };
	} = {};

	if (department && department.length > 0) {
		department.sort().forEach((dep) => {
			if (dep === "Menswear") {
				treeCategory[dep] = filteredTree.Category[dep];
				treeSize[dep] = filteredTree.Sizes[dep];
			} else {
				treeCategory[dep] = filteredTree.Category[dep];
				treeSize[dep] = filteredTree.Sizes[dep];
			}
		});

		filteredTree.Category = treeCategory;
	}

	if (category) {
		Object.keys(category).forEach((key) => {
			if (key === "Menswear") {
				const catSize: { [S in keyof MenswearSizeType]?: string[] } = {};
				category[key]?.forEach((cat) => {
					if (filteredTree.Category.Menswear && cat in filteredTree.Category.Menswear) {
						catSize[cat] = filteredTree.Sizes.Menswear?.[cat];
					}
				});
				treeSize[key] = catSize;
			} else if (key === "Womenswear") {
				const catSize: { [S in keyof WomenswearSizeType]?: string[] } = {};
				category[key]?.forEach((cat) => {
					if (filteredTree.Category.Womenswear && cat in filteredTree.Category.Womenswear) {
						catSize[cat] = filteredTree.Sizes.Womenswear?.[cat];
					}
				});
				treeSize[key] = catSize;
			}
		});
	}

	filteredTree.Sizes = treeSize;

	return filteredTree;
}
