// Excel/CSV helpers for downloading passes and importing them. No React or API calls here, and the
// heavy libraries are loaded only when a button is pressed, so they stay out of the main bundle.

export const DEVELOPER = { name: "Satyam Prajapati", site: "mrstm.in", url: "https://mrstm.in" };
export const MAX_IMPORT_ROWS = 5000;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const SHEET_NAME = "Passes";
const IST = { timeZone: "Asia/Kolkata" };

// The import format. An exported file uses the same headers, so it can be edited and uploaded again.
export const IMPORT_COLUMNS = [
  { key: "elixirPassId", header: "Elixir ID", required: true, example: "PEDIA12", width: 16,
    help: "Unique pass ID. Spaces are removed and letters made uppercase. The QR code holds exactly this ID." },
  { key: "name", header: "Name", required: true, example: "Dr Asha Verma", width: 32, help: "Name shown to the scanner." },
  { key: "department", header: "Department", required: false, example: "PEDIATRICS", width: 22, help: "Saved in uppercase." },
  { key: "designation", header: "Designation", required: false, example: "JR1", width: 16,
    help: "e.g. PROFESSOR, SR, JR1, ALUMNI. Saved in uppercase." },
];

// Header text -> field; anything else (S.No, Status, QR Code, College...) is ignored
const HEADER_ALIASES = {
  elixirPassId: ["elixirid", "elixirpassid", "passid", "id"],
  name: ["name", "fullname"],
  department: ["department", "dept"],
  designation: ["designation", "batch"],
};
const headerKey = (text) => String(text).toLowerCase().replace(/[^a-z]/g, "");
const fieldForHeader = (text) =>
  Object.keys(HEADER_ALIASES).find((field) => HEADER_ALIASES[field].includes(headerKey(text)));

const loadExcelJS = async () => (await import("exceljs")).default;

const formatIST = (date) =>
  new Date(date).toLocaleString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const formatDateOnlyIST = (date) => new Date(date).toLocaleDateString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric" });
export const todayForFilename = () => new Date().toLocaleDateString("en-CA", IST);

const byDepartmentThenId = (a, b) =>
  !a.department - !b.department || // passes without a department go last
  (a.department || "").localeCompare(b.department || "") ||
  a.elixirPassId.localeCompare(b.elixirPassId, undefined, { numeric: true, sensitivity: "base" });

const creditCell = (cell) => {
  cell.value = { text: `Developed by ${DEVELOPER.name} · ${DEVELOPER.site}`, hyperlink: DEVELOPER.url };
  cell.font = { color: { argb: "FF0F766E" }, underline: true };
};

const setCredits = (workbook) => {
  workbook.creator = DEVELOPER.name;
  workbook.lastModifiedBy = DEVELOPER.name;
  workbook.company = DEVELOPER.site;
  workbook.created = new Date();
};

const styleHeaderRow = (row) => {
  row.font = { bold: true };
  row.alignment = { vertical: "middle" };
  row.height = 20;
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FF94A3B8" } } };
  });
};

