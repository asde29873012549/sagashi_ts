export interface ApiResponse<Data> {
	status: "success" | "fail";
	data: Data;
}
