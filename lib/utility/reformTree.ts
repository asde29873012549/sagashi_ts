import type {
	OriginTreeData,
	WomenswearCategory,
	FilteredTreeData,
	MenswearCategory,
} from "../types/global";

export default function reformTree(treeData: OriginTreeData, filter: Record<string, Set<string>>) {
	const filteredTree: Partial<FilteredTreeData> = structuredClone(treeData);
	if (filter.subCategory?.size > 0) {
		const subCatArr = [...(filter.subCategory || [])].map((c) => c.split("@")[0]);
		const s = new Set(subCatArr);
		if (s.has("Menswear")) filteredTree.Sizes!.Menswear = {};
		if (s.has("Womenswear")) filteredTree.Sizes!.Womenswear = {};
	}

	Object.keys(filter).forEach((key) => {
		const value = [...filter[key]];
		switch (key) {
			case "department":
				if (value.length === 1) {
					const otherDepartment = value[0] === "Menswear" ? "Womenswear" : "Menswear";
					delete filteredTree.Category![otherDepartment];
					delete filteredTree.Sizes![otherDepartment];
				}
				break;
			case "subCategory":
				const deptArr = value.map((c) => c.split("@")[0]);
				const catArr = value.map((c) => c.split("@")[1]) as
					| (keyof MenswearCategory)[]
					| (keyof WomenswearCategory)[];
				const dept = new Set(deptArr);
				const cat = [...new Set(catArr)];
				if (dept.has("Menswear") && !dept.has("Womenswear")) {
					cat.forEach((c) => {
						if (filteredTree.Sizes!.Menswear)
							filteredTree.Sizes!.Menswear[c as keyof MenswearCategory] =
								treeData.Sizes!.Menswear![c as keyof MenswearCategory];
					});
				} else if (dept.has("Womenswear") && !dept.has("Menswear")) {
					cat.forEach((c) => {
						if (filteredTree.Sizes!.Womenswear)
							filteredTree.Sizes!.Womenswear[c as keyof WomenswearCategory] =
								treeData.Sizes!.Womenswear![c as keyof WomenswearCategory];
					});
				} else {
					value.forEach((str) => {
						const c = str.split("@");
						if (c[0] === "Menswear") {
							if (filteredTree.Sizes!.Menswear)
								filteredTree.Sizes!.Menswear![c[1] as keyof MenswearCategory] =
									treeData.Sizes!.Menswear![c[1] as keyof MenswearCategory];
						} else {
							if (filteredTree.Sizes!.Womenswear)
								filteredTree.Sizes!.Womenswear![c[1] as keyof WomenswearCategory] =
									treeData.Sizes!.Womenswear![c[1] as keyof WomenswearCategory];
						}
					});
				}
				break;
		}
	});

	return filteredTree;
}
