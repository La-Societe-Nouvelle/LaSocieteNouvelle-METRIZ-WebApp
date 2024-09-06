
// Lib
import metaIndics from "/lib/indics";
import fuels from "/lib/emissionFactors/fuels.json";
import { buildNetValueAddedIndicator } from "../../../../../../formulas/netValueAddedFootprintFormulas";

export const getStatementDetails = (impactsData, indic, colors) => 
{
    const { nbDecimals } = metaIndics[indic];

    switch (indic) {
        case "art":
          return createARTDetailsStatement(impactsData, nbDecimals, colors);
        case "idr":
          return createIDRDetailsStatement(impactsData, nbDecimals, colors);
        case "eco":
          return createECODetailsStatement(impactsData, nbDecimals, colors);
        case "geq":
          return createGEQDetailsStatement(impactsData, nbDecimals, colors);
        case "ghg":
          return createGHGDetailsStatement(impactsData, nbDecimals, colors);
        case "haz":
          return createHAZDetailsStatement(impactsData, nbDecimals, colors);
        case "knw":
          return createKNWDetailsStatement(impactsData, nbDecimals, colors);
        case "mat":
          return createMATDetailsStatement(impactsData, nbDecimals, colors);
        case "nrg":
          return createNRGDetailsStatement(impactsData, nbDecimals, colors);
        case "soc":
          return createSOCDetailsStatement(impactsData, nbDecimals, colors);
        case "was":
          return createWASDetailsStatement(impactsData, nbDecimals, colors);
        case "wat":
          return createWATDetailsStatement(impactsData, nbDecimals, colors);
        default:
            return [];
    }
}

// ########################################################################################################### //

// ----------------------------------------------------------------------------------------------------
// ART

const createARTDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { isValueAddedCrafted, craftedProduction } = impactsData;

	if (isValueAddedCrafted) {
		const content = [
			{
				text: "Les activités de l'entreprise sont considérées comme artisanales ou faisant appel à un savoir-faire reconnu.",
			},
			createARTDetailsTable(impactsData, nbDecimals, colors)
		]
		return content;
	} else {
		const content = [
			{
				text: "Les activités de l'entreprise ne sont pas considérées comme artisanales.",
			},
			createARTDetailsTable(impactsData, nbDecimals, colors)
		]
		return content;
	}
}

const createARTDetailsTable = (impactsData, nbDecimals, colors) => 
{
	let nva_fpt = buildNetValueAddedIndicator("art", impactsData);

	const tableBody = [[
			{ text: 'Poste', style: 'tableHeader' }, 
			{ text: 'Unité', style: 'tableHeader' }, 
			{ text: 'Taux de contribution', style: 'tableHeader' }, 
			{ text: 'Incertitude', style: 'tableHeader' }
		],[
			{ text: "Valeur ajoutée nette", style: 'tableData' },
			{ text: "%", style: 'tableData', alignment: 'center' },
			{ text: nva_fpt.value.toFixed(nbDecimals), style: 'tableData', alignment: 'right' },
			{ text: "0 %", style: 'tableData', alignment: 'right', fontSize: 5 }
		]
	];

	const tableContent = [
		{ text: 'Détails des contributions directes', style: 'h3', margin: [0, 10, 0, 10] },
		{
			table: {
				headerRows: 1,
				widths: ['*', 'auto', 'auto', 'auto'],
				body: tableBody,
			},
			defaultBorder: false,
			layout: {
				vLineWidth: function (i, node) {
					return 0;
				},
				hLineWidth: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
				},
				hLineColor: function (i, node) {
					return colors.primary;
	
				},
			},
			style: 'table',
			margin: [0, 0, 0, 20]
		}
	]

	return tableContent;
}

// ----------------------------------------------------------------------------------------------------
// IDR

const createIDRDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { interdecileRange } = impactsData;
	
	const content = [
		{
			text: "Ecart interne de rémunération : "+interdecileRange.toFixed(nbDecimals),
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}

// ----------------------------------------------------------------------------------------------------
// ECO

const createECODetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { isAllActivitiesInFrance } = impactsData;

	if (isAllActivitiesInFrance) {
		const content = [
			{
				text: "L'ensemble des activités de l'entreprise sont localisées en France.",
			},
			createECODetailsTable(impactsData, nbDecimals, colors)
		]
		return content;
	} else {
		const content = [
			{
				text: "Les activités de l'entreprise ne sont pas localisées en France.",
			},
			createECODetailsTable(impactsData, nbDecimals, colors)
		]
		return content;
	}
}

