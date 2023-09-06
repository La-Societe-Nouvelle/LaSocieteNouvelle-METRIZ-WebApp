// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Select from "react-select";

// Bootstrap
import { Button, Col, Form, FormGroup, Image, Row } from "react-bootstrap";
import { customSelectStyles } from "/config/customStyles";

// Lib
import divisions from "/lib/divisions";

// Readers
import { FECDataReader } from "../utils/FECReader";

import { ErrorAPIModal } from "../../../modals/userInfoModals";
import { getDivisionsOptions } from "/src/utils/Utils";
import { FinancialDataDropzone } from "./FinancialDataDropzone";
import ImportModal from "../ImportModal";
import { BalanceForwardBookSelection } from "./BalanceForwardBookSelection";
import { DepreciationAssetsMapping } from "./DepreciationAssetsMapping";
import { StockPurchasesMapping } from "./StockPurchasesMapping";
import { getFinancialPeriodFECData, getMonthPeriodsFECData } from "../utils";
import ErrorReportModal from "../../../modals/ErrorReportModal";

/* ---------- FEC IMPORT FORM ---------- */

/** View to import financial data (accounting data file)
 *
 *  Props :
 *    - onClick()
 *
 *  Read accounting data file
 *  Get informations :
 *    - company id (SIREN)
 *    - name
 *    - economic division
 */

// Division options
const divisionsOptions = getDivisionsOptions(divisions);

