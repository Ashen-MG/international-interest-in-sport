import React, {useEffect, useState} from "react";
import {Button, Col, FloatingLabel, Form, Row} from "react-bootstrap";
import {useMutationWithNotifications} from "app/hooks";
import {useSports} from "admin_secretary_shared/hooks";
import {CenteredRow} from "components/basic/CenteredRow";
import Select from "react-select";
import createSnackbar, {SnackTypes} from "components/snackbar/Snackbar";
import {apiUpdateSport} from "admin/adapters";

interface SelectedOption {
	value: string,
	label: string
}

/** Form to update existing sport.  */
export const UpdateSport = () => {

	const {sports} = useSports();
	const [sportCodes, setSportCodes] = useState<SelectedOption[]>([]);
	const [sportNames, setSportNames] = useState<SelectedOption[]>([]);
	const [oldSportCode, setOldSportCode] = useState<SelectedOption>();
	const [newSportCode, setNewSportCode] = useState<string>("");
	const [newSportTitle, setNewSportTitle] = useState<string>("");

	useEffect(() => {
		setSportCodes(sports.map((sport) => { return { value: sport.code, label: sport.code } }));
		setSportNames(sports.map((sport) => { return { value: sport.code, label: sport.title } }));
	}, [sports]);

	const updateSportMutation = useMutationWithNotifications(
		"adding_new_sport", apiUpdateSport, "Saving changes...", "en"
	);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (oldSportCode === undefined || newSportCode.length === 0 || newSportTitle.length === 0) {
			createSnackbar("All fields are required.", SnackTypes.warn); return;
		}
		if (sportCodes.find(c => c.value == newSportCode) !== undefined) {
			createSnackbar("New sport code already exists.", SnackTypes.warn); return;
		}
		updateSportMutation.mutate({oldCode: oldSportCode.value, newCode: newSportCode, newTitle: newSportTitle});
	}

	return(<>
		<CenteredRow as="header" lg={6} md={7}>
			<h1>Update sport</h1>
		</CenteredRow>
		<CenteredRow as="section" className="mb-3" lg={6} md={7}>
			<Form onSubmit={handleSubmit}>
				<Row className={`mb-4`}>
					<Col>
						<Form.Label>Old sport name</Form.Label>
						<Select
							id="sportNamesSelect"
							options={sportNames}
							placeholder="Enter or pick sport name"
							value={ sportNames.find( (sportName) => sportName.value === oldSportCode?.value ) }
							onChange={ (selectedOption) => {
								if (selectedOption !== null)
									setOldSportCode(selectedOption)
							} }
						/>
					</Col>
				</Row>
				<Row className={`mb-4`}>
					<Col>
						<Form.Label>Old sport code</Form.Label>
						<Select
							id="sportCodesSelect"
							options={sportCodes}
							placeholder="Enter or pick sport code"
							value={ sportCodes.find( (code) => code.value === oldSportCode?.value ) }
							onChange={ (selectedOption) => {
								if (selectedOption !== null)
									setOldSportCode(selectedOption)
							} }
						/>
					</Col>
				</Row>
				<Form.Group as={Row} className="mb-4" controlId="formNewSportTitle">
					<Col>
						<FloatingLabel controlId="floatingNewSportTitle" label="New sport name">
							<Form.Control type="text"
							              placeholder="New sport name"
							              value={newSportTitle}
							              onChange={(e) =>
								              setNewSportTitle((e.currentTarget as HTMLInputElement).value)}
							/>
						</FloatingLabel>
					</Col>
				</Form.Group>
				<Form.Group as={Row} className="mb-4" controlId="formNewSportCode">
					<Col>
						<FloatingLabel controlId="floatingNewSportCode" label="New sport code">
							<Form.Control type="text"
							              placeholder="New sport code"
							              value={newSportCode}
							              onChange={(e) =>
								              setNewSportCode((e.currentTarget as HTMLInputElement).value)}
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