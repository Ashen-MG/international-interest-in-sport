import {Table, TableCellComponent, TableColumnNameType} from "components/table/Table";
import React, {useContext, useEffect, useState} from "react";
import {Form} from "react-bootstrap";
import {RowWithSuggestion} from "./Suggestions";
import {useAppDispatch, useAppSelector} from "app/hooks";
import {RootState} from "app/store";
import {
	setCorrections, updateBranchTitle, updateBranchCode, updateSportTitle, clearState, Correction
} from "admin_secretary_shared/components/upload_funding_data/correctionsSlice";
import textLang, {Language} from "../../../app/string";
import {LanguageContext} from "../../../App";

interface SuggestionsTableProps {
	suggestions: RowWithSuggestion[],
	editing?: boolean
}

/** Table of suggestions with options to make corrections. */
export const SuggestionsTable = ({suggestions, editing = true}: SuggestionsTableProps) => {

	const dispatch = useAppDispatch();

	const language = useContext<Language>(LanguageContext);
	const text = textLang[language];

	const columnNames: TableColumnNameType[] = [
		{name: text.rowInCSV, sortable: false},
		{name: text.sportCode, sortable: false},
		{name: text.oldSportTitle, sortable: false},
		{name: text.newSportTitle, sortable: false},
		{name: text.oldBranchCode, sortable: false},
		{name: text.newBranchCode, sortable: false},
		{name: text.oldBranchTitle, sortable: false},
		{name: text.newBranchTitle, sortable: false}
	];

	const [rows, setRows] = useState<TableCellComponent[][]>([]);

	/** Create table rows with suggestions. */
	useEffect(() => {
		const _corrections: Correction[] = [];
		setRows(suggestions.map((s) => {
			_corrections.push({row: s.row, sportCode: s.sportCode, sportTitle: s.newSportTitle, branchCode: s.newBranchCode,
												 branchTitle: s.newBranchTitle});
			return [
				{value: s.row},
				{value: s.sportCode},
				{value: s.oldSportTitle},
				(s.newSportTitle.length === 0 || s.newSportTitle === s.oldSportTitle || !editing)
					? {value: s.newSportTitle}
					: {element: <SuggestionNewSportTitleCell row={s.row} />, value: ""},
				{value: s.oldBranchCode},
				(s.newBranchCode.length === 0 || s.newBranchCode === s.oldBranchCode || !editing)
					? {value: s.newBranchCode}
					: {element: <SuggestionNewBranchCodeCell row={s.row} />, value: ""},
				{value: s.oldBranchTitle},
				(s.newBranchTitle.length === 0 || s.newBranchTitle === s.oldBranchTitle || !editing)
					? {value: s.newBranchTitle}
					: {element: <SuggestionNewBranchTitleCell row={s.row} />, value: ""},
			];
		}));
		dispatch(setCorrections(_corrections));
	}, [suggestions]);

	useEffect(() => {
		return () => {
			dispatch(clearState());
		}
	}, []);

	return (
		<div>
	    <Table columnNames={columnNames} rows={rows} />
		</div>
  )
}

interface SuggestionCellProps {
	row: string
}

const SuggestionNewSportTitleCell = ({row}: SuggestionCellProps) => {
	const dispatch = useAppDispatch();
	const corrections = useAppSelector((state: RootState) => state.secretaryUploadCorrections.corrections);
	return (
		<Form.Control
			type="text"
			placeholder="Nová hodnota"
			value={corrections.find(c => c.row === row)!.sportTitle}
			onChange={(e) =>
				dispatch(updateSportTitle({row: row, sportTitle: (e.currentTarget as HTMLInputElement).value}))}
		/>
	)
}

const SuggestionNewBranchCodeCell = ({row}: SuggestionCellProps) => {
	const dispatch = useAppDispatch();
	const corrections = useAppSelector((state: RootState) => state.secretaryUploadCorrections.corrections);
	return (
		<Form.Control
			type="text"
			placeholder="Nová hodnota"
			value={corrections.find(c => c.row === row)!.branchCode}
			onChange={(e) =>
				dispatch(updateBranchCode({row: row, branchCode: (e.currentTarget as HTMLInputElement).value}))}
		/>
	)
}

const SuggestionNewBranchTitleCell = ({row}: SuggestionCellProps) => {
	const dispatch = useAppDispatch();
	const corrections = useAppSelector((state: RootState) => state.secretaryUploadCorrections.corrections);
	const [branchTitle, setBranchTitle] = useState<string>("");

	useEffect(() => {
		const _branchTitle = corrections.find(c => c.row === row)?.branchTitle;
		setBranchTitle(_branchTitle === undefined ? "" : _branchTitle);
	}, [corrections]);

	return (
		<Form.Control
			type="text"
			placeholder="Nová hodnota"
			value={branchTitle}
			onChange={(e) =>
				dispatch(updateBranchTitle({row: row, branchTitle: (e.currentTarget as HTMLInputElement).value}))}
		/>
	)
}