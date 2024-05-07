import { Fragment, useState, useRef, useMemo } from "react";

import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utility/utils";
import { Skeleton } from "../base/skeleton";

export default function Carousel({
	primary_image,
	secondary_images,
	className,
}: {
	primary_image: string;
	secondary_images: { [key: string]: string } | {};
	className?: string;
}) {
	const slides = useMemo(
		() => [primary_image, ...Object.values(secondary_images)],
		[primary_image, secondary_images],
	);

	const [imgLoaded, setImgLoaded] = useState<boolean>(false);
	const [direction, setDirection] = useState<number>(1);
	const carouselRef = useRef<HTMLDivElement>(null);
	const initialTouchRef = useRef<number>(0);
	const endingTouchRef = useRef<number>(0);
	const isSwiped = useRef<boolean>(true);
	const [currentImage, setCurrentImage] = useState<string>("0");
	const isTouchActiveRef = useRef<boolean>(false);

	const prevSlide = () => {
		if (direction > 0 && carouselRef.current) {
			const firstElementChild = carouselRef.current.firstElementChild;
			if (firstElementChild) {
				carouselRef.current.appendChild(firstElementChild);
			}
			setDirection((d) => d * -1);
		}
		handleTouchPrevSlide();
	};

	const nextSlide = () => {
		if (direction < 0 && carouselRef.current) {
			const lastElementChild = carouselRef.current.lastElementChild;
			if (lastElementChild) {
				carouselRef.current.prepend(lastElementChild);
			}
			setDirection((d) => d * -1);
		}
		handleTouchNextSlide();
	};

	const onTransitionEnd = () => {
		// Ensure carouselRef.current is not null before accessing its properties
		if (!isSwiped.current || isTouchActiveRef.current || !carouselRef.current) return;

		const carousel = carouselRef.current; // This makes code cleaner and ensures we only check carouselRef.current once

		if (direction > 0) {
			// Check that firstElementChild and lastElementChild are not null
			if (carousel.firstElementChild) carousel.appendChild(carousel.firstElementChild);
		} else {
			if (carousel.lastElementChild) carousel.prepend(carousel.lastElementChild);
		}

		carousel.style.transition = "none";
		carousel.style.transform = "translateX(0)";

		// Use an arrow function to ensure `carousel` refers to the correct element
		setTimeout(() => {
			carousel.style.transition = "transform 0.5s";
		});
	};

	const onTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
		e.preventDefault();
		isTouchActiveRef.current = true;
		initialTouchRef.current = e.touches[0].screenX;
	};
	const onTouchMove = (e: React.TouchEvent<HTMLImageElement>) => {
		endingTouchRef.current = e.touches[0].screenX;
		if (carouselRef.current)
			carouselRef.current.style.transform = `translateX(${
				endingTouchRef.current - initialTouchRef.current
			}px)`;
	};

	const onTouchEnd = () => {
		if (!carouselRef.current) return;
		isTouchActiveRef.current = false;
		const distance = endingTouchRef.current - initialTouchRef.current;
		const isDirectionChanged = distance * direction > 0;
		if (Math.abs(distance) > 30) {
			isSwiped.current = true;
			if (isDirectionChanged) {
				setDirection((d) => d * -1);
				if (distance < 0 && carouselRef.current.lastElementChild) {
					carouselRef.current.prepend(carouselRef.current.lastElementChild);
					handleTouchNextSlide();
				} else {
					if (carouselRef.current.firstElementChild) {
						carouselRef.current.appendChild(carouselRef.current.firstElementChild);
						handleTouchPrevSlide();
					}
				}
			} else {
				distance < 0 ? handleTouchNextSlide() : handleTouchPrevSlide();
			}
		} else {
			isSwiped.current = false;
			carouselRef.current.style.transform = "translateX(0px)";
		}

		initialTouchRef.current = 0;
		endingTouchRef.current = 0;
	};

	const handleTouchNextSlide = () => {
		if (!carouselRef.current) return;
		carouselRef.current.style.justifyContent = "flex-start";
		carouselRef.current.style.transform = `translateX(-${carouselRef.current.offsetWidth}px)`;
		return setCurrentImage(carouselRef.current.children[1].id);
	};

	const handleTouchPrevSlide = () => {
		if (!carouselRef.current) return;
		carouselRef.current.style.justifyContent = "flex-end";
		carouselRef.current.style.transform = `translateX(${carouselRef.current.offsetWidth}px)`;
		return setCurrentImage(carouselRef.current.children[slides.length - 2].id);
	};

	return (
		<Fragment>
			<div
				className={cn(
					"no-scrollbar relative aspect-[4/5] w-screen overflow-hidden md:w-2/5 md:overflow-scroll",
					className,
				)}
			>
				{!imgLoaded && <Skeleton className="h-full w-full" />}
				<div
					className="duration-400 flex h-full w-full justify-start transition-transform ease-out md:flex-col"
					ref={carouselRef}
					onTransitionEnd={onTransitionEnd}
				>
					{slides.map((slide, index) => (
						<div
							className="relative aspect-[4/5] w-screen shrink-0 md:w-full"
							key={index}
							id={String(index)}
						>
							<Image
								priority
								src={slide}
								fill={true}
								alt="image"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								onTouchStart={onTouchStart}
								onTouchMove={onTouchMove}
								onTouchEnd={onTouchEnd}
								onLoad={() => {
									index === 0 && setImgLoaded(true);
								}}
							/>
						</div>
					))}
				</div>
				{/* Left Arrow */}
				<div className="absolute left-5 top-[50%] -translate-x-0 translate-y-[-50%] cursor-pointer rounded-full bg-black/20 p-2 text-2xl text-white md:hidden">
					<ChevronLeft onClick={prevSlide} size={30} />
				</div>
				{/* Right Arrow */}
				<div className="absolute right-5 top-[50%] -translate-x-0 translate-y-[-50%] cursor-pointer rounded-full bg-black/20 p-2 text-2xl text-white md:hidden">
					<ChevronRight onClick={nextSlide} size={30} />
				</div>
			</div>
			<CarouselDots currentImage={currentImage} slides={slides} />
		</Fragment>
	);
}

function CarouselDots({ currentImage, slides }: { currentImage: string; slides: string[] }) {
	const carouselDotLength = slides.length === 1 ? "w-full" : `w-${Math.floor(48 / slides.length)}`;
	return (
		<div className={`m-auto flex h-10 w-36 items-center space-x-2 md:hidden`}>
			{slides.map((slide, index) => (
				<div
					className={`${
						currentImage == String(index)
							? `${carouselDotLength} shrink-0 bg-slate-400`
							: "w-4 shrink"
					} inline-block h-px rounded bg-border transition-all duration-500`}
					key={index}
				/>
			))}
		</div>
	);
}
