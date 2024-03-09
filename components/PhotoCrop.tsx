import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import BlackCanvas from "@/components/layout/BlackCanvas";
import { Button } from "@/components/base/button";
import { centerAspectCrop } from "../lib/utils/utils";

interface PhotoCropProps {
	imgSrc: string | null;
	setCrop: (crop: Crop) => void;
	crop: Crop | undefined;
	onFinishCrop: () => void;
	onCancelCrop: () => void;
	cropAspet: number;
	noBackDrop?: boolean;
}

export default function PhotoCrop({
	imgSrc,
	setCrop,
	crop,
	onFinishCrop,
	onCancelCrop,
	cropAspet,
	noBackDrop,
}: PhotoCropProps) {
	const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		const { width, height } = e.currentTarget;
		setCrop(centerAspectCrop(width, height, cropAspet));
	};

	return (
		<>
			{imgSrc && (
				<>
					<div className="fixed inset-0 z-[30] flex flex-col items-center justify-center">
						<ReactCrop
							crop={crop}
							onChange={(_, percentCrop) => setCrop(percentCrop)}
							aspect={cropAspet}
						>
							<img alt="Crop me" src={imgSrc} onLoad={onImageLoad} className="h-[70vh] w-auto" />
						</ReactCrop>
						<div>
							<Button className="mt-10 hover:bg-slate-600" onClick={onFinishCrop}>
								CROP
							</Button>
							<Button className="ml-5 bg-destructive hover:bg-slate-600" onClick={onCancelCrop}>
								CANCEL
							</Button>
						</div>
					</div>
					{!noBackDrop && <BlackCanvas />}
				</>
			)}
		</>
	);
}
