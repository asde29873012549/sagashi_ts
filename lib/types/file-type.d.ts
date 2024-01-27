declare module "file-type" {
	export function fileTypeFromFile(arg: string): Promise<{ mime: string; ext: string } | undefined>;
}
