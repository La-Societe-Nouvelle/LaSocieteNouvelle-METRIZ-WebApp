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
import { ProviderNumMode } from "../modals/ProviderNumMode";
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

  // ----------------------------------------------------------------------------------------------------

  /** Modals
   *    1 - A-Nouveaux
   *    2 - Associations comptes immobilisations
   *    3 - Associations comptes stocks
   *    4 - Comptes fournisseurs
   */

  const hasAssetAccounts = Object.keys(FECData?.meta?.accounts ?? []).some((accountNum) => /^(28|29|39)/.test(accountNum));
  const hasStockAccounts = Object.keys(FECData?.meta?.accounts ?? []).some((accountNum) => /^3(1|2|7)/.test(accountNum));
  
  const nextModal = () => 
  {
    if (modal==1 && hasAssetAccounts) {
      setModal(2)
    } else if (modal<=2 && hasStockAccounts) {
      setModal(3);
    } else {
      setModal(4);
    }
  };

  const prevModal = () => 
  {
    if (modal==4 && hasStockAccounts) {
      setModal(3)
    } else if (modal>=3 && hasAssetAccounts) {
      setModal(2);
    } else {
      setModal(1);
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
                <ImportModal show={modal === 1} onHide={cancelImport} title={"Identification du journal des A-Nouveaux"} fileName={fileName}>
                  <BalanceForwardBookSelection
                    FECData={FECData}
                    onSubmit={() => nextModal()}
                    onCancel={cancelImport}
                  />
                </ImportModal>
                <ImportModal show={modal === 2} onHide={cancelImport} title={"Associations entre comptes d'amortissements et comptes d'immobilisations"}  fileName={fileName}>
                  <DepreciationAssetsMapping
                    meta={FECData.meta}
                    onSubmit={() => nextModal()}
                    onGoBack={() => prevModal()}
                  />
                </ImportModal>
                <ImportModal show={modal === 3} onHide={cancelImport} title={"Associations entre comptes de stocks et comptes de charges"}  fileName={fileName}>
                  <StockPurchasesMapping
                    meta={FECData.meta}
                    onSubmit={() => setModal()}
                    onGoBack={() => prevModal()}
                  />
                </ImportModal>
                <ImportModal show={modal === 4} onHide={cancelImport} title={"Gestion des comptes fournisseurs"}  fileName={fileName}>
                  <ProviderNumMode
                    meta={FECData.meta}
                    onSubmit={() => loadAccountingData(FECData)}
                    onGoBack={() => prevModal()}
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