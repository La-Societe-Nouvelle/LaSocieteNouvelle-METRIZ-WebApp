// La Société Nouvelle

// React
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Button, Col, Form, FormGroup, Image, Row } from "react-bootstrap";

// Styles
import { customSelectStyles } from "/config/customStyles";

// Librairies
import divisions from "/lib/divisions";

// Modals
import { BalanceForwardBookSelection } from "../modals/BalanceForwardBookSelection";
import { DepreciationAssetsMapping } from "../modals/DepreciationAssetsMapping";
import { StockPurchasesMapping } from "../modals/StockPurchasesMapping";
import { ErrorReportModal } from "../modals/ErrorReportModal";
import { ImportModal } from "../modals/ImportModal";
import { ErrorAPIModal } from "../../../modals/userInfoModals";

// Readers
import { FECDataReader } from "../utils/FECReader";

// Utils
import { getDivisionsOptions } from "/src/utils/metaUtils";
import { getFinancialPeriodFECData, getMonthPeriodsFECData } from "../utils";

// Components
import { FinancialDataDropzone } from "./FinancialDataDropzone";

/* ---------- FEC IMPORT FORM ---------- */

/** View to import financial data (accounting data file)
 *
 *  Props :
 *    - session
 *    - selectedPeriod
 *    - submit
 *
 *  Read accounting data file
 *  Get informations :
 *    - company id (SIREN)
 *    - name
 *    - economic division
 */

// Division options
const divisionsOptions = getDivisionsOptions({excluded: ["00"]});

export const FinancialDataForm = ({
  session,
  onSelectPeriod,
  submit
}) => {

  const [siren, setSiren] = useState(session.legalUnit.siren);
  const [corporateName, setCorporateName] = useState(session.legalUnit.corporateName || "");
  const [division, setDivision] = useState(session.comparativeData.comparativeDivision || "");
  const [fileName, setFileName] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // session options
  const [useChatGPT, setUseChatGPT] = useState(session.useChatGPT);
  
  // Accounting import
  const [FECData, setFECData] = useState(null);
  const [showViewsModals, setShowViewsModals] = useState(false);
  const [modal, setModal] = useState(0);
  
  // UI Modals
  const [hasErrorsFEC, setHasErrorsFEC] = useState(false);
  const [errorsMessage, setErrorsMessage] = useState("");
  const [errorsFEC, setErrorsFEC] = useState([]);
  const [errorAPI, setErrorAPI] = useState(false);

  // ----------------------------------------------------------------------------------------------------
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
          session.comparativeData.comparativeDivision = nextDivision;
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
    session.comparativeData.comparativeDivision = division;
  }, [division]);

  useEffect(() => {
    session.useChatGPT = useChatGPT;
  }, [useChatGPT]);

  // ----------------------------------------------------------------------------------------------------
  // Handlers -----------------------------------------

  // on change - siren
  const handleSirenChange = async (event) => {
    let nextSiren = event.target.value.trim();
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

  // on change - useChatGPT
  const handleUseChatGPT = (event) => {
    const useChatGPT = event.target.checked;
    setUseChatGPT(useChatGPT);
  }

  // ----------------------------------------------------------------------------------------------------

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

  // ----------------------------------------------------------------------------------------------------
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
      console.log(accountingData.errors);
      
      setShowViewsModals(false);
      setHasErrorsFEC(true);
      setErrorsMessage("Erreur(s) relevée(s) : ");
      setErrorsFEC(accountingData.errors);
      setFECData(null);
    } 
    else 
    {
      // console logs
      console.log("Aucune erreur de lecture");

      // build periods
      let financialPeriod = await getFinancialPeriodFECData(accountingData);
      let monthPeriods = getMonthPeriodsFECData(accountingData);
      let periods = [financialPeriod, ...monthPeriods];
      
      // add periods
      session.addPeriods(periods);

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
      console.log("Periode : ", financialPeriod);
      console.log("Session id : ", session.id);
      
      setIsDataLoaded(true);
      setShowViewsModals(false);
      onSelectPeriod(financialPeriod);
    }
  };

  // ----------------------------------------------------------------------------------------------------

  // Check form
  const isFormValid = () => {
    return (
      isDataLoaded &&
      corporateName &&
      division &&
      (siren === "" || /^[0-9]{9}$/.test(siren))
    );
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
                setFileName={setFileName}
              />
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

            <Form.Group>
              <Form.Label column sm={4}>
                Options
              </Form.Label>
              <Form.Check
                className="fw"
                type="switch"
                value={useChatGPT}
                checked={useChatGPT}
                onChange={handleUseChatGPT}
                id="Utilisation de ChatGPT"
                label="Utilisation de ChatGPT (OpenAI)"
              />
              <div className="form-text">
                <p className="mt-2">
                  L'usage de ChatGPT permet d'obtenir une association automatique
                  entre les comptes de charges et les divisions économiques, pour
                  estimer les empreintes des dépenses dont le fournisseur n'est pas
                  identifié ; et de disposer d'une analyse des résultats obtenus
                  en fin de session. <b>Aucune donnée nominative n'est présente au
                  sein des requêtes, et ces dernières ne servent pas à l'amélioration
                  du modèle</b> ( 
                  <a href="https://openai.com/enterprise-privacy" 
                     target="_blank"><u>Politique de confidentialité des données</u> </a>
                   d'OpenAI).
                </p>
              </div>
            </Form.Group>

            <div>              
              <p className="small fst-italic mb-3 mt-3 text-end">*Champs obligatoires</p>
            </div>

            {showViewsModals && (
              <>
                <ImportModal show={modal === 1} onHide={cancelImport} title={fileName}>
                  <BalanceForwardBookSelection
                    FECData={FECData}
                    onSubmit={() => nextModal(1)}
                    onCancel={cancelImport}
                  />
                </ImportModal>
                <ImportModal show={modal === 2} onHide={cancelImport} title={fileName}>
                  <DepreciationAssetsMapping
                    meta={FECData.meta}
                    onSubmit={() => nextModal(2)}
                    onGoBack={() => setModal(1)}
                  />
                </ImportModal>
                <ImportModal show={modal === 3} onHide={cancelImport} title={fileName}>
                  <StockPurchasesMapping
                    meta={FECData.meta}
                    onSubmit={() => loadAccountingData(FECData)}
                    onGoBack={() => setModal(2)}
                  />
                </ImportModal>
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