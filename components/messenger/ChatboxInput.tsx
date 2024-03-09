import { Input } from "@/components/base/input";
import { useState } from "react";
import { useToast } from "@/components/base/use-toast";
import { genericError } from "@/lib/utility/userMessage";
import { cn } from "@/lib/utility/utils";

interface ChatboxInputProps {
	updateMessageInput: ({
		val,
		setVal,
	}: {
		val: string;
		setVal: React.Dispatch<React.SetStateAction<string>>;
	}) => void;
	currentActiveChatroom: string;
	messageMutate: ({
		val,
		product_id,
		listingOwner,
		recipient,
	}: {
		val: string;
		product_id: string;
		listingOwner: string;
		recipient: string;
	}) => void;
	isSmallMsgBox?: boolean;
}

export default function ChatboxInput({
	updateMessageInput,
	currentActiveChatroom,
	messageMutate,
	isSmallMsgBox,
}: ChatboxInputProps) {
	const [val, setVal] = useState<string>("");
	const { toast } = useToast();

	const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setVal(e.target.value);
	};

	const onPressEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			updateMessageInput({ val, setVal });
			// check who should be the recipient
			const [product_id, listingOwner, recipient] = currentActiveChatroom?.split("-");

			if (!recipient)
				return toast({
					title: "Failed !",
					description: genericError,
					status: "fail",
				});

			messageMutate({ val, product_id, listingOwner, recipient });
		}
	};

	return (
		<Input
			className={cn(
				"w-full text-base placeholder:text-slate-400",
				isSmallMsgBox ? "h-10 rounded-full" : "h-10 rounded-lg border-slate-800",
			)}
			placeholder="Aa"
			onChange={onInput}
			onKeyDown={onPressEnter}
			value={val}
		/>
	);
}
