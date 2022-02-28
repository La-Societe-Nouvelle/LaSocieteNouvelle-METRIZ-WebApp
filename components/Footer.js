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
          <a href="https://lasocietenouvelle.org/" target="_blank">A propos</a>
          </li>
          <li>
           <a href="https://lasocietenouvelle.org/mentions-legales" target="_blank">Mentions légales</a>
          </li>
          <li>
            Design by <a href="https://la-quincaillerie.fr/" target="_blank">La quincaillerie</a>
          </li>
        </ul>
      </section>
      {step == 0 ? (
        <section className="align-center">
          <h3>Vous avez des questions ?</h3>
          <p>
            <a href="https://lasocietenouvelle.org/contact" target="_blank" className={"btn btn-primary"}>
              Contactez nous
            </a>
          </p>
          <p>- ou -</p>
          <p>appeller maintenant le</p>
          <a href="tel:0602362383" className="phone-number">
            <FontAwesomeIcon icon={faPhone} />
            06 02 36 23 83
                      </a>
        </section>
      ) : (
        ""
      )}
    </footer>
  );

}
