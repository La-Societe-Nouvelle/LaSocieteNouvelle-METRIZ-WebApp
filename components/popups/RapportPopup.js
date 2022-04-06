import React, { useState } from 'react'
import { InputText } from '../input/InputText'

const RapportPopup = (props) => {


  const [siren, setSiren] = useState();
  const [activitePrincipale, setActivitePrincipale] = useState();
  const [expenses] = useState(props.session.financialData.expenses);
  const [companiesActivityCode, setCompaniesActivityCode] = useState([]);
  const getCompany = props.session.financialData.getCompany;
  const [isDisable, setIsDisable] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [companyExpense, setCompanyExpense] = useState([])
  const [partOfExpense, setPartOfExpense] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!siren) return;

    async function fetchData() {
      const response = await fetch(
        `https://systema-api.azurewebsites.net/api/v2/siren/${siren}`
      );
      const data = await response.json();
      const APE = data.profil.descriptionUniteLegale.activitePrincipale;
      setActivitePrincipale(APE);
    }
    fetchData();
    getCompaniesActivityCode(expenses);
    setIsDisable(true);
    getExpenseAmount(expenses)
    getPartOfExpense(totalExpense,companyExpense,companiesActivityCode)
  };

  function handleSiren(siren) {
    setSiren(siren)
  }



  function getPartOfExpense(totalExpense,companyExpense) {

    setPartOfExpense([])
    companyExpense.map((expense) =>
    setPartOfExpense(partOfExpense => [...partOfExpense, Math.floor(totalExpense/expense)])

  )


  }
 
  function getExpenseAmount(expenses) {
    setCompanyExpense([])
    let total = 0;
    expenses.map((expense) =>
      setCompanyExpense(companyExpense =>[...companyExpense, expense.amount] )
    )
    expenses.map((expense) =>
      total += expense.amount,
    )

    setTotalExpense(total)
  }


  function getCompaniesActivityCode(expenses) {

    setCompaniesActivityCode([])

    expenses.map((expense) =>

      getCompany(expense.id).legalUnitActivityCode ?
        setCompaniesActivityCode(companiesActivityCode => [...companiesActivityCode, getCompany(expense.id).legalUnitActivityCode])
        :
        setCompaniesActivityCode(companiesActivityCode => [...companiesActivityCode, getCompany(expense.id).footprintActivityCode])
    )
  }

  return (
    <div className="modal-overlay" id="rapport-popup">
      <div className="modal-wrapper">
        <div className={"modal "}>
          <div className="header">
            <h3>Contribuez aux rapports statistiques</h3>
          </div>
          <div className="body">
            <div className="message">
              <h4>
                Numéro de siren de l'entreprise
              </h4>
              <p>
                Le numéro de siren permet de récupérer le code APE (disponible au sein du répertoire SIRENE).
                Le code d’activité principale nécessaire au travail statistique.<br />
                Le numéro de siren ne sera pas inclu dans le rapport envoyé, seul le code APE sera intégré.
                Le détail des informations transmises sera affichée avant confirmation de l’envoi.
              </p>
            </div>
            <InputText
              value={siren}
              unvalid={siren != "" && !/^[0-9]{9}$/.test(siren)}
              onUpdate={handleSiren}
            />

            {
              activitePrincipale && (
                <div className="step">
                  <h4>Informations envoyées dans le rapport</h4>
                  <p>Code APE : {activitePrincipale}</p>
                  <ul>
                    {companiesActivityCode.map((code, index) => (
                      <li key={index}>
                        {code} : {partOfExpense[index]}
                      </li>
                    ))}
                  </ul>

                </div>
              )
            }
      {
          console.log(partOfExpense)
      }
            {/* <button className="btn" onClick={onGoBack} >Ok</button> */}
          </div>
          <div className="footer">
            <button className="btn btn-secondary"  onClick={handleSubmit}>
              Envoyer mon rapport
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RapportPopup