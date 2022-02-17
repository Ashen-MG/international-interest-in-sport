import React from "react";
import styles from "./styles/footer.module.scss";

/** This is the footer for the user site */
export const Footer = () => {
  return (
    <div className={`${styles.mainFooter}`}>
      <div className="container">
        <div className="row">
          {/* Column1 */}
          <div className="col">
            <h4>International interest in sports</h4>
			<ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li>A project which is created within the subject Information Systems Development</li>
			</ul>
          </div>
          {/* Column2 */}
          <div className="col">
            <h4>Authors</h4>
            <ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li>Sabína Samporová</li>
              <li>Martin Gergel</li>
              <li>Jakub Mišovský</li>
			        <li>Slavomír Holenda</li>
            </ul>
          </div>
          {/* Column3 */}
          <div className="col">
            <h4>Links</h4>
            <ul className={`list-unstyled ${styles.listUnstyled}`}>
              <li><a href = "https://github.com/TIS2021-FMFI/zaujem-o-sport">github</a></li>
            </ul>
          </div>
        </div>
        <hr />
        <div className="row">
          <p className="col-sm">
            &copy;{new Date().getFullYear()} MATFYZ | Applied informatics |
            Tvorba informačných systémov
          </p>
        </div>
      </div>
    </div>
  );
}
