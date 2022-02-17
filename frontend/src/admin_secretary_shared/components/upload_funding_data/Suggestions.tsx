import {Alert} from "react-bootstrap";
import {CenteredRow} from "components/basic/CenteredRow";
import {SuggestionsTable} from "./SuggestionsTable";
import React, {useContext} from "react";
import textLang, {Language} from "../../../app/string";
import {LanguageContext} from "../../../App";

export interface Suggestion {
	sportCode: string,
	oldBranchCode: string,
	oldSportTitle: string,
	oldBranchTitle: string,
	newBranchCode: string,
	newSportTitle: string,
	newBranchTitle: string,
	type: number
}

export type RowWithSuggestion = {row: string} & Suggestion;

export interface RowToSuggestion {
	[row: string]: Suggestion
}

interface SuggestionsProps {
	suggestions: RowWithSuggestion[],
	rowErrors: RowWithSuggestion[],
	numOfRealSuggestions: number,
	editing?: boolean
}

/** Errors and options to make corrections / leave suggestions after uploading a funding file. */
export const Suggestions = ({suggestions, rowErrors, numOfRealSuggestions, editing}: SuggestionsProps) => {

	const language = useContext<Language>(LanguageContext);
	const text = textLang[language];

	const rowErrorMessagesByErrorType: {[row: number]: string} = {
		2: text.uploadFundingErrorType2,
		3: text.uploadFundingErrorType3,
		5: text.uploadFundingErrorType5,
		6: text.uploadFundingErrorType6,
		7: text.uploadFundingErrorType7,
		8: text.uploadFundingErrorType8
	}

	if (rowErrors.length !== 0) {
		return (<>
			<Alert variant="danger">{text.uploadFundingErrorFoundMistakes}</Alert>
			<Alert variant="danger">
				{rowErrors.map((rowError, i) => { return (
					<p key={`csvRowError${i}`}>
						<b>{rowError.row}. {text.row}.</b> {rowErrorMessagesByErrorType[rowError.type]}
					</p>
				)})}
			</Alert>
		</>)
	}

	if (numOfRealSuggestions !== 0) {
		return (
			<section className={`mt-5`}>
				<header>
					<h2>
						{numOfRealSuggestions === 1 ? text.foundSingular : text.foundPlural}
						<span
							className={`text-warning`}> {numOfRealSuggestions} {numOfRealSuggestions === 1
																																		? text.inconsistencySingular
																																		: text.inconsistencyPlural}
						</span>
						<span> {text.inTheUploadedFile}:</span>
					</h2>
				</header>
				<div className={`mt-3`}>
					<SuggestionsTable suggestions={suggestions} editing={editing}/>
				</div>
			</section>
		)
	}

	return <></>
}