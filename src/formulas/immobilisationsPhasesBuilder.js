// La Société Nouvelle

// Objects
import { Account } from '../accountingObjects/Account';
import { Aggregate } from '../accountingObjects/Aggregate';
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
            let amortisationExpenses = financialData.amortisationExpenses.filter(expense => expense.accountAux == amortisation.accountNum);

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



            amortisation.buildPeriods(phases);

            amortisationExpenses.forEach(async expense => await expense.initPeriods(dateStart, dateEnd));
            await amortisation.initPeriods(amortisationExpenses, dateStart, dateEnd);
            await immobilisation.initPeriods(dateStart, dateEnd);

            // let dates = amortisation.periods
            //     .concat(immobilisation.periods)
            //     .concat(expenses.map(expense => expense.periods).reduce((a,b) => a.concat(b),[]))
            //     .map(period => [period.dateStart,period.dateEnd])   // get date start & date end
            //     .reduce((a,b) => a.concat(b),[])
            //     .filter((value, index, self) => index === self.findIndex(item => item === value) && value!="")   // remove duplicates and empty string
            //     .sort((a,b) => parseInt(a) > parseInt(b));   // sort by date (chronology)

            let datesExpenses = amortisationExpenses
                .map(expense => expense.periods).reduce((a, b) => a.concat(b), [])
                .map(period => [period.dateStart, period.dateEnd])
                .reduce((a, b) => a.concat(b), [])
                .filter((value, index, self) => index === self.findIndex(item => item === value))
                .sort((a, b) => parseInt(a) > parseInt(b));

            // build next periods
            let nextPeriods = dates.slice(1).map((date, index, self) => {
                return ({
                    id: index,
                    dateStart: index > 0 ? self[index - 1] : dateStart,
                    dateEnd: date,
                    amount: null
                })
            })

            immobilisation.completePeriods(nextPeriods);
            amortisation.completePeriods(nextPeriods);
            amortisationExpenses.forEach(async expense => expense.completePeriods(immobilisation, amortisation, nextPeriods, datesExpenses, dateStart));

            console.log("results");
            console.log(immobilisation);
            console.log(amortisation);
            amortisationExpenses.forEach(expense => console.log(expense));
        })
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

const buildAmortisationPhases = async (amortisation,phases) => 
{
    amortisation.phases = [];

    let currentAmount = this.prevAmount;

    for (let phase of phases) {
        // update current amount
        let entriesAtDate = this.entries.filter(entry => !entry.isANouveaux).filter(entry => entry.date == phase.dateEnd); // variations at end of period
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

const buildAdjustedAmortisations = (immobilisation,amortisation,amortisationExpenses,financialYear,phases) => 
{
    let adjustedAmortisationPhases = [];    
    let adjustedAmortisationExpenses = [];

    let currentAmountAmortisation = amortisation.prevAmount;
    let prevAmountAmortisation = amortisation.prevAmount;
    let currentAmountExpenses = 0;
    let currentAmountExpensesMax = 0;
    let dateLastExpense = financialYear.dateStart;
    let tempPhases = [];
    let totalToDepreciate = 0;

    for (let phase of phases) 
    {
        let immobilisationAmount = immobilisation.phases.filter(({id}) => id==phase.id)[0].amount;
        let nbDaysPhase =  Math.round(Math.abs((getDateFromString(phase.dateEnd) - getDateFromString(phase.dateStart)) / oneDay));

        // add phase to temp list
        tempPhases.push({
            id: phase.id,
            dateStart: phase.dateStart,
            dateEnd: phase.dateEnd,
            amountToDepreciate: (immobilisationAmount - currentAmountAmortisation)*nbDaysPhase
        })
        totalToDepreciate = totalToDepreciate + (immobilisationAmount - currentAmountAmortisation)*nbDaysPhase;
        
        // get expenses at end of phase
        let expensesAtDate = amortisationExpenses.filter(expense => expense.date == phase.dateEnd);
        currentAmountExpenses = roundValue(currentAmountExpenses + getAmountItems(expensesAtDate), 2);
        
        // get amortisation entries at end of phase
        let entriesAtDate = amortisation.entries.filter(entry => entry.date == phase.dateEnd);
        let amortisationVariation = getAmountItems(entriesAtDate) - getAmountItems(expensesAtDate);
        currentAmountAmortisation = currentAmountAmortisation + amortisationVariation;
        
        if (currentAmountExpenses > currentAmountExpensesMax) 
        {
            let amountAdjustedExpense = roundValue(currentAmountExpensesMax-currentAmountExpenses, 2);
            let cumulAdjustment = 0;

            for (let tempPhase of tempPhases) 
            {
                let amountExpense = roundValue((tempPhase.amountToDepreciate / totalToDepreciate)*amountAdjustedExpense, 2);
                let adjustedAmortisationExpense = new Expense({
                    amount: amountExpense
                })
                adjustedAmortisationPhases.push({
                    id: tempPhase.id,
                    dateStart: tempPhase.dateStart,
                    dateEnd: tempPhase.dateEnd,
                    amount: roundValue(cumulAdjustment + amountExpense, 2)
                })
                cumulAdjustment = cumulAdjustment;
            }
        }
    }

}