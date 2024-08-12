// Libraries
import fuels from "/lib/emissionFactors/fuels.json";

export const createGHGDetailsTable = (impactsData, unit, precision, colors) => {

    const ghgDetails = impactsData.ghgDetails;

    const tableBody = [
        [{ text: 'Poste', style: 'tableHeader' }, { text: 'Unité', style: 'tableHeader' }, { text: 'Émissions', style: 'tableHeader' }, { text: 'Incertitude', style: 'tableHeader' }]
    ];

    for (const key in ghgDetails) {
        if (ghgDetails.hasOwnProperty(key)) {
            const item = ghgDetails[key];
            tableBody.push([
                { text: item.label, style: 'tableData', },
                { text: unit, style: 'tableData', },
                { text: `${item.ghgEmissions.toFixed(precision)}`, style: 'tableData', alignment: 'right' },
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
            defaultBorder : false,
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

export const createNRGDetailsTable = (impactsData, unit, precision, colors) => {

    const nrgDetails = impactsData.nrgDetails;

    const tableBody = [
        [{ text: 'Poste', style: 'tableHeader' }, { text: 'Unité', style: 'tableHeader' }, { text: 'Émissions', style: 'tableHeader' }, { text: 'Incertitude', style: 'tableHeader' }]
    ];

    for (const key in nrgDetails) {
        if (nrgDetails.hasOwnProperty(key)) {
            const item = nrgDetails[key];

            item.nrgConsumption > 0 && tableBody.push([
                { text: fuels[item.fuelCode] ? fuels[item.fuelCode].label : "", style: 'tableData', },
                { text: unit, style: 'tableData', },
                { text: `${item.nrgConsumption.toFixed(precision)}`, style: 'tableData', alignment: 'right' },
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

