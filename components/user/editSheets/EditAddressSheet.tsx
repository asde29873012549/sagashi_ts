import { Textarea } from "@/components/base/textarea";
import { Input } from "@/components/base/input";
import { useState, Fragment, useEffect } from "react";
import { Button } from "@/components/base/button";
import generalFetch from "@/lib/queries/fetchQuery";
import { useToast } from "@/components/base/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personalInfoUpdateSuccess, genericError } from "@/lib/utility/userMessage";
import ComboBox from "@/components/base/comboBox";
import region from "@/lib/utility/countries";
import DOMPurify from "dompurify";
import type { Feature } from "@/lib/types/global";

export default function EditAddressSheet({
	setOpen,
	uri,
	addressData,
	setFeature,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	uri: string;
	addressData: { id: string; address: string; city: string; country: string; postal_code: string };
	setFeature: React.Dispatch<React.SetStateAction<Feature>>;
}) {
	const queryClient = useQueryClient();
	const [countries, setCountries] = useState({});
	const [country, setCountry] = useState(addressData.country);
	const [city, setCity] = useState(addressData.city);
	const [postalCode, setPostalCode] = useState(addressData.postal_code);
	const [address, setAddress] = useState(addressData.address);
	const { toast } = useToast();

	useEffect(
		(lang = "en") => {
			const countryName = new Intl.DisplayNames([lang], { type: "region" });
			const country: { [K: string]: string } = {};
			region.forEach((r: string) => {
				let name = countryName.of(r)!;
				country[r] = name;
			});
			setCountries(country);

			return () => setFeature("My Address");
		},
		[setFeature],
	);

	const { mutate: mutateAddress } = useMutation({
		mutationFn: () =>
			generalFetch({
				uri,
				method: "PUT",
				body: {
					id: addressData.id,
					address: DOMPurify.sanitize(address),
					city: DOMPurify.sanitize(city),
					country,
					postal_code: DOMPurify.sanitize(postalCode),
				},
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["addressData"] });
			setOpen(false);
			toast({
				title: personalInfoUpdateSuccess.title,
				description: personalInfoUpdateSuccess.desc,
				status: personalInfoUpdateSuccess.status,
			});
		},
		onError: () => {
			toast({
				title: "Failed !",
				description: genericError,
				status: "fail",
			});
		},
	});

	const onCancel = () => {
		setOpen(false);
	};

	return (
		<Fragment>
			<div className="flex flex-col space-y-4">
				<div className="flex items-center justify-between space-x-2">
					<div className="mb-2 text-sm font-normal">Country</div>
					<ComboBox
						data={Object.values(countries) || []}
						className="w-60"
						defaultValue={country}
						fallBackValue="Sorry, no country found"
						onSelect={setCountry}
					/>
				</div>
				<div className="flex items-center justify-between space-x-2">
					<div className="mb-2 text-sm font-normal">City</div>
					<Input
						className="w-60 px-4 text-sm font-light"
						value={city}
						onChange={(e) => setCity(e.target.value)}
					></Input>
				</div>
				<div className="flex items-center justify-between space-x-2">
					<div className="mb-2 text-sm font-normal">Post Code</div>
					<Input
						className="w-60 px-4 text-sm font-light"
						value={postalCode}
						onChange={(e) => setPostalCode(e.target.value)}
					></Input>
				</div>
				<div className="flex items-center justify-between space-x-2">
					<div className="mb-2 text-sm font-normal">Address</div>
					<Textarea
						value={address}
						className="h-1/3 w-60 px-4 text-sm font-light"
						onChange={(e) => setAddress(e.target.value)}
					/>
				</div>
			</div>
			<div className="absolute bottom-0 right-0 w-full px-6">
				<Button className="mb-4 w-full" onClick={() => mutateAddress}>
					SAVE
				</Button>
				<Button variant="destructive" className="mb-4 w-full" onClick={onCancel}>
					CANCEL
				</Button>
			</div>
		</Fragment>
	);
}
