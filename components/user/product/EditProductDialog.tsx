import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import ImageUploadCard from "@/components/sell/ImageUploadCard";
import { Textarea } from "@/components/base/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/base/select";
import DesignerComboBox from "@/components/designerDisplay/DesignerComboBox";
import { Dialog, DialogContent, DialogFooter } from "@/components/base/dialog";
import { activate } from "@/redux/loadingSlice";
import getAllCondition from "@/lib/queries/fetchQuery";
import editProductData from "@/lib/queries/fetchQuery";
import getAllCategories from "@/lib/queries/fetchQuery";
import getAllSizes from "@/lib/queries/fetchQuery";
import getAllColor from "@/lib/queries/fetchQuery";
import getAllDesigners from "@/lib/queries/fetchQuery";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Button } from "@/components/base/button";
import { genericError, uploadSuccess } from "@/lib/utility/userMessage";
import { useToast } from "@/components/base/use-toast";
import DOMPurify from "dompurify";
import { useDispatch } from "react-redux";
import { XCircle } from "lucide-react";
import type {
	ProductData,
	DraftProductData,
	MenswearCategory,
	WomenswearCategory,
	SizeOptions,
	PhotoBlobKey,
	EditProductFormInput,
	SubCategorySubType,
	PartialSellFormInputType,
	ApiResponse,
	DeptCategory,
} from "@/lib/types/global";

interface EditProductDialogProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	productData: ProductData | DraftProductData;
	user: string;
	isDraft?: boolean;
}

type CategoryData = ApiResponse<DeptCategory> | undefined;