const createECODetailsTable = (impactsData, nbDecimals, colors) => 
{
	let nva_fpt = buildNetValueAddedIndicator("eco", impactsData);

	const tableBody = [[
			{ text: 'Poste', style: 'tableHeader' }, 
			{ text: 'Unité', style: 'tableHeader' }, 
			{ text: 'Taux de contribution', style: 'tableHeader' }, 
			{ text: 'Incertitude', style: 'tableHeader' }
		],[
			{ text: "Valeur ajoutée nette", style: 'tableData' },
			{ text: "%", style: 'tableData', alignment: 'center' },
			{ text: nva_fpt.value.toFixed(nbDecimals), style: 'tableData', alignment: 'right' },
			{ text: "0 %", style: 'tableData', alignment: 'right' }
		]
	];

	const tableContent = [
		{ text: 'Détails des contributions', style: 'h3', margin: [0, 10, 0, 10] },
		{
			table: {
				headerRows: 1,
				widths: ['*', 'auto', 'auto', 'auto'],
				body: tableBody,
			},
			defaultBorder: false,
			layout: {
				vLineWidth: function (i, node) {
					return 0;
				},
				hLineWidth: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
				},
				hLineColor: function (i, node) {
					return colors.primary;
	
				},
			},
			style: 'table',
			margin: [0, 0, 0, 20]
		}
	]

	return tableContent;
}

// ----------------------------------------------------------------------------------------------------
// GEQ

const createGEQDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { wageGap } = impactsData;
	
	const content = [
		{
			text: "Ecart interne de rémunération femmes/hommes : "+wageGap.toFixed(nbDecimals)+" %",
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}

// ----------------------------------------------------------------------------------------------------
// GHG

const createGHGDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { greenhouseGasEmissions, greenhouseGasEmissionsUncertainty, greenhouseGasEmissionsUnit, ghgDetails } = impactsData;

	if (Object.keys(ghgDetails)>0) {
		const content = [
			// {
			// 	text: "Les activités de l'entreprise sont considérées comme artisanales.",
			// },
			createGHGDetailsTable(impactsData, nbDecimals, colors)
		]
		return content;
	} else {
		const content = [
			{
				text: "Emissions directes de gaz à effet de serre déclarées : "
					+ greenhouseGasEmissions.toFixed(nbDecimals)+" "+greenhouseGasEmissionsUnit
					+ " +/- "+greenhouseGasEmissionsUncertainty.toFixed(0)+" %",
				margin: [0, 0, 0, 20]
			},
		]
		return content;
	}
}

const createGHGDetailsTable = (impactsData, nbDecimals, colors) => 
{
	const ghgDetails = impactsData.ghgDetails;

	const tableBody = [
		[{ text: 'Poste', style: 'tableHeader' }, { text: 'Unité', style: 'tableHeader' }, { text: 'Émissions', style: 'tableHeader' }, { text: 'Incertitude', style: 'tableHeader' }]
	];

	for (const key in ghgDetails) {
		if (ghgDetails.hasOwnProperty(key)) {
			const item = ghgDetails[key];
			tableBody.push([
				{ text: item.label, style: 'tableData', },
				{ text: "kgCO2e", style: 'tableData', },
				{ text: `${item.ghgEmissions.toFixed(nbDecimals)}`, style: 'tableData', alignment: 'right' },
				{ text: `${item.ghgEmissionsUncertainty} %`, style: 'tableData', alignment: 'right' }
			]);
		}
	}

	return [
		{ text: 'Détails des principaux postes d\'émissions', style: 'h3', margin: [0, 10, 0, 10] },
		{
			table: {
				headerRows: 1,
				widths: ['*', 'auto', 'auto', 'auto'],
				body: tableBody,
			},
			defaultBorder: false,
			layout: {
				vLineWidth: function (i, node) {
					return 0;
				},
				hLineWidth: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
				},
				hLineColor: function (i, node) {
					return colors.primary;

				},
			},
			style: 'table',
			margin: [0, 0, 0, 20]
		}
	];

}

// ----------------------------------------------------------------------------------------------------
// HAZ

const createHAZDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { hazardousSubstancesUse, hazardousSubstancesUseUnit, hazardousSubstancesUseUncertainty } = impactsData;
	
	const content = [
		{
			text: "Quantité utilisée de produit dangereux déclarée : "
				+ hazardousSubstancesUse.toFixed(nbDecimals)+" "+hazardousSubstancesUseUnit
				+ " +/- "+hazardousSubstancesUseUncertainty.toFixed(0)+" %",
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}

// ----------------------------------------------------------------------------------------------------
// KNW

const createKNWDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { researchAndTrainingContribution } = impactsData;
	
	const content = [
		{
			text: "Contribution directe à la formation et à la recherche : "
				+ researchAndTrainingContribution.toFixed(nbDecimals)+" €",
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}

// ----------------------------------------------------------------------------------------------------
// MAT

const createMATDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { materialsExtraction, materialsExtractionUnit, materialsExtractionUncertainty } = impactsData;
	
	const content = [
		{
			text: "Quantité extraite de matières premières déclarée : "
				+ materialsExtraction.toFixed(nbDecimals)+" "+materialsExtractionUnit
				+ " +/- "+materialsExtractionUncertainty.toFixed(0)+" %",
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}

// ----------------------------------------------------------------------------------------------------
// NRG

const createNRGDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { energyConsumption, energyConsumptionUnit, energyConsumptionUncertainty, nrgDetails } = impactsData;

	if (Object.keys(nrgDetails)>0) { // /!\ test if sum > 0
		const content = [
			// {
			// 	text: "Les activités de l'entreprise sont considérées comme artisanales.",
			// },
			createNRGDetailsTable(impactsData, nbDecimals, colors)
		]
		return content;
	} else {
		const content = [
			{
				text: "Consommation directe d'énergie déclarée : "
					+ energyConsumption.toFixed(nbDecimals)+" "+energyConsumptionUnit
					+ " +/- "+energyConsumptionUncertainty.toFixed(0)+" %",
				margin: [0, 0, 0, 20]
			},
		]
		return content;
	}
}

const createNRGDetailsTable = (impactsData, nbDecimals, colors) => {

	const nrgDetails = impactsData.nrgDetails;

	const tableBody = [
		[{ text: 'Poste', style: 'tableHeader' }, { text: 'Unité', style: 'tableHeader' }, { text: 'Émissions', style: 'tableHeader' }, { text: 'Incertitude', style: 'tableHeader' }]
	];

	for (const key in nrgDetails) {
		if (nrgDetails.hasOwnProperty(key)) {
			const item = nrgDetails[key];

			item.nrgConsumption > 0 && tableBody.push([
				{ text: fuels[item.fuelCode] ? fuels[item.fuelCode].label : "", style: 'tableData', },
				{ text: "kJ", style: 'tableData', },
				{ text: `${item.nrgConsumption.toFixed(nbDecimals)}`, style: 'tableData', alignment: 'right' },
				{ text: `${item.nrgConsumptionUncertainty} %`, style: 'tableData', alignment: 'right' }
			]);
		}
	}

	return [
		{ text: 'Détails des principaux postes de consommation', style: 'h3', margin: [0, 10, 0, 10] },
		{
			table: {
				headerRows: 1,
				widths: ['*', 'auto', 'auto', 'auto'],
				body: tableBody,
			},
			defaultBorder: false,
			layout: {
				vLineWidth: function (i, node) {
					return 0;
				},
				hLineWidth: function (i, node) {
					return (i === 0 || i === node.table.body.length) ? 0.5 : 0;
				},
				hLineColor: function (i, node) {
					return colors.primary;

				},
			},
			style: 'table',
			margin: [0, 0, 0, 10]
		}
	];
}

// ----------------------------------------------------------------------------------------------------
// SOC

const createSOCDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { hasSocialPurpose } = impactsData;
		
	if (hasSocialPurpose) {
		const content = [
			{
				text: "Les activités de l'entreprise sont considérées comme contributrices à un intérêt social.",
			},
		]
		return content;
	} else {
		const content = [
			{
				text: "Les activités de l'entreprise ne sont pas considérées comme contributrices à un intérêt social.",
			},
		]
		return content;
	}
}

// ----------------------------------------------------------------------------------------------------
// WAS

const createWASDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { wasteProduction, wasteProductionUnit, wasteProductionUncertainty } = impactsData;
	
	const content = [
		{
			text: "Quantité produite de déchets : "
				+ wasteProduction.toFixed(nbDecimals)+" "+wasteProductionUnit
				+ " +/- "+wasteProductionUncertainty.toFixed(0)+" %",
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}

// ----------------------------------------------------------------------------------------------------
// WAT

const createWATDetailsStatement = (impactsData, nbDecimals, colors) => 
{
	const { waterConsumption, waterConsumptionUnit, waterConsumptionUncertainty } = impactsData;
	
	const content = [
		{
			text: "Quantité consommée d'eau : "
				+ waterConsumption.toFixed(nbDecimals)+" "+waterConsumptionUnit
				+ " +/- "+waterConsumptionUncertainty.toFixed(0)+" %",
			margin: [0, 0, 0, 20]
		},
	]
	
	return content;
}