import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/base/select";
import DesignerComboBox from "../../components/designerDisplay/DesignerComboBox";
import { Input } from "@/components/base/input";
import { Textarea } from "@/components/base/textarea";
import { Button } from "@/components/base/button";
import { XCircle } from "lucide-react";
import { useToast } from "@/components/base/use-toast";
import ImageUploadCard from "../../components/sell/ImageUploadCard";
import { useDispatch } from "react-redux";
import { activate } from "@/redux/loadingSlice";

import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";

import {
	dehydrate,
	QueryClient,
	useQuery,
	useInfiniteQuery,
	useMutation,
} from "@tanstack/react-query";
import getAllCategories from "@/lib/queries/fetchQuery";
import getAllSizes from "@/lib/queries/fetchQuery";
import getAllColor from "@/lib/queries/fetchQuery";
import getAllCondition from "@/lib/queries/fetchQuery";
import getAllDesigners from "@/lib/queries/fetchQuery";
import createDraft from "@/lib/queries/fetchQuery";
import {
	genericError,
	saveDraftSuccess,
	uploadSuccess,
	submitEmptyDraft,
	unAuthorizedError,
} from "@/lib/utility/userMessage";
import type {
	DeptCategory,
	ApiResponse,
	SubCategorySubType,
	SizeOptions,
	Condition,
	PhotoBlobKey,
	PartialSellFormInputType,
} from "@/lib/types/global";

import DOMPurify from "dompurify";

type SelectCategoryType =
	| "department"
	| "category"
	| "subCategory"
	| "size"
	| "color"
	| "condition";

