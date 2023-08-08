import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import indicators from "/lib/indics";

const IndicatorDetailsModal = ({ show, handleClose, indicator }) => {
  const renderIndicatorDetails = (indicator) => {
    switch (indicator) {
      case "eco":
        return <IndicatorECOcontent />;
      case "art":
        return <IndicatorARTcontent />;
      case "soc":
        return <IndicatorSOCcontent />;
      case "idr":
        return <IndicatorIDRcontent />;
      case "geq":
        return <IndicatorGEQcontent />;
      case "knw":
        return <IndicatorKNWcontent />;
      case "ghg":
        return <IndicatorGHGcontent />;
      case "nrg":
        return <IndicatorNRGcontent />;
      case "wat":
        return <IndicatorWATcontent />;
      case "mat":
        return <IndicatorMATcontent />;
      case "was":
        return <IndicatorWAScontent />;
      case "haz":
        return <IndicatorHAZcontent />;

      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size={"lg"}
      className="indic-modal"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center ">
              <Image
                className="me-2"
                src={`/icons-ese/logo_ese_${indicator}_bleu.svg`}
                height={50}
              />{" "}
              {indicators[indicator].libelle}
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="small">
        {renderIndicatorDetails(indicator)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/**
 * ==============================================
 * INDICATORS CONTENT COMPONENTS
 * ==============================================
 */

const IndicatorARTcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Part de la valeur produite par des entreprises artisanales, créatives ou
      dont le savoir-faire est reconnu; exprimée en % (de la valeur).
    </p>
    <p>
      L'indicateur vise à informer sur la part artisanale de la valeur produite
      dans un objectif de valorisation des savoir-faire et des métiers de
      l'artisanat auprès des consommateurs finaux.
    </p>
    <h5>Déclaration</h5>
    <p>
      Dans le cas où les activités de l'entreprise sont qualifiées
      d'artisanales, la valeur ajoutée est considérée comme entièrement
      contributrice. Inversement, la contribution est considérée comme nulle.
    </p>
    <p>
      Dans le cas où l'entreprise exerce plusieurs activités dont certaines
      artisanales, il est alors nécessaire de déclarer le volume de la valeur
      ajoutée des activités artisanales.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["art"].odds.map((odd) => {
      return (
        <Image
          className="mt-2 me-1"
          src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorECOcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Part de la valeur produite sur le territoire français, exprimée en % (de
      la valeur). L'indicateur vise à informer sur la localisation des activités
      (en France ou à l'étranger).
    </p>
    <h5>Déclaration</h5>
    <p>
      Dans le cas où les activités sont entièrement localisées en France,
      l'ensemble de la valeur ajoutée contribue à l'économie française i.e. est
      inclus dans le production intérieure. Inversement, pour des activités
      situées à l'étranger, la contribution est nulle.
    </p>
    <p>
      Si les activités sont localisées en France et à l'étranger, il est alors
      nécessaire de déclarer la valeur ajoutée nette produite en France.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["eco"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorGEQcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Ecart entre le taux horaire brut moyen des femmes et des hommes (en
      pourcentage du taux horaire moyen), exprimé en % (du taux horaire moyen).
    </p>
    <p>
      L'indicateur informe sur les écarts de salaires entre les femmes et les
      hommes au sein des entreprises ayant contribué à la production de la
      valeur. Il vise à encourager les actions en faveur de la réduction de
      l'écart de rémunérations entre les femmes/hommes.
    </p>
    <h5>Déclaration</h5>
    <p>
      Dans le cas où l'entreprise n'est pas employeur, l'écart de rémunérations
      est par défaut à 0% (absence d'inégalités).
    </p>
    <p>
      Dans le cas contraire, il est nécessaire de déclarer l'écart de
      rémunération femmes/hommes (en pourcentage du taux horaire brut moyen).
    </p>
    <h6>Outil d'évaluation</h6>
    <p>
      Un outil d'évaluation est mis à disposition, il permet à partir du nombre
      d'heures travaillées, de la rémunération brute et du sexe des
      collaborateurs de calculer l'écart de rémunérations femmes/hommes.
    </p>
    <p>
      La saisie des informations peut se faire manuellement ou en complétant un
      document Excel dont le modèle est téléchargeable ou en important
      directement les DSN (déclarations Sociales Nominatives)
    </p>

    <p>
      La documentation sur la lecture des DSN est disponible{" "}
      <a
        href="https://docs.lasocietenouvelle.org/application-web/lecture-dsn"
        className="text-decoration-underline text-secondary"
        target="blank"
      >
        ici
      </a>
      .
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["geq"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorGHGcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Quantité de gaz à effet de serre émise par unité de valeur produite,
      exprimée en gCO2e/€ (grammes de CO2 équivalent par euro ; équivalent pour
      la mise en équivalence des différents gaz à effet de serre, par rapport au
      CO2).
    </p>
    <p>
      L'indicateur informe sur la quantité émise de gaz à effet de serre liée à
      la production de l'entreprise avec pour objectif d'identifier les
      entreprises les plus performantes. Il s'inscrit dans l'objectif de
      réduction des émissions de gaz à effet de serre, dans le cadre de la lutte
      contre le déréglèment climatique.
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration concerne les émissions directes de gaz à effet de serre (en
      kgCO2e) et l'incertitude relative. Par défaut, l'incertitude est de 25%.
    </p>
    <p>
      L'outil d'évaluation mis à disposition permet de calculer les émissions
      directes à partir des consommations de combustibles, des installations de
      refroidissement et d'autres données d'activités.
    </p>
    <p>
      L'outil ne remplace en aucun cas un outil pour la réalisation d'un Bilan
      Carbone.
    </p>
    <h6>Outil d'évaluation</h6>
    <p>L'outil d'évaluation est décomposé en 6 postes d'émissions :</p>
    <p className="fw-bold">
      1 - Emissions directes des sources fixes de combustion
    </p>
    <p>
      Evaluation à partir des quantités de combustibles consommées. La liste des
      combustibles et les coefficients utilisés sont issus de la Base Carbone.
    </p>
    <p className="fw-bold">
      2 - Emissions directes des sources mobiles de combustion
    </p>
    <p>
      Evaluation à partir des quantités de combustibles consommées. La liste des
      combustibles et les coefficients utilisés sont issus de la Base Carbone.
      Les coefficients monétaires pour l'essence SP95-E10 et le gazole B7 sont
      obtenus à partir des coefficents par litre et du prix moyen à la pompe sur
      l'année 2021 calculé par l'INSEE.
    </p>
    <p className="fw-bold">
      3 - Emissions directes des procédés industriels (hors énergie)
    </p>
    <p>
      Emissions liées à la décarbonation dans la fabrication de produits de
      construction (ciment, tuiles, etc.) obtenue à partir de la quantité
      produite.
    </p>
    <p className="fw-bold">
      4 - Emissions directes des procédés agricoles (hors énergie)
    </p>
    <p>
      Emissions liées aux cheptels et aux activités de drainage et d'épandage.
    </p>
    <p className="fw-bold">5 - Emissions directes fugitives</p>
    <p>
      Emissions obtenues à partir de l'installation de réfrigération ou de
      climatisation et du gaz réfrigérant (R134a, R410a, etc.). 3 cas sont
      possibles pour le dimensionnement des installations :
    </p>
    <ul>
      <li>
        Elément unitaire (meuble autonome, camion, charge moyenne, etc.) ;
      </li>
      <li>
        Equipement dimensionné à partir de la surface en m2 (surface de vente
        supérieure à 400 m2, etc.) ;
      </li>
      <li>
        Equipement dimensionné à partir de la puissance en kW (entrepôt
        frigorifique, etc.)
      </li>
    </ul>
    Le dimensionnement permet d'estimer la quantité de fluide réfrigérant
    utilisée. Un coefficent de fuite annuelle permet alors d'obtenir la quantité
    émise du gaz réfrigérant. Le volume est ensuite exprimé en CO2e.
    <p className="fw-bold">6 - Emissions issues de la biomasse</p>
    <p>
      Emissions liées au changement d'affectation des sols, évaluées à partir
      des surfaces concernées et du changement opéré (forêt vers prairie, etc.).
    </p>
    <p className="fw-bold">Calcul de l'incertitude</p>
    <p>
      L'écart entre l'incertitude liée à la valeur saisie (consommation, etc.)
      et celle liée aux émissions provient de l'incertitude associé au facteur
      d'émissions de gaz à effet de serre utilisé.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["ghg"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorHAZcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Quantité utilisée de produits classifiés comme dangereux pour la santé ou
      l'environnement par unité de valeur produite, exprimée en g/€ (grammes par
      euro). Les dangers physiques (irritation, explosif, inflammable, etc.) ne
      sont pas pris en compte. La classification s'appuie sur les pictogrammes
      de danger présents sur les produits.
    </p>
    <p>
      L'indicateur vise à informer sur le degré d'utilisation de produits
      pouvant entraîner des conséquences néfastes sur la santé et/ou
      l'environnement (pesticides, etc.). Son objectif est de diminuer le
      recours à ces catégories de produits.
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration concerne l'utilisation directe de produits dangereux pour
      la santé ou l'environnement et l'incertitude relative. Par défaut,
      l'incertitude est de 25%.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["haz"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorIDRcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      L'indicateur vise à fournir un élément d'information sur l'écart des
      rémunérations au sein des entreprises ayant contribué à la production de
      la valeur, dans le but d'encourager celles qui ont un partage plus
      équitable de la valeur produite.
    </p>
    <p className="small">
      Note : Une meilleure répartition des rémunérations au sein de chaque
      entreprise n'implique pas nécessairement une meilleure répartition des
      revenus à l'échelle nationale, notamment en raison des disparités
      existantes entre certaines branches d'activités.
    </p>
    <h5>Déclaration</h5>
    <p>
      Dans le cas où l'entreprise n'est pas employeur, le rapport interdécile
      D9/D1 est par défaut à 1 (aucun écart).
    </p>
    <p>
      Dans le cas contraire, il est nécessaire de déclarer le rapport
      interdécile D9/D1 des taux horaires bruts des collaborateurs.
    </p>
    <h6>Outil d'évaluation</h6>
    <p>
      Un outil d'évaluation est mis à disposition, il permet à partir des DSN
      (Déclarations Sociales Nominatives) de calculer directement le rapport
      interdécile.
    </p>

    <p>
      La documentation sur la lecture des DSN est disponible{" "}
      <a
        href="https://docs.lasocietenouvelle.org/application-web/lecture-dsn"
        target="_blank"
        className="text-decoration-underline"
      >
        ici
      </a>
      .
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["idr"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorKNWcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Part de la valeur produite, contribuant à la recherche, à la formation ou
      à l'enseignement, exprimée en % (de la valeur).
    </p>
    <p>
      L'indicateur informe sur la part des revenus de l'entreprise dédiée à la
      formation, la recherche ou l'enseignement.
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration correspond au montant total des dépenses liées à la
      recherche, la formation ou l'enseignement (hors charges externes)
    </p>
    <h6>Outil d'évaluation</h6>
    <p>
      L'outil d'évaluation mis à disposition permet de décomposer la déclaration
      selon les différents postes et certaintes données sont directement
      obtenues à partir des écritures comptables ou des données relatives aux
      collaborateurs.
    </p>
    <p>L'outil d'évaluation comprend 5 postes :</p>
    <ul>
      <li>Taxe d'apprentissage (valeur récupérée des écritures comptables)</li>
      <li>
        Participation à la formation professionnelle (valeur récupérée des
        écritures comptables)
      </li>
      <li>
        Rémunérations liées à des contrats de formation (valeur récupérée de
        l'outil d'évaluation des indices sociaux : somme des rémunérations
        brutes dont la case "contrat de formation" est cochée)
      </li>
      <li>
        Rémunérations liées à des heures de suivi d'une formation (valeur
        récupérée de l'outil d'évaluation des indices sociaux à partir du nombre
        d'heures de formation suivi indiqué)
      </li>
      <li>Rémunérations liées à des activités de recherche ou de formation</li>
    </ul>
    <p>
      La contribution totale correspond à la somme des montants des 5 postes.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["knw"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorMATcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Quantité de matières premières extraite (minerais, fossiles, biomasse) par
      unité de valeur produite, exprimée en g/€ (en grammes par euro).
    </p>
    <p>
      L'indicateur informe sur le recours à l'extraction (nouvelle) de
      ressources naturelles. La réutilisation de matières premières est donc
      exclue de la mesure. L'objectif est de réduire l'extraction de matières
      premières et de favoriser la réutilisation et l'économie circulaire.
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration concerne l'extraction directe de matières premières et
      l'incertitude relative. Par défaut, l'incertitude est de 25%.
    </p>
    <p>
      Dans le cas où l'entreprise n'exerce pas d'activités minières, agricoles
      ou forestières, aucune extraction directe n'est à constater.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["mat"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorNRGcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Consommation d'énergie primaire par unité de valeur produite, exprimée en
      kJ/€ (kilojoules par euro).
    </p>
    <p>
      L'énergie est une grandeur qui caractérise la transformation d'un système.
      De nombreux enjeux sont ainsi directement liés à l'énergie tels que la
      consommation de ressources naturelles (matières fossiles, eau, minerais,
      etc.) ou les émissions de gaz à effet de serre.
    </p>
    <p>
      L'indicateur informe donc sur la pression exercée sur l'environnement.
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration concerne la consommation directe d'énergie primaire (en MJ)
      et l'incertitude relative. Par défaut, l'incertitude est de 25%.
    </p>
    <h6>Outil d'évaluation</h6>
    <p>
      L'outil d'évaluation mis à disposition permet de décomposer la déclaration
      selon les différents produits énergétiques consommés. Il reprend les 5
      produits énergétiques comptabilisés :
    </p>

    <p className="fw-bold">Electricité</p>
    <p>
      Déclaration de la consommation totale (en MJ ou kWh), valeur disponible à
      partir des relevés d'électricité
    </p>

    <p className="fw-bold">
      Produits énergétiques fossiles (gaz, carburant, etc.)
    </p>
    <p>
      Eléments repris de l'outil d'évaluation des émissions de gaz à effet de
      serre / ajout des produits énergétiques consommés via le menu déroulant et
      déclaration de la quantité consommée selon les unités disponibles.
    </p>

    <p className="fw-bold">Biomasse (bois, biocarburant, etc.)</p>
    <p>
      Eléments repris de l'outil d'évaluation des émissions de gaz à effet de
      serre / ajout des produits énergétiques consommés via le menu déroulant et
      déclaration de la quantité consommée selon les unités disponibles.
    </p>

    <p className="fw-bold">Chaleur</p>
    <p>
      Déclaration de la quantité totale d'énergie consommée (en MJ ou kWh),
      valeur disponible à partir des relevés (réseaux de chaleur)
    </p>

    <p className="fw-bold">
      Energie renouvelable transformée (panneaux photovoltaïques, etc.)
    </p>
    <p>
      Déclaration de la quantité totale d'énergie transformée et consommée (en
      MJ ou kWh), valeur disponible à partir des relevés du transformateur
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["nrg"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorSOCcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Part de la valeur produite dans un intérêt social défini (raison d'être,
      etc.), exprimée en % (de la valeur).
    </p>
    <h5>Déclaration</h5>
    <p>La déclaration se limite à l'existence ou non d'une raison d'être.</p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["soc"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorWATcontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Quantité d'eau consommée par unité de valeur produite, exprimée en L/€
      (litres par euro).
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration concerne la consommation directe d'eau (en m3) et
      l'incertitude relative. Par défaut, l'incertitude est de 25%.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["wat"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
const IndicatorWAScontent = () => (
  <>
    <h5>Informations sur l'indicateur</h5>
    <p>
      Quantité de déchets produite par unité de valeur produite, exprimée en g/€
      (grammes par euro).
    </p>
    <p>
      L'indicateur informe sur la quantité de déchets produite, avec pour
      objectif de la réduire. Il n'informe cependant pas sur le traitement des
      déchets (recyclages, destruction, etc.) et leur dangerosité.
    </p>
    <h5>Déclaration</h5>
    <p>
      La déclaration concerne la production directe de déchets (en kg) et
      l'incertitude relative. Par défaut, l'incertitude est de 25%.
    </p>
    <h5>Objectifs de développement durable associés</h5>
    {indicators["was"].odds.map((odd) => {
      return (
        <Image
        className="mt-2 me-1"
        src={`/odd/F-WEB-Goal-${odd}.png`}
          width={65}
        ></Image>
      );
    })}
  </>
);
export default IndicatorDetailsModal;
