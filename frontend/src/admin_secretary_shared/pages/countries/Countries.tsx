import {Table, TableRowsType} from "components/table/Table";
import {CenteredRow} from "components/basic/CenteredRow";
import {CSVLink} from "react-csv";
import {useCountries} from "app/hooks";
import {useContext, useEffect, useState} from "react";
import textLang, {Language} from "app/string";
import {LanguageContext} from "App";
import {countryISOMapping} from "../../../helpers/country-iso-3-to-2";

/** Table of countries. */
export const Countries = () => {

	const language = useContext<Language>(LanguageContext);
	const text = textLang[language];

	const {isLoading, countries: responseCountries} = useCountries(language);

	const [countries, setCountries] = useState<TableRowsType>([]);


	useEffect(() => {
		setCountries(responseCountries.map((country) => {
			const countryCode = countryISOMapping[country.code]?.toLowerCase();
			return [{element: <img src={`https://flagcdn.com/32x24/${countryCode}.png`} alt="" />, value: ""}, country.name, country.code];
		}));
	}, [responseCountries]);

	return (<>
		<CenteredRow as="header">
			<h1>{text.countries}</h1>
		</CenteredRow>
		<CenteredRow as="section" className="mb-3">
			{countries.length !== 0 &&
        <CSVLink role="button" className="btn btn-outline-primary" data={countries} filename={`export_${text.countries}`}>
          Export
        </CSVLink>
			}
		</CenteredRow>
		<CenteredRow as="section">
			{ !isLoading && countries.length !== 0 &&
				<Table
					columnNames={[{name: "flag", sortable: false}, {name: text.name, sortable: true}, {name: text.code, sortable: true}]}
					rows={countries} />
			}
		</CenteredRow>
	</>)
}