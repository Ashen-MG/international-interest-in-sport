import {CenteredRow} from "components/basic/CenteredRow";
import React, {useState} from "react";
import createSnackbar, {SnackTypes} from "../../../components/snackbar/Snackbar";
import {useMutationWithNotifications} from "../../../app/hooks";
import {ApiAddNewUser} from "../../adapters";
import {Button, Col, FloatingLabel, Form, Row} from "react-bootstrap";
import textLang from "../../../app/string";
import {isEmailValid} from "../../../helpers/validation";

/** Upload funding data.
 *  If there are any mistakes in the uploaded file, errors or suggestions will show up with option to re-upload
 *  the same file and corrections. This process might be repeated until all mistakes are resolved and successfully
 *  saved on the backend.
 * */
export const AccountManagement = () => {

    const [newUserEmail, setnewUserEmail] = useState<string>("");
    const [newUserPassword, setNewUserPassword] = useState<string>("");
    const [newUserType, setNewUserType] = useState<string>("");

    const [emailValid, setEmailValid] = useState<boolean>(false);

    const setEmail = (email: string) => {
        setnewUserEmail(email);
        setEmailValid(isEmailValid(email));
    }

    const addNewUserMutation = useMutationWithNotifications(
        "adding_new_user", ApiAddNewUser, "Adding new user...", "en",
      () => {
            setEmail("");
            setNewUserPassword("");
            setNewUserType("");
      }
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newUserEmail.length === 0 || newUserPassword.length === 0 || newUserType.length === 0) {
            createSnackbar("All fields are required.", SnackTypes.warn); return;
        }
        addNewUserMutation.mutate({email: newUserEmail, password: newUserPassword, type: newUserType});
        //console.log({email: newUserEmail, password: newUserPassword, type: newUserType});
    }

    return(<>
        <CenteredRow as="header" lg={6} md={7}>
            <h1>Account Management</h1>
        </CenteredRow>

        <CenteredRow as="section" className="mb-3" lg={6} md={7}>
            <h2>Add new user account</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group as={Row} className="mb-4" controlId="formNewUserEmail">
                    <Col>
                        <FloatingLabel controlId="floatingNewUserEmail" label="User email">
                            <Form.Control type="text"
                                          placeholder="User email"
                                          value={newUserEmail}
                                          isValid={emailValid}
                                          isInvalid={newUserEmail.length !== 0 && !emailValid}
                                          onChange={(e) =>
                                            setEmail((e.currentTarget as HTMLInputElement).value)}
                            />
                            {!emailValid &&
                                <Form.Control.Feedback type="invalid">
                                    {textLang.en.invalidEmail}
                                </Form.Control.Feedback>
                            }
                        </FloatingLabel>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-4" controlId="formNewUserPassword">
                    <Col>
                        <FloatingLabel controlId="floatingNewUserPassword" label="New User Password">
                            <Form.Control type="password"
                                          placeholder="New User Password"
                                          value={newUserPassword}
                                          onChange={(e) =>
                                              setNewUserPassword((e.currentTarget as HTMLInputElement).value)}
                            />
                        </FloatingLabel>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-4" controlId="formNewUserType">
                    <Col>
                        <div>
                            <label>
                                <input
                                    type = "radio"
                                    value = "admin"
                                    checked = {newUserType === "admin"}
                                    onChange = {(e) =>
                                        setNewUserType((e.currentTarget as HTMLInputElement).value)}
                                />
                            Admin
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type = "radio"
                                    value = "secretary"
                                    checked = {newUserType === "secretary"}
                                    onChange = {(e) =>
                                        setNewUserType((e.currentTarget as HTMLInputElement).value)}
                                />
                            Secretary
                            </label>
                        </div>

                    </Col>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Add user
                </Button>
            </Form>
        </CenteredRow>

    </>)
}