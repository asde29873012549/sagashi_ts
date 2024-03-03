import * as dotenv from "dotenv";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { refreshAccessToken } from "@/lib/utils/utils";
import { UserJWTtype } from "@/lib/types/global";

import { genericError, loginError } from "@/lib/utils/userMessage";

dotenv.config();

const BACKEND_SERVER = process.env.BACKEND_SERVER;
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export default NextAuth({
	session: {
		maxAge: 60 * 60 * 24 * 30, // 30 days
	},
	providers: [
		CredentialsProvider({
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				try {
					const response = await fetch(`${BACKEND_SERVER}/user/login`, {
						method: "POST",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify({
							username: credentials?.username,
							password: credentials?.password,
						}),
					});

					// if the user input wrong credentials
					if (response.status === 403) throw new Error(loginError.wrongCredential);
					if (response.status === 404) throw new Error(loginError.notExist);
					if (response.status >= 400) throw new Error(genericError);

					const res = await response.json();

					const user = res.data;

					return user;
				} catch (err) {
					throw err;
				}
			},
		}),
		GoogleProvider({
			clientId: GOOGLE_CLIENT_ID!,
			clientSecret: GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "google" && "name" in user) {
				try {
					const response = await fetch(`${BACKEND_SERVER}/user/register`, {
						method: "POST",
						headers: {
							"content-type": "application/json",
						},
						body: JSON.stringify({
							name: user.name,
							email: user.email,
							avatar: user.image,
							locale: profile?.locale,
						}),
					});

					if (response.status === 403) throw new Error(loginError.emptyFields);
					if (response.status >= 400) throw new Error(genericError);

					const res = await response.json();
					user.google = res.data;
				} catch (err) {
					throw err;
				}
			}

			return user ? true : false;
		},
		async jwt({ token, user }) {
			if (user) {
				//  if user obj exists, check if its google or credential, and then make the returned user obj the token
				if ("google" in user && user.google) {
					token = user.google;
				} else {
					token = user as UserJWTtype;
				}
			}

			const unixTimeInSeconds = Math.floor(Date.now() / 1000);

			// if token expired, refresh the access token and return it, or return the token directly otherwise
			return unixTimeInSeconds < Number(token.accessTokenExpireTime)
				? token
				: await refreshAccessToken(token);
		},
		async session({ session, token }) {
			session.user = token;
			return session;
		},
	},
	secret: JWT_TOKEN_SECRET,
});
