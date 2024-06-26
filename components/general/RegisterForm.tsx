import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/base/tabs";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Button } from "@/components/base/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/base/card";
import SmallSpinner from "../layout/SmallSpinner";
import { Checkbox } from "../base/checkbox";

import { userSelector, toggleRegisterForm } from "../../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";
import register from "@/lib/queries/fetchQuery";

import { useState } from "react";
import DOMPurify from "dompurify";
import Check from "../svg/check";
import { useRouter } from "next/router";

export default function RegisterForm() {
	const dispatch = useDispatch();
	const router = useRouter();
	const { user } = router.query;
	const registerFormStatus = useSelector(userSelector).isRegisterFormActive;
	const [currentTab, setCurrentTab] = useState<string>("login");
	const [loginBtnText, setLoginBtnText] = useState<React.ReactNode>("SIGN IN");
	const [registerBtnText, setRegisterBtnText] = useState<React.ReactNode>("REGISTER");
	const [error, setError] = useState<string>("");
	const [info, setInfo] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [isChecked, setIsChecked] = useState<boolean>(true);
	const [formInput, setFormInput] = useState<{ username: string; password: string }>({
		username: typeof window !== "undefined" ? localStorage.getItem("username") ?? "" : "",
		password: "",
	});

	const [registerFormInput, setRegisterFormInput] = useState({
		username: "",
		password: "",
		email: "",
	});

	if (user && user === "invalid") {
		dispatch(toggleRegisterForm());
	}

	const onToggleRegisterForm = () => dispatch(toggleRegisterForm());

	const onFormInput = (e: React.ChangeEvent<HTMLInputElement>, form: string) => {
		setFormInput({ ...formInput, [form]: e.target.value });
		if (error || info) {
			setError("");
			setInfo("");
		}
	};

	const onRegisterFormInput = (e: React.ChangeEvent<HTMLInputElement>, form: string) => {
		setRegisterFormInput({ ...registerFormInput, [form]: e.target.value });
		if (error || info) {
			setError("");
			setInfo("");
		}
	};

	const onSignIn = async () => {
		setLoading(true);
		setLoginBtnText(<SmallSpinner />);
		if (isChecked) localStorage.setItem("username", formInput.username);
		try {
			const result = await signIn("credentials", {
				username: DOMPurify.sanitize(formInput.username),
				password: formInput.password,
				redirect: false,
			});

			if (result && result.error) {
				throw new Error(result.error);
			} else {
				dispatch(toggleRegisterForm());
				setFormInput({ username: "", password: "" });
			}
		} catch (error) {
			setError((error as Error).message);
		} finally {
			setLoginBtnText("LOGIN");
			setLoading(false);
		}
	};

	const onGoogleSignIn = async () => {
		try {
			await signIn("google", {
				redirect: false,
			});

			dispatch(toggleRegisterForm());
		} catch (error) {
			setError((error as Error).message);
		}
	};

	const onRegister = async () => {
		setLoading(true);
		setRegisterBtnText(<SmallSpinner />);
		try {
			const result = await register({
				uri: "/user/register",
				method: "POST",
				body: registerFormInput,
			});

			if (result.error) {
				throw new Error(result.error);
			} else {
				// dispatch(toggleRegisterForm());
				setRegisterFormInput({ username: "", password: "", email: "" });
				setTimeout(() => {
					setRegisterBtnText(<Check />);
					setLoading(false);
					setTimeout(() => {
						setCurrentTab("login");
						setInfo("WELCOME ! PLEASE LOGIN !");
						setRegisterBtnText("REGISTER");
					}, 750);
				}, 1000);
			}
		} catch (error) {
			setError((error as Error).name);
			setRegisterBtnText("REGISTER");
		}
	};

	const onCheckedChange = () => {
		setIsChecked((c) => !c);
		localStorage.removeItem("username");
	};

	return (
		<div>
			<Tabs
				value={currentTab}
				onValueChange={setCurrentTab}
				className={
					"opacity-1 visible fixed inset-0 z-30 m-auto h-4/6 max-h-max w-9/12 min-w-fit max-w-max transition-opacity duration-1000 " +
					(!registerFormStatus && "invisible opacity-0")
				}
			>
				<TabsList
					className={`grid w-full grid-cols-2 ${!registerFormStatus && "invisible opacity-0"}`}
				>
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="register">Register</TabsTrigger>
				</TabsList>
				<TabsContent value="login">
					<Card className="h-4/6 max-h-max w-9/12 min-w-fit max-w-max">
						<CardHeader className="mb-2 flex items-center justify-center">
							<CardTitle>LOGIN</CardTitle>
							<div className={`text-xs ${error ? "text-red-700" : "text-emerald-500"}`}>
								{error || info}
							</div>
						</CardHeader>
						<CardContent>
							<div className="mb-2 space-y-1 md:mb-6">
								<Label htmlFor="username">USERNAME</Label>
								<Input
									id="username"
									placeholder="username"
									className="w-80 text-base placeholder:text-gray-500"
									onChange={(e) => onFormInput(e, "username")}
									value={formInput.username}
								/>
							</div>
							<div className="mb-5 space-y-1 md:mb-8">
								<Label htmlFor="password">PASSWORD</Label>
								<Input
									id="password"
									placeholder="password"
									className="w-80 text-base placeholder:text-gray-500"
									type="password"
									value={formInput.password}
									onChange={(e) => onFormInput(e, "password")}
									onKeyDown={(e) => e.key === "Enter" && onSignIn()}
								/>
							</div>
							<Button className="mb-2 w-full" onClick={onSignIn} disabled={loading}>
								{loginBtnText}
							</Button>
							<div className="mb-3 flex w-full justify-between text-xs">
								<span className="flex items-center">
									<Checkbox
										className="mr-2"
										id="rememberMe"
										checked={isChecked}
										onCheckedChange={onCheckedChange}
									/>
									<label htmlFor="rememberMe" className="cursor-pointer">
										REMEMBER ME
									</label>
								</span>
								<span className="ml-1 cursor-pointer hover:underline">FORGOT PASSWORD ?</span>
							</div>
							<div className="flex items-center justify-center">
								<div className="space-y-1">OR</div>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col">
							<Button variant="outline" className="mb-2 w-full" onClick={onGoogleSignIn}>
								Sign in With Google
							</Button>
							<Button variant="outline" className="w-full">
								Sign in With FaceBook
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
				<TabsContent value="register">
					<Card className="h-4/6">
						<CardHeader className="mb-2 flex items-center justify-center">
							<CardTitle>REGISTER</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-1 md:mb-6">
								<Label htmlFor="rg_username">USERNAME</Label>
								<Input
									id="rg_username"
									placeholder="username"
									className="w-80 text-base placeholder:text-gray-500"
									value={registerFormInput.username}
									onChange={(e) => onRegisterFormInput(e, "username")}
								/>
							</div>
							<div className="space-y-1 md:mb-6">
								<Label htmlFor="rg_password">PASSWORD</Label>
								<Input
									id="rg_password"
									placeholder="password"
									className="w-80 text-base placeholder:text-gray-500"
									value={registerFormInput.password}
									type="password"
									onChange={(e) => onRegisterFormInput(e, "password")}
								/>
							</div>
							<div className="space-y-1 md:mb-6">
								<Label htmlFor="rg_email">EMAIL</Label>
								<Input
									id="rg_email"
									placeholder="yourEmail@example.com"
									className="w-80 text-base placeholder:text-gray-500"
									value={registerFormInput.email}
									onChange={(e) => onRegisterFormInput(e, "email")}
								/>
							</div>
						</CardContent>
						<CardFooter>
							<Button className="w-full" onClick={onRegister} disabled={loading}>
								{registerBtnText}
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
			<div
				className={
					"opacity-1 visible fixed z-20 h-screen w-screen bg-[rgba(0,0,0,0.7)] transition-opacity duration-700 " +
					(!registerFormStatus && "invisible opacity-0")
				}
				onClick={onToggleRegisterForm}
			></div>
		</div>
	);
}
