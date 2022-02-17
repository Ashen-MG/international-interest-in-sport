import {CenteredRow} from "components/basic/CenteredRow";
import {Dropzone, dropzoneFileProp} from "components/drag_and_drop/Dropzone";
import React, {useEffect, useState} from "react";
import createSnackbar, {SnackTypes} from "../../../components/snackbar/Snackbar";
import {useCountries, useMutationWithNotifications} from "../../../app/hooks";
import {apiUploadFiles} from "../../adapters";
import {currencies} from "../../../data/active_currency_codes";
import {Col, Form, Row} from "react-bootstrap";
import Select from "react-select";
import {useInterconnectednessType} from "../../../user/hooks";
import {RowToSuggestion, RowWithSuggestion, Suggestions} from "admin_secretary_shared/components/upload_funding_data/Suggestions";
import config from "../../../config";

const acceptedFundingFileExtensions = ".csv";
const acceptedSuccessFileExtensions = ".xlsx, .xlsm, .xltx, .xltm";
const acceptedInterconnectednessFileExtensions = acceptedSuccessFileExtensions;

interface UploadFundingError {
	message: string,
	suggestions: RowToSuggestion
}

/** Upload funding data.
 *  If there are any mistakes in the uploaded file, errors or suggestions will show up with option to re-upload
 *  the same file and corrections. This process might be repeated until all mistakes are resolved and successfully
 *  saved on the backend.
 * */
