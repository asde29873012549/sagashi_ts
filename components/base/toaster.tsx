import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/base/toast";
import { useToast } from "@/components/base/use-toast";

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(function ({ id, title, description, status, action, ...props }) {
				return (
					<Toast
						key={id}
						{...props}
						className="from-22% max-w-fit bg-gradient-to-bl from-cyan-800 via-slate-800 via-40% to-slate-950 to-90% text-background"
					>
						<div className="grid">
							{title && (
								<ToastTitle
									className={`text-base ${status === "fail" ? "text-red-500" : "text-lime-500"}`}
								>
									{title}
								</ToastTitle>
							)}
							{description && (
								<ToastDescription className="font-extralight">{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
