import axios from "axios";
import config from "config";

/** Use this API provider to make calls that don't require any authentication e.g. user calls. */
export const generalAxiosProvider = axios.create({
	baseURL: config.API_URL,
	headers: {
		"Content-Type": "application/json"
	}
});