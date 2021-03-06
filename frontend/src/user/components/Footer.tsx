import React from "react";
import styles from "./styles/footer.module.scss";
import minlogo from "user/components/minlogo.png";
import fmfilogo from "user/components/fmfilogo.png";

/** This is the footer for the user site */
export const Footer = () => {
  return (
    <div className={`${styles.mainFooter}`}>
      <div className="container">
        <div className="row">
          {/* Column1 */}
          <div className="col">
            <h4>Project Design</h4>
			<ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li>Richard Kollár</li>
              <li>Filip Šramko</li>
              <li>Radoslava Hatalová</li>
			</ul>
            <h6>Comenius University in Bratislava</h6>
          </div>
          {/* Column2 */}
          <div className="col">
            <h4>Data acquisition</h4>

            <h6>Project Design Team and Ministry of Education, Science, Research and Sport of the Slovak Republic</h6>
          </div>
          {/* Column3 */}
          <div className="col">
            <h4>Web application</h4>
            <ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li>Sabína Samporová</li>
              <li>Martin Gergel</li>
              <li>Jakub Mišovský</li>
              <li>Slavomír Holenda</li>
            </ul>
            <h6>Comenius University in Bratislava</h6>
          </div>
          {/* Column4 */}
          <div className="col">
            <div className="row">
              <h4>Source Code</h4>
              <ul className={`list-unstyled ${styles.listUnstyled}`}>
                <li><a href = "https://github.com/TIS2021-FMFI/zaujem-o-sport">github</a></li>
              </ul>
            </div>
            {/* Column5 */}
            <div className="row">
              <h4>Project Methodology</h4>
              <ul className={`list-unstyled ${styles.listUnstyled}`}>
                <li><a href = "https://github.com/TIS2021-FMFI/zaujem-o-sport">link</a></li>
              </ul>
            </div>
            {/* Column6 */}
            <div className="row">
              <h4>Contact</h4>
              <ul className={`list-unstyled ${styles.listUnstyled}`}>
                <li>richard.kollar@fmph.uniba.sk</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Column7 */}
          <div className="col">
            <ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li><img className={styles.logo} src={fmfilogo} alt={"logo"}/></li>
            </ul>
          </div>
          {/* Column8 */}
          <div className="col">
            <ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li><img className={styles.logo} src={minlogo} alt={"logo"}/></li>
            </ul>
          </div>
        </div>

        <hr />
        <div className="row">
          <p className="col-sm">
            The project was developed within the Information Systems Development class and was financially supported by the Ministry of Education, Science, Research and Sport of the Slovak Republic and Faculty of Mathematics, Physics, and Informatics, Comenius University in Bratislava.
          </p>
        </div>
      </div>
    </div>
  );
}
