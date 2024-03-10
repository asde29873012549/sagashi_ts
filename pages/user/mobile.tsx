import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/base/alert";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/base/accordion";
import SheetWrapper from "@/components/user/editSheets/SheetWrapper";

import ProfileInfo from "@/components/user/profile/ProfileInfo";
import LanguageInfo from "@/components/user/profile/LanguageInfo";
import AddressInfo from "@/components/user/profile/AddressInfo";
import CountryInfo from "@/components/user/profile/CountryInfo";
// import About from "@/components/User/About";

import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import getUser from "@/lib/queries/fetchQuery";
import { getToken } from "next-auth/jwt";

import { NextApiRequest } from "next";
import type { ApiResponse, UserData } from "@/lib/types/global";

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

export default function User({ user }: { user: string }) {
	const { data: userData } = useQuery<ApiResponse<UserData>, Error>({
		queryKey: ["userData"],
		queryFn: () => getUser({ uri: `/user/${user}/info` }),
		refetchOnWindowFocus: false,
	});

	return (
		<div className="h-full w-screen px-3">
			<div className="py-4 text-2xl font-bold">Account</div>
			<Alert>
				<div className="flex items-center justify-between">
					<AlertDescription className="flex items-center">
						<Avatar className="h-20 w-20">
							<AvatarImage src="/defaultProfile.webp" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						<div className="ml-3">
							<AlertTitle className="font-semibold">Noah Hung</AlertTitle>
							<div>0 reviews</div>
						</div>
					</AlertDescription>
					<SheetWrapper
						trigger={<div className="text-xs underline">Change Password</div>}
						feature="Change Password"
						sheet="ChangePassword"
					/>
				</div>
			</Alert>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>My Items</AccordionTrigger>
					<AccordionContent>
						<div className="flex items-center justify-between">
							<SheetWrapper
								trigger={<div className="text-xs underline">See All Items</div>}
								feature="My Items"
								sheet="MyItem"
							/>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>My Profile</AccordionTrigger>
					<AccordionContent>
						<ProfileInfo
							user={user}
							sheet={
								<SheetWrapper trigger={<FilledPencil />} feature="Edit Profile" sheet="MyProfile" />
							}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Shipping Address</AccordionTrigger>
					<AccordionContent>
						<AddressInfo
							userData={userData?.data}
							sheet={
								<SheetWrapper trigger={<FilledPencil />} feature="Edit Address" sheet="MyAddress" />
							}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Language</AccordionTrigger>
					<AccordionContent>
						<LanguageInfo
							sheet={
								<SheetWrapper
									trigger={<FilledPencil />}
									feature="Edit Language"
									sheet="MyLanguage"
								/>
							}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Country/Region</AccordionTrigger>
					<AccordionContent>
						<CountryInfo
							userData={userData?.data}
							sheet={
								<SheetWrapper
									trigger={<FilledPencil />}
									feature="Edit Countries"
									sheet="MyCountry"
								/>
							}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Contact Us</AccordionTrigger>
					<AccordionContent>
						<SheetWrapper
							trigger={<div className="text-xs underline">Contact us through email</div>}
							feature="Contact Us"
							sheet="ContactUs"
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>About</AccordionTrigger>
					<AccordionContent>{/* <About /> */}</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Terms & Conditions</AccordionTrigger>
					<AccordionContent>
						<div>123</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Private Policy</AccordionTrigger>
					<AccordionContent>
						<div>123</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}

function FilledPencil() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="h-3 w-3"
		>
			<path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
		</svg>
	);
}

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
	const queryClient = new QueryClient();
	const token = await getToken({ req, secret: JWT_TOKEN_SECRET });
	const username = token?.username;
	const accessToken = token?.accessToken;

	await queryClient.prefetchQuery({
		queryKey: ["userData"],
		queryFn: () => getUser({ uri: `/user/${username}/info`, server: true, token: accessToken }),
	});

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
			user: username,
		},
	};
}
