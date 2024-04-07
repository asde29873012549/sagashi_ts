import NextAuth from "next-auth";
import { UserJWT } from "./global";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		user: UserJWT;
	}
	interface User extends UserJWT {
		google?: Omit<UserJWT, "google">;
	}
	interface SignIn {
		user: UserJWT | GoogleLoginUserType;
		account: any;
		profile: any;
	}
	interface Profile {
		locale: string;
	}
}

declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends UserJWT {}
}
