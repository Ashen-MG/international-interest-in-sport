import {Col, ColProps, Row} from "react-bootstrap";
import {ReactNode} from "react";
import {AsProp} from "react-bootstrap/helpers";

export interface CenteredRowProps {
	children?: ReactNode,
	className?: string
}

/** Wrapper component for bootstrap centered row with one column. */
export const CenteredRow = ({as, children, className, xs, sm, md, lg=10, xl, xxl}: CenteredRowProps & AsProp & ColProps) => {
	return (
		<Row as={as} className={`${className !== undefined ? className : ""} justify-content-center`}>
			<Col xs={xs} sm={sm} md={md} lg={lg} xl={xl} xxl={xxl}>
				{ children }
			</Col>
		</Row>
	)
}