/**
 * API adapters to be used by anyone anywhere.
 * All API here urls should start with "/".
 */

import {AxiosResponse} from "axios";
import {generalAxiosProvider as axios} from "app/axios_provider";

export interface Country {
	name: string,
	code: string
}
export interface ApiListCountries {
	message: string,
	countries: Country[]
}

export const apiListCountries = (): Promise<AxiosResponse<ApiListCountries>> => {
	return axios.get("/countries");
}