"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utility/utils";
import { Button } from "@/components/base/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/base/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";
import { mobileFormInput } from "@/redux/sellSlice";
import { useDispatch } from "react-redux";
import { ScrollArea } from "@/components/base/scroll-area";
import useInterSectionObserver from "@/lib/hooks/useIntersectionObserver";
import type { EditProductFormInput } from "@/lib/types/global";

interface BaseDesignerComboBoxProps {
	onMakeProgress?: (progress: number) => void;
	data?: {
		status: "success" | "fail";
		data: { designer_id: string; name: string; sort: [number] }[];
	}[];
	fetchNextPage: () => void;
	isFetchingNextPage: boolean;
	hasNextPage: boolean | undefined;
	cacheValue?: string;
	className?: string;
	popoverWidth?: string;
	disabled?: boolean;
}

type DesignerComboBoxProps =
	| (BaseDesignerComboBoxProps & { setFormInput: React.Dispatch<React.SetStateAction<any>> })
	| (BaseDesignerComboBoxProps & { dispatchFormInput: boolean });

const DesignerComboBox = forwardRef(
	(
		{
			onMakeProgress,
			data: datas = [],
			fetchNextPage,
			isFetchingNextPage,
			hasNextPage,
			cacheValue,
			className,
			popoverWidth,
			disabled,
			...props
		}: DesignerComboBoxProps,
		ref,
	) => {
		const dispatchFormInput = "dispatchFormInput" in props ? props.dispatchFormInput : false;
		const setFormInput = "setFormInput" in props ? props.setFormInput : undefined;

		const [open, setOpen] = useState(false);
		const [value, setValue] = useState(cacheValue || "");
		const dispatch = useDispatch();

		useImperativeHandle(
			ref,
			() => ({
				val: { value },
			}),
			[value],
		);

		const lastDesignerElement = useInterSectionObserver({
			isFetchingNextPage,
			hasNextPage,
			fetchNextPage,
		});

		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={`mt-6 w-full justify-between text-base font-light md:col-span-2 md:h-12 ${
							!value && "!text-gray-400"
						} ${className}`}
						disabled={disabled}
					>
						{value ? value : "Select Designers..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className={`h-80 w-[calc(100vw-2rem)] ${
						popoverWidth ? popoverWidth : "md:w-[calc(100vw-38rem)]"
					}`}
				>
					<Command>
						<CommandInput placeholder="Search designers..." />
						<ScrollArea data-testid="scrollArea">
							<CommandEmpty>No designers found.</CommandEmpty>
							<CommandGroup className="overflow-scroll">
								{datas?.map((page) => {
									const pageData = page.data;
									return pageData.map((data, index) => {
										if (pageData.length === index + 1) {
											return (
												<CommandItem
													key={data.name}
													onSelect={() => {
														onMakeProgress && onMakeProgress(85);
														setValue(data.name);

														if (dispatchFormInput) {
															dispatch(mobileFormInput({ key: "designer", value: data.name }));
															dispatch(
																mobileFormInput({ key: "designer_id", value: data.designer_id }),
															);
														} else {
															if (setFormInput)
																setFormInput((prev: EditProductFormInput) => ({
																	...prev,
																	designer: data.name,
																	designer_id: data.designer_id,
																}));
														}

														setOpen(false);
													}}
													ref={lastDesignerElement}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															value === data.name ? "opacity-100" : "opacity-0",
														)}
													/>
													{data.name}
												</CommandItem>
											);
										} else {
											return (
												<CommandItem
													key={data.name}
													onSelect={() => {
														onMakeProgress && onMakeProgress(85);
														setValue(data.name);
														if (dispatchFormInput) {
															dispatch(mobileFormInput({ key: "designer", value: data.name }));
															dispatch(
																mobileFormInput({ key: "designer_id", value: data.designer_id }),
															);
														} else {
															if (setFormInput)
																setFormInput((prev: EditProductFormInput) => ({
																	...prev,
																	designer: data.name,
																	designer_id: data.designer_id,
																}));
														}
														setOpen(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															value === data.name ? "opacity-100" : "opacity-0",
														)}
													/>
													{data.name}
												</CommandItem>
											);
										}
									});
								})}
								{isFetchingNextPage && (
									<CommandItem className="flex justify-center" disabled>
										<div className="h-4 w-4 animate-spin  rounded-full border-2 border-solid border-gray-400 border-t-transparent"></div>
									</CommandItem>
								)}
							</CommandGroup>
						</ScrollArea>
					</Command>
				</PopoverContent>
			</Popover>
		);
	},
);

DesignerComboBox.displayName = "DesignerComboBox";

export default DesignerComboBox;
