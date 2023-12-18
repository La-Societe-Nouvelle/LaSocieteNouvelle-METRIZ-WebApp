// La Société Nouvelle

import { Col, Image, Row } from "react-bootstrap";
import {  getKeyIndics, getTagsIndic } from "../utils";
import RingChart from "../charts/RingChart";
import { VerticalBarChart } from "../charts/VerticalBarChart";

import metaIndics from "/lib/indics";

export const ProductionFootprintVisual = ({ 
  session, 
  period 
}) => {

  const aggregate = "production";
  const validations = session.validations[period.periodKey];

  const keyIndics = getKeyIndics(session.comparativeData.comparativeDivision);

  const tags = {};
  validations.forEach((indic) => {
    tags[indic] = getTagsIndic(session, period, aggregate, indic);
  });

  return (
    <div className="box">
      <h3>Empreinte de la production</h3>
      <Row className="justify-content-around">
        {validations.map((indic) => (
          <Col lg={2} className="my-3" key={indic}>
            <div
              className={`production-box d-flex flex-column justify-content-between ${
                keyIndics.includes(indic) ? "major" : ""
              }`}
            >
              {keyIndics.includes(indic) && (
                <div className="production-box-header">
                  Enjeu sectoriel majeur
                </div>
              )}
              {!keyIndics.includes(indic) && (
                <div className="production-box-header ">Enjeu national</div>
              )}
              <div className="production-box-title">
                <h5>
                  <Image
                    className="me-2"
                    src={`/icons-ese/logo_ese_${indic}_bleu.svg`}
                    alt={indic}
                    height={15}
                  />
                  {metaIndics[indic].libelle}
                </h5>
              </div>
              {buildIndicatorChart({
                id: "socialfootprintvisual_" + indic,
                session,
                period,
                aggregate: "production",
                indic,
                showDivisionData: true,
                useIndicColors: true,
                label : "Production"
              })}
              <div className="my-4">
                {tags[indic].map((tag, index) => (
                  <div key={index} className="text-center flex-grow-1">
                    <span className={"badge rounded-pill bg-" + tag.class}>
                      {tag.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

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