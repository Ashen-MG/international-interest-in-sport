import React, {useEffect} from "react";
import {Redirect, useLocation} from "react-router-dom";
import {UserType} from "admin_secretary_shared/adapters";

export interface LogoutFormProps {
	userType: UserType
}

/**
 * Logout secretary or admin based on `userType`.
 * */
export const Logout = ({userType}: LogoutFormProps) => {
	const location = useLocation();

	useEffect(() => {
		const clearLocalStorage = async () => {
			localStorage.removeItem(`${userType}AccessToken`);
		}
		clearLocalStorage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Redirect to={{
			pathname: `/${userType}/login`,
			state: location.state === undefined ? {} : location.state
		}}/>
	);
};