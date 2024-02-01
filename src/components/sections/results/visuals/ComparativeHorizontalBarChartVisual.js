// La Société Nouvelle

import { Button } from "react-bootstrap";
import { downloadChartImage } from "../utils";
import { ComparativeHorizontalBarChart } from "../charts/ComparativeHorizontalBarChart";

export const ComparativeHorizontalBarChartVisual = ({
  session,
  period,
}) => {

  return (
    <div className="box">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Empreinte environnementale - Ecarts avec la branche</h3>
        <Button
          className="btn-light btn-rounded"
          size="sm"
          onClick={() =>
            downloadChartImage(
              "environmentalChart",
              "empreinte_environnementale.png"
            )
          }
        >
          <i className="bi bi-download"></i>
        </Button>
      </div>
      <ComparativeHorizontalBarChart
        id={""}
        session={session}
        datasetOptions={
          period
        }
        printOptions={""}
      />
    </div>
  );
}