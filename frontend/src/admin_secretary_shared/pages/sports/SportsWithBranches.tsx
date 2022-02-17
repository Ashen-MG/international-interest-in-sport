import {useContext, useEffect, useState} from "react";
import {Tab, Tabs} from "react-bootstrap";
import {Table} from "components/table/Table";
import {CenteredRow} from "components/basic/CenteredRow";
import {CSVLink} from "react-csv";
import {useBranchesWithSports, useCombiBranches} from "admin_secretary_shared/hooks";
import textLang, {Language} from "app/string";
import {LanguageContext} from "App";

/** Table of sports with their branches. */
export const SportsWithBranches = () => {

	const language = useContext<Language>(LanguageContext);
	const text = textLang[language];

	const {isLoading: isLoadingBranchesWithSports, branchesWithSports: responseBranchesWithSports} = useBranchesWithSports(language);
	const [branchesWithSports, setBranchesWithSports] = useState<string[][]>([]);
	const {isLoading: isLoadingCombiBranches, combiBranches: responseCombiBranches} = useCombiBranches(language);
	const [combiBranches, setCombiBranches] = useState<(string|number)[][]>([]);

	useEffect(() => {
		setBranchesWithSports(responseBranchesWithSports.map((branchWithSport) =>
			[branchWithSport.sportCode, branchWithSport.sportTitle, branchWithSport.branchCode, branchWithSport.branchTitle]
		));
	}, [responseBranchesWithSports]);

	useEffect(() => {
		setCombiBranches(responseCombiBranches.map((combiBranch) =>
			[combiBranch.countryCode, combiBranch.countryName, combiBranch.combiCode, combiBranch.combiTitle,
			 combiBranch.subCode, combiBranch.subTitle, combiBranch.coefficient]
		));
	}, [responseCombiBranches]);

	return (<>
		<CenteredRow as="header">
			<h1>{text.sportAndBranches}</h1>
		</CenteredRow>
		<CenteredRow as="section">
			<Tabs defaultActiveKey="branchesWithSports" id="uncontrolled-tab-example" className="mb-3">
				<Tab eventKey="branchesWithSports" title={text.sportWithBranches}>
					<section>
						<div>
							<p>{text.sportAndBranchesList}</p>
						</div>
						<div className="mb-3">
							{branchesWithSports.length !== 0 &&
					      <CSVLink role="button" className="btn btn-outline-primary" data={branchesWithSports}
					               filename={`export_${text.sportWithBranchesFileName}`}>
					        Export
					      </CSVLink>
							}
						</div>
						<div>
							{ !isLoadingBranchesWithSports && branchesWithSports.length !== 0 &&
	              <Table
	                columnNames={[{name: text.sportCode, sortable: true}, {name: text.sportName, sortable: true},
																{name: text.branchCode, sortable: true}, {name: text.branchName, sortable: true}]}
	                rows={branchesWithSports} />
							}
						</div>
					</section>
				</Tab>
				<Tab eventKey="combiBranches" title={text.combiBranches}>
					<section>
						<div>
							<p>{text.combiBranchesHint}</p>
						</div>
						<div className="mb-3">
							{combiBranches.length !== 0 &&
              <CSVLink role="button" className="btn btn-outline-primary" data={combiBranches}
                       filename={`export_${text.combiBranchesFileName}`}>
                Export
              </CSVLink>
							}
						</div>
						<div>
							{ !isLoadingCombiBranches && combiBranches.length !== 0 &&
              <Table
                columnNames={[{name: text.countryCode, sortable: true}, {name: text.countryName, sortable: true},
															{name: text.combiBranchCode, sortable: true}, {name: text.combiBranchName, sortable: true},
															{name: text.subBranchCode, sortable: true}, {name: text.subBranchName, sortable: true},
	                            {name: text.coefficient, sortable: true}
                ]}
                rows={combiBranches} />
							}
						</div>
					</section>
				</Tab>
			</Tabs>
		</CenteredRow>
	</>)
}