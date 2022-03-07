import React from "react";
import {Link, useLocation} from "react-router-dom";
import {HouseDoor, BarChart, Wallet,  List, Easel} from "react-bootstrap-icons";
import styles from "./styles/navbar.module.scss";

import {  Nav } from "react-bootstrap";
/** This is the navbar that shows which page is active.*/
function Navbar() {
    const location = useLocation();
    const {pathname} = location;
    return (
        <div className={`${styles.mainNavbar}`}>
            <Nav>
                <Nav.Item className={pathname === "/home" ? styles.active : ""}>
                    <Link className={`${styles.navItem}`} to="/home"><HouseDoor size={25} /> Home</Link>
                </Nav.Item>
                <Nav.Item className={pathname === "/importance" ? styles.active : ""}>
                    <Link className={`${styles.navItem}`} to="/importance"><BarChart size={25} />  International Importance</Link>
                </Nav.Item>
                <Nav.Item className={pathname === "/funding" ? styles.active : ""}>
                    <Link className={`${styles.navItem}`} to="/funding"><Wallet size={25} /> Funding</Link>
                </Nav.Item>
                <Nav.Item className={pathname === "/ranking" ? styles.active : ""}>
                    <Link className={`${styles.navItem}`} to="/ranking"><List size={25} /> Sport Ranking</Link>
                </Nav.Item>
                <Nav.Item className={pathname === "/influence" ? styles.active : ""}>
                    <Link className={`${styles.navItem}`} to="/influence"><Easel size={25} /> Country Influence</Link>
                </Nav.Item>
            </Nav>
        </div>
    );
}



export default Navbar;