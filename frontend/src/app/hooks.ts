import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import {useEffect, useState} from "react";
import {useMutation, useQuery} from "react-query";
import createSnackbar, {dismissSnackbar, resolveSnackbar, SnackTypes} from "../components/snackbar/Snackbar";
import {AxiosResponse} from "axios";
import {apiListCountries, Country} from "app/adapters";
import textLang, {Language} from "app/string";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Custom hook that wraps:
 *    - snackbar (from initial message and loading to success/error response) with default messages in language `language`
 *    - making API call with provided `apiFetchFunction`
 *    - caching (by unique values of `queryKey` and `apiFetchFunction`
 *  @returns loading and response states
 * */
export const useQueryWithNotifications = (
	toastId: string,
	queryKey: string,
	apiFetchFunction: (...args: any[]) => Promise<AxiosResponse<any>>,
	initToastMsg: string,
	cache: boolean = true,
	language: Language = "sk"
) => {
	const {isLoading, data: response} = useQuery(queryKey, apiFetchFunction, {
		onSuccess: (successResponse) => {
			if (response === undefined)
				resolveSnackbar(toastId, textLang[language].dataSuccessfullyLoaded);
		},
		onError: (error) => {
			console.log(error);
			if (response === undefined)
				resolveSnackbar(toastId, textLang[language].unableToLoadData, false);
		},
		cacheTime: cache ? undefined : 0
	});

	useEffect(() => {
		if (isLoading)
			createSnackbar(initToastMsg, SnackTypes.loading, false, toastId);
	}, [isLoading]);

	useEffect(() => { return () => dismissSnackbar(toastId) }, []);

	return { isLoading, response };
}

/**
 * Same logic as for `useQueryWithNotifications`, except this custom hook returns react-query' mutation that can be
 * further more used to make API calls anytime.
 * */
export const useMutationWithNotifications = (
	toastId: string,
	apiFetchFunction: (...args: any[]) => Promise<AxiosResponse<any>>,
	initToastMsg: string,
	language: Language = "sk",
	runOnSuccess?: Function
) => {
	const successToastMsg: string = textLang[language].dataSuccessfullySaved
	const errorToastMsg: string = textLang[language].unableToSaveData
	const mutation = useMutation(apiFetchFunction, {
		onSuccess: (successResponse) => {
			resolveSnackbar(toastId, successToastMsg);
			if (runOnSuccess) runOnSuccess();
		},
		onError: (error: any) => {
			resolveSnackbar(toastId, errorToastMsg, false);
		},
	});

	useEffect(() => {
		if (mutation.isLoading)
			createSnackbar(initToastMsg, SnackTypes.loading, false, toastId);
	}, [mutation.isLoading]);

	useEffect(() => { return () => dismissSnackbar(toastId) }, []);

	return mutation;
}

export const useCountries = (language: Language = "sk"): { isLoading: boolean, countries: Country[] } => {
	const toastId = "countries_fetching";
	const toastMsg = textLang[language].loadingCountries;
	const queryKey = "list_countries";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiListCountries, toastMsg, true, language
	);

	const [countries, setCountries] = useState<Country[]>([]);

	useEffect(() => {
		if (response !== undefined)
			setCountries(response.data.countries);
	}, [response]);

	return { isLoading, countries };
}