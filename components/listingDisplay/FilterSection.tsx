import { Button } from "@/components/base/button";
import { Ban } from "lucide-react";

interface FilterSectionProps {
	filter: Record<string, Set<string>>;
	setFilter: React.Dispatch<React.SetStateAction<Record<string, Set<string>>>>;
}

export default function FilterSection({ filter = {}, setFilter }: FilterSectionProps) {
	let filterArray: string[] = [];

	const filterKeys = Object.keys(filter);

	filterKeys.forEach((key) => {
		if (key !== "newArrivals") {
			const temp = [...filter[key]].map((item) => item);
			if (temp) filterArray = [...filterArray, ...temp];
		}
	});

	const nameFormatter = (str: string) => {
		const [dept, cat, name] = str.split("@");
		return dept + (cat ? ` ${cat}` : "") + (name ? ` ${name}` : "");
	};

	const onRemoveFilter = (str: string) => {
		filterArray = filterArray.filter((s) => s !== str);
		setFilter((prev) => {
			const newFilter = { ...prev };
			filterKeys.forEach((key) => {
				newFilter[key] = new Set([...newFilter[key]].filter((s) => s !== str));
			});
			return newFilter;
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
				{filterArray.map((str, index) => (
					<Button
						variant="outline"
						className="group mx-2 my-2 min-w-fit space-x-2 hover:bg-red-900"
						key={`${index}`}
						onClick={() => onRemoveFilter(str)}
					>
						<span className="group-hover:text-background">{nameFormatter(str)}</span>
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