// passes: [{ elixirPassId, name, department, batch, isSpecial, validOn, lastScannedAt, scannedBy }]
export const buildPassesWorkbook = async (passes, { title, onProgress } = {}) => {
  const [ExcelJS, { default: QRCode }] = await Promise.all([loadExcelJS(), import("qrcode")]);
  const sorted = [...passes].sort(byDepartmentThenId);
  const HEADER_ROW = 3;
  const QR_PX = 88;

  const workbook = new ExcelJS.Workbook();
  setCredits(workbook);
  const sheet = workbook.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", ySplit: HEADER_ROW }],
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    headerFooter: { oddFooter: `&LDeveloped by ${DEVELOPER.name} · ${DEVELOPER.site}&RPage &P of &N` },
  });
  sheet.pageSetup.printTitlesRow = `${HEADER_ROW}:${HEADER_ROW}`;

  sheet.getCell("A1").value = `${title || "IMS Fest Entry · All passes"} · ${sorted.length} passes · exported ${formatIST(Date.now())} IST`;
  sheet.getCell("A1").font = { bold: true, size: 13 };
  creditCell(sheet.getCell("A2"));

  const columns = [
    { header: "S.No", width: 7 },
    { header: "Elixir ID", width: 16 },
    { header: "Name", width: 32 },
    { header: "Department", width: 20 },
    { header: "Designation", width: 14 },
    { header: "Status", width: 13 },
    { header: "Entered at (IST)", width: 22 },
    { header: "Let in by", width: 14 },
    { header: "Special pass", width: 24 },
    { header: "QR Code", width: 15 },
  ];
  columns.forEach((c, i) => (sheet.getColumn(i + 1).width = c.width));
  const header = sheet.getRow(HEADER_ROW);
  header.values = columns.map((c) => c.header);
  styleHeaderRow(header);

  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i];
    const row = sheet.getRow(HEADER_ROW + 1 + i);
    row.values = [
      i + 1,
      p.elixirPassId,
      p.name,
      p.department || "",
      p.batch || "",
      p.lastScannedAt ? "Entered" : "Not entered",
      p.lastScannedAt ? formatIST(p.lastScannedAt) : "",
      p.scannedBy || "",
      p.isSpecial ? `Valid only on ${p.validOn ? formatDateOnlyIST(p.validOn) : "?"}` : "",
    ];
    row.height = 72;
    row.alignment = { vertical: "middle", wrapText: true };
    row.getCell(2).font = { bold: true };

    const png = await QRCode.toDataURL(p.elixirPassId, { margin: 2, width: 176, errorCorrectionLevel: "M" });
    const imageId = workbook.addImage({ base64: png, extension: "png" });
    sheet.addImage(imageId, { tl: { col: 9.1, row: HEADER_ROW + i + 0.04 }, ext: { width: QR_PX, height: QR_PX }, editAs: "oneCell" });

    if (onProgress && (i % 50 === 49 || i === sorted.length - 1)) {
      onProgress(i + 1, sorted.length);
      await new Promise((resolve) => setTimeout(resolve, 0)); // let the page repaint the progress
    }
  }
  sheet.autoFilter = { from: { row: HEADER_ROW, column: 1 }, to: { row: HEADER_ROW, column: columns.length - 1 } };
  return workbook.xlsx.writeBuffer();
};

export const buildTemplateWorkbook = async () => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  setCredits(workbook);

  const sheet = workbook.addWorksheet(SHEET_NAME, { views: [{ state: "frozen", ySplit: 1 }] });
  IMPORT_COLUMNS.forEach((c, i) => {
    const column = sheet.getColumn(i + 1);
    column.width = c.width;
    const cell = sheet.getCell(1, i + 1);
    cell.value = c.header;
    cell.note = `${c.required ? "Required" : "Optional"}. ${c.help}`;
  });
  sheet.getColumn(1).numFmt = "@"; // keep IDs like 007 as typed
  styleHeaderRow(sheet.getRow(1));

  const help = workbook.addWorksheet("How to fill", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  help.getColumn(1).width = 16;
  help.getColumn(2).width = 30;
  help.getColumn(3).width = 20;
  help.getColumn(4).width = 16;
  const lines = [
    ["How to fill the Passes sheet"],
    ["1. Add one pass per row on the \"Passes\" sheet, starting on row 2. Keep the header row as it is."],
    ["2. Elixir ID and Name are required. Department and Designation are optional."],
    ["3. Every Elixir ID must be unique. Spaces are removed and letters made uppercase (\"pedia 12\" becomes PEDIA12)."],
    ["4. Save as Excel (.xlsx) or CSV and upload it on the Import page. You'll see a preview before anything is saved."],
    ["5. IDs that already exist are skipped, unless you choose \"Update details\" on the Import page."],
    [],
    ["Example"],
    IMPORT_COLUMNS.map((c) => c.header),
    ["PEDIA12", "Dr Asha Verma", "PEDIATRICS", "JR1"],
    ["ALUMNI73", "Dr Rakesh Kumar", "ALUMNI", "ALUMNI"],
    [],
  ];
  lines.forEach((values, i) => (help.getRow(i + 1).values = values));
  help.getCell("A1").font = { bold: true, size: 13 };
  help.getCell("A8").font = { bold: true };
  styleHeaderRow(help.getRow(9));
  creditCell(help.getCell(`A${lines.length + 1}`));

  return workbook.xlsx.writeBuffer();
};

