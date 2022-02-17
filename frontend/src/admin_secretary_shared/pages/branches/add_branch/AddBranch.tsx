import React, {useContext} from "react";
import {Tab, Tabs} from "react-bootstrap";
import {CenteredRow} from "components/basic/CenteredRow";
import {AddUncombiBranch} from "./components/AddUncombiBranch";
import {AddCombiBranch} from "./components/AddCombiBranch";
import textLang, {Language} from "app/string";
import {LanguageContext} from "App";

/** Wrapper component to add new branch.
 *  Switching between creating combined and uncombined branch.
 *  */
export const AddBranch = () => {

	const language = useContext<Language>(LanguageContext);
	const text = textLang[language];

	return (<>
		<CenteredRow as="header" lg={7} md={8} className="text-center">
			<h1>{text.addBranchHeader}</h1>
		</CenteredRow>
		<CenteredRow as="section" lg={7} md={8}>
			<Tabs defaultActiveKey="uncombiBranch" id="uncontrolled-tab-example" className="mb-3 justify-content-center">
				<Tab eventKey="uncombiBranch" title={text.uncombiBranch}>
					<section>
						<div className="mb-3">
							<AddUncombiBranch />
						</div>
					</section>
				</Tab>
				<Tab eventKey="combiBranch" title={text.combiBranch}>
					<section>
						<div className="mb-3">
							<AddCombiBranch />
						</div>
					</section>
				</Tab>
			</Tabs>
		</CenteredRow>
	</>)
}