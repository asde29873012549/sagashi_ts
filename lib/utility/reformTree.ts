import type {
	OriginTreeData,
	WomenswearSizeType,
	MenswearSizeType,
	FilterOptionType,
	FilteredTreeData,
	DeptCategory,
} from "../types/global";

interface DeptCategorySizePartial {
	Menswear: Partial<MenswearSizeType>;
	Womenswear: Partial<WomenswearSizeType>;
}

export default function reformTree(treeData: OriginTreeData, opts: FilterOptionType) {
	const { department, category } = opts;
	if (!department && !category) return treeData;

	const filteredTree: FilteredTreeData = { ...treeData };

	const treeCategory: Partial<DeptCategory> = {};
	const treeSize: Partial<DeptCategorySizePartial> = {};

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
				category[key]!.forEach((cat) => {
					if (filteredTree.Category.Menswear && cat in filteredTree.Category.Menswear) {
						catSize[cat] = filteredTree.Sizes.Menswear![cat];
					}
				});
				treeSize[key] = catSize;
			} else if (key === "Womenswear") {
				const catSize: { [S in keyof WomenswearSizeType]?: string[] } = {};
				category[key]!.forEach((cat) => {
					if (filteredTree.Category.Womenswear && cat in filteredTree.Category.Womenswear) {
						catSize[cat] = filteredTree.Sizes.Womenswear![cat];
					}
				});
				treeSize[key] = catSize;
			}
		});
	}

	filteredTree.Sizes = treeSize;

	return filteredTree;
}
