import {useQueryWithNotifications} from "app/hooks";
import {
	apiGetBranchesWithSports,
	apiGetCombiBranches,
	BranchWithSport,
	CombiBranch,
	apiGetNewSportCode, apiGetNewCombiBranchCode, Sport, apiGetSports
} from "admin_secretary_shared/adapters";
import {useEffect, useState} from "react";
import textLang, {Language} from "../app/string";

export const useNewSportCode = (language: Language = "sk"): { isLoading: boolean, newSportCode: string } => {
	const toastId = "getting_new_sport_code";
	const toastMsg = textLang[language].gettingNewSportCode;
	const queryKey = "get_new_sport_code";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiGetNewSportCode, toastMsg, false, language
	);

	const [newSportCode, setNewSportCode] = useState<string>("");

	useEffect(() => {
		if (response !== undefined)
			setNewSportCode(response.data.newSportCode);
	}, [response]);

	return { isLoading, newSportCode };
}

export const useBranchesWithSports = (language: Language = "sk"): { isLoading: boolean, branchesWithSports: BranchWithSport[] } => {
	const toastId = "fetching_branches_with_sports";
	const toastMsg = textLang[language].loadingSportsWithBranches;
	const queryKey = "get_branches_with_sports";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiGetBranchesWithSports, toastMsg, true, language
	);

	const [branchesWithSports, setBranchesWithSports] = useState<BranchWithSport[]>([]);

	useEffect(() => {
		if (response !== undefined)
			setBranchesWithSports(response.data.branchesWithSports);
	}, [response]);

	return { isLoading, branchesWithSports };
}

export const useCombiBranches = (language: Language = "sk"): { isLoading: boolean, combiBranches: CombiBranch[] } => {
	const toastId = "fetching_combi_branches";
	const toastMsg = textLang[language].loadingCombiBranches;
	const queryKey = "get_combi_branches";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiGetCombiBranches, toastMsg, true, language
	);

	const [combiBranches, setCombiBranches] = useState<CombiBranch[]>([]);

	useEffect(() => {
		if (response !== undefined)
			setCombiBranches(response.data.combiBranches);
	}, [response]);

	return { isLoading, combiBranches };
}

export const useNewCombiBranchCode = (language: Language = "sk"): { isLoading: boolean, newCombiBranchCode: string } => {
	const toastId = "getting_new_combi_branch_code";
	const toastMsg = textLang[language].gettingNewBranchCode;
	const queryKey = "get_new_combi_branch_code";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiGetNewCombiBranchCode, toastMsg, false, language
	);

	const [newCombiBranchCode, setNewCombiBranchCode] = useState<string>("");

	useEffect(() => {
		if (response !== undefined)
			setNewCombiBranchCode(response.data.newCombiBranchCode);
	}, [response]);

	return { isLoading, newCombiBranchCode };
}

export const useSports = (language: Language = "sk"): { isLoading: boolean, sports: Sport[] } => {
	const toastId = "fetching_sports";
	const toastMsg = textLang[language].loadingSports;
	const queryKey = "get_sports";

	const {isLoading, response} = useQueryWithNotifications(
		toastId, queryKey, apiGetSports, toastMsg, true, language
	);

	const [sports, setSports] = useState<Sport[]>([]);

	useEffect(() => {
		if (response !== undefined)
			setSports(response.data.sports);
	}, [response]);

	return { isLoading, sports };
}