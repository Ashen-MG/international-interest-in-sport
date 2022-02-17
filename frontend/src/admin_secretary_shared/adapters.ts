/**
 * API adapters for shared routes for an admin and secretary.
 * All API urls here should start with "/adminsecretary".
 */

import {adminsecretaryAxiosProvider as axios} from "admin_secretary_shared/axios_provider";
import {AxiosResponse} from "axios";

export interface ApiLoginResponseType {
	message: string,
	data: {
		accessToken?: string
	}
}

export type UserType = "secretary" | "admin";

export const apiLogin = (email: string, password: string, userType: UserType)
	: Promise<AxiosResponse<ApiLoginResponseType>> =>
{
	return axios.post(`/${userType}/login`, {
		"email": email,
		"password": password
	});
}

export interface ApiNewSportCode {
	message: string,
	newSportCode: string
}

export const apiGetNewSportCode = (): Promise<AxiosResponse<ApiNewSportCode>> => {
	return axios.get("/adminsecretary/sports/new-code");
}

export interface ApiAddNewSportProps {
	sportCode: string,
	sportTitle: string
}

export const apiAddNewSport = ({sportCode, sportTitle}: ApiAddNewSportProps): Promise<AxiosResponse<{}>> => {
	return axios.post("/adminsecretary/sports/add", {code: sportCode, title: sportTitle});
}

export interface ApiAddNewUncombiBranchProps {
	sportCode: string,
	branchCode: string,
	branchTitle: string
}

export const apiAddNewUncombiBranch = ({sportCode, branchCode, branchTitle}: ApiAddNewUncombiBranchProps): Promise<AxiosResponse<{}>> => {
	return axios.post("/adminsecretary/branches/add", {sportCode: sportCode, branchCode: branchCode, branchTitle: branchTitle});
}

export interface SubBranch {
	sportCode: string,
	branchCode: string,
	coefficient: number
}

export interface ApiAddNewCombiBranchProps {
	branchCode: string,
	branchTitle: string
	countryCode: string,
	subBranches: SubBranch[]
}

export const apiAddNewCombiBranch = ({branchCode, branchTitle, countryCode, subBranches}: ApiAddNewCombiBranchProps): Promise<AxiosResponse<{}>> => {
	return axios.post("/adminsecretary/combi-branches/add", {
		branchCode: branchCode,
		branchTitle: branchTitle,
		countryCode: countryCode,
		subBranches: subBranches
	});
}

export interface BranchWithSport {
	sportCode: string,
	sportTitle: string,
	branchCode: string,
	branchTitle: string
}

export interface ApiBranchesWithSports {
	message: string,
	branchesWithSports: BranchWithSport[]
}

export const apiGetBranchesWithSports = (): Promise<AxiosResponse<ApiBranchesWithSports>> => {
	return axios.get("/adminsecretary/branches-with-sports");
}

export interface CombiBranch {
	countryCode: string,
	countryName: string,
	combiCode: string,
	combiTitle: string,
	subCode: string,
	subTitle: string,
	coefficient: number
}

export interface ApiCombiBranches {
	message: string,
	combiBranches: CombiBranch[]
}

export const apiGetCombiBranches = (): Promise<AxiosResponse<ApiCombiBranches>> => {
	return axios.get("/adminsecretary/combi-branches");
}

export interface ApiNewCombiBranchCode {
	message: string,
	newCombiBranchCode: string
}

export const apiGetNewCombiBranchCode = (): Promise<AxiosResponse<ApiNewCombiBranchCode>> => {
	return axios.get("/adminsecretary/combi-branches/new-code");
}

export interface ApiNewBranchCode {
	message: string,
	newBranchCode: string
}

export const apiGetNewBranchCode = (sportCode: string): Promise<AxiosResponse<ApiNewBranchCode>> => {
	return axios.get(`/adminsecretary/sport/${sportCode}/branches/new-code`);
}

export interface Sport {
	title: string,
	code: string
}

export interface ApiSports {
	message: string,
	sports: Sport[]
}

export const apiGetSports = (): Promise<AxiosResponse<ApiSports>> => {
	return axios.get("/adminsecretary/sports");
}