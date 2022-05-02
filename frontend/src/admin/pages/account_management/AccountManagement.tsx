import {CenteredRow} from "components/basic/CenteredRow";
import React, {useContext, useEffect, useState} from "react";
import createSnackbar, {SnackTypes} from "../../../components/snackbar/Snackbar";
import {useMutationWithNotifications, useQueryWithNotifications} from "../../../app/hooks";
import {apiAddNewCountry, ApiAddNewUser} from "../../adapters";
import {ApiUpdateUser} from "../../adapters";
import {Button, Col, FloatingLabel, Form, Row} from "react-bootstrap";
import textLang, {Language} from "../../../app/string";
import {isEmailValid} from "../../../helpers/validation";
import {useCountries} from "app/hooks";
import {getCountryImageURL} from "../../../helpers/country-iso-3-to-2";
import {LanguageContext} from "../../../App";
import {Table, TableRowsType} from "../../../components/table/Table";
import {apiListAccounts} from "admin/adapters";

/** Upload funding data.
 *  If there are any mistakes in the uploaded file, errors or suggestions will show up with option to re-upload
 *  the same file and corrections. This process might be repeated until all mistakes are resolved and successfully
 *  saved on the backend.
 * */
export const AccountManagement = () => {

    const {isLoading, response: responseAccounts} = useQueryWithNotifications(
        "account_loading", "account_loading", apiListAccounts, "account_loading");

    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        if(responseAccounts === undefined){return;}
        setAccounts(responseAccounts.data.accounts);
    }, [responseAccounts]);


    const [newUserEmail, setnewUserEmail] = useState<string>("");
    const [newUserPassword, setNewUserPassword] = useState<string>("");
    const [updatedUserPassword, setUpdatedUserPassword] = useState<string>("");
    const [newUserType, setNewUserType] = useState<string>("");
    const [updatedUserEmail, setUserEmail] = useState<string>("");

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

    const addUpdatedUserMutation = useMutationWithNotifications(
        "adding_updated_user", ApiUpdateUser, "Adding updated user...", "en",
        () => {
            setUserEmail("");
            setUpdatedUserPassword("");
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

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (updatedUserPassword.length === 0 || updatedUserEmail.length === 0) {
            createSnackbar("All fields are required.", SnackTypes.warn); return;
        }
        addUpdatedUserMutation.mutate({email: updatedUserEmail, password: updatedUserPassword});
        //console.log({email: newUserEmail, password: newUserPassword, type: newUserType});
    }

    console.log(accounts);

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

        <CenteredRow as="section" className="mb-3" lg={6} md={7}>
            <Form onSubmit={handleUpdate}>
                <h2>Update user account</h2>
                <h3>Choose user</h3>

                <Form.Group as={Row} className="mb-4" controlId="formNewUserType">
                    <Col>
                        {accounts.map((email) =>
                            <div key={email}>
                                <label>
                                    <input
                                        type = "radio"
                                        value = {email}
                                        checked = {updatedUserEmail === email}
                                        onChange = {(e) =>
                                            setUserEmail((e.currentTarget as HTMLInputElement).value)}
                                    />
                                    {email}
                                </label>
                            </div>
                        )}


                    </Col>
                </Form.Group>

                <h3>Enter new password</h3>

                <Form.Group as={Row} className="mb-4" controlId="formUpdatedUserPassword">
                    <Col>
                        <FloatingLabel controlId="floatingUpdatedUserPassword" label="Updated User Password">
                            <Form.Control type="password"
                                          placeholder="Updated User Password"
                                          value={updatedUserPassword}
                                          onChange={(e) =>
                                              setUpdatedUserPassword((e.currentTarget as HTMLInputElement).value)}
                            />
                        </FloatingLabel>
                    </Col>
                </Form.Group>
                <Button variant="primary" type="submit">
                    Update user
                </Button>
            </Form>
        </CenteredRow>

    </>)
}