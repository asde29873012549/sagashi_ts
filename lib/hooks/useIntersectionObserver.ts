import { useRef, useCallback, ReactNode } from "react";

interface IntersectionObserverProps {
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	fetchNextPage: () => void;
}

function useInterSectionObserver({
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
}: IntersectionObserverProps) {
	const observer = useRef<IntersectionObserver>();

	const lastElement = useCallback(
		(node: HTMLElement) => {
			if (isFetchingNextPage) return;
			if (observer.current) {
				observer.current.disconnect();
			}
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
