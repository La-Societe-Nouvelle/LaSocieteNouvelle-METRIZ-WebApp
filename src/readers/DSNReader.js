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

const DSNFileReader = async () =>
{
  // Segmentations des lignes
  const rows = content.slice(content.indexOf('\n')+1).split('\n');

  const dataDSN = {
    rows: [],
    errors: []
  };

  // Lecture des lignes
  for (let row of rows)
  {
    if (/^S[0-9]{2}.G[0-9]{2}.[0-9]{2}.[0-9]{3},'[.*]'$/.test(row)) // ex. S20.G00.05.002,'01'
    {
      // get code rubrique
      let blocCode = row.substring(0,10);
      let rubriqueCode = row.substring(0,14);

      // value
      let value = row.substring(16,row.length-1);
  
      dataDSN.rows.push({
        blocCode,
        rubriqueCode,
        value
      })
    }
  }

  return dataDSN;
}

/* ----------------------------------------------------------------------------------------------------------------- */
/* -------------------------------------------------- DATA READER -------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------- */

const DSNDataReader = async (dataDSN) =>
{
  // rows
  const rows = dataDSN.rows;

  let dsn = {};

  // Lecture des lignes
  let index = 0;
  while (index < rows.length)
  {
    let row = rows[index];

    // Déclaration -------------------------------------- //

    if (row.blocCode=="S20.G00.05")
    {
      let bloc = getBloc(rows,index,blocCode);
      let declaration = {
        nature: bloc["S20.G00.05.001"],
        type: bloc["S20.G00.05.002"]
      };
      // add to dsn
      dsn.declaration = declaration;
    }

    // Entreprise --------------------------------------- //

    else if (row.blocCode=="S21.G00.06")
    {
      let bloc = getBloc(rows,index,blocCode);
      let entreprise = {
        siren: bloc["S21.G00.06.001"],
      };
      // add to dsn
      dsn.declaration.entreprise = entreprise;
    }

    // Etablissement ------------------------------------ //

    else if (row.blocCode=="S21.G00.11")
    {
      let bloc = getBloc(rows,index,blocCode);
      let etablissement = {
        nic: bloc["S21.G00.06.001"],
        individus: []
      };
      // add to dsn
      dsn.declaration.entreprise.etablissement = etablissement;
    }

    // Individu ----------------------------------------- //

    else if (row.blocCode=="S21.G00.30")
    {
      let bloc = getBloc(rows,index,blocCode);
      let individu = {
        identifiant: bloc["S21.G00.30.001"],
        nomFamille: bloc["S21.G00.30.002"],
        nomUsage: bloc["S21.G00.30.003"],
        prenoms: bloc["S21.G00.30.004"],
        sexe: bloc["S21.G00.30.005"],
        contrats: [],
        versements: []
      };
      // add to dsn
      dsn.declaration.entreprise.etablissement.individus.push(individu);
    }

    // Contrat ------------------------------------------ //

    else if (row.blocCode=="S21.G00.40")
    {
      let bloc = getBloc(rows,index,blocCode);
      let contrat = {
        nature: bloc["S21.G00.40.007"],
        uniteMesure: bloc["S21.G00.40.011"]
      };
      // add to dsn
      let individu = getLastBloc(dsn.declaration.entreprise.etablissement.individus);
      individu.contrats.push(contrat);
    }

    // Versement ---------------------------------------- //

    else if (row.blocCode=="S21.G00.50")
    {
      let bloc = getBloc(rows,index,blocCode);
      let versement = {
        date: bloc["S21.G00.50.001"],
        remunerations: []
      };
      // add sub items
      // add to dsn
      let individu = getLastBloc(dsn.declaration.entreprise.etablissement.individus);
      individu.versements.push(versement);
    }

    // Remuneration ------------------------------------- //

    else if (row.blocCode=="S21.G00.51")
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
      let individu = getLastBloc(dsn.declaration.entreprise.etablissement.individus);
      let versement = getLastBloc(individu.versements);
      versement.remunerations.push(remuneration);
    }

    // Activite ----------------------------------------- //

    else if (row.blocCode=="S21.G00.53")
    {
      let bloc = getBloc(rows,index,blocCode);
      let activite = {
        type: bloc["S21.G00.53.001"],
        mesure: bloc["S21.G00.53.002"],
        unite: bloc["S21.G00.53.003"]
      };
      // add to dsn
      let individu = getLastBloc(dsn.declaration.entreprise.etablissement.individus);
      let versement = getLastBloc(individu.versements);
      let remuneration = getLastBloc(versement.remunerations);
      remuneration.activites.push(activite);
    }

    // -------------------------------------------------- //

    else
    {
      getBloc(rows,index,blocCode);
    }
  }

  return dsn;
}

const getBloc = (rows,index,blocCode) =>
{
  let bloc = {};
  while (index < rows.length && rows[index].startWith(blocCode))
  {
    let row = rows[index];
    bloc[row.rubriqueCode] = row.value;
    index+=1;
  }
  return bloc;
}