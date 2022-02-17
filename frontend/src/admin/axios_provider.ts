import axios from "axios";
import config from "config";

/** Use this API provider to make admin calls. */
export const adminAxiosProvider = axios.create({
	baseURL: config.API_URL,
	headers: {
		"Content-Type": "application/json"
	}
});

adminAxiosProvider.interceptors.request.use((config) => {
	// add token to the headers
	if (config.headers !== undefined)
		config.headers["Authorization"] = `Bearer ${localStorage.getItem("adminAccessToken")}`;
	return config;
});

export const setupInterceptors = (history: any) => {
	adminAxiosProvider.interceptors.response.use((response) => {
		return response;
	}, (error) => {
		if (error.response.status === 401) {
			localStorage.removeItem("adminAccessToken");
			history.push("/auth/admin/login");
			window.location.reload();
		}
		return Promise.reject(error);
	});
}