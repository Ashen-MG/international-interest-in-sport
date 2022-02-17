import React from "react";

interface ChoiceStateProps {
    state: string,
    alert?: string,
    message?: string
}
/** A component that notifies the user if an option is selected
 * A parameter and two optional parameters enter this component.
 * And that item is selected or undefined and reports if the item
 * is undefined and reports that if it is selected */
export const ChoiceState = ({state, alert = "Please select country",message = "You can see results for country" }:ChoiceStateProps) => {
    if (!state) {
        return(
            <div className="alert alert-warning col-md-6 mt-md-4" role="alert">
                <h4>  {alert}  </h4>
            </div>
        )
    }
    return (
        <div className="alert alert-success col-md-6 mt-md-4" role="alert">
            <h4>  {message} <b>{state} :</b>  </h4>
        </div>
    );
}