export default function EditProductDialog({
	isOpen,
	setIsOpen,
	productData,
	user,
	isDraft = false,
}: EditProductDialogProps) {
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const childStateRef = useRef();
	const dispatch = useDispatch();

	const generatePhotoObj = (productData: ProductData | DraftProductData) => {
		const photoObj: { [key: number]: string } = {};
		if (productData) {
			photoObj[1] = productData?.primary_image || "";
			const secondary_image = JSON.parse(productData?.secondary_image || "{}");
			secondary_image &&
				Object.keys(secondary_image).forEach((key, index) => {
					if (key.startsWith("image_")) {
						photoObj[Number(index) + 2] = secondary_image[key];
					}
				});
		}
		return photoObj;
	};

	const cachedCategoryData: CategoryData = queryClient.getQueryData(["category"]);

	let category_id: string | number = "";
	let subCategory_id: string | number = "";

	if (productData?.department === "Menswear") {
		const category = productData?.category as keyof MenswearCategory;
		category_id = cachedCategoryData?.data?.Menswear[category]?.id || "";
		subCategory_id =
			cachedCategoryData?.data?.Menswear[category]?.sub?.find(
				(subCat) => subCat.name === productData?.subCategory,
			)?.id || "";
	} else if (productData?.department === "Womenswear") {
		const category = productData?.category as keyof WomenswearCategory;
		category_id = cachedCategoryData?.data?.Womenswear[category]?.id || "";
		subCategory_id =
			cachedCategoryData?.data?.Womenswear[category]?.sub?.find(
				(subCat) => subCat.name === productData?.subCategory,
			)?.id || "";
	}

	const [formInput, setFormInput] = useState<EditProductFormInput>({
		item_name: productData?.name || "",
		tags: productData?.tags || "",
		desc: productData?.desc || "",
		size: productData?.size || "",
		color: productData?.color || "",
		price: String(productData?.price) || "",
		department: productData?.department || "",
		category: productData?.category || "",
		category_id: String(category_id),
		condition: productData?.condition || "",
		subCategory: productData?.subCategory || "",
		designer: productData?.designer || "",
		subCategory_id: String(subCategory_id),
		size_id: "",
		photos: generatePhotoObj(productData),
	});

	const [tagInput, setTagInput] = useState("");

	const { data: conditionData } = useQuery({
		queryKey: ["condition"],
		queryFn: () => getAllCondition({ uri: "/listing/condition" }),
		enabled: isOpen,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 30,
		cacheTime: 1000 * 60 * 35,
	});

	const { data: categoryData }: { data: CategoryData } = useQuery({
		queryKey: ["category"],
		queryFn: () => getAllCategories({ uri: "/category" }),
		enabled: isOpen && productData ? true : false,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 30,
		cacheTime: 1000 * 60 * 35,
		onSuccess: (categoryData) => {
			setFormInput({
				...formInput,
				category_id:
					String(
						productData?.department &&
							categoryData?.data[productData.department]?.[
								productData?.category as keyof (MenswearCategory | WomenswearCategory)
							]?.id,
					) ?? "",
				subCategory_id:
					String(
						productData?.department &&
							categoryData?.data[productData.department]?.[
								productData?.category as keyof (MenswearCategory | WomenswearCategory)
							]?.sub?.find((subCat: SubCategorySubType) => subCat.name === productData?.subCategory)
								?.id,
					) ?? "",
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

	const { data: sizeData, refetch: fetchSize } = useQuery({
		queryKey: ["size", formInput.category_id && formInput.category_id],
		queryFn: (obj) => getAllSizes({ uri: `/category/size/${obj.queryKey[1]}` }),
		enabled: formInput.category_id ? true : false,
		refetchOnWindowFocus: false,
		onSuccess: (sizeData) => {
			const sizeObj = sizeData?.data?.find(
				(sizeObj: SizeOptions) => sizeObj.Size.name === productData?.size,
			);
			setFormInput({ ...formInput, size_id: sizeObj?.Size.id });
		},
	});

	const { data: colorData } = useQuery({
		queryKey: ["color"],
		queryFn: () => getAllColor({ uri: "/listing/color" }),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 30,
		cacheTime: 1000 * 60 * 35,
	});

	const { mutate: editMutate } = useMutation({
		mutationFn: (product: FormData) =>
			editProductData({
				uri: `/listing/${productData?.prod_id}`,
				method: "PUT",
				body: product,
				isFormData: true,
			}),
		onSuccess: () => {
			dispatch(activate());
			toast({
				title: uploadSuccess.title,
				description: uploadSuccess.desc,
				status: uploadSuccess.status,
			});

			queryClient.invalidateQueries({ queryKey: ["products", {}, user] });

			setIsOpen(false);
		},
		onError: (error) => {
			dispatch(activate());
			toast({
				title: "Failed !",
				description: genericError,
				status: "fail",
			});
		},
	});

	const onSelect = (
		e: string,
		category: "department" | "category" | "color" | "condition" | "subCategory" | "size",
		shouldFetchSize?: boolean | undefined,
	) => {
		const [cat_id, cat_name] = String(e)?.split("_");

		shouldFetchSize && fetchSize();

		return category !== "department" && category !== "color" && category !== "condition"
			? setFormInput({ ...formInput, [category]: cat_name, [`${category}_id`]: cat_id })
			: setFormInput({ ...formInput, [category]: e });
	};

	const onFormInput = (e: React.ChangeEvent<HTMLElement>, form: "item_name" | "price" | "desc") => {
		setFormInput({ ...formInput, ...{ [form]: (e.target as HTMLInputElement).value } });
	};

	const onTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "Space") {
			setFormInput({
				...formInput,
				tags: (formInput.tags += `#${tagInput.trim()}#`),
			});
			setTagInput("");
		}
	};

	const onTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTagInput((e.target as HTMLInputElement).value);
	};

	const onRemoveTag = (tag: string) => {
		setFormInput({
			...formInput,
			tags: formInput.tags.replace(`#${tag}#`, ""),
		});
	};

	const onEditProductData = () => {
		dispatch(activate());

		const formData = new FormData();

		Object.keys(formInput).forEach((key) => {
			if (key === "photos") {
				Object.keys(formInput.photos).forEach((photo_key) => {
					if (String(photo_key) === "1") {
						formData.append("primary_image", formInput.photos[photo_key as PhotoBlobKey]!);
					} else {
						// start from `image_0` to `image_5`
						formData.append(
							`image_${Number(photo_key) - 2}`,
							formInput.photos[photo_key as PhotoBlobKey]!,
						);
					}
				});
			} else if (key === "tags" && formInput.tags.length > 0) {
				if (Array.isArray(formInput.tags))
					formData.append("tags", DOMPurify.sanitize(formInput.tags.join("&")));
			} else {
				if (key in formInput) {
					const val = formInput[key as keyof EditProductFormInput];
					if (typeof val === "string" || typeof val === "number") {
						formData.append(key, DOMPurify.sanitize(String(val)));
					}
				}
			}
		});

		formData.append("isDraft", String(isDraft));

		try {
			editMutate(formData);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-h-screen gap-1 overflow-y-scroll px-6 py-4">
				<div className="grid grid-cols-6 gap-3">
					<div className="col-span-3 items-center">
						<Label htmlFor="name" className="text-right">
							Item Name
						</Label>
						<Input
							id="name"
							placeholder="Item Name"
							className="col-span-2 h-10 w-full text-sm font-light placeholder:font-light placeholder:text-gray-400"
							value={formInput.item_name || ""}
							onChange={(e) => onFormInput(e, "item_name")}
						/>
					</div>
					<div className="col-span-3 items-center">
						<Label htmlFor="designer" className="text-right">
							Designer
						</Label>
						<DesignerComboBox
							ref={childStateRef}
							data={designerData?.pages ?? []}
							fetchNextPage={fetchNextPage}
							isFetchingNextPage={isFetchingNextPage}
							hasNextPage={hasNextPage}
							setFormInput={setFormInput}
							cacheValue={formInput.designer}
							className="col-span-2 mt-0 w-full text-sm placeholder:font-light placeholder:text-gray-400 hover:bg-background md:h-10"
							popoverWidth="md:w-[224px]"
							disabled={!isDraft}
						/>
					</div>
					<div className="col-span-3 items-center">
						<Label htmlFor="department" className="text-right">
							Department
						</Label>
						<Select
							value={formInput.department || undefined}
							onValueChange={(e) => onSelect(e, "department")}
							disabled={!isDraft}
						>
							<SelectTrigger className="col-span-2 h-10 w-full text-sm placeholder:font-light placeholder:text-gray-400">
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
					</div>
					<div className="col-span-3 items-center">
						<Label htmlFor="category" className="text-right">
							Category
						</Label>
						<Select
							value={
								formInput.category ? `${formInput.category_id}_${formInput.category}` : undefined
							}
							onValueChange={(e) => onSelect(e, "category")}
							disabled={!isDraft}
						>
							<SelectTrigger className="col-span-2 h-10 w-full text-sm placeholder:font-light placeholder:text-gray-400">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								{formInput.department ? (
									Object.keys(
										categoryData!.data[formInput.department as "Menswear" | "Womenswear"],
									).map((category) => {
										const cat_id =
											categoryData!.data[formInput.department as "Menswear" | "Womenswear"][
												category as keyof (MenswearCategory | WomenswearCategory)
											]?.id;
										return (
											<SelectItem key={cat_id} value={`${cat_id}_${category}`}>
												{category}
											</SelectItem>
										);
									})
								) : (
									<SelectItem
										value="Please Select Department First"
										className="pl-2 text-cyan-900"
										disabled
									>
										Please Select Department First
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="col-span-3 items-center">
						<Label htmlFor="subCategory" className="text-right">
							SubCategory
						</Label>
						<Select
							value={
								formInput.subCategory
									? `${formInput.subCategory_id}_${formInput.subCategory}`
									: undefined
							}
							onValueChange={(e) => onSelect(e, "subCategory", true)}
						>
							<SelectTrigger className="col-span-2 h-10 w-full text-sm placeholder:font-light placeholder:text-gray-400">
								<SelectValue placeholder="SubCategory" />
							</SelectTrigger>
							<SelectContent>
								{formInput.category_id ? (
									Object.values(
										categoryData!.data[formInput.department as "Menswear" | "Womenswear"],
									)
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
									<SelectItem
										value="Please Select Category First"
										className="pl-2 text-cyan-900"
										disabled
									>
										Please Select Category First
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="col-span-3 items-center">
						<Label htmlFor="size" className="text-right">
							Size
						</Label>
						<Select
							value={formInput.size ? `${formInput.size_id}_${formInput.size}` : undefined}
							onValueChange={(e) => onSelect(e, "size")}
						>
							<SelectTrigger className="col-span-2 h-10 w-full text-sm placeholder:font-light placeholder:text-gray-400">
								<SelectValue placeholder="size" />
							</SelectTrigger>
							<SelectContent>
								{formInput.subCategory_id ? (
									sizeData?.data.map((obj: SizeOptions, index: number) => (
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
					</div>
					<div className="col-span-2 items-center">
						<Label htmlFor="color" className="text-right">
							Color
						</Label>
						<Select value={formInput.color} onValueChange={(e) => onSelect(e, "color")}>
							<SelectTrigger className="col-span-2 h-10 w-full text-sm placeholder:font-light placeholder:text-gray-400">
								<SelectValue placeholder="color" />
							</SelectTrigger>
							<SelectContent>
								{colorData?.data.map((color: string) => (
									<SelectItem key={color} value={color}>
										{color}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="col-span-2 items-center">
						<Label htmlFor="condition" className="text-right">
							Condition
						</Label>
						<Select value={formInput.condition} onValueChange={(e) => onSelect(e, "condition")}>
							<SelectTrigger className="col-span-2 h-10 w-full text-sm placeholder:font-light placeholder:text-gray-400">
								<SelectValue placeholder="Condition" />
							</SelectTrigger>
							<SelectContent>
								{conditionData?.data.map((condition: string) => (
									<SelectItem key={condition} value={condition}>
										{condition}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="col-span-2 items-center gap-2">
						<Label htmlFor="price" className="text-right">
							Price
						</Label>
						<Input
							id="price"
							placeholder="price"
							className="col-span-2 h-10 w-full text-sm font-light placeholder:font-light placeholder:text-gray-400"
							value={formInput.price || ""}
							onChange={(e) => onFormInput(e, "price")}
						/>
					</div>
					<div className="col-span-6 items-center gap-2">
						<Label htmlFor="tags" className="text-right">
							Tags
						</Label>
						<div className="col-span-2 flex h-fit flex-wrap rounded-md border border-gray-500 px-1">
							{formInput.tags &&
								formInput.tags?.split("#").map((tag, index) => {
									if (tag)
										return (
											<div
												key={`${tag}-${index}-tags`}
												className="mx-0.5 my-1 flex h-8 items-center justify-center space-x-1 rounded-sm bg-sky-900 px-2 py-1 text-sm font-light text-white"
											>
												<span>#{tag}</span>
												<XCircle
													size={16}
													strokeWidth={2}
													className="cursor-pointer hover:text-rose-800"
													onClick={() => onRemoveTag(tag)}
												/>
											</div>
										);
								})}
							<Input
								id="tags"
								placeholder="Press Enter or Space to add #Tags"
								className="my-1 h-8 min-w-[10px] grow border-none px-0.5 py-1 text-sm font-light outline-none placeholder:font-light placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
								value={tagInput}
								onChange={(e) => onTagInput(e)}
								onKeyDown={(e) => onTagInputKeyDown(e)}
							/>
						</div>
					</div>
					<div className="col-span-6 items-center gap-2">
						<Label htmlFor="description" className="text-right">
							Description
						</Label>
						<Textarea
							className="min-h-[70px] w-full text-sm font-light placeholder:font-light placeholder:text-gray-400"
							placeholder="Add details about condition, how the garments fits, additional measurements, etc."
							value={formInput.desc || ""}
							onChange={(e) => {
								return onFormInput(e, "desc");
							}}
						/>
					</div>
				</div>
				<section className="mt-4 grid grid-cols-6 gap-2">
					{["1", "2", "3", "4", "5", "6"].map((id) => (
						<ImageUploadCard
							key={id}
							id={id as PhotoBlobKey}
							noBackDrop={true}
							formInput={formInput}
							initialBgImage={
								id === "1"
									? productData?.primary_image
									: productData?.secondary_image &&
										JSON.parse(productData?.secondary_image)[`image_${Number(id) - 2}`]
							}
							setFormInput={
								setFormInput as React.Dispatch<
									React.SetStateAction<EditProductFormInput | PartialSellFormInputType>
								>
							}
						/>
					))}
				</section>
				<DialogFooter>
					<Button type="submit" className="mt-2 h-10 text-sm" onClick={onEditProductData}>
						{isDraft ? "Publish" : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
