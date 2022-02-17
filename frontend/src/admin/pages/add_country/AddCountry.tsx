import React, {useState} from "react";
import {Button, Col, FloatingLabel, Form, Row} from "react-bootstrap";
import {useCountries, useMutationWithNotifications} from "app/hooks";
import {CenteredRow} from "components/basic/CenteredRow";
import createSnackbar, {SnackTypes} from "components/snackbar/Snackbar";
import {apiAddNewCountry} from "admin/adapters";

/** Add new country form. */
export const AddCountry = () => {

	const {countries} = useCountries();
	const [countryName, setCountryName] = useState<string>("");
	const [countryTranslation, setCountryTranslation] = useState<string>("");
	const [countryCode, setCountryCode] = useState<string>("");

	const addNewCountryMutation = useMutationWithNotifications(
		"adding_new_country", apiAddNewCountry, "Adding new country...", "en"
	);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (countryName.length === 0 || countryTranslation.length === 0 || countryCode.length === 0) {
			createSnackbar("All fields are required.", SnackTypes.warn); return;
		}
		if (countries.find(c => c.code === countryCode) !== undefined) {
			createSnackbar("Country code already exists.", SnackTypes.warn); return;
		}
		addNewCountryMutation.mutate({name: countryName, translation: countryTranslation, code: countryCode});
	}

	return(<>
		<CenteredRow as="header" lg={6} md={7}>
			<h1>Add country</h1>
		</CenteredRow>
		<CenteredRow as="section" className="mb-3" lg={6} md={7}>
			<Form onSubmit={handleSubmit}>
				<Form.Group as={Row} className="mb-4" controlId="formCountryName">
					<Col>
						<FloatingLabel controlId="floatingCountryName" label="Country name">
							<Form.Control type="text"
							              placeholder="Country name"
							              value={countryName}
							              onChange={(e) =>
								              setCountryName((e.currentTarget as HTMLInputElement).value)}
							/>
						</FloatingLabel>
					</Col>
				</Form.Group>
				<Form.Group as={Row} className="mb-4" controlId="formCountryTranslation">
					<Col>
						<FloatingLabel controlId="floatingCountryTranslation" label="Translation of the country into Slovak">
							<Form.Control type="text"
							              placeholder="Translation of the country into Slovak"
							              value={countryTranslation}
							              onChange={(e) =>
								              setCountryTranslation((e.currentTarget as HTMLInputElement).value)}
							/>
						</FloatingLabel>
					</Col>
				</Form.Group>
				<Form.Group as={Row} className="mb-4" controlId="formCountryCode">
					<Col>
						<FloatingLabel controlId="floatingCountryCode" label="Country code">
							<Form.Control type="text"
							              placeholder="Country code"
							              value={countryCode}
							              onChange={(e) =>
								              setCountryCode((e.currentTarget as HTMLInputElement).value)}
							/>
						</FloatingLabel>
					</Col>
				</Form.Group>
				<Button variant="primary" type="submit">
					Save
				</Button>
			</Form>
		</CenteredRow>
	</>)
}