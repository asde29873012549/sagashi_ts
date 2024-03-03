import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import offerPriceQuery from "@/lib/queries/fetchQuery";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { formattedMoney } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import CheckSvg from "./checkSvg";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import SmallSpinner from "@/components/SmallSpinner";
import { toggleRegisterForm } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import { duplicateOffer, genericError } from "@/lib/utils/userMessage";

let loadingTimeoutid: ReturnType<typeof setTimeout>;

interface offerDialogProps {
	username: string;
	product_id: string;
	image: string;
	productName: string;
	designerName: string;
	price: string;
}

function OfferDialog({
	username,
	product_id,
	image,
	productName,
	designerName,
	price,
}: offerDialogProps) {
	const [open, setOpen] = useState<boolean>(false);
	const [submitText, setSubmitText] = useState<React.ReactNode>("SUBMIT");
	const [offerPrice, setOfferPrice] = useState<string>("");
	const [error, setError] = useState<string>("");
	const { toast } = useToast();
	const dispatch = useDispatch();

	const { mutate: offerMutate } = useMutation({
		mutationFn: () =>
			offerPriceQuery({
				uri: "/listing/offer",
				method: "POST",
				body: {
					product_id,
					offer_price: offerPrice,
				},
			}),
		onMutate: () => {
			loadingTimeoutid = setTimeout(() => setSubmitText(<SmallSpinner />), 250);
		},
		onSuccess: () => {
			clearTimeout(loadingTimeoutid);
			setSubmitText(<CheckSvg />);
			setTimeout(() => {
				setOpen(false);
				setSubmitText("SUBMIT");
			}, 1000);
		},
		onError: (err: Error) => {
			clearTimeout(loadingTimeoutid);
			if (err.message === "Error: SequelizeUniqueConstraintError") {
				toast({
					title: duplicateOffer.title,
					description: duplicateOffer.desc,
					status: duplicateOffer.status,
				});
			} else {
				toast({
					title: "Failed !",
					description: genericError,
					status: "fail",
				});
			}
			setSubmitText("SUBMIT");
		},
	});

	const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOfferPrice(e.target.value);
		if (error) setError("");
	};

	const onOpen = (state: boolean) => {
		if (!username) return dispatch(toggleRegisterForm());
		setOpen(state);
		if (error) setError("");
		if (!state) setOfferPrice("");
	};

	const onCancel = () => {
		setOpen(false);
		if (error) setError("");
		setOfferPrice("");
	};

	const onOffer = () => {
		if (!offerPrice || Number.isNaN(Number(offerPrice)))
			return setError("**Please enter a valid price**");
		offerMutate();
	};

	return (
		<Dialog open={open} onOpenChange={onOpen}>
			<DialogTrigger className="mb-4 h-12 w-full rounded-md bg-primary text-white hover:border-2 hover:border-foreground hover:bg-background hover:text-foreground md:w-4/5">
				OFFER
			</DialogTrigger>
			<DialogContent className="p-6">
				<DialogHeader className="space-y-0">
					<DialogTitle className="mx-auto w-fit text-xl">Make Your Offer</DialogTitle>
					<DialogDescription className="!mb-4 flex w-full flex-col items-center justify-center text-sm text-sky-900">
						<span className="leading-4">
							The seller will have 48 hours to accept or decline your offer
						</span>
						<span className="leading-4">You may also not make a offer twice within 48 hours</span>
						<span className="text-rose-800">{error}</span>
					</DialogDescription>
					<div className="flex justify-between">
						<div className="flex flex-col justify-between">
							<span>
								<h1 className="text-lg">{productName}</h1>
								<h2 className="text-sm italic">{designerName}</h2>
							</span>
							<Input
								placeholder={`${formattedMoney(Number(price) * 0.9)}`}
								className="w-28 rounded-none border-0 border-b-2 placeholder:font-light placeholder:text-info focus-visible:ring-0 focus-visible:ring-offset-0"
								value={offerPrice}
								onChange={onInput}
							/>
						</div>
						<Image src={image} alt="product image" width={90} height={120} />
					</div>
				</DialogHeader>
				<footer className="mt-2 flex justify-between space-x-4 border-t border-gray-200 pt-4">
					<Button variant="outline" className="w-1/2" onClick={onCancel}>
						CANCEL
					</Button>
					<Button className="w-1/2" onClick={onOffer}>
						{submitText}
					</Button>
				</footer>
			</DialogContent>
		</Dialog>
	);
}

export default OfferDialog;
