import { Fragment } from "react";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/base/command";
import { Check } from "lucide-react";
import { Button } from "@/components/base/button";
import generalFetch from "@/lib/queries/fetchQuery";
import { useToast } from "@/components/base/use-toast";
import { personalInfoUpdateSuccess, genericError } from "@/lib/utility/userMessage";

import { useEffect, useState } from "react";
import region from "@/lib/utility/countries";

export default function EditCountrySheet({
	setOpen,
	uri,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	uri: string;
}) {
	const [countries, setCountries] = useState<{ [K: string]: string }>();
	const [value, setValue] = useState<string>("");
	const { toast } = useToast();

	useEffect((lang = "en") => {
		const countryName = new Intl.DisplayNames([lang], { type: "region" });
		const country: { [K: string]: string } = {};
		region.forEach((r: string) => {
			let name = countryName.of(r)!;
			country[r] = name;
		});
		setCountries(country);
	}, []);

	const onSetValue = (e: string) => {
		setValue(e);
	};

	const onSaveCountry = async () => {
		const response = await generalFetch({
			uri,
			method: "POST",
			body: {
				country: value,
			},
		});
		if (response.status === "success") {
			setOpen(false);
			toast({
				title: personalInfoUpdateSuccess.title,
				description: personalInfoUpdateSuccess.desc,
				status: personalInfoUpdateSuccess.status,
			});
		} else {
			toast({
				title: "Failed !",
				description: genericError,
				status: "fail",
			});
		}
	};

	const onCancel = () => {
		setOpen(false);
	};

	return (
		<Fragment>
			<Command>
				<CommandInput
					placeholder="Search for country..."
					className="text-base"
					value={value}
					onValueChange={setValue}
				/>
				<CommandList className="max-h-[350px] md:max-h-[500px]">
					<CommandEmpty>No results found.</CommandEmpty>
					{countries &&
						Object.values(countries).map((c) => (
							<CommandItem
								key={c}
								className="cursor-pointer justify-between"
								id="cmItem"
								onSelect={onSetValue}
							>
								<span className={`${value === c.toLowerCase() ? "text-sky-900" : ""}`}>{c}</span>
								{value === c.toLowerCase() && <Check size={16} color="#0c4a6e" />}
							</CommandItem>
						))}
				</CommandList>
			</Command>
			<div className="absolute bottom-0 right-0 w-full px-6">
				<Button className="mb-4 w-full" onClick={onSaveCountry}>
					SAVE
				</Button>
				<Button variant="destructive" className="mb-4 w-full" onClick={onCancel}>
					CANCEL
				</Button>
			</div>
		</Fragment>
	);
}
