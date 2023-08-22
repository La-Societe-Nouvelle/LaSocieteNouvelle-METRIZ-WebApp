// La Société Nouvelle

// React
import React from "react";

// Utils
import { XLSXFileWriterFromJSON } from "../utils";

/* ------------------------------------------------------------------------------------------------------------------------------ */
/* -------------------------------------------------- EXPORT PROVIDER COMPONENT ------------------------------------------------- */
/* ------------------------------------------------------------------------------------------------------------------------------ */

/** Exports data to an XLSX (Excel) file for providers.
 *  @param {Array} providers - Array of provider objects to be exported.
 */

const DownloadProvidersExcel = ({ providers }) => {
  const exportXLSXFile = async (providers) => {
    // Prepare data for export
    let jsonContent = providers
      .filter((provider) => provider.providerNum.charAt(0) !== "_")
      .map((provider) => {
        return {
          accountNum: provider.providerNum,
          denomination: provider.corporateName,
          siren: provider.corporateId,
        };
      });

    // Excel file properties
    let fileProps = { wsclos: [{ wch: 50 }, { wch: 20 }] };

    // Convert data to Excel file (JSON -> ArrayBuffer)
    let file = await XLSXFileWriterFromJSON(
      fileProps,
      "fournisseurs",
      jsonContent
    );
    // Trigger the file download
    let blob = new Blob([file], { type: "application/octet-stream" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fournisseurs.xlsx";
    link.click();
  };

  return (
    <div className="step mt-3">
      <h4>1. Télécharger et compléter le tableau de vos fournisseurs</h4>
      <p className="form-text">
        Exportez la liste des comptes fournisseurs auxiliaires afin de
        renseigner les numéros SIREN de vos fournisseurs.
      </p>
      <button
        className="btn btn-primary mt-3"
        onClick={() => exportXLSXFile(providers)}
      >
        <i className="bi bi-download"></i> Exporter mes fournisseurs
      </button>
    </div>
  );
};

export default DownloadProvidersExcel;
