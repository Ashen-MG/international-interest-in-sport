import textLang, {Language} from "../app/string";
import {useEffect, useState} from "react";
import {useQueryWithNotifications} from "../app/hooks";
import {apiListInterconnectnessType, interconnectnessTypeType} from "./adapters";

export const useInterconnectednessType = (language: Language = "sk"): { isLoading: boolean, interconnectednessType: interconnectnessTypeType[] } => {
	const toastId = "interconnectedness_type_fetching";
	const toastMsg = textLang[language].loadingInterconnectednessType;
	const queryKey = "list_interconnectedness_type";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiListInterconnectnessType, toastMsg, true, language
	);

	const [interconnectednessType, setInterconnectednessType] = useState<interconnectnessTypeType[]>([]);

	useEffect(() => {
		if (response !== undefined)
			setInterconnectednessType(response.data.data.interconnectnesstype);
	}, [response]);

	return { isLoading, interconnectednessType };
}

