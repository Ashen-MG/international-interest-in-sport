import {Table} from "components/table/Table";
import {CenteredRow} from "components/basic/CenteredRow";
import {CSVLink} from "react-csv";
import {useCountries} from "app/hooks";
import {useContext, useEffect, useState} from "react";
import textLang, {Language} from "app/string";
import {LanguageContext} from "App";

/** Table of countries. */
export const Countries = () => {

	const language = useContext<Language>(LanguageContext);
	const text = textLang[language];

	const {isLoading, countries: responseCountries} = useCountries(language);

	const [countries, setCountries] = useState<string[][]>([]);

	useEffect(() => {
		setCountries(responseCountries.map((country) => [country.name, country.code]));
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
					columnNames={[{name: text.name, sortable: true}, {name: text.code, sortable: true}]}
					rows={countries} />
			}
		</CenteredRow>
	</>)
}