export const UploadData = () => {

	const [fundingFile, setFundingFile] = useState<dropzoneFileProp[]>([]);
	const [successFile, setSuccessFile] = useState<dropzoneFileProp[]>([]);
	const [interconnectednessFile, setInterconnectednessFile] = useState<dropzoneFileProp[]>([]);

	const {countries: responseCountries} = useCountries("en");
	const [countries, setCountries] = useState<{value: string, label: string}[]>([]);
	const [selectedCountry, setSelectedCountry] = useState<string | undefined>();

	const currencyOptions = currencies.map((currency) => { return {label: currency, value: currency} });
	const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();

	const {interconnectednessType} = useInterconnectednessType("en");
	const [interconnectednessOptions, setInterconnectednessOptions] = useState<{value: number, label: string}[]>([]);
	const [selectedInterconnectednessType, setSelectedInterconnectednessType] = useState<number | undefined>();

	useEffect(() => {
		setCountries(responseCountries.map((country) => { return {
			value: country.code, label: `${country.name} (${country.code})`
		}}));
	}, [responseCountries]);

	useEffect(() => {
		setInterconnectednessOptions(interconnectednessType.map((interconnectednessType) => { return {
			value: interconnectednessType.code, label: interconnectednessType.title
		}}));
	}, [interconnectednessType]);

	const uploadMutation = useMutationWithNotifications(
		"admin_upload", apiUploadFiles, "Uploading files...", "en"
	);

	const handleUploadSubmit = () => {
		if (fundingFile.length === 0 && successFile.length === 0 && interconnectednessFile.length === 0)
			createSnackbar("Please upload at least one source.", SnackTypes.warn);
		else if (fundingFile.length !== 0 && (selectedCountry === undefined || selectedCurrency === undefined))
			createSnackbar("Select country and currency.", SnackTypes.warn);
		else if (interconnectednessFile.length !== 0 && selectedInterconnectednessType === undefined)
			createSnackbar("Select interconnectedness type.", SnackTypes.warn);
		else {
			uploadMutation.mutate({
				fundingFile: fundingFile[0]?.file, successFile: successFile[0]?.file,
				interconnectednessFile: interconnectednessFile[0]?.file, countryCode: selectedCountry,
				currency: selectedCurrency, interconnectednessType: selectedInterconnectednessType
			});
		}
	}

	const [rowErrors, setRowErrors] = useState<RowWithSuggestion[]>([]);
	const [suggestions, setSuggestions] = useState<RowWithSuggestion[]>([]);  // suggestion type = 1 or type 4
	const [numOfRealSuggestions, setNumOfRealSuggestions] = useState<number>(0);

	useEffect(() => {
		setRowErrors([]);
		setSuggestions([]);
		setNumOfRealSuggestions(0);
	}, [fundingFile]);

	useEffect(() => {
		if (uploadMutation.error === null) return;
		const apiSuggestions: RowToSuggestion = (uploadMutation.error.response.data as UploadFundingError).suggestions;
		const _rowErrors: RowWithSuggestion[] = [], _suggestions: RowWithSuggestion[] = [];
		for (const [row, suggestion] of Object.entries(apiSuggestions)) {
			if (suggestion.type !== 1 && suggestion.type !== 4)
				_rowErrors.push({...suggestion, row: row});
			else
				_suggestions.push({...suggestion, row: row});
		}
		setRowErrors(_rowErrors);

		// update potential previous suggestions
		const _numOfRealSuggestions: number = _suggestions.length;
		const previousSuggestions: RowWithSuggestion[] = [...suggestions];
		for (const previousSuggestion of previousSuggestions) {
			const s = _suggestions.find(s => s.row === previousSuggestion.row);
			if (s === undefined)
				_suggestions.push(previousSuggestion);
		}
		setSuggestions(_suggestions);
		setNumOfRealSuggestions(_numOfRealSuggestions);
	}, [uploadMutation.error]);

	return (<>
		<CenteredRow as="header">
			<h1>Upload data</h1>
		</CenteredRow>
		<section>
			<CenteredRow as="header">
				<h2>Upload funding data</h2>
				<a href={`${config.API_URL}/static/funding.csv`}>download sample file</a>
			</CenteredRow>
			<CenteredRow className="mb-4">
				<Row>
					<Col>
						<Form.Label>Countries</Form.Label>
						<Select
							id="country"
							options={countries}
							placeholder="Pick a country"
							onChange={(selectedCountry) => setSelectedCountry(selectedCountry?.value)}
						/>
					</Col>
					<Col>
						<Form.Label>Currencies</Form.Label>
						<Select
							id="currency"
							options={currencyOptions}
							placeholder="Pick a currency"
							onChange={(selectedCurrency) => setSelectedCurrency(selectedCurrency?.value)}
						/>
					</Col>
				</Row>
			</CenteredRow>
			<CenteredRow as="section">
				<Dropzone accept={acceptedFundingFileExtensions} files={fundingFile} setFiles={setFundingFile} lang="en"/>
				{ fundingFile.length !== 0 &&
        <div className={`w-100 mt-2`}>
          <span>Uploaded files: </span>
          <span>
								{ fundingFile.map((file) => file.file.name).join(", ") }
							</span>
          <a href="#"
             className={`float-end`}
             onClick={ () => setFundingFile([]) }
          >
            Delete uploaded files
          </a>
        </div>
				}
			</CenteredRow>
			<CenteredRow as="section" className="mt-4">
				<Suggestions suggestions={suggestions} rowErrors={rowErrors} numOfRealSuggestions={numOfRealSuggestions}
				             editing={false}
				/>
			</CenteredRow>
		</section>
		<section>
			<CenteredRow as="header">
				<h2>Upload success data</h2>
				<a href={`${config.API_URL}/static/all_sports_ranking_2019.xlsx`}>download sample file</a>
			</CenteredRow>
			<CenteredRow as="section">
				<Dropzone accept={acceptedSuccessFileExtensions} files={successFile} setFiles={setSuccessFile} lang="en"/>
				{ successFile.length !== 0 &&
        <div className={`w-100 mt-2`}>
          <span>Uploaded files: </span>
          <span>
								{ successFile.map((file) => file.file.name).join(", ") }
							</span>
          <a href="#"
             className={`float-end`}
             onClick={ () => setSuccessFile([]) }
          >
            Delete uploaded files
          </a>
        </div>
				}
			</CenteredRow>
		</section>
		<section>
			<CenteredRow as="header">
				<h2>Upload interconnectedness data</h2>
				<a href={`${config.API_URL}/static/interconnectedness.xlsx`}>download sample file</a>
			</CenteredRow>
			<CenteredRow className="mb-4">
				<Row>
					<Col lg={6}>
						<Form.Label>Interconnectedness type</Form.Label>
						<Select
							id="interconnectedness"
							options={interconnectednessOptions}
							placeholder="Pick an interconnectedness type"
							onChange={(selectedInterconnectednessType) => setSelectedInterconnectednessType(selectedInterconnectednessType?.value)}
						/>
					</Col>
				</Row>
			</CenteredRow>
			<CenteredRow as="section">
				<Dropzone accept={acceptedInterconnectednessFileExtensions} files={interconnectednessFile} setFiles={setInterconnectednessFile} lang="en"/>
				{ interconnectednessFile.length !== 0 &&
        <div className={`w-100 mt-2`}>
          <span>Uploaded files: </span>
          <span>
								{ interconnectednessFile.map((file) => file.file.name).join(", ") }
							</span>
          <a href="#"
             className={`float-end`}
             onClick={ () => setInterconnectednessFile([]) }
          >
            Delete uploaded files
          </a>
        </div>
				}
			</CenteredRow>
		</section>
		<CenteredRow as="section" className="mt-5 mb-5">
			<div>
				<button type="button" className="btn btn-primary" onClick={handleUploadSubmit}>Upload</button>
			</div>
		</CenteredRow>
	</>)
}