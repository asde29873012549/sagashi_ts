import NextAuth from "next-auth";
import { UserJWTtype } from "./global";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		user: UserJWTtype;
	}
	interface User extends UserJWTtype {
		google?: Omit<UserJWTtype, "google">;
	}
	interface SignIn {
		user: UserJWTtype | GoogleLoginUserType;
		account: any;
		profile: any;
	}
	interface Profile {
		locale: string;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends UserJWTtype {}
}
