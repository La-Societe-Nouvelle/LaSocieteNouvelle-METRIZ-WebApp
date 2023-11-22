// Table Rows

export const TableHeaderRow = (includeGrossImpact) => {
    return (
      <>
        <th className="text-end">Empreinte</th>
        <th className="text-end">Incertitude</th>
        {includeGrossImpact && <th className="text-end">Impact</th>}
      </>
    );
  };
  
export const TableHeaderRowUnits = (includeGrossImpact, unit, unitAbsolute) => {
    return (
      <>
        <th className="text-end">&euro;</th>
        <th className="text-end">{unit}</th>
        <th className="text-end uncertainty">%</th>
        {includeGrossImpact && <th className="text-end">{unitAbsolute}</th>}
      </>
    );
  };