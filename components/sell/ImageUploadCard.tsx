import PhotoCrop from "@/components/sell/PhotoCrop";
import { Fragment, useState, useRef, ChangeEvent } from "react";
import { mobileFormInput } from "@/redux/sellSlice";
import { useDispatch } from "react-redux";
import { EditProductFormInput, PartialSellFormInputType, PhotoBlobKey } from "@/lib/types/global";
import { type Crop } from "react-image-crop";
import { cn } from "@/lib/utility/utils";
import Spinner from "@/components/layout/Spinner";
import { useToast } from "../base/use-toast";
import { uploadImageFailure } from "@/lib/utility/userMessage";

const cropAspet = 4 / 5;
const NEXT_PUBLIC_SERVER_DOMAIN = process.env.NEXT_PUBLIC_SERVER_DOMAIN;

interface BaseImageUploadCardProps {
	id: PhotoBlobKey;
	formInput: PartialSellFormInputType | EditProductFormInput;
	initialBgImage?: string;
	noBackDrop?: boolean;
}

type ImageUploadCardProps =
	| (BaseImageUploadCardProps & {
			setFormInput: React.Dispatch<
				React.SetStateAction<PartialSellFormInputType | EditProductFormInput>
			>;
	  })
	| (BaseImageUploadCardProps & { dispatchFormInput: boolean });

export default function ImageUploadCard({
	id,
	formInput,
	initialBgImage,
	noBackDrop,
	...props
}: ImageUploadCardProps) {
	const setFormInput = "setFormInput" in props ? props.setFormInput : undefined;
	const dispatchFormInput = "dispatchFormInput" in props ? props.dispatchFormInput : false;

	const [imgSrc, setImgSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState<Crop>();
	const [bufferImage, setBufferImage] = useState<ArrayBuffer | string>("");
	const [croppedBackground, setCroppedBackground] = useState<string>("");
	const [shouldShowSpinner, setShouldShowSpinner] = useState<boolean>(false);
	const imageCardRef = useRef<HTMLLabelElement>(null);
	const cameraIconRef = useRef<HTMLDivElement>(null);
	const cancelIconRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	const { toast } = useToast();

	const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader();
			const bufferReader = new FileReader();
			reader.readAsDataURL(e.target.files[0]);
			bufferReader.readAsArrayBuffer(e.target.files[0]);
			reader.addEventListener("load", () =>
				setImgSrc(reader.result ? reader.result.toString() : ""),
			);
			bufferReader.addEventListener("load", () =>
				setBufferImage(bufferReader.result ? bufferReader.result : ""),
			);
		}
	};

	const onFinishCrop = async () => {
		let timeoutId: ReturnType<typeof setTimeout> | string = "";
		// remove the crop area
		setImgSrc(null);
		setCrop(undefined);

		setShouldShowSpinner(true);
		const minLoadingTime = 300;

		const imageCardNode = imageCardRef.current!;
		const cameraIconNode = cameraIconRef.current!;
		const cancelIconNode = cancelIconRef.current!;

		const formData = new FormData();
		formData.append("originalImage", new Blob([bufferImage]));
		if (crop) {
			formData.append(
				"cropInfo",
				JSON.stringify({
					cropInfo: {
						left: crop.x,
						top: crop.y,
						width: crop.width,
						height: crop.height,
					},
				}),
			);
		}

		try {
			const imgResponsePromise = fetch(`${NEXT_PUBLIC_SERVER_DOMAIN}/api/cropImage`, {
				method: "POST",
				body: formData,
			});

			const timeoutPromise = new Promise((resolve) => {
				timeoutId = setTimeout(() => {
					setShouldShowSpinner(false);
					resolve(true);
				}, minLoadingTime);
			});

			const [response, _] = await Promise.all([imgResponsePromise, timeoutPromise]);

			if (!response.ok) {
				const error = await response.json();
				console.log(error);
			} else {
				const data = await response.blob();
				const imageURL = URL.createObjectURL(data);
				setCroppedBackground(imageURL);
				if (dispatchFormInput) {
					dispatch(mobileFormInput({ key: "photos", value: { ...formInput.photos, [id]: data } }));
				} else {
					if (setFormInput)
						setFormInput({ ...formInput, photos: { ...formInput.photos, [id]: data } });
				}
				imageCardNode.style.backgroundImage = `url(${imageURL})`;
				// imageCardNode.style.backgroundSize = "contain";
				cameraIconNode.style.display = "none";
				cancelIconNode.style.display = "block";
			}
		} catch (err) {
			toast({
				title: uploadImageFailure.title,
				description: uploadImageFailure.desc,
				status: uploadImageFailure.status,
			});
		} finally {
			timeoutId && clearTimeout(timeoutId);
		}
	};

	const onCancelCrop = () => {
		croppedBackground && URL.revokeObjectURL(croppedBackground);
		setImgSrc(null);
		setCrop(undefined);
	};

	const onCancelIconClick = () => {
		const imageCardNode = imageCardRef.current!;
		const cameraIconNode = cameraIconRef.current!;
		const cancelIconNode = cancelIconRef.current!;

		imageCardNode.style.backgroundImage = "";
		cancelIconNode.style.display = "none";
		cameraIconNode.style.display = "inline-block";

		const newFormInput = { ...formInput };
		if (newFormInput.photos) delete newFormInput.photos[id];

		if (dispatchFormInput) {
			dispatch(mobileFormInput({ key: "photos", value: newFormInput }));
		} else {
			if (setFormInput) setFormInput(newFormInput);
		}

		setImgSrc(null);
	};

	return (
		<Fragment>
			{shouldShowSpinner && <Spinner />}
			<PhotoCrop
				imgSrc={imgSrc}
				setCrop={setCrop}
				crop={crop}
				onFinishCrop={onFinishCrop}
				onCancelCrop={onCancelCrop}
				cropAspet={cropAspet}
				noBackDrop={noBackDrop}
			/>
			<div className="relative">
				<div
					ref={cancelIconRef}
					onClick={() => onCancelIconClick()}
					className="absolute right-2 top-2 z-1 hidden"
					style={{ display: `${initialBgImage ? "block" : "none"}` }}
				>
					<FilledCancel className="h-6 w-6 fill-foreground hover:cursor-pointer hover:fill-destructive" />
				</div>
				<label
					ref={imageCardRef}
					className={
						"relative flex aspect-[4/5] items-center justify-center rounded-md bg-gray-100 bg-contain transition-transform duration-700 hover:scale-105 hover:cursor-pointer"
					}
					style={{ backgroundImage: `url(${initialBgImage || ""})` }}
				>
					<div ref={cameraIconRef} style={{ display: `${initialBgImage ? "none" : "block"}` }}>
						<FilledCamera className="h-6 w-6" />
					</div>
					<input
						type="file"
						accept="image/png, image/jpg, image/jpeg, image/webp"
						className="hidden"
						multiple={false}
						onChange={onSelectFile}
					/>
				</label>
			</div>
		</Fragment>
	);
}

function FilledCamera({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={cn("h-6 w-6", className)}
		>
			<path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
			<path
				fillRule="evenodd"
				d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function FilledCancel({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={cn("h-6 w-6 cursor-pointer hover:text-rose-800", className)}
		>
			<path
				fillRule="evenodd"
				d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
				clipRule="evenodd"
			/>
		</svg>
	);
}
