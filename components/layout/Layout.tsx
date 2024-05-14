import { Fragment } from "react";
import NavBar from "./NavBar";
import RegisterForm from "../general/RegisterForm";
import Footer from "./Footer";
import { Toaster } from "@/components/base/toaster";
import Loading from "@/components/layout/Loading";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Fragment>
			<RegisterForm />
			{/* {isUsingMobile() ? <MobileHeader /> : <Header />} */}
			<Header />
			<NavBar />
			<main>{children}</main>
			<Footer />
			<Toaster />
			<Loading />
		</Fragment>
	);
}

//
