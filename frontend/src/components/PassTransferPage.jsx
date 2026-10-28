import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import {
  downloadImportedLabel,
  downloadTemplate,
  exportProgressText,
  usePassExport,
  usePassImport,
} from "../shared/passTransfer";
import { FormatTable, ImportSummary, PreviewTable } from "../shared/PassImportParts";
import { todayForFilename } from "../shared/passesExcel";

const primaryButton =
  "px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed cursor-pointer";
const secondaryButton =
  "px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-teal-600 rounded-md hover:bg-teal-50 cursor-pointer";

const Message = ({ tone, children }) => (
  <div className={`mt-4 p-4 text-center text-white rounded-md ${tone === "error" ? "bg-rose-600" : "bg-teal-600"}`}>
    {children}
  </div>
);

const ExportStatus = ({ exporter }) => (
  <>
    {exporter.progress && (
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-teal-600 transition-all"
          style={{ width: `${Math.round((exporter.progress.done / exporter.progress.total) * 100)}%` }}
        />
      </div>
    )}
    {exporter.result && <Message tone={exporter.result.tone}>{exporter.result.text}</Message>}
  </>
);

const BUSY_TEXT = { reading: "Reading the file...", checking: "Checking passes...", importing: "Importing passes..." };

const PassTransferPage = ({ onLogout, focus = "export" }) => {
  const navigate = useNavigate();
  const exporter = usePassExport();
  const importedExporter = usePassExport();
  const importer = usePassImport();
  const [templateError, setTemplateError] = useState("");
  const { preview, result, busy } = importer;

  useEffect(() => {
    if (focus === "import") document.getElementById("import")?.scrollIntoView({ behavior: "smooth" });
  }, [focus]);

  const getTemplate = async (format) => {
    setTemplateError("");
    try {
      await downloadTemplate(format);
    } catch {
      setTemplateError("Couldn't create the template. Check your connection and try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />

      <div className="flex flex-col items-center flex-grow px-4 py-8">
        <div className="w-full max-w-3xl space-y-6">
          <section className="p-6 bg-white rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold text-gray-900">Download All Passes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Excel file with every pass, its entry status and its QR code.
            </p>
            <button type="button" onClick={() => exporter.run()} disabled={exporter.busy} className={`mt-4 w-full ${primaryButton}`}>
              {exporter.busy ? exportProgressText(exporter) : "Download Excel"}
            </button>
            <ExportStatus exporter={exporter} />
          </section>

          <section id="import" className="p-6 bg-white rounded-lg shadow-xl scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Import Passes (Excel / CSV)</h2>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Add many passes at once. You'll see a preview before anything is saved.
            </p>

            {result ? (
              <div className="mt-6 space-y-4">
                <Message tone={result.summary.error ? "error" : "success"}>{result.message}</Message>
                {result.rows.length > 0 && <PreviewTable rows={result.rows} />}
                <ExportStatus exporter={importedExporter} />
                <div className="flex flex-col gap-2 sm:flex-row">
                  {result.importedIds.length > 0 && (
                    <button
                      type="button"
                      disabled={importedExporter.busy}
                      className={`flex-1 ${primaryButton}`}
                      onClick={() =>
                        importedExporter.run({
                          ids: result.importedIds,
                          title: `IMS Fest Entry · Passes imported from ${importer.fileName}`,
                          filename: `IMS_Fest_Imported_Passes_${todayForFilename()}.xlsx`,
                        })
                      }
                    >
                      {importedExporter.busy
                        ? exportProgressText(importedExporter)
                        : downloadImportedLabel(result.importedIds.length)}
                    </button>
                  )}
                  <button type="button" onClick={importer.reset} className={`flex-1 ${secondaryButton}`}>
                    Import another file
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Step 1: Fill in the template</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => getTemplate("xlsx")} className={secondaryButton}>
                      Download Excel template
                    </button>
                    <button type="button" onClick={() => getTemplate("csv")} className={secondaryButton}>
                      Download CSV template
                    </button>
                  </div>
                  {templateError && <Message tone="error">{templateError}</Message>}
                  <p className="mt-3 mb-2 text-sm text-gray-600">One pass per row, with these columns in the first row:</p>
                  <FormatTable />
                  <p className="mt-2 text-xs text-gray-500">
                    Other columns are ignored, so you can also edit a downloaded passes file and upload it again.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Step 2: Upload the file</h3>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    aria-label="Excel or CSV file to import"
                    disabled={!!busy}
                    onChange={(e) => {
                      importer.chooseFile(e.target.files[0]);
                      e.target.value = "";
                    }}
                    className="mt-2 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-white hover:file:bg-teal-700 file:cursor-pointer"
                  />
                  {importer.fileName && <p className="mt-2 text-sm text-gray-700">Selected: {importer.fileName}</p>}
                  {busy && busy !== "importing" && <p className="mt-2 text-sm text-gray-600">{BUSY_TEXT[busy]}</p>}
                  {importer.parsed?.ignoredColumns.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">Ignored columns: {importer.parsed.ignoredColumns.join(", ")}</p>
                  )}
                  {importer.error && !preview && <Message tone="error">{importer.error}</Message>}
                </div>

                {preview && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Step 3: Check and import</h3>
                    <fieldset>
                      <legend className="text-sm font-medium text-gray-700">If an Elixir ID already exists:</legend>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-800">
                        {[
                          ["skip", "Skip it"],
                          ["update", "Update name, department and designation"],
                        ].map(([value, label]) => (
                          <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="import-mode"
                              value={value}
                              checked={importer.mode === value}
                              disabled={!!busy}
                              onChange={() => importer.changeMode(value)}
                              className="accent-teal-600"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {importer.error && <Message tone="error">{importer.error}</Message>}
                    <ImportSummary summary={preview.summary} />
                    <PreviewTable key={importer.mode} rows={preview.rows} />
                    <button
                      type="button"
                      onClick={importer.runImport}
                      disabled={!!busy || importer.importable === 0}
                      className={`w-full ${primaryButton}`}
                    >
                      {busy === "importing"
                        ? BUSY_TEXT.importing
                        : importer.importable === 0
                          ? "Nothing to import"
                          : `Import ${importer.importable} pass${importer.importable === 1 ? "" : "es"}`}
                    </button>
                    {preview.summary.error > 0 && importer.importable > 0 && (
                      <p className="text-xs text-gray-500 text-center">
                        Rows with problems are left out. Fix them in the file and upload it again to add them.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/mrstm")}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 cursor-pointer"
            >
              ← Back to Admin Panel
            </button>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassTransferPage;
