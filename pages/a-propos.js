// Components
import { Container } from "react-bootstrap";
import { Footer } from "/src/components/pageComponents/Footer";
import {HeaderPage} from "/src/components/pageComponents/HeaderPage";

export default function Home() {
  return (
    <>
     
       <HeaderPage/>
        <Container>
          <section className="step">
            <h2>A propos</h2>
            <h3 className="mb-4">Qu’est-ce que METRIZ ? </h3>
            <p>
              L’application web METRIZ permet d’évaluer l’empreinte sociétale de
              la production d’une entreprise. La méthodologie de mesure s’appuie
              sur la traçabilité des revenus de l’entreprise et prend en compte
              les impacts directs (liés à la valeur ajoutée) et indirects liés
              aux consommations (intermédiaires et de capital fixe).
              L’estimation des impacts indirects s’effectue à partir de
              l’empreinte sociétale des fournisseurs.
            </p>
            <p>
              L’application fait le lien entre les écritures comptables via le
              FEC (Fichiers d’Ecritures Comptables), les données disponibles au
              sein de la base de données ouverte SINESE et les impacts directs
              de l’entreprise.
            </p>
            <p>
              Les résultats permettent de situer l’entreprise par rapport à sa
              branche et, pour les indicateurs faisant l’objet d’une stratégie
              nationale, aux objectifs nationaux à atteindre.
            </p>
            <p>
              Une option de publication des résultats est également disponible
              pour participer à la construction d’une économie plus transparente
              et valoriser les ratios de performance obtenus.
            </p>
            <h4 className="mb-3">Qui la développe? </h4>
            <p>
              L’application web est développée par <a href="https://lasocietenouvelle.org" target="_blank">La Société Nouvelle</a>. Le code
              est libre, sous licence CeCILL. Il est accessible <a href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/" target="_blank">ici.</a>
            </p>

            <h3 className="mb-4">Vie privée </h3>
            <p>
              Aucune donnée n’est collectée lors de l’utilisation de
              l’application web. Les informations pouvant être transmises se
              limitent aux données présentes au sein du formulaire de
              publication, accessible en fin d’analyse et dont la réponse est
              volontaire.
            </p>
            <p>
              Le traitement des données (calcul des indicateurs et affichage des
              résultats) s’effectue en local, au sein du navigateur utilisé.
            </p>

            <h3 className="mb-4">Nous contacter </h3>

            <p>
              Vous pouvez nous contacter par mail à l’adresse :{" "}
              <a href="mailto:contact@lasocietenouvelle.org">
                contact@lasocietenouvelle.org
              </a>{" "}
            </p>

            <h3 className="mb-4">Accessibilité</h3>

            <p>
              Si vous rencontrez un défaut d’accessibilité vous empêchant
              d’accéder à un contenu ou une fonctionnalité du site, merci de
              nous en faire part.
            </p>

            <h3 className="mb-4">Mentions légales </h3>

            <h4>La Société Nouvelle </h4>

            <p>SAS au capital de 1000 € <br />

            165 avenue de Bretagne 59000 Lille <br />

           RCS Lille Métropole 889 182 770 </p>

            <h4>Directeur de publication </h4>

            <p>Sylvain HUMILIERE </p>

            <h4>Hébergement</h4>

            <p>VERCEL</p>

            <p>
              Vercel Inc. <br />
              340 S Lemon Ave #4133 <br />
              Walnut, CA 91789
            </p>

            <p>
              <a href="https://vercel.com" target="_blank">
                https://vercel.com{" "}
              </a>
            </p>
            <p>
              Le site est hébergé sur Vercel. Le traitement s’effectue en local,
              aucune donnée n’est traitée par le serveur d’hébergement.
            </p>

            <h3 className="mb-4">Conditions générales d’Utilisation </h3>

            <p>
              Les conditions générales d’utilisation sont disponibles <a href="/conditions-generales-utilisation">ici</a>.
            </p>
          </section>
        </Container>

      <Footer />
    </>
  );
}
