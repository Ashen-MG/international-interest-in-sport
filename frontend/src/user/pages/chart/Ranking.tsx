import React, {useEffect, useState} from "react";
import {useMutation} from "react-query";
import {
	apiChart
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
	/** useEffect for displaying interconnectedness data. */
	useEffect(() => {
		if (option[0].length !== 0)
			asyncChart();
	}, [option]);

	return (
		<>
			<h1 className="mt-3 mb-4"> Ranking <Info label="What is Ranking" input="The page displays the global (universal) order of sports
            (order, sport,points and code )."/></h1>
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
				<Table columnNames={[{name: "Order", sortable: true}, {name: "Sport", sortable: true},
														 {name: "Points", sortable: true}, {name: "Code", sortable: true}
				]}
				       rows={rowChart}
				/>
			</div>
		</>
	)
}