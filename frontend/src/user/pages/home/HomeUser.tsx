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
            <h2>International importance of sports</h2>

            <ul>
                <li>
                    How important are individual sports in different countries and how does it sum up for the
                    international importance of sports in one particular country? The answer is not simple. This
                    application provides a summary of a large set of publically available data that is used to compute
                    the weight coefficients of international importance of individual sports for more than 40 world
                    countries.
                </li>

                <li>
                    The resulting international importance of individual sports is different for each country,
                    as it has different neighbors, a different cultural and history and thus it weights differently
                    importance in other countries. The mutual weigths for each pair of countries is calculated
                    based on the level of their export/import, distance, neighbourship, and social factors - common
                    history and common languare. For each considered country importance of individual sports
                    is estimated from three data sets - by the relative success of the country in the sport,
                    by the level of its national funding and by the sport coverage in the media.
                </li>

                <li>
                    The data on success of countries in inidividual sports are based on the common source:
                    The data on national funding are colledted separately for each country from the publically
                    available sources. The data on sport coverage in the media are based on the Biggest Global
                    Sports source.
                </li>

                <li>
                    For further methodology see (link).
                </li>

            </ul>

        </section>
    </div>
    </>)
}