import { Table, Form } from "react-bootstrap";
import metaIndics from "/lib/indics";
import { printValue } from "/src/utils/formatters";

const IndicatorList = ({ legalUnitFootprint, comments, onCheckIndicator }) => {
  return (
    <>
      <h3 className="mb-4">
        <i className="bi bi-pencil-square"></i> Indicateurs à publier
      </h3>
      <Table>
        <thead>
          <tr>
            <th>Indicateur</th>
            <th className="text-end">Valeur</th>
            <th></th>
            <th className="text-end">Incertitude</th>
            <th>Commentaires</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(metaIndics).map((indic) => (
            <tr key={indic}>
              <td>
                <Form>
                  <Form.Check
                    type="checkbox"
                    id={`checkbox-${indic}`}
                    value={indic}
                    checked={legalUnitFootprint[indic]?.toPublish}
                    onChange={() => onCheckIndicator(indic)}
                    label={metaIndics[indic].libelle}
                    disabled={!legalUnitFootprint[indic]}
                  />
                </Form>
              </td>
              <td className="text-end">
                <span className="fw-bold">
                  {printValue(
                    legalUnitFootprint[indic]?.value,
                    metaIndics[indic].nbDecimals
                  )}
                </span>
              </td>
              <td className="text-start">
                <span className="small">&nbsp;{metaIndics[indic].unit}</span>
              </td>
              <td className="text-end small">
                <u>+</u>&nbsp;
                {printValue(legalUnitFootprint[indic]?.uncertainty, 0)}
                &nbsp;%
              </td>
              <td>
                <span className="small">{comments[indic] || "-"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default IndicatorList;
