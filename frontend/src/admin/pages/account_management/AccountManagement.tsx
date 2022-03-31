import {CenteredRow} from "components/basic/CenteredRow";
import {Dropzone, dropzoneFileProp} from "components/drag_and_drop/Dropzone";
import React, {useEffect, useState} from "react";
import createSnackbar, {SnackTypes} from "../../../components/snackbar/Snackbar";
import {useCountries, useMutationWithNotifications} from "../../../app/hooks";
import {apiUploadFiles} from "../../adapters";
import {currencies} from "../../../data/active_currency_codes";
import {Button, Col, FloatingLabel, Form, Row} from "react-bootstrap";
import Select from "react-select";
import {useInterconnectednessType} from "../../../user/hooks";
import {RowToSuggestion, RowWithSuggestion, Suggestions} from "admin_secretary_shared/components/upload_funding_data/Suggestions";
import config from "../../../config";


/** Upload funding data.
 *  If there are any mistakes in the uploaded file, errors or suggestions will show up with option to re-upload
 *  the same file and corrections. This process might be repeated until all mistakes are resolved and successfully
 *  saved on the backend.
 * */
export const AccountManagement = () => {

    return(<>
        <CenteredRow as="header" lg={6} md={7}>
            <h1>Account Management</h1>
        </CenteredRow>

    </>)
}