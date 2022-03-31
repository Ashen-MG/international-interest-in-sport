import {CenteredRow} from "components/basic/CenteredRow";
import {Dropzone, dropzoneFileProp} from "components/drag_and_drop/Dropzone";
import React, {useEffect, useState} from "react";
import createSnackbar, {SnackTypes} from "../../../components/snackbar/Snackbar";
import {useCountries, useMutationWithNotifications} from "../../../app/hooks";
import {apiUploadFiles} from "../../adapters";
import {currencies} from "../../../data/active_currency_codes";
import {Button, Col, FloatingLabel, Form, Row} from "react-bootstrap";
import Select from "react-select";
import {useInterconnectednessType} from "../../../user/hooks";
import {RowToSuggestion, RowWithSuggestion, Suggestions} from "admin_secretary_shared/components/upload_funding_data/Suggestions";
import config from "../../../config";

const acceptedFundingFileExtensions = ".csv";
const acceptedSuccessFileExtensions = ".xlsx, .xlsm, .xltx, .xltm";
const acceptedInterconnectednessFileExtensions = acceptedSuccessFileExtensions;
const acceptedBGSFileExtensions = acceptedSuccessFileExtensions;


interface UploadFundingError {
    message: string,
    suggestions: RowToSuggestion
}

/** Upload funding data.
 *  If there are any mistakes in the uploaded file, errors or suggestions will show up with option to re-upload
 *  the same file and corrections. This process might be repeated until all mistakes are resolved and successfully
 *  saved on the backend.
 * */
export const UserManagement = () => {

    const [fundingFile, setFundingFile] = useState<dropzoneFileProp[]>([]);
    const [successFile, setSuccessFile] = useState<dropzoneFileProp[]>([]);
    const [interconnectednessFile, setInterconnectednessFile] = useState<dropzoneFileProp[]>([]);
    const [bgsFile, setBgsFile] = useState<dropzoneFileProp[]>([]);

    const {countries: responseCountries} = useCountries("en");
    const [countries, setCountries] = useState<{value: string, label: string}[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string | undefined>();

    const currencyOptions = currencies.map((currency) => { return {label: currency, value: currency} });
    const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>();

    const {interconnectednessType} = useInterconnectednessType("en");
    const [interconnectednessOptions, setInterconnectednessOptions] = useState<{value: number, label: string}[]>([]);
    const [selectedInterconnectednessType, setSelectedInterconnectednessType] = useState<number | undefined>();

    const [fundingSource, setFundingSource] = useState<string>("");
    const [successSource, setSuccessSource] = useState<string>("");
    const [interconnSource, setInterconnSource] = useState<string>("");
    const [bgsSource, setBGSSource] = useState<string>("");

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
        if (fundingFile.length === 0 && successFile.length === 0 && interconnectednessFile.length === 0 && bgsFile.length === 0)
            createSnackbar("Please upload at least one file.", SnackTypes.warn);
        else if (fundingFile.length !== 0 && (selectedCountry === undefined || selectedCurrency === undefined || fundingSource === ""))
            createSnackbar("Select country, currency and source for funding.", SnackTypes.warn);
        else if (successFile.length !== 0 && successSource === "")
            createSnackbar("Enter success source.", SnackTypes.warn);
        else if (interconnectednessFile.length !== 0 && ( selectedInterconnectednessType === undefined || interconnSource === ""))
            createSnackbar("Select interconnectedness type and enter it's source.", SnackTypes.warn);
        else if (bgsFile.length !== 0 && bgsSource === "")
            createSnackbar("Enter BGS source.", SnackTypes.warn);
        else {
            uploadMutation.mutate({
                fundingFile: fundingFile[0]?.file,
                successFile: successFile[0]?.file,
                interconnectednessFile: interconnectednessFile[0]?.file,
                bgsFile: bgsFile[0]?.file,
                countryCode: selectedCountry,
                currency: selectedCurrency,
                interconnectednessType: selectedInterconnectednessType,
                foundingSource : fundingSource,
                successSource : successSource,
                interconnSource : interconnSource,
                bgsSource : bgsSource
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

    return(<>
        <CenteredRow as="header" lg={6} md={7}>
            <h1>User Management</h1>
        </CenteredRow>

    </>)
}