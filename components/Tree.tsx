import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/base/accordion";
import { Checkbox } from "@/components/base/checkbox";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import getAllDesigners from "@/lib/queries/fetchQuery";
import {
	OriginTreeData,
	TreeFilterType,
	Condition,
	ApiResponse,
	DeptCategory,
	DeptCategorySize,
	FilteredTreeData,
} from "@/lib/types/global";

import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/base/command";
import { Input } from "@/components/base/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utility/utils";

interface TreeProps {
	treeData: OriginTreeData | FilteredTreeData;
	onChangeFilter: (filter: TreeFilterType) => void;
	filter: TreeFilterType;
	isDesigner?: boolean;
	isMenswear?: boolean;
	isWomenswear?: boolean;
}

interface CategoryFilter<K extends keyof DeptCategory> {
	key: "category";
	department: K;
	category: keyof DeptCategory[K];
}

interface SubCatSizeFilter<K extends keyof DeptCategorySize> {
	key: "subCategory" | "sizes";
	department: K;
	category: keyof DeptCategorySize[K];
	value: string;
}

interface ConditionDepartmentDesignerFilter {
	key: "condition" | "department" | "designers";
	value: string | Condition | keyof DeptCategory;
}

type FilterCheck =
	| CategoryFilter<keyof DeptCategory>
	| SubCatSizeFilter<keyof DeptCategory>
	| ConditionDepartmentDesignerFilter;

