import { Label } from "@/components/base/label";
import { RadioGroup, RadioGroupItem } from "@/components/base/radio-group";
import { useState, Fragment } from "react";
import { Button } from "@/components/base/button";

export default function EditLanguageSheet({
	setOpen,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [radio, setRadio] = useState<string>("English");

	const onRadioSelect = (e: string) => {
		setRadio(e);
	};

	const onSaveLanguage = () => {
		setOpen(false);
	};

	const onCancel = () => {
		setOpen(false);
	};

	return (
		<Fragment>
			<RadioGroup
				defaultValue="English"
				className="flex-col"
				value={radio}
				onValueChange={onRadioSelect}
			>
				<div className="flex items-center space-x-1">
					<RadioGroupItem value="English" id="English" />
					<Label htmlFor="English">English</Label>
				</div>
				<div className="mb-3 mt-4 flex items-center space-x-1">
					<RadioGroupItem value="TraditionalChinese" id="TraditionalChinese" />
					<Label htmlFor="TraditionalChinese">Traditional Chinese</Label>
				</div>
			</RadioGroup>
			<div className="absolute bottom-0 right-0 w-full px-6">
				<Button className="mb-4 w-full" onClick={onSaveLanguage}>
					SAVE
				</Button>
				<Button variant="destructive" className="mb-4 w-full" onClick={onCancel}>
					CANCEL
				</Button>
			</div>
		</Fragment>
	);
}
