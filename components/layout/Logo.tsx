import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utility/utils";

export default function Logo({ className = "" }: { className: string }) {
	return (
		<Link href="/" className={cn("relative hover:cursor-pointer", className)}>
			<Image
				src="/sagashi_logo_2.webp"
				alt="Sagashi_logo"
				width={300}
				height={74}
				sizes="(max-width: 768px) 35vw, (max-width: 1200px) 20vw, 15vw"
				priority={true}
			/>
		</Link>
	);
}
