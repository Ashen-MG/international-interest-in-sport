import React, {useEffect, useState} from "react";
import {useMutation} from "react-query";
import {
	apiChart, apiSource2
} from "../../adapters";
import {Button, Form} from "react-bootstrap";
import Select from "react-select";
import {Table} from "../../../components/table/Table";
import {CSVLink} from "react-csv";
import {Download} from "react-bootstrap-icons";
import {useCountries} from "../../../app/hooks";
import {Info} from "../../components/info/Info";
import {ChoiceState} from "../../components/choicestate/ChoiceState";

export const Ranking = () => {

	const {countries} = useCountries("en");
	const [rowChart, setRowChart] = useState<(number | string)[][]>([]);
	const [options, setOptions] = useState<{value: string, label: string}[]>([]);
	const [option, setOption] = useState<string[]>(["",""]);
	const [rowSource, setRowSource] = useState<string>("");
	/** useEffect for loading ranking types */
	useEffect(() => {
		if (countries !== undefined) {
			setOptions(countries.map(d => ({
				"value": d.code,
				"label": d.name
			})));
			const svkCountry = countries.find(c => c.code === "SVK");
			if (svkCountry !== undefined)
				setOption([svkCountry.code, svkCountry.name]);
		}
	}, [countries]);
	/** Async query for displaying ranking data. */
	const { mutateAsync: asyncChart } = useMutation(["setRanking", option],
		() => apiChart(option[0]),
		{
			onSuccess: (response) => {
				const serverData = response.data.data;
				setRowChart(serverData.chart.map((ch) => [ch.order, ch.title, ch.value.toFixed(3), ch.code]))
			},
			onError: (error) => {
				console.log(error);
			}
		}
	);

	/** Async query for displaying source data. */
	const { mutateAsync: asyncSource } = useMutation(["setSource", "bgsSource"],
		() => apiSource2("bgsSource"),
		{
			onSuccess: (response) => {
				const serverData = response.data.data;
				setRowSource(serverData);
				console.log(serverData);
			},
			onError: (error) => {
				console.log(error);
			}
		}
	);





	/** useEffect for displaying interconnectedness data. */
	useEffect(() => {
		if (option[0].length !== 0)
			asyncChart();
			asyncSource();
	}, [option]);

	return (
		<>
			<h1 className="mt-3 mb-4"> International Importance <Info label="What is International Importance" input="Results are displayed with tree decimal digits, the coefficients are calculated with 10 decimal digits and sorted accordingly. The exact values can be viewed in data export."/></h1>
			<h5>The coefficient measures the interational importance of individual sports for a selected particular country. It sums the estimatd importantce in all included foreign countries for the particular country weighted by their relative country influence.</h5> <br></br>
			<div>
				<Form.Label><h4>Country</h4></Form.Label>
				<Select
					id="country"
					options={options}
					placeholder="Choose country"
					onChange={ (selectedOption) => {
						if (selectedOption !== null)
							setOption([selectedOption.value, selectedOption.label]) }}
				/>
				<ChoiceState state={option[1]} />
				<Button variant="outline-primary mt-md-2 mb-md-2"><CSVLink className='button' filename={"ranking"+option[1]} data={rowChart}><Download size={25} /> Export data</CSVLink></Button>{' '}
			</div>
			<div>
				<h5>Source of displayed data: <b>{rowSource}</b></h5>
				<Table columnNames={[{name: "Rank", sortable: true}, {name: "Sport", sortable: true},
														 {name: "Ranking coefficient", sortable: true}, {name: "Sport Code", sortable: true}
				]}
				       rows={rowChart}
				/>
			</div>
		</>
	)
}