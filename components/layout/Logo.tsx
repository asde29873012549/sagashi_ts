import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utility/utils";

export default function Logo({ className = "" }: { className: string }) {
	return (
		<Link href="/" className={cn("relative aspect-[3/2] hover:cursor-pointer", className)}>
			<Image
				src="/sagashi_logo.webp"
				alt="Sagashi_logo"
				width={300}
				height={205}
				sizes="(max-width: 768px) 35vw, (max-width: 1200px) 20vw, 15vw"
				priority={true}
			/>
		</Link>
	);
}