export const FinancialDataForm = ({
  session,
  selectPeriod,
  submit
}) => {

  const [siren, setSiren] = useState(session.legalUnit.siren);
  const [corporateName, setCorporateName] = useState(session.legalUnit.corporateName || "");
  const [division, setDivision] = useState(session.legalUnit.activityCode || "");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Accounting import
  const [FECData, setFECData] = useState(null);
  const [showViewsModals, setShowViewsModals] = useState(false);
  const [modal, setModal] = useState(0);
  const [fileName, setFileName] = useState(null);
  
  // UI Modals
  const [hasErrorsFEC, setHasErrorsFEC] = useState(false);
  const [errorsMessage, setErrorsMessage] = useState("");
  const [errorsFEC, setErrorsFEC] = useState([]);
  const [errorAPI, setErrorAPI] = useState(false);

  // update session -----------------------------------

  useEffect(async () => 
  {
    session.legalUnit.siren = siren;
    if (/^[0-9]{9}/.test(siren)) 
    {
      try {
        await session.legalUnit.fetchLegalUnitData();
        setCorporateName(session.legalUnit.corporateName || "");
        if (/^[0-9]{2}/.test(session.legalUnit.activityCode)) {
          let nextDivision = session.legalUnit.activityCode.slice(0, 2);
          session.comparativeData.activityCode = nextDivision;
          setDivision(nextDivision);
        }
      } catch (error) {
        setErrorAPI(true);
      }
    }
  }, [siren])

  useEffect(() => {
    session.legalUnit.corporateName = corporateName;
  }, [corporateName]);

  useEffect(() => {
    session.comparativeData.activityCode = division;
  }, [division]);

  // Check form ---------------------------------------

  const isFormValid = () => {
    return (
      isDataLoaded &&
      corporateName &&
      division &&
      (siren === "" || /^[0-9]{9}$/.test(siren))
    );
  };

  // Handlers -----------------------------------------

  // on change - siren
  const handleSirenChange = async (event) => {
    let nextSiren = event.target.value;
    setSiren(nextSiren);
  };

  // on change - corporate name
  const handleCorporateNameChange = (event) => {
    setCorporateName(event.target.value);
   // props.onChangeCorporateName(event.target.value);
  };

  const handleDivisionChange = (selectedOption) => {
    const division = selectedOption.value;
    setDivision(division)
    //props.onChangeDivision(division);
  };

  const handleFECData = (FECData) => 
  {
    setIsDataLoaded(false);
    setFECData(FECData);
    setModal(1);
    setShowViewsModals(true);
  };

  // Modals -------------------------------------------

  const renderBalanceForwardBookModal = () => (
    <ImportModal
      show={modal === 1}
      onHide={cancelImport}
      title={fileName}
    >
      <BalanceForwardBookSelection
        return={cancelImport}
        FECData={FECData}
        onClick={() => nextModal(1)}
      />
    </ImportModal>
  );

  const renderDepreciationAssetsModal = () => (
    <ImportModal
      show={modal === 2}
      onHide={cancelImport}
      title={fileName}
    >
      <DepreciationAssetsMapping
        return={() => setModal(1)}
        onClick={() => nextModal(2)}
        meta={FECData.meta}
      />
    </ImportModal>
  );

  const renderStockPurchasesModal = () => (
    <ImportModal
      show={modal === 3}
      onHide={cancelImport}
      title={fileName}
    >
      <StockPurchasesMapping
        return={() => setModal(2)}
        onClick={() => loadAccountingData(FECData)}
        meta={FECData.meta}
      />
    </ImportModal>
  );

  const nextModal = () => 
  {
    let hasAssetAccounts = Object.keys(FECData.meta.accounts)
      .some((accountNum) => /^(28|29|39)/.test(accountNum));
    let hasStockAccounts = Object.keys(FECData.meta.accounts)
      .some((accountNum) => /^3(1|2|7)/.test(accountNum));

    if (modal<2 && hasAssetAccounts) {
      setModal(2);
    } else if (modal<3 && hasStockAccounts) {
      setModal(3);
    } else {
      loadAccountingData();
    }
  };

  const cancelImport = () => {
    setFECData(null);
    setShowViewsModals(false);
    setFileName(false);
  }

  // Load accounting data -----------------------------

  const loadAccountingData = async () => 
  {
    let accountingData = await FECDataReader(FECData);

    // console logs
    console.log("Lecture des écritures comptables");
    console.log("Données extraites du FEC : ")
    console.log(accountingData);

    if (accountingData.errors.length > 0) 
    {
      // console logs
      console.log("Erreur(s) de lecture : ");
      accountingData.errors.forEach((error) => console.log(error));

      setHasErrorsFEC(true);
      setErrorsMessage("Erreur(s) relevée(s) : ");
      setErrorsFEC(accountingData.errors);
      setImportedData(null);
    } 
    else 
    {
      // console logs
      console.log("Aucune erreur détectée");

      // build periods
      let financialPeriod = getFinancialPeriodFECData(accountingData);
      let monthPeriods = getMonthPeriodsFECData(accountingData);
      let periods = [financialPeriod, ...monthPeriods];
      
      // add periods
      session.addPeriods(periods);
      //selectPeriod(financialPeriod); // set selected period in App

      // load financial data
      await session.financialData.loadFECData(
        accountingData,
        financialPeriod,
        periods
      );

      // impacts data
      let impactsDataOnFinancialPeriod = session.impactsData[financialPeriod.periodKey];
      impactsDataOnFinancialPeriod.netValueAdded = session.financialData.mainAggregates.netValueAdded.periodsData[financialPeriod.periodKey].amount;
      impactsDataOnFinancialPeriod.knwDetails.apprenticeshipTax = accountingData.KNWData.apprenticeshipTax;
      impactsDataOnFinancialPeriod.knwDetails.vocationalTrainingTax = accountingData.KNWData.vocationalTrainingTax;

        // FEC id
      session.id = FECData.id; // anonymisation id

      // console logs
      console.log("Periode : "+financialPeriod);
      console.log("Session id : "+session.id);
      
      setIsDataLoaded(true);
      setShowViewsModals(false);
      selectPeriod(financialPeriod);
    }
  };

  return (
    <>
      <Row>
        <Col lg={4}>
          <h3 className="subtitle">C'est parti !</h3>
          <Image
            fluid
            src="/illus/accountingImport.svg"
            alt="Financial Data Illustration"
          />
        </Col>
        <Col>
          <Form className="border-left">
            <Form.Group as={Row} className="my-3">
              <Form.Label column sm={4} className="fw-normal fst-italic">
                Numéro SIREN <i>(optionnel)</i> :
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={siren}
                  onChange={handleSirenChange}
                  pattern="[0-9]{9}"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Dénomination / Nom du projet * :
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={corporateName}
                  onChange={handleCorporateNameChange}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="my-3">
              <Form.Label column sm={4}>
                Branche d'activité * :
              </Form.Label>
              <Col sm={8}>
                <Select
                  styles={customSelectStyles}
                  options={divisionsOptions}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  placeholder="Selectionner une branche d'activité"
                  onChange={handleDivisionChange}
                  value={
                    division
                      ? {
                          label: division + " - " + divisions[division],
                          value: division,
                        }
                      : null
                  }
                  required
                />
              </Col>
            </Form.Group>

            <FormGroup className="my-3">
              <Form.Label>Fichier d'Ecritures Comptables (FEC) *</Form.Label>
              <div className="form-text">
                <p>
                  L'importation des écritures comptables s'effectue via un
                  Fichier d'Ecritures Comptables (FEC¹). Générez ce fichier{" "}
                  <b>
                    à partir de votre logiciel comptable, ou demandez-le auprès
                    de votre service comptable.
                  </b>
                </p>
              </div>
              <FinancialDataDropzone
                setImportedData={handleFECData}
                setFileRead={(name) => setFileName(name)}
              />
              <p className="small fst-italic mb-0">*Champs obligatoires</p>
              <p className="small fst-italic">
                ¹ Le fichier doit respecter les normes relatives à la structure
                du fichier (libellés des colonnes, séparateur tabulation ou
                barre verticale, encodage ISO 8859-15, etc.).
              </p>
            </FormGroup>

            {/* Files */}
                  
            {fileName && (
              <div className={`alert ${isDataLoaded ? 'alert-success' : 'alert-info'}`}>
                <p className="font-weight-bold">Fichier à analyser :</p>

                <p className="fw-bold">
                <i className="bi bi-file-earmark-spreadsheet"></i> 
                   {fileName}
                   <i className={`ms-1 bi ${isDataLoaded ? 'bi-check-lg' : 'bi-arrow-clockwise'}`}></i>
                </p>
             
              </div>
            )}
            {showViewsModals && (
              <>
                {renderBalanceForwardBookModal()}
                {renderDepreciationAssetsModal()}
                {renderStockPurchasesModal()}
              </>
            )}

            <div className="text-end">
              <Button
                variant="secondary"
                disabled={!isFormValid()}
                onClick={submit}
              >
                Suivant
                <i className="bi bi-chevron-right" />
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      {/* Error Modal for FEC Errors */}
      {hasErrorsFEC && (
        <ErrorReportModal
          hasError={hasErrorsFEC}
          onClose={() => setHasErrorsFEC(false)}
          errorMessage={errorsMessage}
          errors={errorsFEC}
        />
      )}

      {/* Error Modal for API Errors */}
      <ErrorAPIModal hasError={errorAPI} onClose={() => setErrorAPI(false)} />
    </>
  );
}