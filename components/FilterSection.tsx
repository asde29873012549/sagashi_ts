import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { MenswearCategory, WomenswearCategory } from "@/lib/types/global";

type CategoryOpts = {
	Menswear: MenswearCategory;
	Womenswear: WomenswearCategory;
};

type SubCategory<Dept extends keyof CategoryOpts> = {
	dept: Dept;
	cat: keyof CategoryOpts[Dept];
	name: string;
};

type FilterSubCategory = SubCategory<"Menswear"> | SubCategory<"Womenswear">;

interface Filter {
	department?: ("Menswear" | "Womenswear")[];
	designers?: string[];
	newArrivals?: boolean;
	subCategory?: FilterSubCategory[];
}

interface FilterSectionProps {
	filter: Filter;
	setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}

type FilterArrayType =
	| (FilterSubCategory & { key: keyof Filter })
	| { name: string; key: keyof Filter };

export default function FilterSection({ filter = {}, setFilter }: FilterSectionProps) {
	let filterArray: FilterArrayType[] = [];

	const filterKeys = Object.keys(filter) as (keyof Filter)[];

	filterKeys.forEach((key) => {
		if (key !== "newArrivals") {
			const temp = filter[key]?.map((item) => {
				if (key === "subCategory" && typeof item !== "string") return { ...item, key };
				return { name: item as string, key };
			});
			if (temp) filterArray = [...filterArray, ...temp];
		}
	});

	const nameFormatter = (obj: FilterArrayType) => {
		if ("cat" in obj) return `${obj.dept} ${obj.cat} ${obj.name}`;
		return obj.name;
	};

	const onRemoveFilter = (item: FilterArrayType) => {
		if ("cat" in item) {
			filterArray = filterArray.filter((obj) => {
				if ("cat" in obj)
					return `${obj.dept} ${obj.cat} ${obj.name}` !== `${item.dept} ${item.cat} ${item.name}`;
			});
			setFilter((prev) => ({
				...prev,
				subCategory: prev.subCategory?.filter(
					(obj) => `${obj.dept} ${obj.cat} ${obj.name}` !== `${item.dept} ${item.cat} ${item.name}`,
				),
			}));
			return;
		}
		filterArray = filterArray.filter((obj) => obj.name !== item.name);
		setFilter((prev) => {
			const currentKeyData = prev[item.key];
			if (Array.isArray(currentKeyData))
				return {
					...prev,
					[item.key]: currentKeyData.filter((id) => id !== item.name),
				};
			return prev;
		});
		return;
	};

	const onRemoveAll = () => {
		filterArray = [];
		setFilter({});
	};

	return (
		filterArray.length > 0 && (
			<div className="box-border h-fit w-full flex-wrap p-2 md:flex md:px-6">
				{filterArray.map((obj, index) => (
					<Button
						variant="outline"
						className="group mx-2 my-2 min-w-fit space-x-2 hover:bg-red-900"
						key={`${index}`}
						onClick={() => onRemoveFilter(obj)}
					>
						<span className="group-hover:text-background">{nameFormatter(obj)}</span>
						<Ban className="h-4 w-4 group-hover:text-background" />
					</Button>
				))}
				<Button
					variant="ghost"
					className="mx-2 my-2 min-w-fit space-x-2 hover:underline"
					onClick={onRemoveAll}
				>
					<span className="group-hover:text-background">Clear All</span>
				</Button>
			</div>
		)
	);
}
