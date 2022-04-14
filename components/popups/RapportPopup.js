import React, { useState } from 'react'
import { InputText } from '../input/InputText'
import { sendReportToAdmin } from '/pages/api/mail-api'

const RapportPopup = (props) => {

  const getCompany = props.session.financialData.getCompany;

  // State
  const [expenses] = useState(props.session.financialData.expenses);
  const [siren, setSiren] = useState();
  const [activitePrincipale, setActivitePrincipale] = useState();
  const [showSubmit, setShowSubmit] = useState(false);
  const [listOfExpenses, setListOfExpense] = useState([{}]);
  const [showRecap, setShowRecap] = useState(false);
  const [erreur, setErreur] = useState("");


  function handleSiren(siren) {
    setSiren(siren)
  }

  const getListOfExpense = async (expenses) => {

    let total = 0;

    // Total of expenses 

    expenses.map((expense) => {
      total += expense.amount
    })

    // Temporary array
    var arrObj = [];

    expenses.forEach((expense) => {

      let getActivityCode = getCompany(expense.id).legalUnitActivityCode
        ? getCompany(expense.id).legalUnitActivityCode
        : getCompany(expense.id).footprintActivityCode;

      let getPartOfExpense = (expense.amount / total).toFixed(10);

      arrObj.push(
        {
          activityCode: getActivityCode,
          partOfExpense: getPartOfExpense
        }
      )
    })

    // Group by activity code and sum amount 
    var result = [];
    arrObj.reduce(function (res, value) {
      if (!res[value.activityCode]) {
        res[value.activityCode] = { activityCode: value.activityCode, partOfExpense: 0 };
        result.push(res[value.activityCode])
      }
      res[value.activityCode].partOfExpense = (parseFloat(res[value.activityCode].partOfExpense) + parseFloat(value.partOfExpense)).toFixed(4);
      return res;
    }, {});

    setListOfExpense(result)

  }


  const fetchSirenData = async (siren) => {

    const response = await fetch(
      `https://systema-api.azurewebsites.net/api/v2/siren/${siren}`
    );


    const data = await response.json();
    if (data.header.statut == 200) {
      return data.profil.descriptionUniteLegale.activitePrincipale
    }
    else {
      return false;
    }
  };


  const getDataOnSubmit = async () => {

    setErreur("");
    if (!siren) return;

    let APE = await fetchSirenData(siren);
    if (APE) {
      await getListOfExpense(expenses)
      setActivitePrincipale(APE);
      setShowRecap(true);
      setShowSubmit(true);
    } else {
      setErreur("Erreur lors de la récupération du numéro de Siren");
    }

  };

  const ButtonRecap = () => {

    return (
      <button className="btn btn-secondary" disabled={siren ? false : true} onClick={getDataOnSubmit}>
        Consulter les données envoyées
      </button>
    )

  }

  const ButtonSubmit = ({ handleClick }) => {
    return (
      <button className="btn btn-secondary" id="submit" onClick={handleClick} >
        Envoyer mon rapport
      </button>
    )
  }


  const sendReport = async (activitePrincipale, listOfExpenses) => {
    const json = JSON.stringify({ activitePrincipale: activitePrincipale, listOfExpenses: listOfExpenses });
    const file = new Blob([json], { type: 'application/json' });
    const fileName = "rapport_" + activitePrincipale;

    const res = await sendReportToAdmin(file, fileName);

    res.status < 300 ? setErreur("send") : setErreur("Erreur lors de l'envoi du rapport. Si l'erreur persiste, veuillez contacter le support.");
  }



  return (

    <div className="modal-overlay" id="rapport-popup">
      <div className="modal-wrapper">
        <div className={"modal "}>
          <div className="header">
            <h3>Contribuez aux rapports statistiques</h3>
          </div>
          <div className="body">

            {
              showRecap ?
                <div>
                  <h4>Informations envoyées dans le rapport</h4>
                  <div className="">
                    <h5>Code APE : {activitePrincipale}</h5>
                    <table className="w100">
                      <thead>
                        <tr>
                          <th>
                            Code d'activité
                          </th>
                          <th>
                            Part des dépenses
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {listOfExpenses.map(({ activityCode, partOfExpense }, index) => (
                          <tr key={index}>
                            <td>
                              {activityCode}
                            </td>
                            <td>
                              {partOfExpense}
                            </td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                :
                <div>
                  <h4>
                    Numéro de siren de l'entreprise
                  </h4>
                  <p>
                    Le numéro de siren permet de récupérer le code APE (disponible au sein du répertoire SIRENE).
                    Le code d’activité principale nécessaire au travail statistique.<br />
                    Le numéro de siren ne sera pas inclu dans le rapport envoyé, seul le code APE sera intégré.
                    Le détail des informations transmises sera affiché avant confirmation de l’envoi.
                  </p>
                  <div className="form-group mt-1">
                    <label>Entrer votre numéro de siren</label>
                    <InputText
                      value={siren}
                      unvalid={siren != "" && !/^[0-9]{9}$/.test(siren)}
                      onUpdate={handleSiren}
                    />
                  </div>
                </div>
            }
            {
              erreur && (
                <div className="alert alert-error">
                  <p>
                    {erreur}
                  </p>
                </div>
              )
            }
          </div>

          <div className="footer">
            {showSubmit ? <ButtonSubmit handleClick={() => sendReport(activitePrincipale, listOfExpenses)} /> : <ButtonRecap />}
            <button className="btn" onClick={() => props.onGoBack()}>
              Retour
            </button>
          </div>

        </div>
      </div>
    </div>
  )

}


export default RapportPopup