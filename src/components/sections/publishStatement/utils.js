export const getPublishableIndicators = (indicators, comments) => {
  if (!indicators) return {};

  const indicatorsData = indicators.indicators;

  const publishableIndicators = Object.entries(indicatorsData)
    .filter(([_, indicator]) => indicator.value != null)
    .reduce((acc, [indic, indicator]) => {
      acc[indic] = {
        value: indicator.value,
        uncertainty: indicator.uncertainty,
        comment: comments[indic],
        toPublish: true,
        flag : "w",
        source : "La Société Nouvelle (via l'outil Metriz : https://metriz.lasocietenouvelle.org ) ",
      };
      return acc;
    }, {});

  return publishableIndicators;
};

/* ----- Builder message mails ----- */

export const mailToAdminWriter = (
  siren,
  corporateName,
  year,
  footprints,
  declarant,
  declarantOrganisation,
  email,
  price
) => {


  let mailContent = `Unité légale : ${siren} \n
  Dénomination : ${corporateName} \n
  Année : ${year}  \n
  Valeurs à publier :\n
  ${Object.values(footprints)
    .map((footprint) => {
      const comment = footprint.values.comment
        ? ` Commentaire : ${footprint.values.comment}`
        : "";
      return `- ${footprint.indicator} :  ${footprint.values.value} ( incertitude : +/- ${footprint.values.uncertainty} % )${comment}`;
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

export const mailToDeclarantWriter = (declarant) => {
  let mailContent = `${declarant},\n
    
    Votre demande de publication a bien été prise en compte. Vous trouverez ci-joint votre déclaration.
    Le délai de traitement est de 7 jours.\n
    
    Pour modifier ou supprimer les données publiées, contactez-nous directement via l'adresse mail admin@lasocietenouvelle.org.\n
    
    Bien à vous,\n
    La Société Nouvelle.`;

  return mailContent;
};
