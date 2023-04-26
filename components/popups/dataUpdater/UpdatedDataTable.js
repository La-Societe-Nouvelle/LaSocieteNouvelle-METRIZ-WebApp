import React, { useEffect, useState } from "react";

const UpdatedDataTable = (props) => {
  const [needUpdate, setNeedUpdate] = useState(false);
  const [prevLegalUnit] = useState(props.prevSession.legalUnit);
  const [updLegalUnit] = useState(props.updatedSession.legalUnit);

  useEffect(() => {
    if (prevLegalUnit && updLegalUnit) {
      if (
        !compareObjects(
          props.prevSession.legalUnit,
          props.updatedSession.legalUnit
        )
      ) {
        setNeedUpdate(true);
      }
    }
  }, []);

  return (
    <>
      {needUpdate && (
        <div>
          <h3>Données à mettre à jour</h3>
          {<DataToUpdate prev={prevLegalUnit} upd={updLegalUnit} title="Unité Légale"></DataToUpdate>}
        </div>
      )}
      {!needUpdate && (
        <div className="text-center">
          <p>Toutes les données sont à jour !</p>
        </div>
      )}
    </>
  );
};

function compareObjects(obj1, obj2) {
  // Compare the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }
  // Compare the values of each key
  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

const DataToUpdate = ({ prev, upd, title }) => {


  if (
    !compareObjects(prev, upd)
  ) {
    return (
      <>
        <h5>{title}</h5>

        {/* checkBox */}
        <p>Mettre à jour les données</p>
      </>
    );
  } else {
    return <>Toutes les données sont à jours</>;
  }
};

export default UpdatedDataTable;
