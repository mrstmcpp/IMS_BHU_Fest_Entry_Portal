import React, { useEffect, useRef, useState } from "react";
import { LuDownload, LuFileSpreadsheet, LuFileUp, LuRotateCcw, LuUpload } from "react-icons/lu";
import { Alert, Button, Card, PageHeader, ProgressBar, SegmentedControl, Spinner } from "./ui";
import {
  downloadImportedLabel,
  downloadTemplate,
  exportProgressText,
  usePassExport,
  usePassImport,
} from "../shared/passTransfer";
import { FormatTable, ImportSummary, PreviewTable } from "../shared/PassImportParts";
import { todayForFilename } from "../shared/passesExcel";

const Step = ({ number, title, children }) => (
  <li className="relative pl-10">
    <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
      {number}
    </span>
    <h3 className="pt-0.5 font-semibold text-slate-900">{title}</h3>
    <div className="mt-2">{children}</div>
  </li>
);

const ExportStatus = ({ exporter }) => (
  <>
    {exporter.progress && <ProgressBar value={exporter.progress.done} max={exporter.progress.total} className="mt-3" />}
    {exporter.result && <Alert tone={exporter.result.tone} className="mt-3">{exporter.result.text}</Alert>}
  </>
);

const BUSY_TEXT = { reading: "Reading the file…", checking: "Checking passes…", importing: "Importing passes…" };

const PassesV2 = ({ focus = "export" }) => {
  const exporter = usePassExport();
  const importedExporter = usePassExport();
  const importer = usePassImport();
  const [templateError, setTemplateError] = useState("");
  const fileInput = useRef(null);
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

  const chooseFile = () => fileInput.current?.click();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Import & export passes"
        subtitle="Download every pass with its QR code, or add many passes at once from Excel or CSV."
        back={{ to: "/mrstm", label: "Admin dashboard" }}
      />

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <LuDownload className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Download all passes</h2>
              <p className="mt-1 text-sm text-slate-500">
                An Excel file with one row per pass: Elixir ID, name, department, designation, whether they've entered,
                who let them in, and the pass QR code.
              </p>
            </div>
          </div>
          <Button onClick={() => exporter.run()} loading={exporter.busy} className="w-full sm:w-auto">
            {exporter.busy ? exportProgressText(exporter) : <><LuFileSpreadsheet className="h-4 w-4" /> Download Excel</>}
          </Button>
        </div>
        <ExportStatus exporter={exporter} />
      </Card>

      <Card id="import" className="scroll-mt-20 p-5">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <LuUpload className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Import passes</h2>
            <p className="mt-1 text-sm text-slate-500">Add many passes at once. You'll see a preview before anything is saved.</p>
          </div>
        </div>

        {result ? (
          <div className="mt-5 space-y-3">
            <Alert tone={result.summary.error ? "warning" : "success"}>{result.message}</Alert>
            {result.rows.length > 0 && <PreviewTable rows={result.rows} />}
            <ExportStatus exporter={importedExporter} />
            <div className="flex flex-col gap-2 sm:flex-row">
              {result.importedIds.length > 0 && (
                <Button
                  onClick={() =>
                    importedExporter.run({
                      ids: result.importedIds,
                      title: `IMS Fest Entry · Passes imported from ${importer.fileName}`,
                      filename: `IMS_Fest_Imported_Passes_${todayForFilename()}.xlsx`,
                    })
                  }
                  loading={importedExporter.busy}
                >
                  {importedExporter.busy ? (
                    exportProgressText(importedExporter)
                  ) : (
                    <><LuFileSpreadsheet className="h-4 w-4" /> {downloadImportedLabel(result.importedIds.length)}</>
                  )}
                </Button>
              )}
              <Button variant="secondary" onClick={importer.reset}>
                <LuRotateCcw className="h-4 w-4" /> Import another file
              </Button>
            </div>
          </div>
        ) : (
          <ol className="mt-5 space-y-6">
            <Step number={1} title="Fill in the template">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => getTemplate("xlsx")}>
                  <LuDownload className="h-4 w-4" /> Excel template
                </Button>
                <Button variant="secondary" size="sm" onClick={() => getTemplate("csv")}>
                  <LuDownload className="h-4 w-4" /> CSV template
                </Button>
              </div>
              {templateError && <Alert tone="error" className="mt-3">{templateError}</Alert>}
              <p className="mb-2 mt-3 text-sm text-slate-600">One pass per row, with these columns in the first row:</p>
              <FormatTable />
              <p className="mt-2 text-xs text-slate-500">
                Other columns are ignored, so you can also edit a file from "Download all passes" and upload it again.
              </p>
            </Step>

            <Step number={2} title="Upload the file">
              <input
                ref={fileInput}
                type="file"
                accept=".xlsx,.csv"
                className="sr-only"
                aria-label="Excel or CSV file to import"
                onChange={(e) => {
                  importer.chooseFile(e.target.files[0]);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={chooseFile} disabled={!!busy}>
                  <LuFileUp className="h-4 w-4" /> {importer.fileName ? "Choose another file" : "Choose Excel or CSV file"}
                </Button>
                {importer.fileName && <span className="truncate text-sm font-medium text-slate-700">{importer.fileName}</span>}
              </div>
              {busy && busy !== "importing" && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Spinner className="h-4 w-4" /> {BUSY_TEXT[busy]}
                </p>
              )}
              {importer.parsed?.ignoredColumns.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">Ignored columns: {importer.parsed.ignoredColumns.join(", ")}</p>
              )}
              {importer.error && !preview && <Alert tone="error" className="mt-3">{importer.error}</Alert>}
            </Step>

            {preview && (
              <Step number={3} title="Check and import">
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-slate-700">If an Elixir ID already exists</p>
                    <div className="max-w-sm">
                      <SegmentedControl
                        label="If an Elixir ID already exists"
                        value={importer.mode}
                        onChange={(m) => !busy && importer.changeMode(m)}
                        options={[
                          { value: "skip", label: "Skip it" },
                          { value: "update", label: "Update details" },
                        ]}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Updating changes name, department and designation only. Entry status is never touched.
                    </p>
                  </div>
                  {importer.error && <Alert tone="error">{importer.error}</Alert>}
                  <ImportSummary summary={preview.summary} />
                  <PreviewTable key={importer.mode} rows={preview.rows} />
                  <Button size="lg" onClick={importer.runImport} loading={busy === "importing"} disabled={!!busy || importer.importable === 0}>
                    {busy === "importing"
                      ? BUSY_TEXT.importing
                      : importer.importable === 0
                        ? "Nothing to import"
                        : `Import ${importer.importable} pass${importer.importable === 1 ? "" : "es"}`}
                  </Button>
                  {preview.summary.error > 0 && importer.importable > 0 && (
                    <p className="text-xs text-slate-500">
                      Rows with problems are left out. Fix them in the file and upload it again to add them.
                    </p>
                  )}
                </div>
              </Step>
            )}
          </ol>
        )}
      </Card>
    </div>
  );
};

export default PassesV2;
