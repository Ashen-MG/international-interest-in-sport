import Select from "react-select";
import {Col, Row, Form, Button, FloatingLabel} from "react-bootstrap";
import {Dropzone} from "components/drag_and_drop/Dropzone";
import React, {useEffect, useState} from "react";
import {dropzoneFileProp} from "components/drag_and_drop/Dropzone";
import {apiUploadFunding} from "secretary/adapters";
import createSnackbar, {SnackTypes} from "components/snackbar/Snackbar";
import {useAppDispatch, useAppSelector, useCountries, useMutationWithNotifications} from "app/hooks";
import {currencies} from "data/active_currency_codes";
import {CenteredRow} from "components/basic/CenteredRow";
import {RowToSuggestion, RowWithSuggestion, Suggestions} from "admin_secretary_shared/components/upload_funding_data/Suggestions";
import {RootState} from "app/store";
import {setCorrections} from "admin_secretary_shared/components/upload_funding_data/correctionsSlice";
import config from "../../../config";

const acceptedFileExtensions = ".csv";

interface UploadFundingError {
	message: string,
	suggestions: RowToSuggestion
}

/** Upload funding, success and interconnectedness data.
 *  If there are any mistakes in the uploaded file, errors or suggestions will show up.
 * */
export const UploadData = () => {

	const dispatch = useAppDispatch();

	const [files, setFiles] = useState<dropzoneFileProp[]>([]);

	const {countries: responseCountries} = useCountries();
	const [countries, setCountries] = useState<{value: string, label: string}[]>([]);
	const [selectedCountry, setSelectedCountry] = useState<string | undefined>();

	const currencyOptions = currencies.map((currency) => { return {label: currency, value: currency} });
	const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();

	const [rowErrors, setRowErrors] = useState<RowWithSuggestion[]>([]);
	const [suggestions, setSuggestions] = useState<RowWithSuggestion[]>([]);  // suggestion type = 1 or type 4
	const [numOfRealSuggestions, setNumOfRealSuggestions] = useState<number>(0);

	const corrections = useAppSelector((state: RootState) => state.secretaryUploadCorrections.corrections);

	const [fundingSource, setFundingSource] = useState<string>("");

	useEffect(() => {
		setCountries(responseCountries.map((country) => { return {
			value: country.code, label: `${country.name} (${country.code})`
		}}));
	}, [responseCountries]);

	const runOnMutationSuccess = () => {
		setFiles([]);
		setRowErrors([]);
		setSuggestions([]);
		setNumOfRealSuggestions(0);
	}

	const uploadMutation = useMutationWithNotifications(
		"funding_upload", apiUploadFunding, "D??ta sa nahr??vaj??.", "sk", runOnMutationSuccess
	);

	useEffect(() => {
		dispatch(setCorrections([]));
		setRowErrors([]);
		setSuggestions([]);
		setNumOfRealSuggestions(0);
	}, [files]);


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
		if (_rowErrors.length !== 0) return;

		// update potential previous suggestions
		const _numOfRealSuggestions: number = _suggestions.length;
		const previousSuggestions: RowWithSuggestion[] = [...suggestions];
		for (const correction of corrections) {
			const s = previousSuggestions.find(s => s.row === correction.row)!;
			s.newSportTitle = correction.sportTitle;
			s.oldSportTitle = correction.sportTitle;
			s.newBranchTitle = correction.branchTitle;
			s.oldBranchTitle = correction.branchTitle;
			s.newBranchCode = correction.branchCode;
			s.oldBranchCode = correction.branchCode;
		}
		for (const previousSuggestion of previousSuggestions) {
			const s = _suggestions.find(s => s.row === previousSuggestion.row);
			if (s === undefined)
				_suggestions.push(previousSuggestion);
		}
		setSuggestions(_suggestions);
		setNumOfRealSuggestions(_numOfRealSuggestions);
	}, [uploadMutation.error]);

	const handleSubmit = () => {
		if (selectedCountry === undefined || selectedCurrency === undefined || fundingSource === "")
			createSnackbar("Zvo??te krajinu, menu a zadajte zdroj.", SnackTypes.warn);
		else if (files.length === 1)
			uploadMutation.mutate({csvFile: files[0].file, countryCode: selectedCountry, currency: selectedCurrency,
											corrections: corrections, fundingSource: fundingSource});
		else
			createSnackbar("Najsk??r je potrebn?? nahra?? d??ta vo form??te csv.", SnackTypes.warn);
	}

	return (<>
		<CenteredRow as="section" lg={7} md={8}>
			<header>
				<h1>Nahranie d??t</h1>
				<h2>V??ha financovania</h2>
				<a href={`${config.API_URL}/static/funding.csv`}>stiahnu?? pr??klad s??boru</a>
			</header>
			<Row>
				<Col xl={7} lg={9} md={9}>
					<Form.Label>Krajina</Form.Label>
					<Select
						id="country"
						options={countries}
					  placeholder="Zvo??te krajinu"
						onChange={(selectedCountry) => setSelectedCountry(selectedCountry?.value)}
					/>
				</Col>
			</Row>
			<Row>
				<Col xl={7} lg={9} md={9}>
					<Form.Label>Meny</Form.Label>
					<Select
						id="currency"
						options={currencyOptions}
						placeholder="Zvo??te menu"
						onChange={(selectedCurrency) => setSelectedCurrency(selectedCurrency?.value)}
					/>
				</Col>
			</Row>
			<Form.Group as={Row} className="mt-4" controlId="formFundingSource">
				<Col>
					<FloatingLabel controlId="floatingFundingSource" label="Zadajte zdroj d??t">
						<Form.Control type="text"
									  placeholder="Funding Data Source"
									  value={fundingSource}
									  onChange={(e) =>
										  setFundingSource((e.currentTarget as HTMLInputElement).value)}
						/>
					</FloatingLabel>
				</Col>
			</Form.Group>
			<Row className={`mt-4`}>
				<Col>
					<Form.Label>S??bory</Form.Label>
					<Dropzone accept={acceptedFileExtensions} files={files} setFiles={setFiles}/>
					{ files.length !== 0 &&
						<div className={`w-100 mt-2`}>
							<span>Nahran?? s??bory: </span>
							<span>
								{ files.map((file) => file.file.name).join(", ") }
							</span>
              <a href="#"
	              className={`float-end`}
	              onClick={ () => setFiles([]) }
              >
	              Zma?? nahrat?? s??bory
              </a>
						</div>
					}
				</Col>
			</Row>
			<Row className={`mt-4`}>
				<Col>
					<Button
						onClick={ handleSubmit }
					>
						Nahra?? d??ta
					</Button>
				</Col>
			</Row>
		</CenteredRow>

		<CenteredRow as="section" lg={numOfRealSuggestions === 0 ? 7 : 12} md={numOfRealSuggestions === 0 ? 8 : 12} className="mt-4">
			<Suggestions suggestions={suggestions} rowErrors={rowErrors} numOfRealSuggestions={numOfRealSuggestions} />
		</CenteredRow>

	</>)
}