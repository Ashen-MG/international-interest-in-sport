import React, {useEffect, useState} from "react";
// npm i react-leaflet@3.1.0 @react-leaflet/core@1.0.2
import { Route, Switch, useHistory} from "react-router-dom";
import Select from "react-select";
import {Info} from "../../components/info/Info";
import {useCountries} from "../../../app/hooks";
import {useInterconnectednessType} from "../../hooks";
import {useMutation} from "react-query";
import {apiInterconnectness, interconnectnessType} from "../../adapters";
import {Button, Form} from "react-bootstrap";
import {ChoiceState} from "../../components/choicestate/ChoiceState";
import {CSVLink} from "react-csv";
import {Download} from "react-bootstrap-icons";
import {Table, TableRowsType} from "../../../components/table/Table";
import {MapShow} from "../../components/map/Map";
import {getCountryImageURL} from "../../../helpers/country-iso-3-to-2";

/** This page is used to show the interconnectedness of individual countries */
export const Interconnectness = () => {
	const history = useHistory()
	const dataDisplayingSelectedOptions = [
		{
			label: "Table",
			value: "/influence/table",
		},
		{
			label: "Map",
			value: "/influence/map",
		}
	];

	const [dataDisplayingSelectedOption, setDataDisplayingSelectedOption] = useState<{value: string, label: string}>(
		dataDisplayingSelectedOptions[1]
	);
    /** useEffect for storing selected option */
	useEffect(() => {
		history.push(dataDisplayingSelectedOption.value);
	}, [dataDisplayingSelectedOption]);

	const {countries} = useCountries("en");
	const {interconnectednessType} = useInterconnectednessType("en");
	const [countryOptions, setCountryOptions] = useState<{value: string, label: string}[]>([]);
	const [countryOption, setCountryOption] = useState<string[]>(["",""]);
	const [interconnectednessTypeOptions, setInterconnectednessTypeOptions] = useState<{value: number, label: string}[]>([]);
	const [interconnectednessOption, setInterconnectednessOption] = useState<number>(1);
	const [interconnectnesses, setInterconnectness] = useState<interconnectnessType[]>();
	const [rowInterconnectness, setRowInterconnectness] = useState<TableRowsType>([]);
  
	/** useEffect for loading interconnectedness types */
	useEffect(() => {
		if (interconnectednessType !== undefined) {
			setInterconnectednessTypeOptions(interconnectednessType.map(d => ({
				"value": d.code,
				"label": d.title
			})));
		}
	}, [interconnectednessType]);

	/** useEffect for loading countries */
	useEffect(() => {
		if (countries !== undefined) {
			setCountryOptions(countries.map(d => ({
				"value": d.code,
				"label": d.name
			})));
			const svkCountry = countries.find(c => c.code === "SVK");
			if (svkCountry !== undefined)
				setCountryOption([svkCountry.code, svkCountry.name]);
		}
	}, [countries]);

	/** Async query for displaying interconnectedness data. */
	const { mutateAsync: asyncInterconnectness } = useMutation(["setInterconnectedness", countryOption, interconnectednessOption],
		() => apiInterconnectness(interconnectednessOption, countryOption[0]),
		{
			onSuccess: (response) => {
				const serverData = response.data.data;
				setInterconnectness(serverData.interconnectness);
				setRowInterconnectness(serverData.interconnectness.map((i) => [
					{element: getCountryImageURL(i.code, i.country), value: ""}, i.code, i.country, i.value, i.type]
				));
			},
			onError: (error) => {
				console.log(error);
			}
		}
	);
	/** useEffect for displaying interconnectedness data. */
	useEffect(() => {
		if (countryOption[0].length !== 0)
			asyncInterconnectness();
	}, [countryOption, interconnectednessOption]);

	return (<>
		<header>
			<h1 className="mt-3 mb-4"> Country Influence <Info label="What is Country Influence" input="The coefficients measure the relative influence of other countries on the selected particular country.
			The values depend on mutual export and import between the particular country and all other
			included countries, on the distance between the countries, on neighbourship of countries,
			on common or similar language, and on common history. Economic, non-economic and combined
			(averaged economic and non-economic) relative influence can be viewed."/></h1>
		</header>
		<div>
			<h4> Display mode</h4>

			<Select className="mb-3"
					id="setview"
					value={dataDisplayingSelectedOption}
					options={dataDisplayingSelectedOptions}
					placeholder="Choose how data will be displayed"
					onChange={ (selectedOption) => {
						if (selectedOption !== null)
							setDataDisplayingSelectedOption(selectedOption);
					}}
			/>

			<div>
				<Form.Label><h4>Country</h4></Form.Label>
				<Select
					id="setcountry"
					options={countryOptions}
					placeholder="Choose country"
					onChange={ (selectedOption) => {
						if (selectedOption !== null)
							setCountryOption([selectedOption.value, selectedOption.label]) }}
				/>

				<Form.Label><h4>Influence type</h4></Form.Label>
				<Select
					id="setinterconnectness"
					options={interconnectednessTypeOptions}
					placeholder="Choose interconnectedness type"
					onChange={ (selectedOption) => {
						if (selectedOption !== null)
							setInterconnectednessOption(selectedOption.value) }}
				/>
				<ChoiceState state={countryOption[1]} alert={"Please select country and type "}
							 message={"You can see results for country and type"} />
				<Button variant="outline-primary mt-md-2 mb-md-2">
					<CSVLink className='button' filename={"interconnectedness" + countryOption}
							 data={rowInterconnectness}>
						<Download size={25} />Export data
					</CSVLink>
				</Button>{' '}
			</div>

			<div className="inter">
				<Switch>
					<Route path="/influence/table">
						<Table columnNames={[{name: "Flag", sortable: false}, {name: "Code", sortable: true},
							{name: "Country", sortable: true}, {name: "Value", sortable: true}, {name: "Type", sortable: true }]}
							   rows={rowInterconnectness}/>
					</Route>
					<Route path="/influence/map">
						<>
							{interconnectnesses !== undefined &&
								<MapShow input={interconnectnesses.map((interconnectness) => {
									return (
										{name: interconnectness.country, code: interconnectness.code, value: interconnectness.value}
									)
								})}/>
							}
						</>
					</Route>
				</Switch>
			</div>
		</div>

	</>)
}