// The byte-order mark makes Excel open the CSV as UTF-8
const BOM = String.fromCharCode(0xfeff);
export const buildTemplateCsv = () => `${BOM}${IMPORT_COLUMNS.map((c) => c.header).join(",")}\r\n`;

// Turns a sheet/CSV grid into pass rows. table: [{ row: number, cells: string[] }]
const rowsFromTable = (table) => {
  const headerIndex = table.slice(0, 15).findIndex(({ cells }) => {
    const fields = cells.map(fieldForHeader);
    return fields.includes("elixirPassId") && fields.includes("name");
  });
  if (headerIndex === -1) return null;

  const columnFields = new Map();
  const ignored = [];
  table[headerIndex].cells.forEach((text, col) => {
    const field = fieldForHeader(text);
    if (field && ![...columnFields.values()].includes(field)) columnFields.set(col, field);
    else if (String(text).trim()) ignored.push(String(text).trim());
  });

  const rows = [];
  for (const { row, cells } of table.slice(headerIndex + 1)) {
    const entry = { row };
    for (const [col, field] of columnFields) entry[field] = String(cells[col] ?? "").trim();
    if (Object.keys(HEADER_ALIASES).some((field) => entry[field])) rows.push(entry);
  }
  return { rows, headerRow: table[headerIndex].row, ignoredColumns: ignored };
};

const FORMAT_HELP = 'Use the template: the first row must have the headers "Elixir ID" and "Name".';

// file: a browser File (or anything with name, size and arrayBuffer()). Throws Error with a readable message.
export const readPassFile = async (file) => {
  const ext = file.name.split(".").pop().toLowerCase();
  if (file.size > MAX_FILE_BYTES) throw new Error("This file is too large (over 20 MB).");
  const bytes = await file.arrayBuffer();

  let found = null;
  let sheetName = null;
  if (ext === "csv" || ext === "txt") {
    const { default: Papa } = await import("papaparse");
    const text = new TextDecoder("utf-8").decode(bytes); // also drops a leading byte-order mark
    const { data } = Papa.parse(text, { skipEmptyLines: false });
    found = rowsFromTable(data.map((cells, i) => ({ row: i + 1, cells })));
  } else if (ext === "xlsx") {
    const ExcelJS = await loadExcelJS();
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(bytes);
    } catch {
      throw new Error("This Excel file couldn't be opened. Save it again as .xlsx and retry.");
    }
    for (const sheet of workbook.worksheets) {
      const table = [];
      sheet.eachRow((row, rowNumber) => {
        const cells = [];
        row.eachCell({ includeEmpty: true }, (cell, col) => (cells[col - 1] = cell.text));
        table.push({ row: rowNumber, cells });
      });
      found = rowsFromTable(table);
      if (found) {
        sheetName = sheet.name;
        break;
      }
    }
  } else if (ext === "xls") {
    throw new Error("Old .xls files aren't supported. In Excel use File → Save As → Excel Workbook (.xlsx) or CSV.");
  } else {
    throw new Error("Upload an Excel (.xlsx) or CSV file.");
  }

  if (!found) throw new Error(`Couldn't find the pass columns in this file. ${FORMAT_HELP}`);
  if (found.rows.length === 0) throw new Error("The file has the right headers but no passes under them.");
  if (found.rows.length > MAX_IMPORT_ROWS) {
    throw new Error(`This file has ${found.rows.length} passes; the limit is ${MAX_IMPORT_ROWS} per upload. Split it into smaller files.`);
  }
  return { ...found, sheetName };
};

// Browser only: hand a generated file to the user
export const saveFile = (data, filename, type) => {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const CSV_TYPE = "text/csv;charset=utf-8";
