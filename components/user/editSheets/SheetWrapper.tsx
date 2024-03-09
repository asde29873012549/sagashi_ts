import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/base/sheet";
import MyItem from "./MyItemSheet";
import MyProfile from "./EditProfileSheet";
import MyAddress from "./AddAddressSheet";
import EditAddress from "./EditAddressSheet";
import MyLanguage from "./EditLanguageSheet";
import MyCountry from "./EditCountrySheet";
import ContactUs from "./ContactUsForm";
import ChangePassword from "./ChangePasswordSheet";
import { UserData, Feature } from "@/lib/types/global";

interface SheetWrapperProps {
	user?: UserData;
	trigger: React.ReactNode;
	feature: Feature;
	setFeature?: React.Dispatch<React.SetStateAction<Feature>>;
	sheet: string;
	side?: "bottom" | "right" | "left" | "top";
	className?: string;
	addressData?: { id: string; address: string; city: string; country: string; postal_code: string };
	open?: boolean;
	setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

type featureActionMapType = {
	[key: string]: string;
};

type SheetsMapType = {
	[key: string]: React.ReactNode;
};

export default function SheetWrapper({
	user,
	trigger,
	feature,
	setFeature,
	sheet,
	side = "bottom",
	className = "h-[90%] overflow-scroll",
	addressData,
	open,
	setOpen,
}: SheetWrapperProps) {
	const featureActionMap: featureActionMapType = {
		"My Profile": `/user/${user?.username}/info`,
		"My Address": `/user/${user?.username}/shippingAddress`,
		"Edit Address": `/user/${user?.username}/shippingAddress`,
		"My Country": `/user/${user?.username}/info`,
	};

	const sheets: SheetsMapType = {
		MyItem: <MyItem /*setOpen={setOpen} uri={featureActionMap[feature]}*/ />,
		MyProfile: <MyProfile setOpen={setOpen!} uri={featureActionMap[feature]} user={user!} />,
		MyAddress: <MyAddress setOpen={setOpen!} uri={featureActionMap[feature]} />,
		MyLanguage: <MyLanguage setOpen={setOpen!} />,
		MyCountry: <MyCountry setOpen={setOpen!} uri={featureActionMap[feature]} />,
		ContactUs: <ContactUs setOpen={setOpen!} rows={10} />,
		ChangePassword: <ChangePassword setOpen={setOpen!} />,
		EditAddress: (
			<EditAddress
				setOpen={setOpen!}
				uri={featureActionMap[feature]}
				addressData={addressData!}
				setFeature={setFeature!}
			/>
		),
	};

	return (
		<Sheet open={open!} setOpen={setOpen!}>
			<SheetTrigger>{trigger}</SheetTrigger>
			<SheetContent side={side} className={className}>
				<SheetHeader>
					<SheetTitle>{feature}</SheetTitle>
					{sheets[sheet]}
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
}
