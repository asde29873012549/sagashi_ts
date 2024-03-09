import { Button } from "@/components/base/button";
import Link from "next/link";

interface DesignerAlphabaticSecProps {
	alphabat: string;
	designers: string[];
	alphabatRef: React.MutableRefObject<Map<string, HTMLElement>>;
}

function DesignerAlphabaticSec({ alphabat, designers, alphabatRef }: DesignerAlphabaticSecProps) {
	const getMap = (ref: React.MutableRefObject<Map<string, HTMLElement>>) => {
		if (!ref.current) {
			ref.current = new Map();
		}
		return ref.current;
	};

	const getNode = (
		node: HTMLElement | null,
		key: string,
		ref: React.MutableRefObject<Map<string, HTMLElement>>,
	) => {
		const map = getMap(ref);
		if (!map.get(key)) {
			if (node) {
				map.set(key, node);
			}
		}
	};

	return (
		<section className="my-14">
			<h1
				className="my-4 text-2xl font-bold md:text-3xl"
				ref={(node) => getNode(node, `${alphabat}`, alphabatRef)}
			>
				{alphabat}
			</h1>
			<div className="flex flex-col space-y-1 text-xl md:grid md:grid-cols-3 md:gap-4 md:text-2xl md:font-light">
				{designers.map((designer) => {
					return (
						<Button
							key={designer}
							variant="ghost"
							className="focus-bg-transparent w-fit cursor-pointer p-0 text-xl hover:bg-transparent hover:underline active:bg-transparent"
							asChild
						>
							<Link href={`/designers/${designer}`}>{designer}</Link>
						</Button>
					);
				})}
			</div>
		</section>
	);
}

export default DesignerAlphabaticSec;
