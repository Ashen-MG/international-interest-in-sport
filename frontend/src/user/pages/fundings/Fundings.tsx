import React, {useEffect, useState} from "react";
import {useMutation} from "react-query";
import {apiFunding} from "../../adapters";
import {Button, Form} from "react-bootstrap";
import Select from "react-select";
import {Table} from "../../../components/table/Table";
import {CSVLink} from "react-csv";
import {Download} from "react-bootstrap-icons";
import {useCountries} from "../../../app/hooks";
import {Info} from "../../components/info/Info";
import {ChoiceState} from "../../components/choicestate/ChoiceState";
import {formatLongNumber} from "../../../helpers/format";
/** This page is used to show the fundings of individual countries */
export const Fundings = () => {
    
    const {countries} = useCountries("en");
    const [rowFundings, setRowFunding] = useState<(number | string)[][]>([]);
    const [options, setOptions] = useState<{value: string, label: string}[]>([]);
    const [option, setOption] = useState<string[]>(["",""]);
    /** useEffect for loading countries */
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
    /** Async query for displaying funding data. */
    const { mutateAsync: asyncFunding } = useMutation(["setFunding", option],
        () => apiFunding(option[0]),
        {
            onSuccess: (response) => {
                const serverData = response.data.data;
                setRowFunding((serverData.funding.map((f) => [f.branch_id, formatLongNumber(f.absolute_funding), f.currency])));
            },
            onError: (error) => {
                console.log(error);
            }
        }
    );
    /** useEffect for displaying funding data. */
    useEffect(() => {
        if (option[0].length !== 0)
            asyncFunding();
    }, [option]);

    return (
        <>
            <header><h1 className="mt-3 mb-4"> Fundings <Info label="What is Funding" input="
            On this page, after selecting a country, it is displayed as a given funding between individual sports.
            The branches the columns will be: name of the sport,  amount (money) in the local currency of the given country and currency"/></h1></header>

            <div>

                <Form.Label><h4>Country</h4></Form.Label>

                <Select
                    id="country"
                    options={options}
                    placeholder="Choose country"
                    onChange={ (selectedOption) => {
                        if (selectedOption !== null)
                            setOption([selectedOption.value, selectedOption.label])
                            }}
                />

                <ChoiceState state={option[1]} />

                <Button variant="outline-primary mt-md-2 mb-md-2"><CSVLink className='button' filename={"funding"+option[1]} data={rowFundings}><Download size={25} /> Export data</CSVLink></Button>{' '}
            </div>
            <div>
                <Table columnNames={[{name: "Sport", sortable: true}, {name: "Amount", sortable: false, alignRight: true}, {
                    name: "Currency", sortable: true
                }]}
                       rows={rowFundings}/>
            </div>
        </>
    )
}