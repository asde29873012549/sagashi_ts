import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { useState, Fragment } from "react";

export default function ChangePasswordSheet({
	setOpen,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [oldPassword, setOldPassword] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");

	const onChangeOld = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOldPassword(e.target.value);
	};

	const onChangeNew = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewPassword(e.target.value);
	};

	const onCancel = () => {
		setOpen(false);
	};
	return (
		<Fragment>
			<div className="flex w-full flex-col items-start space-y-4">
				<div>Old Password</div>
				<Input className="w-full" type="password" value={oldPassword} onChange={onChangeOld} />
				<div>New Password</div>
				<Input className="w-full" type="password" value={newPassword} onChange={onChangeNew} />
			</div>
			<div className="absolute bottom-0 right-0 w-full px-6">
				<Button className="mb-4 w-full">SAVE</Button>
				<Button variant="destructive" className="mb-4 w-full" onClick={onCancel}>
					CANCEL
				</Button>
			</div>
		</Fragment>
	);
}
