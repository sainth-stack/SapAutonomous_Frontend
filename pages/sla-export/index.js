import React, { useMemo, useState } from "react";
import { Table, Card, Typography, Space, ConfigProvider } from "antd";
import {
  processFileData,
  readFileAsData,
  downloadSlaReportXlsx,
  YELLOW_FIELDS,
} from "../../utils/dataProcessor";

const { Title, Text, Paragraph } = Typography;

const PREVIEW_ROW_LIMIT = 100;

/** Right-align SLA metric columns (same set as highlighted in Excel export); everything else stays left for readability */
function columnAlign(header) {
  const h = String(header || "").trim();
  if (YELLOW_FIELDS.includes(h)) return "right";
  return "left";
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") {
    try {
      const j = JSON.stringify(value);
      return j.length > 120 ? `${j.slice(0, 120)}…` : j;
    } catch {
      return "—";
    }
  }
  const str = String(value);
  return str.length > 500 ? `${str.slice(0, 500)}…` : str;
}

/**
 * SLA Export — upload extract, process client-side, preview first 100 rows, download full XLSX.
 */
export default function SlaExportPage() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const raw = await readFileAsData(file);
      const processed = processFileData(raw);
      if (!processed || processed.length === 0) {
        setError("Could not process file. Check the format matches the SLA extract template.");
        setCsvData(null);
        return;
      }
      setCsvData(processed);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to process file.");
      setCsvData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!csvData || csvData.length === 0) return;
    downloadSlaReportXlsx(csvData);
  };

  const { tableColumns, tableData } = useMemo(() => {
    if (!csvData || csvData.length < 2) {
      return { tableColumns: [], tableData: [] };
    }
    const headers = csvData[0].map((h) => (h !== undefined && h !== null ? String(h).trim() : ""));
    const allRows = csvData.slice(1);
    const slice = allRows.slice(0, PREVIEW_ROW_LIMIT);

    const columns = headers.map((header, colIndex) => {
      const align = columnAlign(header);
      return {
        title: (
          <span className="font-semibold text-slate-700 select-none">{header || `Column ${colIndex + 1}`}</span>
        ),
        dataIndex: `col_${colIndex}`,
        key: `col_${colIndex}`,
        ellipsis: { showTitle: true },
        width: 150,
        align,
        onHeaderCell: () => ({
          style: { textAlign: align === "right" ? "right" : "left", whiteSpace: "nowrap" },
        }),
        onCell: () => ({
          style: {
            verticalAlign: "top",
            textAlign: align,
            maxWidth: 280,
          },
        }),
        render: (_, record) => (
          <span
            className={`block ${align === "right" ? "tabular-nums text-slate-800" : "text-slate-800"}`}
            style={{ wordBreak: align === "left" ? "break-word" : "normal" }}
          >
            {formatCellValue(record[`col_${colIndex}`])}
          </span>
        ),
      };
    });

    const dataSource = slice.map((row, rowIndex) => {
      const rec = { key: `row_${rowIndex}` };
      headers.forEach((_, ci) => {
        rec[`col_${ci}`] = row[ci];
      });
      return rec;
    });

    return {
      tableColumns: columns,
      tableData: dataSource,
    };
  }, [csvData]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#f1f5f9",
            headerColor: "rgba(15, 23, 42, 0.88)",
            headerSplitColor: "#e2e8f0",
            borderColor: "#e2e8f0",
            cellPaddingBlockSM: 10,
            cellPaddingInlineSM: 14,
            fontSize: 13,
          },
          Card: {
            headerFontSize: 16,
          },
        },
      }}
    >
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[min(100%,1600px)] px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 border-b border-slate-200 pb-6">
          <Space direction="vertical" size={4} className="w-full">
            <Text
              type="secondary"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Data Source
            </Text>
            <Title level={2} className="!mb-0 !text-slate-900" style={{ marginBottom: 0 }}>
              Export output file
            </Title>
            <Paragraph type="secondary" className="!mb-0 max-w-3xl text-base leading-relaxed">
              Process a file in the browser and download the SLA workbook. Use{" "}
              <Text strong>SLA Input File</Text> when you need to upload to the server instead.
            </Paragraph>
          </Space>
        </div>

        {error && (
          <Card size="small" className="mb-6 border-red-200 bg-red-50/80" styles={{ body: { padding: "12px 16px" } }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* Toolbar */}
        <Card className="mb-6 shadow-sm border-slate-200/80" styles={{ body: { padding: 20 } }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 min-w-0 max-w-xl">
              <Text className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
                Input file
              </Text>
              <input
                id="sla-export-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
              />
              {file && (
                <Text type="secondary" className="mt-2 block text-sm">
                  Selected: <Text className="text-slate-800">{file.name}</Text>
                </Text>
              )}
            </div>
            <Space wrap className="flex-shrink-0">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                  !file || isProcessing
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }`}
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  "Process file"
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!csvData}
                className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                  !csvData
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                }`}
              >
                Download Output File
              </button>
            </Space>
          </div>
        </Card>

        {/* Preview table */}
        {csvData && tableColumns.length > 0 && (
          <Card
            className="shadow-sm border-slate-200/80 overflow-hidden"
            styles={{ body: { padding: 0 } }}
            title={
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-1 pr-2">
                <span className="text-base font-semibold text-slate-800">Processed data preview</span>
          
              </div>
            }
          >
            <div className="px-1 pb-4 sm:px-2">
              <Table
                size="small"
                bordered
                sticky
                loading={isProcessing}
                columns={tableColumns}
                dataSource={tableData}
                pagination={false}
                scroll={{ x: "max-content", y: 480 }}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
    </ConfigProvider>
  );
}
