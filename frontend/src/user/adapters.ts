/** API adapters for the user part of the app. */

import {generalAxiosProvider as axios} from "app/axios_provider";
import {AxiosResponse} from "axios";

//------------- For the success ---------

export type successType = {
    country_name: string,
    points: number,
    order: number
}

export interface ApiListSuccess {
    message: string,
    data: {
        success: successType[]
    }
}

export const apiListSuccess = ()
    : Promise<AxiosResponse<ApiListSuccess>> =>
{
    return axios.get("/user/success");

}

export interface ApiSuccessType {
    data: {
        code: string
    }
}


export const apiSuccess = (code: string)
    : Promise<AxiosResponse<ApiListSuccess>> =>
{
    return axios.post("/user/success",{ code:code });
}

//---------- For the chart ----------
export type chartType = {
    code: number,
    title: string,
    value: number,
    order: number
}

export interface ApiListChart {
    message: string,
    data: {
        chart: chartType[]
    }
}

export const apiListChart = ()
    : Promise<AxiosResponse<ApiListChart>> =>
{
    return axios.get("/user/chart");

}

export interface ApiChartType {
    data: {
        code: string
    }
}


export const apiChart = (code: string): Promise<AxiosResponse<ApiListChart>> => {
    return axios.get(`/user/${code}/chart`);
}

//---------- For the interconnectness type ----------


export type interconnectnessTypeType = {
    code: number,
    title: string
}

export interface ApiListInterconnectnessTypeType {
    message: string,
    data: {
        interconnectnesstype: interconnectnessTypeType[]
    }
}

export const apiListInterconnectnessType = ()
    : Promise<AxiosResponse<ApiListInterconnectnessTypeType>> =>
{

    return axios.get("/user/interconnectnesstype");
}



//---------- For the interconnectness ----------

export type interconnectnessType = {
    code: string,
    country: string,
    value: number,
    type: string
}

export interface ApiListInterconnectness {
    message: string,
    data: {
        interconnectness: interconnectnessType[]
    }
}


export interface ApiInterconnectnessType {
    data: {
        typeid: string,
        code: string
    }
}

export const apiInterconnectness = (typeid: number, code: string): Promise<AxiosResponse<ApiListInterconnectness>> => {
    return axios.get(`/user/${code}/${typeid}/interconnectedness`);
}

//------------- For the Funding---------


export type fundingType = {
    branch_id: number,
    absolute_funding: number,
    currency: string
}

export interface ApiListFunding {
    message: string,
    data: {
        funding: fundingType[]
    }
}

export const apiListFunding = ()
    : Promise<AxiosResponse<ApiListFunding>> =>
{
    return axios.get("/user/funding");

}

export const apiFunding = (code: string): Promise<AxiosResponse<ApiListFunding>> => {
    return axios.get(`/user/${code}/funding`);
}

//For the sports

export type sportType = {
    code: string,
    title: string
}

export interface ApiListSportType {
    message: string,
    sports: sportType[]
}

export const apiListSport = ()
    : Promise<AxiosResponse<ApiListSportType>> =>
{

    return axios.get("/user/sports");
}