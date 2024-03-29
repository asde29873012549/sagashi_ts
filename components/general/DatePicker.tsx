"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utility/utils";
import { Button } from "@/components/base/button";
import { Calendar } from "@/components/base/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";

export default function DatePicker({
	className,
	setFormVal,
}: {
	className?: string;
	setFormVal: any;
}) {
	const [date, setDate] = React.useState<Date>();

	const onDateChange = (date: any) => {
		setDate(date);
		setFormVal((f: any) => {
			return { ...f, birth: date };
		});
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[280px] justify-start text-left font-normal",
						!date && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
			</PopoverContent>
		</Popover>
	);
}
