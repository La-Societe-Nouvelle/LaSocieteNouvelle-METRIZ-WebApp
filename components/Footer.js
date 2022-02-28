// La Societe Nouvelle

// React
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";

export function Footer({ step }) {
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer className={"row container-fluid aln-bottom " + (step > 0 ? "footer-step aln-left" : "  ")}>
      <section>
        <p>
          <b>&copy; {getCurrentYear()} La Société Nouvelle</b>
        </p>
        <ul>
          <li>
            <a href="#">Mentions légales</a>
          </li>
          <li>
            <a href="#">Politique des cookies</a>
          </li>
          <li>
            <a href="#">Politique de confidentialité</a>
          </li>
          <li>
            Design by <a href="#">La quincaillerie</a>
          </li>
        </ul>
      </section>
      {step == 0 ? (
        <section className="align-center">
          <h3>Vous avez des questions ?</h3>
          <p>
            <a href="#" className={"btn btn-primary"}>
              Contactez nous
            </a>
          </p>
          <p>- ou -</p>
          <p>appeller maintenant le</p>
          <a href="tel:00000000" className="phone-number">
            <FontAwesomeIcon icon={faPhone} />
            00 00 00 00 00
          </a>
        </section>
      ) : (
        ""
      )}
    </footer>
  );

}
