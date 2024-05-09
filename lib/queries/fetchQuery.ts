import * as dotenv from "dotenv";
import { genericError, unAuthorizedError } from "../utility/userMessage";

dotenv.config();

const NEXT_PUBLIC_SERVER_DOMAIN = process.env.NEXT_PUBLIC_SERVER_DOMAIN;
const BACKEND_SERVER = process.env.BACKEND_SERVER;

interface FetchQueryOptions {
	uri: string;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	body?: unknown;
	server?: boolean;
	isFormData?: boolean;
	token?: string | null;
}

const fetchQuery = async ({
	uri,
	method,
	body,
	server = false,
	isFormData = false,
	token = null,
}: FetchQueryOptions) => {
	const configObj: RequestInit = {
		method: method || "GET",
		credentials: "include",
	};

	if (method === "POST" || method === "PUT") {
		if (!body) throw new Error(genericError);

		configObj.body = isFormData ? (body as FormData) : JSON.stringify(body);
	}

	if (!isFormData) {
		configObj.headers = {
			"Content-Type": "application/json",
		};
	}

	const fetch_uri = server
		? `${BACKEND_SERVER}${uri}`
		: `${NEXT_PUBLIC_SERVER_DOMAIN}/api/proxy${uri}`;

	if (server) {
		configObj.headers = {
			...configObj.headers,
		};

		token && (configObj.headers = { ...configObj.headers, Authorization: `Bearer ${token}` });
	}

	try {
		const response = await fetch(fetch_uri, configObj);
		if (response.status === 401) {
			throw new Error(unAuthorizedError.title);
		}
		const res = await response.json();
		if (res.status === "fail") {
			throw new Error(res.data);
		}
		return res;
	} catch (err) {
		throw err;
	}
};

export default fetchQuery;
