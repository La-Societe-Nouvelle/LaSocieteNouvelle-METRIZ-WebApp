// La Société Nouvelle - METRIZ

/* -------------------------------------------------------------------------------------------- */
/* ---------------------------------------- DSN READER ---------------------------------------- */
/* -------------------------------------------------------------------------------------------- */

const getLastBloc = (array) =>
{
  return array[array.length-1];
}

/* ----------------------------------------------------- */
/* -------------------- FILE READER -------------------- */
/* ----------------------------------------------------- */

export const DSNFileReader = async (content) =>
{
  // Segmentations des lignes
  const rows = content.replaceAll('\r','').split('\n');

  const dataDSN = {
    rows: [],
    errors: []
  };

  // Lecture des lignes
  for (let row of rows)
  {
    if (/^S[0-9]{2}\.G[0-9]{2}\.[0-9]{2}\.[0-9]{3},'.*'/.test(row)) // ex. S20.G00.05.002,'01'
    {
      // get code rubrique
      let blocCode = row.substring(0,10);
      let rubriqueCode = row.substring(0,14);
      let valueCode = row.substring(11,14);

      // value
      let value = row.substring(16,row.length-1);
  
      dataDSN.rows.push({
        blocCode,
        rubriqueCode,
        valueCode,
        value
      })
    }
  }

  return dataDSN;
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- DATA READER -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------- */

export const DSNDataReader = async (dataDSN) =>
{
  // rows
  const rows = dataDSN.rows;

  let declaration = {};

  // Lecture des lignes
  let index = 0;
  while (index < rows.length)
  {
    let row = rows[index];
    let blocCode = row.blocCode;
    let valueCode = row.valueCode;

    // Déclaration -------------------------------------- //

    if (blocCode=="S20.G00.05")
    {
      let bloc = getBloc(rows,index,blocCode);
      declaration = {
        nature: bloc["S20.G00.05.001"],
        type: bloc["S20.G00.05.002"],
        fraction: bloc["S20.G00.05.003"],
        ordre: bloc["S20.G00.05.004"],
        mois: bloc["S20.G00.05.005"],
        dateFichier: bloc["S20.G00.05.007"],
        champ: bloc["S20.G00.05.008"],
        devise: bloc["S20.G00.05.010"]
      };
    }

    // Entreprise --------------------------------------- //

    else if (blocCode=="S21.G00.06")
    {
      let bloc = getBloc(rows,index,blocCode);
      let entreprise = {
        siren: bloc["S21.G00.06.001"],
        nic: bloc["S21.G00.06.002"],
      };
      // add to dsn
      declaration.entreprise = entreprise;
    }

    // Etablissement ------------------------------------ //

    else if (blocCode=="S21.G00.11")
    {
      let bloc = getBloc(rows,index,blocCode);
      let etablissement = {
        nic: bloc["S21.G00.11.001"],
        individus: []
      };
      // add to dsn
      declaration.entreprise.etablissement = etablissement;
    }

    // Individu ----------------------------------------- //

    else if (blocCode=="S21.G00.30")
    {
      let bloc = getBloc(rows,index,blocCode);
      let individu = {
        identifiant: bloc["S21.G00.30.001"],
        nomFamille: bloc["S21.G00.30.002"],
        nomUsage: bloc["S21.G00.30.003"],
        prenoms: bloc["S21.G00.30.004"],
        sexe: bloc["S21.G00.30.005"],
        identifiantTechnique: bloc["S21.G00.30.020"],
        contrats: [],
        versements: []
      };
      // add to dsn
      declaration.entreprise.etablissement.individus.push(individu);
    }

    // Contrat ------------------------------------------ //

    else if (blocCode=="S21.G00.40")
    {
      let bloc = getBloc(rows,index,blocCode);
      let contrat = {
        dateDebut: bloc["S21.G00.40.001"],
        statutConventionnel: bloc["S21.G00.40.002"],
        pcsEse: bloc["S21.G00.40.004"],
        complementPcsEse: bloc["S21.G00.40.005"],
        nature: bloc["S21.G00.40.007"],
        numero: bloc["S21.G00.40.009"],
        uniteMesure: bloc["S21.G00.40.011"],
        quotiteCategorie: bloc["S21.G00.40.012"],
        quotite: bloc["S21.G00.40.013"],
        modaliteTemps: bloc["S21.G00.40.014"]
      };
      // add to dsn
      let individu = getLastBloc(declaration.entreprise.etablissement.individus);
      individu.contrats.push(contrat);
    }

    // Versement ---------------------------------------- //

    else if (blocCode=="S21.G00.50")
    {
      let bloc = getBloc(rows,index,blocCode);
      let versement = {
        date: bloc["S21.G00.50.001"],
        remunerations: [],
        primes: [],
        revenuAutres: []
      };
      // add sub items
      // add to dsn
      let individu = getLastBloc(declaration.entreprise.etablissement.individus);
      individu.versements.push(versement);
    }

    // Remuneration ------------------------------------- //

    else if (blocCode=="S21.G00.51")
    {
      let bloc = getBloc(rows,index,blocCode);
      let remuneration = {
        dateDebut: bloc["S21.G00.51.001"],
        dateFin: bloc["S21.G00.51.002"],
        numeroContrat: bloc["S21.G00.51.010"],
        type: bloc["S21.G00.51.011"],
        nombreHeures: bloc["S21.G00.51.012"],
        montant: bloc["S21.G00.51.013"],
        activites: []
      };
      // add to dsn
      let individu = getLastBloc(declaration.entreprise.etablissement.individus);
      let versement = getLastBloc(individu.versements);
      versement.remunerations.push(remuneration);
    }

    // Activite ----------------------------------------- //

    else if (blocCode=="S21.G00.53")
    {
      let bloc = getBloc(rows,index,blocCode);
      let activite = {
        type: bloc["S21.G00.53.001"],
        mesure: bloc["S21.G00.53.002"],
        unite: bloc["S21.G00.53.003"]
      };
      // add to dsn
      let individu = getLastBloc(declaration.entreprise.etablissement.individus);
      let versement = getLastBloc(individu.versements);
      let remuneration = getLastBloc(versement.remunerations);
      remuneration.activites.push(activite);
    }

    // Prime -------------------------------------------- //

    else if (blocCode=="S21.G00.52")
    {
      let bloc = getBloc(rows,index,blocCode);
      let prime = {
        type: bloc["S21.G00.52.001"],
        montant: bloc["S21.G00.52.002"]
      };
      // add to dsn
      let individu = getLastBloc(declaration.entreprise.etablissement.individus);
      let versement = getLastBloc(individu.versements);
      versement.primes.push(prime);
    }

    // Revenu autre ------------------------------------- //

    else if (blocCode=="S21.G00.53")
    {
      let bloc = getBloc(rows,index,blocCode);
      let revenuAutre = {
        type: bloc["S21.G00.54.001"],
        montant: bloc["S21.G00.54.002"],
      };
      // add to dsn
      let individu = getLastBloc(declaration.entreprise.etablissement.individus);
      let versement = getLastBloc(individu.versements);
      versement.revenuAutres.push(revenuAutre);
    }

    // -------------------------------------------------- //

    while (index < rows.length && rows[index].blocCode==blocCode && parseInt(rows[index].valueCode)>=parseInt(valueCode)) {
      valueCode = index < rows.length ? rows[index].valueCode : "001";
      index+=1;
    }
  }

  return declaration;
}

const getBloc = (rows,index,blocCode) =>
{
  let bloc = {};
  let valueCode = rows[index].valueCode;
  while (index < rows.length && rows[index].blocCode==blocCode && parseInt(rows[index].valueCode)>=parseInt(valueCode))
  {
    let row = rows[index];
    bloc[row.rubriqueCode] = row.value;
    valueCode = row.valueCode;
    index+=1;
  }
  return bloc;
}