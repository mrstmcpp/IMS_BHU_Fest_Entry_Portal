import { useState } from "react";
import api, { errorMessage } from "../v2/api";
import {
  buildPassesWorkbook,
  buildTemplateCsv,
  buildTemplateWorkbook,
  CSV_TYPE,
  readPassFile,
  saveFile,
  todayForFilename,
  XLSX_TYPE,
} from "./passesExcel";

// Vercel cold starts + thousands of rows can take longer than the usual 15s
const LONG_REQUEST = { timeout: 60000 };
const IMPORT_URL = "/mrstm/passes/import";

const readableError = (err) =>
  err?.isAxiosError ? errorMessage(err) : err?.message || "Something went wrong. Please try again.";

export const downloadTemplate = async (format) => {
  if (format === "csv") {
    saveFile(buildTemplateCsv(), "IMS_Fest_Pass_Import_Template.csv", CSV_TYPE);
  } else {
    saveFile(await buildTemplateWorkbook(), "IMS_Fest_Pass_Import_Template.xlsx", XLSX_TYPE);
  }
};

// Every pass, or only `ids`, as an Excel file with QR codes; resolves to the number of passes in it
const downloadPassesExcel = async ({ ids, title, filename, onProgress }) => {
  const { data } = await api.get("/mrstm/passes", LONG_REQUEST);
  const wanted = ids && new Set(ids);
  const passes = wanted ? data.passes.filter((p) => wanted.has(p.elixirPassId)) : data.passes;
  if (passes.length === 0) throw new Error("There are no passes to download.");
  const buffer = await buildPassesWorkbook(passes, { title, onProgress });
  saveFile(buffer, filename || `IMS_Fest_Passes_${todayForFilename()}.xlsx`, XLSX_TYPE);
  return passes.length;
};

export const usePassExport = () => {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total } while QR codes are drawn
  const [result, setResult] = useState(null); // { tone, text }

  const run = async (options = {}) => {
    setBusy(true);
    setProgress(null);
    setResult(null);
    try {
      const count = await downloadPassesExcel({ ...options, onProgress: (done, total) => setProgress({ done, total }) });
      setResult({ tone: "success", text: `Downloaded ${count} pass${count === 1 ? "" : "es"} with QR codes.` });
    } catch (err) {
      setResult({ tone: "error", text: readableError(err) });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return { busy, progress, result, run };
};

// Upload -> server check (dry run) -> import. The server re-checks everything on import.
export const usePassImport = () => {
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState(null); // { rows, sheetName, headerRow, ignoredColumns }
  const [mode, setMode] = useState("skip"); // what to do with Elixir IDs that already exist
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(null); // "reading" | "checking" | "importing"
  const [error, setError] = useState("");

  const check = async (rows, nextMode) => {
    setBusy("checking");
    const { data } = await api.post(IMPORT_URL, { rows, mode: nextMode, dryRun: true }, LONG_REQUEST);
    setPreview(data);
  };

  const chooseFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setParsed(null);
    setPreview(null);
    setResult(null);
    setError("");
    setBusy("reading");
    try {
      const data = await readPassFile(file);
      setParsed(data);
      await check(data.rows, mode);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(null);
    }
  };

  const changeMode = async (nextMode) => {
    setMode(nextMode);
    if (!parsed || result) return;
    setError("");
    try {
      await check(parsed.rows, nextMode);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(null);
    }
  };

  const runImport = async () => {
    setBusy("importing");
    setError("");
    try {
      const { data } = await api.post(IMPORT_URL, { rows: parsed.rows, mode, dryRun: false }, LONG_REQUEST);
      setResult(data);
      setPreview(null);
    } catch (err) {
      setError(readableError(err));
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    setFileName("");
    setParsed(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const importable = preview ? preview.summary.new + preview.summary.update : 0;
  return { fileName, parsed, mode, preview, result, busy, error, importable, chooseFile, changeMode, runImport, reset };
};

export const downloadImportedLabel = (count) =>
  count === 1 ? "Download this pass with its QR code" : `Download these ${count} with QR codes`;

export const exportProgressText = ({ progress }) =>
  progress ? `Making QR codes… ${progress.done} / ${progress.total}` : "Preparing…";
