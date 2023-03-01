// La Société Nouvelle

// Objects
import { Account } from '../accountingObjects/Account';
import { Expense } from '../accountingObjects/Expense';

// Utils
import { getAmountItems, getPrevAmountItems, getSumItems, roundValue } from '../utils/Utils';

/* ------------------------------------------------------------------------ */
/* -------------------- IMMOBILISATIONS PHASES BUILDER -------------------- */
/* ------------------------------------------------------------------------ */

export const immobilisationsPhasesBuilder = (financialData, financialYear) => 
{
    financialData.immobilisations
        .filter(immobilisation => immobilisation.isDepreciableImmobilisation)
        .forEach(async immobilisation => 
        {
            let amortisation = financialData.amortisations.filter(amortisation => amortisation.accountAux == immobilisation.accountNum)[0];

            // get all dates ending an immobilisation account phase (i.e. before any change)
            let datesEndImmobilisationPhases = immobilisation.entries
                .filter(entry => !entry.isANouveaux)
                .map(entry => entry.date)
                .map(date => getPrevDay(date))
                .filter(date => parseInt(date) >= parseInt(financialYear.dateStart));

            // get all dates ending an amortisation account phase (i.e. at any change)
            let datesEndAmortisationPhases = amortisation.entries
                .filter(entry => !entry.isANouveaux)
                .map(entry => entry.date);

            // end of months
            let datesEndMonths = getDatesEndMonths(financialYear.dateStart, financialYear.dateEnd);

            // concat phases & sort dates
            let datesEndPhases = datesEndMonths
                .concat([financialYear.dateEnd])
                .concat(datesEndImmobilisationPhases)
                .concat(datesEndAmortisationPhases)
                .filter((value, index, self) => index === self.findIndex(item => item === value) && value != "")   // remove duplicates dates and empty string
                .sort((a, b) => parseInt(a) > parseInt(b));   // sort by date (chronology)

            // build phases
            let phases = datesEndPhases.map((value, index, self) => {
                return ({
                    id: index,
                    dateStart: index > 0 ? getNextDay(self[index - 1]) : financialYear.dateStart,
                    dateEnd: value
                })
            });

            await buildImmobilisationPhasess(immobilisation,phases);
            await buildImmobilisationPhasess(amortisation,phases);
        });
}

const buildImmobilisationPhasess = async (immobilisation, phases) => 
{
    immobilisation.phases = [];

    let currentAmount = immobilisation.prevAmount;

    for (let phase of phases) {
        // update current amount
        let entriesAtDate = immobilisation.entries.filter(entry => !entry.isANouveaux).filter(entry => entry.date == phase.dateStart); // variations at beginning of period
        let variationOnPhase = getAmountItems(entriesAtDate, 2);
        currentAmount = roundValue(currentAmount + variationOnPhase, 2);

        // add period with current amount
        this.periods.push({
            dateStart: phase.dateStart,
            dateEnd: phase.dateEnd,
            amount: currentAmount
        });
    }
}

export const adjustedAmortisationDataBuilder = (financialData, financialYear) =>
{
    financialData.adjustedAmortisations = [];
    financialData.adjustedAmortisationExpenses = [];

    financialData.immobilisations
        .filter(immobilisation => immobilisation.isDepreciableImmobilisation)
        .forEach(async immobilisation => 
        {
            let amortisation = financialData.amortisations.filter(amortisation => amortisation.accountAux == immobilisation.accountNum)[0];
            let amortisationExpenses = financialData.amortisationExpenses.filter(expense => expense.accountAux == amortisation.accountNum);

            let adjustedData = await buildAdjustedAmortisations(immobilisation,amortisation,amortisationExpenses,financialYear,phases);
            let adjustedAmortisation = new Account({id: index, ...amortisation, phases: adjustedData.adjustedAmortisationPhases});
            let adjustedExpenses = adjustedData.adjustedAmortisationExpenses.map((props,index) => new Expense({id: index, ...props}));
            
            financialData.adjustedAmortisations.push(adjustedAmortisation);
            financialData.adjustedAmortisationExpenses.push(adjustedExpenses);
        })
}

const buildAdjustedAmortisations = async (immobilisation,amortisation,amortisationExpenses,financialYear,phases) => 
{
    let adjustedAmortisationPhases = [];    
    let adjustedAmortisationExpenses = [];

    let currentAmountAmortisation = amortisation.prevAmount;
    let currentAmountExpenses = 0;
    let maxAmountExpenses = 0;
    let tempPhases = [];
    let totalToAmortisate = 0;

    for (let phase of phases) 
    {
        let immobilisationAmount = immobilisation.phases.filter(({id}) => id==phase.id)[0].amount;
        let nbDaysPhase =  Math.round(Math.abs((getDateFromString(phase.dateEnd) - getDateFromString(phase.dateStart)) / oneDay));

        // add phase to temp list
        tempPhases.push({
            id: phase.id,
            dateStart: phase.dateStart,
            dateEnd: phase.dateEnd,
            amountToAmortise: (immobilisationAmount - currentAmountAmortisation)*nbDaysPhase,
            prevAmount: currentAmountAmortisation
        })
        totalToAmortisate = totalToAmortisate + (immobilisationAmount - currentAmountAmortisation)*nbDaysPhase;
        
        // get expenses at end of phase
        let expensesAtDate = amortisationExpenses.filter(expense => expense.date == phase.dateEnd);
        let amountExpensesAtDate = getAmountItems(expensesAtDate);
        currentAmountExpenses = roundValue(currentAmountExpenses + amountExpensesAtDate, 2);
        
        // get amortisation entries at end of phase
        let entriesAtDate = amortisation.entries.filter(entry => entry.date == phase.dateEnd);
        let variationAmortisation = getAmountItems(entriesAtDate);
        currentAmountAmortisation = currentAmountAmortisation + variationAmortisation - amountExpensesAtDate; // amount without amortisation expenses
        
        if (currentAmountExpenses > maxAmountExpenses) 
        {
            let totalAmountAdjustedExpense = roundValue(maxAmountExpenses-currentAmountExpenses, 2);
            let cumulAdjustment = 0;

            for (let tempPhase of tempPhases) 
            {
                let amountAdjustedExpense = roundValue((tempPhase.amountToAmortise / totalToAmortisate)*totalAmountAdjustedExpense, 2);

                adjustedAmortisationExpenses.push({
                    accountNum: "6811"+(parseInt(amortisation.accountNum.charAt(2))+1)+amortisation.accountNum.slice(3),
                    accountLib: "Dotations - "+amortisation.accountLib,
                    accountAux: amortisation.accountNum,
                    accountAuxLib: amortisation.accountLib,
                    amount: amountAdjustedExpense,
                    date: tempPhase.dateEnd
                })

                adjustedAmortisationPhases.push({
                    id: tempPhase.id,
                    dateStart: tempPhase.dateStart,
                    dateEnd: tempPhase.dateEnd,
                    amount: roundValue(tempPhase.prevAmount + cumulAdjustment + amountAdjustedExpense, 2)
                })
                cumulAdjustment = cumulAdjustment;
            }

            tempPhases = [];
            totalToAmortisate = 0;
            currentAmountAmortisation = currentAmountAmortisation + totalAmountAdjustedExpense;
        }
    }

    return({
        adjustedAmortisationPhases,
        adjustedAmortisationExpenses
    })
}