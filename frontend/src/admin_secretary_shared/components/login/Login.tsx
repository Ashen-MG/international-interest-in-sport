import {useMutation} from "react-query";
import {apiLogin, UserType} from "admin_secretary_shared/adapters";
import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import styles from "./styles/login.module.scss";
import React, {useState} from "react";
import {isEmailValid} from "helpers/validation";
import {useHistory} from "react-router-dom";
import textLang, {Language} from "app/string";

export interface LoginFormProps {
	userType: UserType,
	lang?: Language
}

/** Try to login admin or secretary based on `userType`. */
export const Login = ({userType, lang = "sk"}: LoginFormProps) => {
	const history = useHistory();

	const text = textLang[lang];

	const [email, _setEmail] = useState<string>("");
	const [emailValid, setEmailValid] = useState<boolean>(false);
	const [password, _setPassword] = useState<string>("");
	const [serverErrorMessage, setServerErrorMessage] = useState<string>("");

	/** Wrapper function for `_setEmail`, `setEmailValid` and `setServerErrorMessage`.*/
	const setEmail = (email: string) => {
		_setEmail(email);
		setEmailValid(isEmailValid(email));
		setServerErrorMessage("");
	}

	/** Wrapper function for `_setPassword` and `setServerErrorMessage`. */
	const setPassword = (password: string) => {
		_setPassword(password);
		setServerErrorMessage("");
	}

	/** Async query to login secretary or admin called on form submission. */
	const { mutateAsync: asyncLogin } = useMutation([`${userType}_login`, email, password],
		() => apiLogin(email, password, userType),
		{
			onSuccess: (response) => {
				// store access token and redirect to secretaries home page
				const serverData = response.data.data;
				localStorage.setItem(`${userType}AccessToken`, serverData.accessToken!);
				history.push(`/${userType}`);
			},
			onError: (error) => {
				const serverData = (error as any).response.data;
				setServerErrorMessage(serverData.message);
			}
		}
	);

	/** Submit form - use `asyncLogin` if the email and password are valid against our criteria. */
	const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (emailValid && password.length !== 0)
			asyncLogin();
	}

	return (
		<Container>
			<Row>
				<Col>
					<section className={`w-100 h-100vh d-flex justify-content-center align-items-center`}>
						<Form className={`${styles.loginForm}`} onSubmit={submitForm}>
							<header className={`text-center`}>
								<h1>{text.loginHeader} {userType === "secretary" ? "sekretárka" : "admin"}</h1>
							</header>
							{ serverErrorMessage.length !== 0 &&
              <>
                <hr className={`mt-4 mb-4`}/>
                <div>
                  <span className={`text-danger`}>{serverErrorMessage}</span>
                </div>
              </>
							}
							<hr className={`mt-4 mb-4`} />
							<Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
								<Col>
									<FloatingLabel
										controlId="floatingInput"
										label="Email"
										className="mb-1"
									>
										<Form.Control type="email" placeholder="name@example.com"
										              required
										              isValid={emailValid}
										              isInvalid={email.length !== 0 && !emailValid}
										              onChange={(e) => setEmail(e.target.value)}
										/>
										{ !emailValid &&
                    <Form.Control.Feedback type="invalid">
	                    { text.invalidEmail }
                    </Form.Control.Feedback>
										}
									</FloatingLabel>
								</Col>
							</Form.Group>
							<Form.Group as={Row} className="mb-4" controlId="formHorizontalPassword">
								<Col>
									<FloatingLabel controlId="floatingPassword" label={text.password}>
										<Form.Control type="password" placeholder={text.password}
										              required
										              onChange={(e) => setPassword(e.target.value)}
										/>
									</FloatingLabel>
								</Col>
							</Form.Group>
							<Form.Group as={Row} className="mb-3">
								<Col className={`text-center`}>
									<Button type="submit">{text.login}</Button>
								</Col>
							</Form.Group>
						</Form>
					</section>
				</Col>
			</Row>
		</Container>
	)
}