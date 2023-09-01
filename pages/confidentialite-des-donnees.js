// Components
import { Container } from "react-bootstrap";
import { Footer } from "/src/components/parts/Footer";
import {HeaderPage} from "/src/components/parts/headers/HeaderPage";

export default function Page() {
  return (
    <>
      <div className="wrapper" id="wrapper">
        <HeaderPage></HeaderPage>
        <Container>
          <section className="step">
            <h1>Politiques de Confidentialités des Données</h1>

            <h2 className="mb-4">Introduction</h2>

            <p>
              Les calculs se font dans votre navigateur web, les informations
              saisies et téléversées restent chez vous, nous n’en collectons
              aucune.
            </p>
            <p>
              Les requêtes envoyées pour la récupération des données (impacts de
              la production d’une entreprise, facteurs d’impacts par défaut,
              valeurs comparatives, etc.) au sein de notre base de données
              ouverte sont anonymes et ne font l’objet d’aucune traçabilité.
            </p>
            <p>
              Seulement en cas de demande de publication, des informations nous
              sont transmises. Elles concernent:{" "}
            </p>
            <ul>
              <li>Le numéro de siren de l’unité légale</li>
              <li>Le nom et prénom du déclarant</li>
              <li>L’adresse mail du déclarant </li>
              <li>
                La structure du déclarant s’il n’appartient pas à l’unité légale
                concernée
              </li>
              <li>
                Les valeurs, incertitudes et informations complémentaires des
                indicateurs sélectionnées, relatifs à la production vendue de
                l’entreprise.
              </li>
            </ul>
            <p>
              Aucune donnée financière, aucune déclaration, ni aucun résultat
              intermédiaire n’est transmis. La demande est volontaire via la
              complétion du formulaire de demande.{" "}
            </p>

            <h2 className="mb-4">
              Traitement des données à caractère personnel traitées
            </h2>

            <p>
              La présente application est à l’initiative de La Société Nouvelle,
              responsable du traitement des données à caractère personnel.{" "}
            </p>

            <h2 className="mb-4">Données à caractère personnel traitées</h2>
            <h3>Données relatives à la mesure et résultats</h3>
            <p>
              Les données qui sont saisies lors de la simulation sont stockées
              en local dans le navigateur de l’utilisateur de l’application.
              Elles sont effacées quand l’utilisateur vide les données de son
              navigateur, clique sur le bouton «recommencer» ou rafraichit la
              page.
            </p>
            <p>
              En ce sens, et selon les lignes directrices de la CNIL, le
              traitement n’est pas considéré comme un traitement de données à
              caractère personnel.
            </p>

            <h3>Données relatives à une demande de publication </h3>
            <p>Les données personnelles concernent:</p>
            <ul>
              <li>Le nom et le prénom du déclarant </li>
              <li>L’adresse mail du déclarant</li>
              <li>
                L’unité légale au sein de laquelle évolue le déclarant (via son
                numéro de siren ou sa dénomination)
              </li>
            </ul>
            <p>
              Les données sont collectées aux fins de traitement de la demande
              de publication et de son suivi. Elles sont recueillies par La
              Société Nouvelle en France.
            </p>
            <h3>Durée de conservation des données </h3>
            <p>
              Données conservées pendant toute la durée nécessaire, jusqu’à
              opposition.{" "}
            </p>
            <h3>Destinataires des données </h3>
            <p>
              Les données relatives au déclarant (nom, prénom, adresse mail)
              restent confidentielles. Elles sont nécessaires pour assurer le
              suivi des demandes et des interlocuteurs réalisant les demandes.
              Elles ne sont communiquées à aucun tiers.
            </p>
            <p>
              Les données rendues publiques se limitent au numéro siren et aux
              informations relatives aux indicateurs publiés (valeur,
              incertitude et informations complémentaires saisies).{" "}
            </p>
            <p>Elles sont publiées sous licence ouverte. </p>
            <p>
              A ce titre, La Société Nouvelle ne pourra être tenu responsable
              d’un préjudice financier, commercial ou d’une autre nature – tels
              que perte de notoriété, revenus, activités, clientèle – causé
              directement ou indirectement, par l’exploitation des résultats
              publiés par l’Utilisateur sein de la base de données SINESE (Base
              de données ouverte regroupant les empreintes sociétales des
              entreprises françaises).
            </p>
            <h2 className="mb-4">Hébergeur de l’application web </h2>
            <p>L’application est hébergée par Vercel Inc. </p>
            <p>
              Vercel Inc. <br />
              340 S Lemon Ave #4133 <br />
              Walnut, CA 91789
            </p>
            <p>
              <a href="https://vercel.com" target="_blank">
                https://vercel.com
              </a>
            </p>
            <p>
              Pour autant, le traitement se fait au sein de votre navigateur et
              les données transmises via le formulaire sont stockées et traitées
              en France.
            </p>
          </section>
        </Container>
      </div>
      <Footer />
    </>
  );
}
