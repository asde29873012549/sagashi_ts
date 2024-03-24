import Document, { Html, Head, Main, NextScript } from "next/document";

export default function CustomDocument({ nonce }: { nonce: string }) {
	return (
		<Html lang="en">
			<Head nonce={nonce} />
			<body>
				<Main />
				<NextScript data-nonce={nonce} />
			</body>
		</Html>
	);
}

CustomDocument.getInitialProps = async (context: any) => {
	const initialProps = await Document.getInitialProps(context);
	return {
		...initialProps,
		// x-nonce header set in middleware.ts
		nonce: context.req?.headers["x-nonce"],
	};
};
