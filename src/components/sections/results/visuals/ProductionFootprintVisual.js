// La Société Nouvelle

import { Button, Col, Row } from "react-bootstrap";
import { downloadChartImage, getKeyIndics, getTagsIndic } from "../utils";
import ComparativeHorizontalBarChart from "../charts/ComparativeHorizontalBarChart";
import RingChart from "../charts/RingChart";
import { VerticalBarChart } from "../charts/VerticalBarChart";

import metaIndics from "/lib/indics";

export const ProductionFootprintVisual = ({
  session,
  period,
}) => {

  const aggregate = "production";

  const validations = session.validations[period.periodKey];

  const keyIndics = getKeyIndics();
  const tags = {};
  validations.forEach((indic) => {
    tags[indic] = getTagsIndic(session,period,aggregate,indic);
  })

  return (
    <div className="box">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Empreinte de la production</h3>
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
      <div className="d-inline">
        <Row className="row-eq-height justify-content-center">
          {validations.map((indic) => 
            <Col lg={2} className="d-flex flex-column justify-content-between my-5">
              {keyIndics.includes(indic) &&
                <div className="my-2 alert alert-danger">
                  Enjeu sectoriel majeur
                </div>}
              {!keyIndics.includes(indic) &&
                <div className="my-2 alert alert-light">
                  Enjeu national
                </div>}
              <div>
                <p>
                  {metaIndics[indic].libelle}
                </p>
              </div>
              {buildIndicatorChart({
                id: "socialfootprintvisual_"+indic,
                session,
                period,
                aggregate: "production",
                indic,
                showDivisionData: true
              })}
              <div>
                {tags[indic].map((tag,index) => 
                  <div key={index} className="text-end flex-grow-1">
                    <span className={"badge rounded-pill bg-"+tag.class}>
                      {tag.text}
                    </span>
                  </div>
                )}
              </div>
            </Col>
          )}   
        </Row>
      </div>   
    </div>
  );
}

const buildIndicatorChart = (props) => 
{
  switch(props.indic) 
  {
    case "art": return(<RingChart {...props}/>);
    case "eco": return(<RingChart {...props}/>);
    case "geq": return(<VerticalBarChart {...props}/>);
    case "ghg": return(<VerticalBarChart {...props}/>);
    case "haz": return(<VerticalBarChart {...props}/>);
    case "idr": return(<VerticalBarChart {...props}/>);
    case "knw": return(<RingChart {...props}/>);
    case "mat": return(<VerticalBarChart {...props}/>);
    case "nrg": return(<VerticalBarChart {...props}/>);
    case "soc": return(<RingChart {...props}/>);
    case "was": return(<VerticalBarChart {...props}/>);
    case "wat": return(<VerticalBarChart {...props}/>);
    default : return(<></>)
  }
}