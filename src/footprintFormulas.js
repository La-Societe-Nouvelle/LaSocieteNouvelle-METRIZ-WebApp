// La Société Nouvelle

// Components
import { Indicator } from '/src/footprintObjects/Indicator';

/* ------------------------------------------------------------ */
/* -------------------- FOOTPRINT FORMULAS -------------------- */
/* ------------------------------------------------------------ */


export function buildIndicatorAggregate(indic,elements,usePrev) 
{
    let indicator = new Indicator({indic: indic});
    
    let totalAmount = 0.0;
    let absolute = 0.0;
    let absoluteMax = 0.0;
    let absoluteMin = 0.0;

    let missingData = false;
    
    elements.forEach((element) => 
    {
        let amount = usePrev ? element.prevAmount : element.amount;
        let indicatorElement = usePrev ? element.prevFootprint.indicators[indic] : element.footprint.indicators[indic];

        if (amount!=null && indicatorElement.getValue()!=null) 
        {
            absolute+= indicatorElement.getValue()*amount;
            absoluteMax+= indicatorElement.getValueMax()*amount;
            absoluteMin+= indicatorElement.getValueMin()*amount;
            totalAmount+= amount;
        } 
        else {missingData = true}
    })

    if (!missingData && totalAmount != 0) { 
        indicator.setValue(absolute/totalAmount);
        let uncertainty = Math.abs(absolute) > 0 ? Math.max( Math.abs(absoluteMax-absolute) , Math.abs(absolute-absoluteMin) )/Math.abs(absolute) *100 : 0;
        indicator.setUncertainty(uncertainty);
    } else if (elements.length == 0) {
        indicator.setValue(0); 
        indicator.setUncertainty(0);
    } else {
        indicator.setValue(null); 
        indicator.setUncertainty(null);
    }

    return indicator;
}

export function buildIndicatorMerge(indicatorA,amountA,
                                    indicatorB,amountB)
{
    let indicator = new Indicator({indic: indicatorA.getIndic()});

    if (indicatorA.getValue()!=null && amountA!=null
     && indicatorB.getValue()!=null && amountB!=null)
    {
        let totalAmount = amountA + amountB;
        let absolute = indicatorA.getValue()*amountA + indicatorB.getValue()*amountB;
        let absoluteMax = indicatorA.getValueMax()*amountA + indicatorB.getValueMax()*amountB;
        let absoluteMin = indicatorA.getValueMin()*amountA + indicatorB.getValueMin()*amountB;

        if (totalAmount != 0) {
            indicator.setValue(absolute/totalAmount);
            let uncertainty = absolute > 0 ? Math.max(absoluteMax-absolute,absolute-absoluteMin)/absolute *100 : 0;
            indicator.setUncertainty(uncertainty);
        } else {
            indicator.setValue(null); 
            indicator.setUncertainty(null);
        }
    }
     
    return indicator;
}