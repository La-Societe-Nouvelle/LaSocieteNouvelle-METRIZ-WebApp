// La Société Nouvelle
import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";

// Libraries
import { getPublishableIndicators } from "./utils";
import IndicatorList from "./views/IndicatorList";
import DeclarantForm from "./views/DeclarantForm";
import { useForm } from "./hooks/useForm";
import SummaryModal from "./views/SummaryModal";

/* ----------------------------------------------------------- */
/* -------------------- PUBLISH STATEMENT SECTION -------------------- */
/* ----------------------------------------------------------- */

const PublishStatementSection = ({ session, period }) => {
  const { financialData, impactsData } = session;

  const { periodKey } = period;
  const { productionAggregates } = financialData;
  const legalUnitFootprint =
    productionAggregates.revenue.periodsData[periodKey].footprint;

  const year = period.dateEnd.substring(0, 4);
  const comments = impactsData[periodKey].comments;

  const [showModalSummary, setShowModalSummary] = useState(false);

  const initialFormData = {
    siren: session.legalUnit.siren,
    corporateName: session.legalUnit.corporateName,
    declarant: "",
    email: "",
    forThirdParty: false,
    declarantOrganisation: "",
    autorisation: false,
    price: "0",
    footprint: {},
    year: year,
  };

  const {
    formData,
    formErrors,
    setFormErrors,
    handleFormChange,
    handleCheckIndicator,
    validateForm,
  } = useForm(initialFormData);

  useEffect(() => {
    const publishableIndicators = getPublishableIndicators(
      legalUnitFootprint,
      comments
    );

    handleFormChange("footprint", publishableIndicators);
  }, []);

  useEffect(() => {
    const validateSiren = async () => {
      const newErrors = {
        ...formErrors,
        siren: "",
      };

      if (/^[0-9]{9}$/.test(formData.siren)) {
        try {
          session.legalUnit.siren = formData.siren;
          await session.legalUnit.fetchLegalUnitData();
          handleFormChange("corporateName", session.legalUnit.corporateName);

          if (!session.legalUnit.siren) {
            newErrors.siren = "Numéro de SIREN non reconnu.";
          }
          if (/^[0-9]{2}/.test(session.legalUnit.activityCode)) {
            let nextDivision = session.legalUnit.activityCode.slice(0, 2);
            session.comparativeData.comparativeDivision = nextDivision;
          }
        } catch (error) {
          console.log(error);
        }
      }

      if (formData.siren && !/^\d+$/.test(formData.siren)) {
        newErrors.siren = "Numéro de SIREN incorrect.";
      }

      setFormErrors(newErrors);
    };

    validateSiren();
  }, [formData.siren]);

  const onCheckIndicator = (indicator) => {
    handleCheckIndicator(indicator);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isFormValid = await validateForm();

    if (isFormValid) {
      setShowModalSummary(true);
    }
  };

  return (
    <Container fluid>
      <section className="step">
        <h2>Publication</h2>
        <p>
          Valoriser votre empreinte en la publiant au sein de notre base de
          données ouverte.
        </p>
        {console.log(formData)}

        <IndicatorList
          legalUnitFootprint={formData.footprint}
          comments={comments}
          onCheckIndicator={onCheckIndicator}
        />

        <h3 className="my-4">
          <i className="bi bi-pencil-square"></i> Informations du déclarant
        </h3>

        <Form onSubmit={handleSubmit}>
          <DeclarantForm
            formData={formData}
            setFormData={handleFormChange}
            errors={formErrors}
          />
          {formErrors.footprint && (
            <p className="alert alert-danger mt-4 small">
              {formErrors.footprint}{" "}
              <i className="bi bi-exclamation-circle"></i>
            </p>
          )}

          <Form.Group className="my-4 mx-1">
            <Form.Check
              type="checkbox"
              id="certification-checkbox"
              label="Je certifie être autorisé(e) à soumettre la déclaration ci-présente."
              checked={formData.autorisation}
              onChange={(e) =>
                handleFormChange("autorisation", e.target.checked)
              }
              className="fw-bold"
              required
            />
          </Form.Group>

          <Button
            variant="secondary"
            disabled={!formData.autorisation}
            onClick={handleSubmit}
          >
            Publier mes résultats
          </Button>
        </Form>

        {showModalSummary && (
          <SummaryModal
            formData={formData}
            handleClose={() => setShowModalSummary(false)}
            showModal={showModalSummary}
          />
        )}
      </section>
    </Container>
  );
};

export default PublishStatementSection;

