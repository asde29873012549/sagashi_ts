import { UserData } from "@/lib/types/global";
export default function CountryInfo({
	sheet = "",
	userData,
}: {
	sheet?: React.ReactNode;
	userData: UserData | undefined;
}) {
	const country = (userData?.country ?? "").toUpperCase();
	return (
		<div className="flex items-center justify-between">
			<div>{country}</div>
			{sheet}
		</div>
	);
}
