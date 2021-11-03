export const sendContactMail = async (objet,message,coordonnees) => 
{
  const recipientMail= "contact@lasocietenouvelle.org";
  const objetMail = objet;
  const messageMail = message
          + " \r\r ----------------- \r ## Coordonnées ## \r ----------------- \r "
          + coordonnees;

  const contentMail = { recipientMail, objetMail, messageMail }

  const req = {
    body: JSON.stringify(contentMail),
    headers: {'Content-Type': 'application/json'},
    method: 'POST'
  }

  try 
  {
      const res = await fetch('/api/mail-sender', req);
      return res;
  } 
  catch (error) {
      return error;
  }
}

export const sendStatementToAdmin = async (message,statementFile) => 
{
  console.log("here");
  const recipientMail= "admin@lasocietenouvelle.org";
  const objetMail= "Demande de publication (via formulaire)";
  const messageMail = message;
  const attachments = [{
    filename: 'declaration.pdf',
    path: statementFile,
    contentType: 'application/pdf',
    encoding: 'base64'
  }];

  const contentMail = { recipientMail, objetMail, messageMail, attachments }

  const request = {
    body: JSON.stringify(contentMail),
    headers: {'Content-Type': 'application/json'},
    method: 'POST'
  }
  
  try 
  {
      const res = await fetch('/api/mail-sender', request);
      console.log(res);
      return res;
  } 
  catch (error) {
    return error;
  }
}

export const sendStatementToDeclarant = async (recipient,message,statementFile) => 
{
  const recipientMail= recipient;
  const objetMail= "Déclaration - Empreinte Sociétale [Ne pas répondre]";
  const messageMail = message;
  const attachments = [{
    filename: 'declaration.pdf',
    path: statementFile,
    contentType: 'application/pdf',
    encoding: 'base64'
  }];

  const contentMail = { recipientMail, objetMail, messageMail, attachments }

  const request = {
    body: JSON.stringify(contentMail),
    headers: {'Content-Type': 'application/json'},
    method: 'POST'
  }
  
  try 
  {
      const res = await fetch('/api/mail-sender', request);
      return res;
  } 
  catch (error) {
    return error;
  }
}

export const sendSimplifiedAssessment = async (siren,data,message,coordonnees,participation) => {

    const recipientMail= "sylvain.humiliere@la-societe-nouvelle.fr";
    const objetMail= "Déclaration en ligne (simplfiiée)";
    const messageMail = "Unité légale : "+siren
            + " \r\r ----------------------- \r ## Valeurs déclarées ## \r ----------------------- \r "
            + Object.entries(data).map(([indic],_) => { return("\r"+indic+" : "+data[indic].value+" (+/- "+data[indic].uncertainty+" %) ") })
            + " \r\r ------------- \r ## Message ## \r ------------- \r "
            + message
            + " \r\r ------------------- \r ## Participation ## \r ------------------- \r "
            + participation
            + " \r\r ----------------- \r ## Coordonnées ## \r ----------------- \r "
            + coordonnees;

    const contentMail = { recipientMail, objetMail, messageMail }
    
    try {
        const res = await fetch('/api/mail-sender', {
            body: JSON.stringify(contentMail),
            headers: {
              'Content-Type': 'application/json'
            },
            method: 'POST'
          })
        return res;
    } catch (error) {
        return error;
    }
}
