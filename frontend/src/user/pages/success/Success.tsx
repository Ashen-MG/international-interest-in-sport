import React, {useEffect, useState} from "react";
import {useMutation, useQuery} from "react-query";
import {apiListSport, apiSource, apiSource2, apiSuccess, sportType} from "../../adapters";
import {Button, Form, Spinner} from "react-bootstrap";
import Select from "react-select";
import {Table, TableRowsType} from "components/table/Table";
import {CSVLink} from "react-csv";
import {Download} from "react-bootstrap-icons";
import {Info} from "../../components/info/Info";
import {ChoiceState} from "../../components/choicestate/ChoiceState";
import {getCountryImageURL} from "helpers/country-iso-3-to-2";

/** This page is used to show the success of individual sports */
export const Success = () => {
	const [sports, setSport] = useState<sportType[]>();
	const [rowSuccess, setRowSuccess] = useState<TableRowsType>([]);
	const [option, setOption] = useState<string[]>(["",""]);
	const [rowSource, setRowSource] = useState<string>("");
	/** Query for displaying sports. */
	const {isLoading} = useQuery("list_sports2", apiListSport, {
		onSuccess: (response) => {
			const serverData = response.data;
			setSport(serverData.sports);
		},
		onError: (error) => {
			alert(error);
		},
		cacheTime:(0)
	})

	/** Async query for displaying source data. */
	const { mutateAsync: asyncSource } = useMutation(["setSource", "successSource"],
		() => apiSource2("successSource"),
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


	let options = sports?.map(d => ({
		"value": d.code,
		"label" : d.title
	}))


	/** Async query for displaying success data. */
	const { mutateAsync: asyncSuccess } = useMutation(["setSport", option],
		() => apiSuccess(option[0]),
		{
			onSuccess: (response) => {
				const serverData = response.data.data;
				setRowSuccess(serverData.success.map((s) => [
					{element: getCountryImageURL(s.country_code, s.country_name), value: ""}, s.country_name, s.points, s.order]
				));
			},
			onError: (error) => {
				console.log(error);
			}
		}
	);

	/** useEffect for displaying success and source data. */
	useEffect(() => {
		asyncSuccess();
		asyncSource();

	}, [option]);


	return (
		<>
			<header>
				<h1 className="mt-3 mb-4"> Sport Ranking <Info label="What is Sport Ranking" input="After selecting a sport, this page displays a table showing
            the ranking of countries according to the number of points earned in the sport.
            Source: https://www.worldsportranking.info/sports-list
            "/></h1>
			</header>

			<div>

				<Form.Label><h4>Sport</h4></Form.Label>
				<Select
					id="sport"
					options={options}
					placeholder="Choose sport"
					onChange={ (selectedOption) => {
						if (selectedOption !== null)
							setOption([selectedOption.value, selectedOption.label]) }}
				/>
				<ChoiceState state = {option[1]} alert = {"Please select sport"} message={"You can see results for chosen sport"}  />
				<Button variant="outline-primary mt-md-2 mb-md-2"><CSVLink className='button' filename={"success"+option[1]} data={rowSuccess}><Download size={25} /> Export data</CSVLink></Button>{' '}


			</div>
			{isLoading
				? <Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>


				:
				<div>
					<h5>Source of displayed data: <b>{rowSource}</b></h5>
					<Table columnNames={[{name: "Flag", sortable: false}, {name: "Country", sortable: true}, {name: "Points", sortable: true}, {
						name: "Order",
						sortable: true
					}]}
					       rows={rowSuccess}/>

				</div>

			}

		</>
	)
}