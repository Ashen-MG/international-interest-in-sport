import axios from "axios";
import config from "config";

/** Use this API provider to make secretary calls. */
export const secretaryAxiosProvider = axios.create({
	baseURL: config.API_URL,
	headers: {
		"Content-Type": "application/json"
	}
});

secretaryAxiosProvider.interceptors.request.use((config) => {
	// add token to the headers
	if (config.headers !== undefined)
		config.headers["Authorization"] = `Bearer ${localStorage.getItem("secretaryAccessToken")}`;
	return config;
});

export const setupInterceptors = (history: any) => {
	secretaryAxiosProvider.interceptors.response.use((response) => {
		return response;
	}, (error) => {
		if (error.response.status === 401) {
			localStorage.removeItem("secretaryAccessToken");
			history.push("/auth/secretary/login");
			window.location.reload();
		}
		return Promise.reject(error);
	});
}