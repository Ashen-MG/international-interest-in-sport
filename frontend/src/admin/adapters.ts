/**
 * API adapters available only for an admin.
 * All API urls here should start with "/admin".
 */

import {AxiosResponse} from "axios";
import {adminAxiosProvider as axios} from "admin/axios_provider";

export interface ApiUploadFiles {
	fundingFile?: File,
	successFile?: File,
	interconnectednessFile?: File,
	bgsFile?: File,
	interconnectednessType?: number,
	countryCode?: string,
	currency?: string,
	fundingSource?: string, successSource?: string,
	interconnSource?: string,
	bgsSource?: string
}




export const apiUploadFiles = ({
	fundingFile,
	successFile,
	interconnectednessFile,
	bgsFile,
	interconnectednessType,
	countryCode,
	currency,
	fundingSource,
	successSource,
	interconnSource,
	bgsSource
	}: ApiUploadFiles): Promise<AxiosResponse<{}>> => {
	const formData = new FormData();
	if (fundingFile !== undefined)            formData.append("fundingFile", fundingFile);
	if (successFile !== undefined)            formData.append("successFile", successFile);
	if (interconnectednessFile !== undefined) formData.append("interconnectednessFile", interconnectednessFile);
	if (bgsFile !== undefined)            	  formData.append("bgsFile", bgsFile);
	formData.append("json", JSON.stringify(
		{countryCode: countryCode, currency: currency, interconnectednessType: interconnectednessType,
			fundingSource: fundingSource, successSource: successSource, interconnSource: interconnSource, bgsSource: bgsSource })
	);
	return axios.post("/admin/upload", formData);
}

export interface ApiAddNewCountryProps {
	name: string,
	translation: string,
	code: string
}

export const apiAddNewCountry = ({name, translation, code}: ApiAddNewCountryProps): Promise<AxiosResponse<{}>> => {
	return axios.post("/admin/countries/add", {name: name, translation: translation, code: code});
}

export interface apiUpdateSportProps {
	oldCode: string,
	newCode: string,
	newTitle: string
}

export const apiUpdateSport = ({oldCode, newCode, newTitle}: apiUpdateSportProps): Promise<AxiosResponse<{}>> => {
	return axios.put("/admin/sports/update", {oldCode: oldCode, newCode: newCode, newTitle: newTitle});
}

export interface ApiAddNewUserProps {
	email: string,
	password: string,
	type: string
}

export const ApiAddNewUser = ({email, password, type}: ApiAddNewUserProps): Promise<AxiosResponse<{}>> => {
	return axios.post("/admin/add_user/add", {email: email, password: password, type: type});
}
