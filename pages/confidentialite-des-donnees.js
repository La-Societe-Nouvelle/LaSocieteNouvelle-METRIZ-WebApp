// Components
import { Container } from "react-bootstrap";
import { Footer } from "/src/components/pageComponents/Footer";
import {HeaderPage} from "/src/components/pageComponents/HeaderPage";

export default function Page() {
  return (
    <>
        <HeaderPage></HeaderPage>
        <Container>
          <section className="step">
            <h2>Politiques de Confidentialités des Données</h2>
            <h3 className="mb-4">Introduction</h3>
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
              De même dans le cadre de la génération des notes d'analyse via 
              l'utilisation de l'API OpenAI, aucune donnée personnelle et 
              aucune donnée permettant d'identifier l'entreprise n'est transmise.
              La requête contient uniquement des résultats intermédiaires et les
              données relatives à la branche à titre de comparaison.
              Conformément à la politique de traitement des données par OpenAI,
              les données anonymes transmises ne servent pas à l'amélioration
              du modèle et ne sont pas sauvegardées.
            </p>
            <p>
              Seulement en cas de demande de publication, des informations nominatives
              nous sont transmises. Elles concernent:{" "}
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
              Au sein de la publication, aucune donnée financière, aucune déclaration, 
              ni aucun résultat intermédiaire n’est transmis. La demande est volontaire via la
              complétion du formulaire de demande.{" "}
            </p>
            <h3 className="mb-4">
              Traitement des données à caractère personnel
            </h3>
            <p>
              La Société Nouvelle est responsable du traitement des données à caractère personnel uniquement
              pour les données transmises dans le cadre d'une publication ou en complément d'un rapport d'erreur. 
            </p>
            <p>
              Les données qui sont saisies pour la mesure des indicateurs sont stockées
              en local dans le navigateur de l’utilisateur de l’application.
              Elles sont effacées quand l’utilisateur vide les données de son
              navigateur, clique sur le bouton «recommencer» ou rafraichit la
              page. En ce sens, et selon les lignes directrices de la CNIL, le
              traitement n’est pas considéré comme un traitement de données à
              caractère personnel par La Société Nouvelle.
            </p>
            <h4>Données transmises lors d'une demande de publication </h4>
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
            <p>
              Les données restent confidentielles. Elles sont nécessaires pour assurer le
              suivi des demandes et des interlocuteurs réalisant les demandes.
              Elles ne sont communiquées à aucun tiers.
            </p>
            <p>
              Les données sont conservées pendant toute la durée nécessaire, jusqu’à
              opposition.{" "}
            </p>
            <h4>Données transmises lors de l'envoi d'un rapport d'erreur</h4>
            <p>Les données personnelles concernent:</p>
            <ul>
              <li>Le nom et le prénom de l'utilisateur </li>
              <li>L’adresse mail de l'utilisateur</li>
            </ul>
            <p>
              Les données sont recueillies afin d'assurer un suivi du traitement de l'erreur
              auprès de l'utilisateur.
              Elles restent confidentielles et ne sont communiquées à aucun tiers.
            </p>
            <p>
              Les données sont conservées jusqu'à la clôture de l'incident ou sur un délai maximum d'un an.{" "}
            </p>
            <h3 className="mb-4">
              Données publiées au sein de la base de données ouverte
            </h3>
            <p>
              Dans le cadre d'une publication, les données rendues publiques se limitent au numéro siren et aux
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
            <h3 className="mb-4">Autres traitements des données</h3>
            <h4>Suivi de Progression</h4>
            <p>
              L'application utilise un système de suivi de progression à des
              fins statistiques de suivi de l'utilisation de l'application. 
              Ce suivi de progression est entièrement anonyme
              et ne collecte aucune information personnelle ou nominative.
            </p>
            <p>
              Les données collectées comprennent la progression de l'utilisateur
              au sein de l'application, la date du traitement, les étapes
              atteintes, ainsi que les indicateurs déclarés.
            </p>
            <h4>Utilisation de l'API OpenAI</h4>
            <p>
              Metriz utilise OpenAI, une plateforme d'intelligence artificielle,
              pour générer des notes d'analyses à partir des données fournies lors
              de l'analyse.
            </p>
            <p>
              Les données transmises à l'API OpenAI contiennent :
              <ul>
                <li>Les résultats intermédiaires obtenus</li>
                <li>Les valeurs relatives à la branche (moyenne, etc.)</li>
                <li>Des éléments déclarés (consommation d'énergie, etc.)</li>
              </ul>
            </p>
            <p>
              Les données sont anonymes. Aucune information personnelle ou nominative n'est partagée avec
              OpenAI.
            </p>
            <p>
              Elles ne participent pas à l'amélioration du
              modèle par OpenAI, et ne sont pas sauvegardées par ce dernier.
            </p>
            <p>
              La Société Nouvelle n'est pas responsables du contenu 
              générée. Bien que ces notes soient générées
              automatiquement en fonction des données disponibles, elles peuvent
              contenir des inexactitudes ou des erreurs. Par conséquent, elles ne
              doivent pas être utilisées comme source d'information fiable et
              doivent être prises avec réserve.
            </p>

            <h3 className="mb-4">Hébergeur de l’application web </h3>
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
              L'éxécutionde l'application se fait cependant au sein de votre navigateur, et
              les données transmises via le formulaire sont stockées et traitées
              en France.
            </p>
          </section>
        </Container>
      <Footer />
    </>
  );
}
