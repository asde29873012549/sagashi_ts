import { Button } from "@/components/base/button";
import { useMutation } from "@tanstack/react-query";
import {
	genericError,
	saveDraftSuccess,
	submitEmptyDraft,
	unAuthorizedError,
} from "@/lib/utility/userMessage";
import { sellSelector } from "@/redux/sellSlice";
import { useDispatch, useSelector } from "react-redux";
import { activate } from "@/redux/loadingSlice";
import { useToast } from "@/components/base/use-toast";
import createDraft from "@/lib/queries/fetchQuery";
import { useRouter } from "next/router";
import type { PartialSellFormInputType } from "@/lib/types/global";

export default function SaveDraft({
	className,
	tags,
}: {
	className: string;
	tags?: { id: string; value: string }[];
}) {
	const dispatch = useDispatch();
	const formInput = useSelector(sellSelector).formInput;
	const { toast } = useToast();
	const router = useRouter();

	const { mutate: draftMutate } = useMutation({
		mutationFn: (draft: FormData) =>
			createDraft({ uri: "/listing/draft", method: "POST", body: draft, isFormData: true }),
		onSuccess: () => {
			dispatch(activate());
			toast({
				title: saveDraftSuccess.title,
				description: saveDraftSuccess.desc,
				status: saveDraftSuccess.status,
			});

			setTimeout(() => {
				router.push("/");
			}, 1500);
		},
		onError: (err: Error) => {
			dispatch(activate());
			toast({
				title: "Failed !",
				description:
					err.message === unAuthorizedError.title ? unAuthorizedError.desc : genericError,
				status: "fail",
			});
		},
	});

	const onSaveDraft = async () => {
		if (Object.keys(formInput).length === 0) {
			toast({
				title: submitEmptyDraft.title,
				description: submitEmptyDraft.desc,
				status: submitEmptyDraft.status,
			});

			return;
		}

		dispatch(activate());

		const formData = new FormData();

		Object.keys(formInput).forEach((key) => {
			if (key === "photos") {
				Object.values(formInput[key]!).forEach((photo) =>
					formData.append("photo", photo as string),
				);
			} else if (key === "tags" && tags && tags.length > 0) {
				formData.append("tags", tags.map((obj) => obj.value).join("&"));
			} else {
				const K = key as keyof PartialSellFormInputType;
				const val = formInput[K] as string;
				if (val) formData.append(key, val);
			}
		});

		try {
			draftMutate(formData);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="col-span-2 flex justify-end p-0">
			<Button variant="link" className={className} onClick={onSaveDraft}>
				Save Draft
			</Button>
		</div>
	);
}
