export interface AppResponse<T> {
	result: "success" | "error";
	data: T | null;
	statusCode: number;
	message: string;
}

export interface AppSuccessResponse<T> {
	result: "success";
	data: T;
	statusCode: number;
	message: string;
}

export interface AppErrorResponse {
	result: "error";
	data: null;
	statusCode: number;
	message: string;
}

