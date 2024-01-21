// La Société Nouvelle
import React, { useState } from "react";
import { Container, Table, Form, Row, Col } from "react-bootstrap";

import api from "/config/api";

// Api
import {
  sendStatementToAdmin,
  sendStatementToDeclarant,
} from "/pages/api/mail-api";

// React

// Sources
import {
  buildStatementPDF,
} from "/src/writers/StatementPDFBuilder";

import { printValue } from "/src/utils/formatters";

// Libraries
import metaIndics from "/lib/indics";

/* ----------------------------------------------------------- */
/* -------------------- PUBLISH STATEMENT SECTION -------------------- */
/* ----------------------------------------------------------- */

const PublishStatementSection = ({ session, period }) => {
  const {
    legalUnit,
    financialData,
    validations,
    impactsData,
  } = session;

  const { periodKey } = period;
  const { productionAggregates } = financialData;
  const { corporateName } = legalUnit;

  const year = period.dateEnd.substring(0, 4);
  const comments = impactsData[periodKey].comments;
  const socialFootprint =
    productionAggregates.revenue.periodsData[periodKey].footprint;

  const indicatorsData =
    productionAggregates.revenue.periodsData[periodKey].footprint.indicators;

  const publishableIndicators = Object.entries(indicatorsData)
    .filter(([_, indicator]) => indicator.value != null)
    .reduce((acc, [indic, _]) => {
      acc[indic] = true;
      return acc;
    }, {});

  const [indicatorsToPublish, setIndicatorsToPublish] = useState(
    publishableIndicators
  );

  const [siren, setSiren] = useState(session.legalUnit.siren || "");

  const [declarant, setDeclarant] = useState("");
  const [email, setEmail] = useState("");
  const [autorisation, setAutorisation] = useState(false);
  const [forThirdParty, setForThirdParty] = useState(false);
  const [declarantOrganisation, setDeclarantOrganisation] = useState("");
  const [price, setPrice] = useState("0");
  const [displayRecap, setDisplayRecap] = useState(false);
  const [errors, setErrors] = useState({});

  const onCheckIndicator = (event) => {
    const indicator = event.target.value;
    setIndicatorsToPublish((prevState) => ({
      ...prevState,
      [indicator]: !prevState[indicator],
    }));
  };

  const onSirenChange = (e) => {
    setSiren(e.target.value);
  };

  const onDeclarantChange = (e) => {
    setDeclarant(e.target.value);
  };

  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const onThirdPartyChange = () => {
    setForThirdParty((prevState) => !prevState);
  };

  const onDeclarantOrganisationChange = (e) => {
    setDeclarantOrganisation(e.target.value);
  };

  const onAutorisationChange = () => {
    setAutorisation((prevState) => !prevState);
  };

  const changePrice = (event) => setPrice(event.target.value);

  const validateForm = async () => {
    const newErrors = {};
    if (!Object.values(indicatorsToPublish).some((value) => value)) {
      newErrors.indicatorsToPublish =
        "Sélectionnez au moins un indicateur à publier.";
    }
    if (!/^[0-9]{9}$/.test(siren)) {
      newErrors.siren = "Numero de SIREN incorrect.";
    } else {
      const isSirenValid = await checkSirenValidity(siren);
      if (!isSirenValid) {
        newErrors.siren = "Numéro de SIREN non reconnu.";
      }
    }

    if (declarant.trim() === "") {
      newErrors.declarant = "Veuillez saisir le nom et prénom du déclarant.";
    }
    if (email.trim() === "") {
      newErrors.email = "Veuillez saisir une adresse e-mail valide.";
    }
    if (!autorisation) {
      newErrors.autorisation =
        "Vous devez certifier être autorisé(e) à soumettre la déclaration.";
    }
    if (forThirdParty && declarantOrganisation.trim() === "") {
      newErrors.declarantOrganisation =
        "Veuillez saisir la structure déclarante.";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isFormValid = await validateForm();

    if (isFormValid) {
      setDisplayRecap(true);
    }
  };

  const checkSirenValidity = async(siren) => {
    return api
      .get("legalunit/" + siren)
      .then((res) => {
        const status = res.data.header.code;
        if (status === 200) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification du SIREN :", error);
        return false;
      });
  };

  return (
    <Container fluid>
      <section className="step">
        <h2>Publication</h2>
        <p>
          Valoriser votre empreinte en la publiant au sein de notre base de
          données ouverte.
        </p>
        {!displayRecap && (
          <>
            <div className="border p-4 border-2 rounded">
              <h3 className="mb-4">
                <i className="bi bi-pencil-square"></i> Formulaire de
                publication
              </h3>
              <h4>Liste des indicateurs</h4>
              <p>Sélectionnez les indicateurs que vous souhaitez publier : </p>
              <Table>
                <thead>
                  <tr>
                    <th>Indicateur</th>
                    <th className="text-end">Valeur</th>
                    <th></th>
                    <th className="text-end">Incertitude</th>
                    <th>Commentaires</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(metaIndics).map((indic) => (
                    <tr key={indic}>
                      <td>
                        <Form>
                          <Form.Check
                            type="checkbox"
                            id={`checkbox-${indic}`}
                            value={indic}
                            checked={indicatorsToPublish[indic]}
                            disabled={validations[periodKey].indexOf(indic) < 0}
                            onChange={onCheckIndicator}
                            label={metaIndics[indic].libelle}
                          />
                        </Form>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold">
                          {printValue(
                            socialFootprint.indicators[indic].value,
                            metaIndics[indic].nbDecimals
                          )}
                        </span>
                      </td>
                      <td className="text-start">
                        <span className="small">
                          &nbsp;{metaIndics[indic].unit}
                        </span>
                      </td>
                      <td className="text-end small">
                        <u>+</u>&nbsp;
                        {printValue(
                          socialFootprint.indicators[indic].uncertainty,
                          0
                        )}
                        &nbsp;%
                      </td>
                      <td>
                        <span className="small">{comments[indic] || "-"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {errors.indicatorsToPublish && (
                <p className="text-secondary small">
                  {errors.indicatorsToPublish}{" "}
                  <i className="bi bi-exclamation-circle"></i>
                </p>
              )}

              <h4 className="mt-5 mb-4">Informations du déclarant</h4>
              <Row>
                <Col lg={4}>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>SIREN</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={siren}
                        isInvalid={errors.siren}
                        onChange={onSirenChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.siren}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom - Prénom </Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={declarant}
                        isInvalid={errors.declarant}
                        onChange={onDeclarantChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.declarant}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Adresse e-mail</Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={email}
                        isInvalid={errors.email}
                        onChange={onEmailChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Check
                      type="checkbox"
                      id="thirdParty"
                      checked={forThirdParty}
                      onChange={onThirdPartyChange}
                      label="Déclaration effectuée pour un tiers."
                    />
                    {forThirdParty && (
                      <Form.Group className="my-3">
                        <Form.Label>Structure déclarante</Form.Label>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={declarantOrganisation}
                          isInvalid={errors.declarantOrganisation}
                          onChange={onDeclarantOrganisationChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.declarantOrganisation}
                        </Form.Control.Feedback>
                      </Form.Group>
                    )}
                  </Form>
                </Col>
                <Col>
                  <Form className="ms-5">
                    <Form.Label>Coût de la formalité*</Form.Label>
                    <Form.Check
                      type="radio"
                      id="price-0"
                      value="0"
                      checked={price === "0"}
                      onChange={changePrice}
                      label="Première déclaration : publication offerte"
                    />

                    <Form.Check
                      type="radio"
                      id="price-10"
                      value="10"
                      checked={price === "10"}
                      onChange={changePrice}
                      label="Organise à but non lucratif : 10 €"
                    />

                    <Form.Check
                      type="radio"
                      id="price-25"
                      value="25"
                      checked={price === "25"}
                      onChange={changePrice}
                      label="Société unipersonnelle : 25 €"
                    />

                    <Form.Check
                      type="radio"
                      id="price-50"
                      value="50"
                      checked={price === "50"}
                      onChange={changePrice}
                      label="Société : 50 €"
                    />
                    <p className="small fst-italic mt-3">
                      * Les revenus couvrent la réalisation des formalités,
                      ainsi que les frais d'hébergement et de maintenance pour
                      l'accessibilité des données.
                    </p>
                  </Form>
                </Col>

                <Form.Group className="mt-4 border-top border-2 pt-4">
                  <Form.Check
                    type="checkbox"
                    id="certification-checkbox"
                    label="Je certifie être autorisé(e) à soumettre la déclaration ci-présente."
                    checked={autorisation}
                    onChange={onAutorisationChange}
                    className="fw-bold"
                    required
                  />
                </Form.Group>
              </Row>
            </div>
            <p className="mt-3">
              <button
                className="btn btn-secondary"
                disabled={!autorisation}
                onClick={handleSubmit}
              >
                Publier mes résultats
              </button>
            </p>
          </>
        )}

        {displayRecap && (
          <Summary
            siren={siren}
            corporateName={corporateName}
            year={year}
            declarant={declarant}
            declarantOrganisation={declarantOrganisation}
            email={email}
            price={price}
            socialFootprint={socialFootprint}
            indicatorsToPublish={indicatorsToPublish}
            comments={comments}
            onReturn={() => setDisplayRecap(false)}
          />
        )}
      </section>
    </Container>
  );
};

// /* ----- Summary ----- */

const PublishSummary = ({
  siren,
  corporateName,
  year,
  declarant,
  declarantOrganisation,
  price,
  legalUnitFootprint,
  todayString,
  comments,
}) => {
  return (
    <div className="border p-4 border-2 rounded mb-3">
      <h3 className="mb-3">
        <i className="bi bi-list-check"></i> Récapitulatif
      </h3>

      <div>
        <h4 className="h5 mb-4">Données à publier</h4>
        <p>
          <b>Siren : </b>
          {siren}
        </p>
        <p>
          <b>Dénomination : </b>
          {corporateName}
        </p>
        <p>
          <b>Année : </b>
          {year}
        </p>
        <p>
          <b>Indicateurs : </b>
        </p>
        <ul className="list-unstyled small mt-1">
          {Object.entries(legalUnitFootprint).map(([indicator, value]) => (
            <li key={indicator} className="p-1 ">
              {metaIndics[indicator].libelle}
              {comments[indicator] && (
                <span className="d-block m-1 small">
                  Commentaire: {comments[indicator]}
                </span>
              )}
            </li>
          ))}
        </ul>
        <hr className="w-25"></hr>
        <p>
          <b>Fait le : </b>
          {todayString}
        </p>
        <p>
          <b>Déclarant : </b>
          {declarant}
        </p>
        {declarantOrganisation && (
          <p>
            <b>Structure déclarante :</b> {declarantOrganisation}
          </p>
        )}
        <p>
          <b>Coût de la formalité : </b>
          {price} €
        </p>
      </div>
    </div>
  );
};

const Summary = (props) => {
  const {
    siren,
    corporateName,
    year,
    declarant,
    declarantOrganisation,
    email,
    price,
    socialFootprint,
    indicatorsToPublish,
    comments,
    onReturn,
  } = props;

  const [isSend, setIsSend] = useState(false);
  const [error, setError] = useState(false);
  const today = new Date();
  const todayString = 
    String(today.getDate()).padStart(2, "0") +
    "/" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "/" +
    today.getFullYear();

  const legalUnitFootprint = Object.entries(socialFootprint.indicators)
    .filter(([indicator, _]) => indicatorsToPublish[indicator])
    .reduce((acc, [indicator, value]) => {
      acc[indicator] = value;
      return acc;
    }, {});

  const exportStatement = () => 
  {
    // build pdf
    const statementPDF = buildStatementPDF(
      siren,
      corporateName,
      year,
      declarant,
      declarantOrganisation,
      price,
      legalUnitFootprint,
      comments
    );

    let today = new Date();
    statementPDF.download(
      "declaration_"+siren +
      "-" + 
        String(today.getDate()).padStart(2, "0") + 
        String(today.getMonth()+1).padStart(2, "0") + 
        today.getFullYear() +
      ".pdf"
    );
  };

  const submitStatement = async (event) => {
    event.preventDefault();

    try {
      // build PDF
      const statementPDF = buildStatementPDF(
        siren,
        corporateName,
        year,
        declarant,
        declarantOrganisation,
        price,
        legalUnitFootprint,
        comments
      );
      
      const statementFilePromise = new Promise((resolve, reject) => {
        statementPDF.getBase64((datauristring) => {
          resolve(datauristring);
        });
      });

      const statementFile = await statementFilePromise;


      const messageToAdmin = mailToAdminWriter(
        siren,
        corporateName,
        year,
        legalUnitFootprint,
        comments,
        declarant,
        declarantOrganisation,
        email,
        price
      );

      const resAdmin = await sendStatementToAdmin(
        messageToAdmin,
        statementFile
      );

      const messageToDeclarant = mailToDeclarantWriter(declarant);

      const resDeclarant = await sendStatementToDeclarant(
        email,
        messageToDeclarant,
        statementFile
      );

      if (resAdmin.status == 200 && resDeclarant.status == 200 ) {
        setIsSend(true);
        setError(false);
      } else {
        setIsSend(false);
        setError(true);
      }
    } catch (error) {
      setIsSend(false);
      setError(true);
      console.error("Erreur lors de la soumission de la déclaration :", error);
    }
  };

  return (
    <div>
      <PublishSummary
        siren={siren}
        corporateName={corporateName}
        declarantOrganisation={declarantOrganisation}
        year={year}
        declarant={declarant}
        price={price}
        legalUnitFootprint={legalUnitFootprint}
        todayString={todayString}
        comments={comments}
      />

      {isSend && (
        <div className="alert alert-success">
          <p>Demande de publication envoyée ! Merci.</p>
        </div>
      )}
      {error && (
        <div className="alert alert-danger">
          <p>
            Erreur lors de l'envoi de la publication. Si l'erreur persiste,
            contactez le support.
          </p>
        </div>
      )}
      <div className="mt-4">
        <button className={"btn btn-primary me-2"} onClick={exportStatement}>
          <i className="bi bi-download"></i> Télécharger le récapitulatif
        </button>
        <button className={"btn btn-secondary"} onClick={submitStatement}>
          <i className="bi bi-send"></i> Envoyer pour publication
        </button>
      </div>
      <div className="text-end mt-4">
        <button className="btn btn-light" onClick={onReturn}>
          <i className="bi bi-chevron-left"></i> Retour au formulaire
        </button>
      </div>
    </div>
  );
};

export default PublishStatementSection;

/* ----- Builder message mails ----- */

const mailToAdminWriter = (
  siren,
  corporateName,
  year,
  legalUnitFootprint,
  comments,
  declarant,
  declarantOrganisation,
  email,
  price
) => {
  let mailContent = `Unité légale : ${siren} \n
Dénomination : ${corporateName} \n
Année : ${year}  \n
Valeurs à publier :\n
${Object.entries(legalUnitFootprint)
  .map(([indicator, value]) => {
    const comment = comments[indicator]
      ? ` Commentaire : ${comments[indicator]}`
      : "";
    return `- ${indicator} : ${value.value} ( incertitude : +/- ${value.uncertainty} % )${comment}`;
  })
  .join("\n")}`;

  if (declarantOrganisation) {
    mailContent += `\nStructure déclarante : ${declarantOrganisation}`;
  }

  mailContent += `\nDéclarant : ${declarant}\n
Mail : ${email}\n
Tarif : ${price} - €`;

  return mailContent;
};

const mailToDeclarantWriter = (declarant) => {
  let mailContent = `${declarant},\n

Votre demande de publication a bien été prise en compte. Vous trouverez ci-joint votre déclaration.
Le délai de traitement est de 7 jours.\n

Pour modifier ou supprimer les données publiées, contactez-nous directement via l'adresse mail admin@lasocietenouvelle.org.\n

Bien à vous,\n
La Société Nouvelle.`;

  return mailContent;
};
