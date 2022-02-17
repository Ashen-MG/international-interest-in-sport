import React,{useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {InfoCircle} from "react-bootstrap-icons";

interface InfoProps {
    input: string,
    label: string
}
/** A component that is used to display information text and resources */
export const Info = ({label,input}:InfoProps) => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
    <InfoCircle className="cursor-pointer" size={20} onClick = { () => { handleShow()}}/>
        <Modal
        show = { show }
        onHide = { handleClose }
        backdrop = "static"
        keyboard = { false }>
            <Modal.Header closeButton>
                <Modal.Title>{label}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {input}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose} >Understood</Button>
            </Modal.Footer>
        </Modal>
    </>
);
}

