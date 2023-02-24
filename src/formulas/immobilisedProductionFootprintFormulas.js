// La Société Nouvelle

// Generic formulas
import { buildIndicatorAggregate, buildIndicatorMerge } from './footprintFormulas';

/** Structure of file
 *    - Assignment companies footprints to expenses or investments
 *    - Build financial accounts footprints
 */

/* --------------------------------------------------------------------- */
/* -------------------- ASSIGN COMPANIES FOOTPRINTS -------------------- */
/* --------------------------------------------------------------------- */

export const getImmobilisedProductionFootprint = async (indic,financialData) =>
{
    // Consommations intermédiaires : OK

    // Capital fixe
    // retrait dotations correspondants à de la prod immobilisée
    // get immobilised production entries
    // get immobilisation account  linked to -> get percentage
    // for all immobilisation of production -> adjust the percentage x % of current ammount in account + amount immobilised
    // rebuild data without immobilised production & reducing amortisation expenses by percentage of immobilised production in account

    financialData.immobilisations.map(immobilisation => {

    })
    
}