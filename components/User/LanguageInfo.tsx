export default function LanguageInfo({ sheet = "" }: { sheet?: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<div>English</div>
			{sheet}
		</div>
	);
}
