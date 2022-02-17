import React from "react";
import {Icon} from "react-bootstrap-icons";

interface IconProps {
	Icon: Icon,
	text: React.ReactNode
}

export const IconWithText = ({Icon, text}: IconProps) => {
  return (
  	<div className={`d-flex flex-row align-items-center`}>
		  <Icon className={`me-3`} style={{fontSize: "1.3em"}} />
		  <span>{text}</span>
	  </div>
  )
}