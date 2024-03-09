import { useRef, useCallback } from "react";

interface IntersectionObserverProps {
	isFetchingNextPage: boolean;
	hasNextPage: boolean | undefined;
	fetchNextPage: () => void;
}

function useInterSectionObserver({
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
}: IntersectionObserverProps): (node: HTMLElement | null) => void {
	const observer = useRef<IntersectionObserver | null>(null);

	const lastElement = useCallback(
		(node: HTMLElement | null) => {
			if (isFetchingNextPage) return;
			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});

			if (node) observer.current.observe(node);
		},
		[hasNextPage],
	);

	return lastElement;
}

export default useInterSectionObserver;