export default function Sell() {
	const router = useRouter();
	const [tags, setTags] = useState<{ id: string; value: string }[]>([]);
	const [formInput, setFormInput] = useState<PartialSellFormInputType>({});
	const { toast } = useToast();
	const childStateRef = useRef();
	const dispatch = useDispatch();

	const { data: categoryData } = useQuery<ApiResponse<DeptCategory>, Error>({
		queryKey: ["category"],
		queryFn: () => getAllCategories({ uri: "/category" }),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 30,
		cacheTime: 1000 * 60 * 35,
	});

	const { data: sizeData, refetch: fetchSize } = useQuery<ApiResponse<SizeOptions[]>, Error>({
		queryKey: ["size", formInput.category_id && formInput.category_id],
		queryFn: (obj) => getAllSizes({ uri: `/category/size/${obj.queryKey[1]}` }),
		enabled: false,
		refetchOnWindowFocus: false,
	});

	const { data: colorData } = useQuery<ApiResponse<string[]>, Error>({
		queryKey: ["color"],
		queryFn: () => getAllColor({ uri: "/listing/color" }),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 30,
		cacheTime: 1000 * 60 * 35,
	});

	const { data: conditionData } = useQuery<ApiResponse<Condition[]>, Error>({
		queryKey: ["condition"],
		queryFn: () => getAllCondition({ uri: "/listing/condition" }),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 30,
		cacheTime: 1000 * 60 * 35,
	});

	const { mutateAsync: draftMutate } = useMutation({
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

	const { mutateAsync: saveMutate } = useMutation({
		mutationFn: (product: FormData) =>
			createDraft({ uri: "/listing/create", method: "POST", body: product, isFormData: true }),
		onSuccess: () => {
			dispatch(activate());
			toast({
				title: uploadSuccess.title,
				description: uploadSuccess.desc,
				status: uploadSuccess.status,
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

	const {
		data: designerData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["designer", "infinite"],
		queryFn: ({ pageParam = "" }) =>
			getAllDesigners({
				uri: `/designer?cursor=${pageParam && encodeURI(JSON.stringify(pageParam))}&limit=10`,
			}),
		getNextPageParam: (lastPage, pages) => lastPage?.data[lastPage.data.length - 1]?.sort,
		refetchOnWindowFocus: false,
	});

	const onFormInput = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		form: string,
	) => {
		setFormInput({ ...formInput, ...{ [form]: e.target.value } });
	};

	const onSelect = (e: string, category: SelectCategoryType, shouldFetchSize?: boolean) => {
		const [cat_id, cat_name] = String(e)?.split("_");

		shouldFetchSize && fetchSize();

		return category !== "department" && category !== "color" && category !== "condition"
			? setFormInput({ ...formInput, [category]: cat_name, [`${category}_id`]: cat_id })
			: setFormInput({ ...formInput, [category]: e });
	};

	const onTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
		if (e.key === "Space" || e.key === "Enter") {
			setTags([
				...tags,
				{
					id,
					value: (e.target as HTMLInputElement).value,
				},
			]);
			setFormInput({ ...formInput, tags: "" });
		}
	};

	const onCancelTag = (tagId: string) => {
		setTags(tags.filter((tag) => tag.id !== tagId));
	};

	const onSaveDraft = async () => {
		if (Object.keys(formInput).length === 0) {
			toast({
				title: submitEmptyDraft.title,
				description: submitEmptyDraft.desc,
				status: submitEmptyDraft.status,
			});

			return;
		}
		try {
			await draftMutate(submitForm());
		} catch (err) {
			console.log(err);
		}
	};

	const onSubmit = async () => {
		try {
			await saveMutate(submitForm());
		} catch (err) {
			console.log(err);
		}
	};

	const submitForm = (): FormData => {
		dispatch(activate());

		const formData = new FormData();

		Object.keys(formInput).forEach((key) => {
			if (key === "photos") {
				Object.keys(formInput.photos!).forEach((photo_key) => {
					if (String(photo_key) === "1") {
						formData.append("primary_image", formInput.photos![photo_key as PhotoBlobKey]!);
					} else {
						// start from `image_0` to `image_5`
						formData.append(
							`image_${Number(photo_key) - 2}`,
							formInput.photos![photo_key as PhotoBlobKey]!,
						);
					}
				});
			} else if (key === "tags" && tags.length > 0) {
				formData.append("tags", DOMPurify.sanitize(tags.map((obj) => obj.value).join("&")));
			} else {
				const K = key as keyof PartialSellFormInputType;
				const val = formInput[K] as string;
				if (val) formData.append(key, DOMPurify.sanitize(val));
			}
		});

		return formData;
	};

	return (
		<main className="mx-72 p-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="col-span-2 my-8 text-3xl font-semibold">Details</div>
				<Select value={formInput.department} onValueChange={(e) => onSelect(e, "department")}>
					<SelectTrigger className="h-12 w-auto">
						<SelectValue placeholder="Department" />
					</SelectTrigger>
					<SelectContent>
						{categoryData?.data &&
							Object.keys(categoryData.data).map((department) => (
								<SelectItem key={department} value={department}>
									{department}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
				<Select
					// manually passed in undefined if the value not exist, due to the constraints of radix ui
					// Since the radix ui will only show the placeholder if the value is undefined, not even null or ""
					value={formInput.category ? `${formInput.category_id}_${formInput.category}` : undefined}
					onValueChange={(e) => onSelect(e, "category")}
				>
					<SelectTrigger className="h-12 w-auto">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						{categoryData && formInput.department ? (
							Object.keys(categoryData.data[formInput.department as keyof DeptCategory]).map(
								(category) => {
									const dept = formInput.department as keyof DeptCategory;
									const cat = category as keyof DeptCategory[typeof dept];
									const cat_id = categoryData.data[dept][cat]?.id;
									return (
										<SelectItem key={cat_id} value={`${cat_id}_${category}`}>
											{category}
										</SelectItem>
									);
								},
							)
						) : (
							<SelectItem value="Please Select Department First" className="text-cyan-900" disabled>
								Please Select Department First
							</SelectItem>
						)}
					</SelectContent>
				</Select>
				<Select
					// manually passed in undefined if the value not exist, due to the constraints of radix ui
					// Since the radix ui will only show the placeholder if the value is undefined, not even null or ""
					value={
						formInput.subCategory
							? `${formInput.subCategory_id}_${formInput.subCategory}`
							: undefined
					}
					onValueChange={(e) => onSelect(e, "subCategory", true)}
				>
					<SelectTrigger className="h-12 w-auto">
						<SelectValue placeholder="SubCategory" />
					</SelectTrigger>
					<SelectContent>
						{categoryData && formInput.department && formInput.category_id ? (
							Object.values(categoryData.data[formInput.department as keyof DeptCategory])
								.filter((obj) => String(obj.id) === String(formInput.category_id))[0]
								?.sub.map((subCategory: SubCategorySubType) => {
									const subCat_id = subCategory.id;
									return (
										<SelectItem key={subCat_id} value={`${subCat_id}_${subCategory.name}`}>
											{subCategory.name}
										</SelectItem>
									);
								})
						) : (
							<SelectItem value="Please Select Category First" className="text-cyan-900" disabled>
								Please Select Category First
							</SelectItem>
						)}
					</SelectContent>
				</Select>
				<Select
					value={formInput.size ? `${formInput.size_id}_${formInput.size}` : undefined}
					onValueChange={(e) => onSelect(e, "size")}
				>
					<SelectTrigger className="h-12 w-auto">
						<SelectValue placeholder="Size" />
					</SelectTrigger>
					<SelectContent>
						{formInput.subCategory_id ? (
							sizeData?.data.map((obj, index) => (
								<SelectItem
									key={`${obj.Size.name}_${index}`}
									value={`${obj.Size.id}_${obj.Size.name}`}
								>
									{obj.Size.name}
								</SelectItem>
							))
						) : (
							<SelectItem
								value="Please Select SubCategory First"
								className="text-cyan-900"
								disabled
							>
								Please Select Category First
							</SelectItem>
						)}
					</SelectContent>
				</Select>
				<div className="col-span-1 mt-8 text-3xl font-semibold">Designers</div>
				<DesignerComboBox
					ref={childStateRef}
					data={designerData?.pages ?? []}
					fetchNextPage={fetchNextPage}
					isFetchingNextPage={isFetchingNextPage}
					hasNextPage={hasNextPage}
					setFormInput={setFormInput}
				/>
				<div className="col-span-1 my-8 text-3xl font-semibold">Item Name</div>
				<div className="col-span-1 my-8 text-3xl font-semibold">Color</div>
				<Input
					placeholder="Item Name"
					className="h-12 w-auto placeholder:text-gray-400"
					value={formInput.item_name || ""}
					onChange={(e) => onFormInput(e, "item_name")}
				/>
				<Select value={formInput.color} onValueChange={(e) => onSelect(e, "color")}>
					<SelectTrigger className="h-12 w-auto">
						<SelectValue placeholder="Color" />
					</SelectTrigger>
					<SelectContent className="h-60">
						{colorData?.data.map((color) => (
							<SelectItem key={color} value={color}>
								{color}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="col-span-1 my-8 text-3xl font-semibold">Condition</div>
				<div className="col-span-1 my-8 text-3xl font-semibold">Price</div>
				<Select value={formInput.condition} onValueChange={(e) => onSelect(e, "condition")}>
					<SelectTrigger className="h-12 w-auto">
						<SelectValue placeholder="Condition" />
					</SelectTrigger>
					<SelectContent>
						{conditionData?.data.map((condition) => (
							<SelectItem key={condition} value={condition}>
								{condition}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					placeholder="Price"
					className="h-12 w-auto placeholder:text-gray-400"
					value={formInput.price || ""}
					onChange={(e) => onFormInput(e, "price")}
				/>

				<div className="col-span-2 my-8 text-3xl font-semibold">Description</div>
				<Textarea
					className="col-span-2 h-48 text-base placeholder:font-light placeholder:text-gray-400"
					placeholder="Add details about condition, how the garments fits, additional measurements, etc."
					value={formInput.desc || ""}
					onChange={(e) => onFormInput(e, "desc")}
				/>
			</div>
			<div>
				<div className="my-12 text-3xl font-semibold">Tags</div>
				<div>
					{tags.map((tag) => (
						<Button
							key={tag.id}
							variant="secondary"
							className="mb-2 mr-2 hover:bg-destructive"
							onClick={() => onCancelTag(tag.id)}
						>
							#{tag.value}
							<XCircle className="ml-1" />
						</Button>
					))}
				</div>
				<Input
					placeholder="Use whitespace or enter to separate #tags"
					className="mt-3 h-12 w-full placeholder:font-light placeholder:text-gray-400"
					onKeyDown={(e) => onTagInputKeyDown(e, uuid())}
					onChange={(e) => onFormInput(e, "tags")}
					value={(formInput.tags as string) || ""}
				/>
			</div>
			<section className="mt-20 grid grid-cols-3 gap-10">
				{["1", "2", "3", "4", "5", "6"].map((id) => (
					<ImageUploadCard
						key={id}
						id={id as PhotoBlobKey}
						formInput={formInput}
						setFormInput={setFormInput}
					/>
				))}
			</section>
			<div className="mt-10 flex items-center justify-end">
				<Button
					variant="outline"
					className="flex items-center justify-center border-2 border-foreground"
					onClick={onSaveDraft}
				>
					SAVE AS DRAFT
				</Button>
				<Button className="ml-6 flex items-center justify-center" type="submit" onClick={onSubmit}>
					SUBMIT
				</Button>
			</div>
		</main>
	);
}

export async function getServerSideProps() {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["category"],
		queryFn: () => getAllCategories({ uri: "/category", server: true }),
	});

	return {
		props: {
			dehydratedState: dehydrate(queryClient),
		},
	};
}
