import { Fragment } from "react";
import NavBar from "./NavBar";
import RegisterForm from "../RegisterForm";
import Footer from "./Footer";
import { Toaster } from "@/components/base/toaster";
import Loading from "@/components/layout/Loading";

import dynamic from "next/dynamic";

const Header = dynamic(import("./Header"), { ssr: false });
const MobileHeader = dynamic(import("../mobile/MobileHeader"), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
	const isUsingMobile = () => {
		if (typeof window !== "undefined") return window.innerWidth < 768; //&& navigator.maxTouchPoints > 0;
	};

	return (
		<Fragment>
			<RegisterForm />
			{isUsingMobile() ? <MobileHeader /> : <Header />}
			<NavBar />
			<main>{children}</main>
			<Footer />
			<Toaster />
			<Loading />
		</Fragment>
	);
}

//
