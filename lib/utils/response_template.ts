class Response<T> {
	data: T;
	constructor(data: T) {
		this.data = data;
	}

	success() {
		return {
			status: "success",
			data: this.data,
		};
	}

	fail() {
		return {
			status: "fail",
			data: this.data instanceof Error ? this.data.message : "",
		};
	}
}

export default Response;
