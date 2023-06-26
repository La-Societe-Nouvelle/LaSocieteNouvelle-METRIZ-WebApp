import { getAnalyse } from "/src/utils/Writers";

const Analyse = ({
  indic,
  impactsData,
  financialData,
  comparativeData,
  period,
}) => {
  let analyse = getAnalyse(
    impactsData,
    financialData,
    comparativeData,
    indic,
    period
  );

  return (
    <>
      {analyse.map((paragraph, index) => (
        <p key={index}>{paragraph.reduce((a, b) => a + " " + b)}</p>
      ))}
    </>
  );
};

export default Analyse