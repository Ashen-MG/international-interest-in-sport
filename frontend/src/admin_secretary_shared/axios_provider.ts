import axios from "axios";
import config from "config";

export const adminsecretaryAxiosProvider = axios.create({
	baseURL: config.API_URL,
	headers: {
		"Content-Type": "application/json"
	}
});

adminsecretaryAxiosProvider.interceptors.request.use((config) => {
	// add token to the headers
	if (config.headers !== undefined) {
		if (localStorage.getItem("adminAccessToken") !== null)
			config.headers["Authorization"] = `Bearer ${localStorage.getItem("adminAccessToken")}`;
		else if (localStorage.getItem("secretaryAccessToken") !== null)
			config.headers["Authorization"] = `Bearer ${localStorage.getItem("secretaryAccessToken")}`;
	}
	return config;
});

export const setupInterceptors = (history: any) => {
	adminsecretaryAxiosProvider.interceptors.response.use((response) => {
		return response;
	}, (error) => {
		if (error.response.status === 401) {
			localStorage.removeItem("secretaryAccessToken");
			localStorage.removeItem("adminAccessToken");
			history.push("/");
			window.location.reload();
		}
		return Promise.reject(error);
	});
}