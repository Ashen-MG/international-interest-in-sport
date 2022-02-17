/**
 * API adapters for a secretary.
 * All API here urls here should start with "/secretary".
 */

import {secretaryAxiosProvider as axios} from "secretary/axios_provider";
import {AxiosResponse} from "axios";
import {Correction} from "admin_secretary_shared/components/upload_funding_data/correctionsSlice";

export interface ApiListSportsType {
	message: string,
	data: {
		columnNames: string[],
		sports: string[][]
	}
}

export const apiListSports = ()
	: Promise<AxiosResponse<ApiListSportsType>> =>
{
	return axios.get("/secretary/sports");
}

export interface ApiUploadFundingProps {
	csvFile: File,
	countryCode: string,
	currency: string,
	corrections: Correction[]
}

export const apiUploadFunding = ({csvFile, countryCode, currency, corrections}: ApiUploadFundingProps): Promise<AxiosResponse<{}>> => {
	const _corrections: any = {};
	for (const correction of corrections) {
		_corrections[correction.row] = correction;
	}
	const formData = new FormData();
	formData.append("csvFile", csvFile);
	formData.append("json", JSON.stringify({countryCode: countryCode, currency: currency, correction: _corrections}))
	return axios.post("/secretary/funding/upload", formData);
}