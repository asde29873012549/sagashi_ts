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
import type {
	OriginTreeData,
	ApiResponse,
	DeptCategoryTree,
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
import { debounce, cn } from "@/lib/utility/utils";

interface TreeProps {
	treeData: OriginTreeData | FilteredTreeData;
	onChangeFilter: (filter: Record<string, Set<string>>) => void;
	filter: Record<string, Set<string>>;
	isDesigner?: boolean;
	isMenswear?: boolean;
	isWomenswear?: boolean;
}

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
		const designers = filter.designers ?? new Set();
		designers.has(e) ? designers.delete(e) : designers.add(e);
		onChangeFilter({ ...filter, designers });
	};

	const onCheck = (key: string, value: string) => {
		const newFilter = structuredClone(filter);
		if (key === "category") {
			const [department, category] = value.split("@");
			if (
				newFilter.subCategory &&
				newFilter.subCategory.size ===
					treeData.Category[department as keyof DeptCategoryTree]![
						category as keyof DeptCategoryTree[keyof DeptCategoryTree]
					].length
			) {
				newFilter.subCategory = new Set();
			} else {
				const allCategory = treeData.Category[department as keyof DeptCategoryTree]![
					category as keyof DeptCategoryTree[keyof DeptCategoryTree]
				].map((subCategory) => `${department}@${category}@${subCategory}`);
				newFilter.subCategory = new Set([...allCategory, ...(newFilter.subCategory || [])]);
			}
		} else {
			newFilter[key] = newFilter[key] ?? new Set();
			if (key === "department" && newFilter[key].has(value)) {
				const arr = Array.from(newFilter.subCategory ?? []).filter(
					(s) => s.split("@")[0] !== value,
				);
				newFilter.subCategory = new Set(arr);
			}
			newFilter[key].has(value) ? newFilter[key].delete(value) : newFilter[key].add(value);
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

	const shouldRenderSize = Object.keys(filter).length > 0;

	return (
		<Accordion type="multiple" value={openedAccordion} onValueChange={onOpenAccordion}>
			{!isMenswear && !isWomenswear && (
				<AccordionItem value="department">
					<AccordionTrigger>Department</AccordionTrigger>
					<AccordionContent className="space-y-3">
						{treeData.Department?.map((department) => (
							<div className="flex items-center space-x-2" key={department}>
								<Checkbox
									id={department}
									checked={!!filter.department?.has(department)}
									onCheckedChange={() => onCheck("department", department)}
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
			<AccordionItem value="category">
				<AccordionTrigger>Category</AccordionTrigger>
				{(Object.keys(treeData.Category) as Array<keyof DeptCategoryTree>).map((department) => {
					const Categories = Object.keys(treeData.Category[department] || {}) as Array<
						keyof DeptCategoryTree[typeof department]
					>;
					return (
						<AccordionContent key={department}>
							<div className="pl-2 text-base">{department}</div>
							{Categories.map((category, index) => {
								return (
									<Accordion
										type="multiple"
										className="pl-4 text-sm"
										key={`${department}-${category}`}
										value={openedAccordion}
										onValueChange={onOpenAccordion}
									>
										<AccordionItem
											value={`${department}-${category}`}
											className={cn({ "!border-b-0": index === Categories.length - 1 })}
										>
											<AccordionTrigger data-testid={`${department}-${category}`}>
												{category}
											</AccordionTrigger>
											<AccordionContent className="cursor-pointer pl-2 hover:underline">
												<div className="flex items-center space-x-2">
													<Checkbox
														id={`All ${category}`}
														checked={
															Array.from(filter.subCategory || []).filter((s) => {
																const [dep, cat] = s.split("@");
																return dep === department && cat === category;
															}).length === treeData.Category[department]![category].length
														}
														onCheckedChange={() => onCheck("category", `${department}@${category}`)}
													/>
													<label
														data-testid={`All ${category}`}
														htmlFor={`All ${category}`}
														className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														All {category}
													</label>
												</div>
											</AccordionContent>
											{treeData.Category[department]?.[category].map((subCategory) => (
												<AccordionContent
													key={subCategory}
													className="cursor-pointer pl-2 hover:underline"
												>
													<div className="flex items-center space-x-2">
														<Checkbox
															id={subCategory}
															checked={
																!!filter.subCategory?.has(
																	`${department}@${category}@${subCategory}`,
																)
															}
															onCheckedChange={() =>
																onCheck("subCategory", `${department}@${category}@${subCategory}`)
															}
														/>
														<label
															htmlFor={subCategory}
															className="ml-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
														>
															{subCategory}
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
			<AccordionItem value="size">
				<AccordionTrigger>Size</AccordionTrigger>
				{shouldRenderSize ? (
					(Object.keys(treeData.Sizes) as Array<keyof DeptCategoryTree>).map(
						(department, index) => {
							const Categories = Object.keys(treeData.Sizes[department] || {}) as Array<
								keyof DeptCategorySize[typeof department]
							>;
							return (
								<AccordionContent key={`${department}-${index}`}>
									<div className="pl-2 text-base">{department}</div>
									{Categories.map((category, index) => {
										return (
											<Accordion
												type="multiple"
												className="pl-4 text-sm"
												key={`${category}-${department}`}
												value={openedAccordion}
												onValueChange={onOpenAccordion}
											>
												<AccordionItem
													value={`${category}-${department}`}
													className={cn({ "!border-b-0": index === Categories.length - 1 })}
												>
													<AccordionTrigger data-testid={`${department}-${category}-size`}>
														{category}
													</AccordionTrigger>
													{treeData.Sizes[department]?.[category]?.map((size, index) => (
														<AccordionContent
															key={`${index}-${size}`}
															className="cursor-pointer pl-2 hover:underline"
														>
															<div className="flex items-center space-x-2">
																<Checkbox
																	id={`${index}-${size}`}
																	checked={!!filter.size?.has(`${department}@${category}@${size}`)}
																	onCheckedChange={() =>
																		onCheck("size", `${department}@${category}@${size}`)
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
						},
					)
				) : (
					<AccordionContent className="text-sm">Please select category first</AccordionContent>
				)}
			</AccordionItem>
			{!isDesigner && (
				<AccordionItem value="designers">
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
									? treeData.Designer.map((designer, index) => (
											<CommandItem
												key={`${designer}-${index}`}
												className="cursor-pointer justify-between"
												onSelect={() => onDesignerSelect(designer)}
											>
												<span>{designer}</span>
												{filter[designer] && <Check size={16} color="#0c4a6e" />}
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

			<AccordionItem value="price">
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
			<AccordionItem value="conditions">
				<AccordionTrigger>Conditions</AccordionTrigger>
				<AccordionContent className="space-y-3">
					{treeData.Condition.map((condition) => (
						<div className="flex items-center space-x-2" key={condition}>
							<Checkbox
								id={condition}
								checked={!!filter.condition?.has(condition)}
								onCheckedChange={() => onCheck("condition", condition)}
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
