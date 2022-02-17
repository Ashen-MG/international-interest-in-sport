import React from "react";
import {BarChart, Easel, HouseDoor, List, Wallet} from "react-bootstrap-icons";
export const HomeUser = () => {

/** This is the home site */
    return (<>
        <div className="main">
        <header>
            <h1 className="mt-3 mb-4"> Homepage </h1>

        </header>
        <section>
            <h2>International interest in sport</h2>

            <ul>
                <li>A system that will group, process and display data about sport and its importance for different countries of the world. </li>
                <li>Able to receive new - up-to-date data and include them in the resulting order of importance.</li>
                <li>The processed data will be freely available on this website.</li>

            </ul>

            <h3>This site contains:</h3>

            <ul>
                <li><HouseDoor size={25} /> Home</li>
                <li><BarChart size={25} /> Chart</li>
                <li><Wallet size={25} /> Fundings</li>
                <li><List size={25} /> Success</li>
                <li><Easel size={25} /> Interconnectedness</li>
            </ul>

        </section>
    </div>
    </>)
}