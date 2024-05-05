import { useSelector } from "react-redux";
import { loadingSelector } from "../../redux/loadingSlice";

export default function Loading() {
	const isLoadingActive = useSelector(loadingSelector).active;
	return (
		<div
			className={
				isLoadingActive
					? `fixed inset-0 z-[1000] flex h-screen w-screen items-center justify-center bg-black/70`
					: "hidden"
			}
		>
			<div className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white">
				<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" />
			</div>
		</div>
	);
}
