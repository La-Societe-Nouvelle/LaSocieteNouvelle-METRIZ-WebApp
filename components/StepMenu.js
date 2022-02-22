// La Societe Nouvelle

// React
import React from 'react';

export function StepMenu({step,stepMax,setStep}) 
{ 
    const goBack = () => setStep(5);

    return(
 
      <div id="progression" className='stepper-wrapper'>
        <div className={"stepper-item" + (stepMax >= 1 ? " completed" : "")}>
               <button className={"step-counter" + (step == 1 ? " current" : "")} disabled={stepMax < 1} onClick={() => setStep(1)}>1</button>
               <div className="step-name">Import comptable</div>
        </div>
        <div className={"stepper-item" + (stepMax > 2 ? " completed" : "")}>
          <button  className={"step-counter" + (step == 2 ? " current" : "")} disabled={stepMax < 2} onClick={() => setStep(2)}>2</button>
          <div className="step-name">Validation de l'import</div>
        </div>
        <div className={"stepper-item" + (stepMax > 3 ? " completed" : "")}>
          <button className={"step-counter" + (step == 3 ? " current" : "")} disabled={stepMax < 3} onClick={() => setStep(3)}>3</button>
          <div className="step-name">Saisie des états initiaux</div>
        </div>
        <div className={"stepper-item" + (stepMax > 4 ? " completed" : "")}>
          <button className={"step-counter" + (step == 4 ? " current" : "")} disabled={stepMax < 4} onClick={() => setStep(4)}>4</button>
          <div className="step-name">Traitement des fournisseurs</div>
        </div>
        <div className={"stepper-item" + (stepMax == 5 ? " completed" : "")}>
          <button className={"step-counter" + (step == 5 ? " current" : "")} disabled={stepMax < 5} onClick={() => setStep(5)}>5</button>
          <div className="step-name">Mesure de l'impact</div>
        </div>
      </div>

    )
}