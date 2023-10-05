// Components
import { Container } from "react-bootstrap";
import { Footer } from "/src/components/pageComponents/Footer";
import { HeaderPage } from "/src/components/pageComponents/HeaderPage";

export default function Page() {
  return (
    <>
      <HeaderPage></HeaderPage>
      <Container>
        <section className="step">
          <h2>Conditions générales d'utilisation - Application Metriz</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (dites « CGU»)
            fixent le cadre juridique de l'application web « METRIZ» et
            définissent les conditions d'accès et d'utilisation des services
            pour l'utilisateur.
          </p>
          <h3 className="mb-4">Article 1 – Champ d'application</h3>
          <p>L'utilisation de l'application est gratuite et ouverte à tous.</p>
          <h3 className="mb-4">Article 2 – Objet </h3>
          <p>
            L'application METRIZ a pour objectif d'évaluer l'empreinte sociétale
            de la production d'une entreprise. La méthodologie de mesure prend
            en compte les impacts directs et indirects liés aux consommations
            (intermédiaires et de capital fixe) à partir de l'empreinte
            sociétale des fournisseurs.
          </p>
          <p>
            L'application fait ainsi le lien entre les écritures comptables via
            le FEC (Fichiers d'Ecritures Comptables), les données disponibles au
            sein de la base de données ouverte SINESE et les impacts directs de
            l'entreprise.
          </p>
          <p>
            Les résultats permettent de situer l'entreprise par rapport à sa
            branche et, pour les indicateurs faisant l'objet d'une stratégie
            nationale, aux objectifs nationaux à atteindre.
          </p>
          <p>
            Une option de publication des résultats est également disponible
            pour participer à la construction d'une économie plus transparente
            et valoriser la performance d'une entreprise.
          </p>
          <h3 className="mb-4">Article 3 – Définitions </h3>
          <p>
            L' «Utilisateur» est toute personne utilisant l'application web
            METRIZ.
          </p>
          <p>
            Les « Services» sont les fonctionnalités offertes par l'application
            web pour répondre à ses finalités.
          </p>
          <p>
            Le « Responsable de traitement» est la personne qui au sens de
            l'article 4 du règlement UE n°2016/679 du Parlement européen et du
            Conseil du 27 avril 2016 relatif à la protection des personnes
            physiques à l'égard du traitement des données à caractère personnel
            et à la libre circulation de ces données détermine les finalités et
            les moyens des traitements de données à caractère personnel.
          </p>
          <h3 className="mb-4">Article 4 – Fonctionnalités </h3>
          <h4>4.1 Mesure de l'empreinte </h4>
          <p>
            L'utilisateur accède au service via le bouton « Nouvelle Session» ou
            « Reprendre une session».
          </p>
          <p>Le calcul des indicateurs est décomposé en 4 étapes:</p>
          <h4>Etape n°1 – Import comptable </h4>
          <p>
            Importation du FEC (Fichier d'Ecritures Comptables) et validation de
            la lecture (identification du journal des A-Nouveaux, Association
            des comptes d'amortissements et de dépréciations aux comptes de
            stocks et d'immobilisations, obtention des soldes intermédiaires de
            gestion, etc.)
          </p>

          <h4>
            Etape n°2 – Impacts des comptes de stocks et d'immobilisations
          </h4>
          <p>
            Téléversement du fichier de sauvegarde relatif à l'exercice
            précédent ou initialisation des données à partir de données par
            défaut (dès que possible les empreintes des comptes sont estimées à
            partir de l'exercice courant).
          </p>
          <h4>
            Etape n°3 – Récupération des données relatives aux fournisseurs
          </h4>
          <p>
            Récupération des empreintes de la production des fournisseurs
            (achats et immobilisations) à partir des numéros de siren.
            L'association entre les comptes fournisseurs auxiliaires et les
            comptes s'effectue via le téléchargement et le téléversement d'un
            fichier Excel.
          </p>
          <p>
            Pour les comptes n'étant pas reliés à un numéro de siren, une étape
            supplémentaire permet d'associer à ces comptes des facteurs par
            défaut selon l'origine et le type de produits.
          </p>
          <h4>Etape n°4 – Déclaration des impacts directs </h4>
          <p>
            Déclaration des impacts directs de l'entreprise sur son périmètre
            opérationnel. Les déclarations se font par indicateur.
          </p>
          <p>Pour certains indicateurs, un outil de calcul est proposé.</p>
          <h4>Etape n°5 - Affichage et téléchargement des résultats </h4>
          <p>
            Une interface permet d'obtenir une vue détaillée des résultats pour
            chaque indicateur.
          </p>
          <p>
            Des livrables sont également disponibles pour obtenir sous format
            .pdf les résultats par indicateurs, ainsi qu'un tableau
            récapitulatif.
          </p>
          <h5>Utilisation de l'API OpenAI</h5>

          <p>
            Metriz utilise OpenAI, une plateforme d'intelligence artificielle,
            pour générer des notes d'analyses à partir des données fournies lors
            de l'analyse.
          </p>
          <p>
            <b>Responsabilité : </b> L'éditeur n'est pas responsables de la note
            générée par l'API OpenAI. Bien que ces notes soient générées
            automatiquement en fonction des données disponibles, elles peuvent
            contenir des inexactitudes ou des erreurs. Par conséquent, elles ne
            doivent pas être utilisées comme source d'information fiable et
            doivent être prises avec réserve.
          </p>
          <p>
            <b>Confidentialité des Données :</b> Les donnéesde l'utilisateur
            sont traitées conformément à notre politique de confidentialité, et
            aucune information personnelle identifiable n'est partagée avec
            OpenAI.
          </p>
          <h4>Etape n°6 - Publication </h4>
          <p>
            L'accès à la publication est accessible dès qu'au moins un
            indicateur est calculé. Elle est volontaire.
          </p>
          <p>
            La publication concerne l'empreinte sociétale de la production
            vendue (chiffre d'affaires) pour les indicateurs sélectionnés. Pour
            chaque indicateur, les données comprennent: la valeur de
            l'indicateur, l'incertitude et les informations complémentaires
            renseignées lors de la déclaration.
          </p>
          <p>
            Les informations nécessaires pour le traitement sont les suivantes:
          </p>
          <ul>
            <li>
              Données publiées : valeurs et incertitudes des indicateurs
              sélectionnés
            </li>
            <li> Numéro siren </li>
            <li> Nom et Prénom du déclarant </li>
            <li> Adresse mail du déclarant </li>
            <li>
              Confirmation de l'aptitude du déclarant à réaliser la publication
            </li>
          </ul>
          <p>
            Un bon de publication est téléchargeable avant l'envoi de la
            demande. Une copie est également envoyée par mail à l'adresse
            renseignée.
          </p>
          <h3 className="mb-4">Article 5 – Exploitation et Diffusion</h3>
          <p>
            METRIZ est un service librement accessible et exploitable, son code
            est libre et réutilisable par tout le monde selon la licence CeCILL.
            Il est possible de diffuser et distribuer l'application librement.
          </p>
          <p>
            Le répertoire GitHub est accessible{" "}
            <a
              href="https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp/"
              target="_blank"
            >
              {" "}
              ici.
            </a>
          </p>
          <p>
            Les termes de la licence CeCILL sont disponibles{" "}
            <a
              href="https://cecill.info/licences/Licence_CeCILL_V2-fr.html"
              target="_blank"
            >
              ici.
            </a>
          </p>
          <h3 className="mb-4">Article 6 – Responsabilités</h3>
          <p>
            Les sources des informations diffusées sur l'application sont
            réputées fiables mais l'application ne garantit pas qu'elles soient
            exemptes de défauts, d'erreurs ou d'omissions.
          </p>
          <p>
            L'éditeur s'engage à la sécurisation de l'application, notamment en
            prenant toutes les mesures nécessaires permettant de garantir la
            sécurité et la confidentialité des informations fournies.
          </p>
          <p>
            L'éditeur fournit les moyens nécessaires et raisonnables pour
            assurer un accès continu, sans contrepartie financière à
            l'application. Il se réserve la liberté de faire évoluer, de
            modifier ou de suspendre, sans préavis l'application pour des
            raisons de maintenance ou pour tout autre motif jugé nécessaire.
          </p>
          <h3 className="mb-4">
            Article 7 – Mise à jour des conditions d'utilisation{" "}
          </h3>
          <p>
            Les termes des présentes conditions d'utilisation peuvent être
            amendés à tout moment, sans préavis, en fonction des modifications
            apportées à l'application, de l'évolution de la législation ou pour
            tout autre motif jugé nécessaire.
          </p>
        </section>
      </Container>

      <Footer />
    </>
  );
}