export default function Tree({
	treeData,
	onChangeFilter,
	filter,
	isDesigner = false,
	isMenswear = false,
	isWomenswear = false,
}: TreeProps) {
	const [searchInput, setSearchInput] = useState<string>("");
	const [initialDesignerData, setInitialDesignerData] = useState<boolean>(true);
	const [openedAccordion, setOpenedAccordion] = useState<string[]>([]);
	const {
		data: designerData,
		refetch: fetchDesigners,
	}: {
		data: ApiResponse<{ designer_id: string; name: string; sort: [number] }[]> | undefined;
		refetch: () => void;
	} = useQuery({
		queryKey: ["designer", { keyword: searchInput }],
		queryFn: (obj) =>
			getAllDesigners({
				uri: `/designer?keyword=${(obj.queryKey[1] as { keyword: string }).keyword}&limit=10`,
			}),
		enabled: false,
		refetchOnWindowFocus: false,
	});

	const onDesignerSelect = (e: string) => {
		const designers = filter.designers ?? [];
		onChangeFilter({ ...filter, designers: [...designers, e] });
	};

	const onCheck = (props: FilterCheck) => {
		const newFilter = { ...filter };
		const key = props.key;
		if (key === "category") {
			const dept = props.department;
			const value = props.category as keyof DeptCategory[typeof dept];
			const items =
				treeData.Category?.[dept]?.[value].sub.map((obj) => ({
					name: obj.name,
					dept: dept,
					cat: value,
				})) ?? [];
			if (!newFilter.subCategory) {
				newFilter.subCategory = items;
			} else {
				const isExist = newFilter.subCategory.some((obj) => obj.dept === dept && obj.cat === value);
				newFilter.subCategory = isExist
					? newFilter.subCategory.filter((obj) => obj.dept !== dept || obj.cat !== value)
					: [...newFilter.subCategory, ...items];
				newFilter.subCategory.length === 0 && delete newFilter.subCategory;
			}
		} else if (key === "sizes" || key === "subCategory") {
			const value = props.value;
			const dept = props.department;
			const cat = props.category as keyof DeptCategorySize[typeof dept];
			if (!newFilter[key]) {
				newFilter[key] = [{ name: value, dept, cat }];
			} else {
				const isExist = newFilter[key]!.some(
					(obj) => obj.dept === dept && obj.cat === cat && obj.name === value,
				);

				newFilter[key] = isExist
					? newFilter[key]!.filter((obj) => obj.name !== value)
					: [...newFilter[key]!, { name: value, dept, cat }];
				newFilter[key]!.length === 0 && delete newFilter[key];
			}
		} else {
			const value = props.value;
			const isExist = !!newFilter[key];
			newFilter[key] = isExist
				? newFilter[key]!.filter((item) => item !== value)
				: ([...newFilter[key]!, value] as any);
			newFilter[key]!.length === 0 && delete newFilter[key];
		}

		onChangeFilter(newFilter);
	};

	const onOpenAccordion = (e: string[]) => {
		setOpenedAccordion(e);
	};

	const memoizedFetch = useCallback(() => {
		fetchDesigners();
	}, [fetchDesigners]);

	const debounceSearch = useMemo(() => {
		return debounce(memoizedFetch, 300);
	}, [memoizedFetch]);

	const onSearch = (e: string) => {
		setSearchInput(e);
		if (e && e.length > 1) {
			setInitialDesignerData(false);
			debounceSearch();
		} else {
			setInitialDesignerData(true);
		}
	};

	const isChecked = (
		key: "Menswear" | "Womenswear" | "department" | "sizes" | "subCategory" | "condition",
		value: keyof DeptCategory | keyof DeptCategory["Menswear" | "Womenswear"] | string | Condition,
		department?: keyof DeptCategory,
		category?: keyof DeptCategory["Menswear" | "Womenswear"],
	) => {
		if (key === "Menswear" || key === "Womenswear") {
			const val = value as keyof DeptCategory["Menswear" | "Womenswear"];
			if (!filter.subCategory || filter.subCategory.length === 0) return false;
			return (
				filter.subCategory.filter((obj) => obj.dept === key && obj.cat === val).length ===
				treeData.Category?.[key]?.[val].sub.length
			);
		} else if (key === "sizes" || key === "subCategory") {
			if (!filter[key] || filter[key]!.length === 0) return false;
			return (
				filter[key]!.some(
					(obj) => obj.name === value && obj.dept === department && obj.cat === category,
				) || false
			);
		}
		return filter[key]?.find((value) => value) ?? false;
	};

	const shouldRenderSize = Object.keys(filter).length > 0;

	return (
		<Accordion type="multiple" value={openedAccordion} onValueChange={onOpenAccordion}>
			{!isMenswear && !isWomenswear && (
				<AccordionItem value="item-1">
					<AccordionTrigger>Department</AccordionTrigger>
					<AccordionContent className="space-y-3">
						{treeData?.Department?.map((department) => (
							<div className="flex items-center space-x-2" key={department}>
								<Checkbox
									id={department}
									checked={!!isChecked("department", department)}
									onCheckedChange={() => onCheck({ key: "department", value: department })}
								/>
								<label
									htmlFor={department}
									className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{department}
								</label>
							</div>
						))}
					</AccordionContent>
				</AccordionItem>
			)}
			<AccordionItem value="item-3">
				<AccordionTrigger>Category</AccordionTrigger>
				{Object.keys(treeData?.Category ?? {}).map((dept) => {
					const department = dept as keyof DeptCategory;
					return (
						<AccordionContent key={department}>
							<div className="pl-2 text-base">{department}</div>
							{Object.keys(treeData?.Category?.[department] || {}).map((cat, index) => {
								const category = cat as keyof DeptCategory[typeof department];
								return (
									<Accordion
										type="multiple"
										className="pl-4 text-sm"
										key={`${department}-${index}-${category}`}
										value={openedAccordion}
										onValueChange={onOpenAccordion}
									>
										<AccordionItem
											value={`${department}-${index}-${category}`}
											className={
												index === Object.keys(treeData.Category?.[department] || {}).length - 1
													? "!border-b-0"
													: ""
											}
										>
											<AccordionTrigger>{category}</AccordionTrigger>
											<AccordionContent className="cursor-pointer pl-2 hover:underline">
												<div className="flex items-center space-x-2">
													<Checkbox
														id={category}
														checked={!!isChecked(department, category)}
														onCheckedChange={() =>
															onCheck({ key: "category", category, department })
														}
													/>
													<label
														htmlFor={category}
														className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														All {category}
													</label>
												</div>
											</AccordionContent>
											{treeData.Category?.[department]?.[category].sub.map((obj) => (
												<AccordionContent
													key={obj.name}
													className="cursor-pointer pl-2 hover:underline"
												>
													<div className="flex items-center space-x-2">
														<Checkbox
															id={obj.name}
															checked={!!isChecked("subCategory", obj.name, department, category)}
															onCheckedChange={() =>
																onCheck({
																	key: "subCategory",
																	value: obj.name,
																	department,
																	category,
																})
															}
														/>
														<label
															htmlFor={obj.name}
															className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
														>
															{obj.name}
														</label>
													</div>
												</AccordionContent>
											))}
										</AccordionItem>
									</Accordion>
								);
							})}
						</AccordionContent>
					);
				})}
			</AccordionItem>
			<AccordionItem value="item-4">
				<AccordionTrigger>Size</AccordionTrigger>
				{shouldRenderSize ? (
					Object.keys(treeData?.Sizes ?? {}).map((dept, index) => {
						const department = dept as keyof DeptCategorySize;
						return (
							<AccordionContent key={`${department}-${index}`}>
								<div className="pl-2 text-base">{department}</div>
								{Object.keys(treeData.Sizes[department] || {}).map((cat, index) => {
									const category = cat as keyof DeptCategorySize[typeof department];
									return (
										<Accordion
											type="multiple"
											className="pl-4 text-sm"
											key={`${category}-${index}-${department}`}
											value={openedAccordion}
											onValueChange={onOpenAccordion}
										>
											<AccordionItem
												value={`${category}-${index}-${department}`}
												className={
													index === Object.keys(treeData.Sizes[department] || {}).length - 1
														? "!border-b-0"
														: ""
												}
											>
												<AccordionTrigger>{category}</AccordionTrigger>
												{treeData.Sizes[department]?.[category]?.map((size, index) => (
													<AccordionContent
														key={`${index}-${size}`}
														className="cursor-pointer pl-2 hover:underline"
													>
														<div className="flex items-center space-x-2">
															<Checkbox
																id={`${index}-${size}`}
																checked={!!isChecked("sizes", size, department, category)}
																onCheckedChange={() =>
																	onCheck({ key: "sizes", value: size, department, category })
																}
															/>
															<label
																htmlFor={`${index}-${size}`}
																className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																{size}
															</label>
														</div>
													</AccordionContent>
												))}
											</AccordionItem>
										</Accordion>
									);
								})}
							</AccordionContent>
						);
					})
				) : (
					<AccordionContent className="text-sm">Please select category first</AccordionContent>
				)}
			</AccordionItem>
			{!isDesigner && (
				<AccordionItem value="item-5">
					<AccordionTrigger>Designers</AccordionTrigger>
					<AccordionContent>
						<Command>
							<CommandInput
								placeholder="Search for designers..."
								value={searchInput}
								onValueChange={onSearch}
							/>
							<CommandList>
								<CommandEmpty>No results found.</CommandEmpty>
								{initialDesignerData
									? treeData?.Designer?.map((designer, index) => (
											<CommandItem
												key={`${designer}-${index}`}
												className="cursor-pointer justify-between"
												onSelect={() => onDesignerSelect(designer)}
											>
												<span>{designer}</span>
												{filter.designers?.includes(designer) && (
													<Check size={16} color="#0c4a6e" />
												)}
											</CommandItem>
										))
									: designerData?.data.map((obj) => (
											<CommandItem key={obj.name} className="cursor-pointer">
												{obj.name}
											</CommandItem>
										))}
							</CommandList>
						</Command>
					</AccordionContent>
				</AccordionItem>
			)}

			<AccordionItem value="item-6">
				<AccordionTrigger>Price</AccordionTrigger>
				<AccordionContent>
					<div className="flex flex-col items-end space-y-4 p-2">
						<div className="flex items-center space-x-3">
							<Input
								placeholder="minimun"
								className="h-fit w-1/2 placeholder:font-light placeholder:text-gray-400"
							/>
							<span>-</span>
							<Input
								placeholder="maximun"
								className="w-1/2 placeholder:font-light placeholder:text-gray-400"
							/>
						</div>
						<div className="cursor-pointer underline hover:text-sky-900">Apply</div>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-7">
				<AccordionTrigger>Conditions</AccordionTrigger>
				<AccordionContent className="space-y-3">
					{treeData?.Condition.map((condition) => (
						<div className="flex items-center space-x-2" key={condition}>
							<Checkbox
								id={condition}
								checked={!!isChecked("condition", condition)}
								onCheckedChange={() => onCheck({ key: "condition", value: condition })}
							/>
							<label
								htmlFor={condition}
								className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{condition}
							</label>
						</div>
					))}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
