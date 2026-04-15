import { useState } from 'react';
import Papa from 'papaparse';
import api from '../utils/api';
import { Download, File, Import, Store, Upload, User, Users } from 'lucide-react';

const steps = [
  { id: 1, label: 'Upload File', icon: '📁' },
  { id: 2, label: 'Preview Data', icon: '👁' },
  { id: 3, label: 'Import', icon: '✅' }
];

const INVENTORY_TEMPLATE = [
  ['productName', 'category', 'quantity', 'price'],
  ['Khaddar Shalwar Kameez', 'Winter Collection', '50', '2800'],
  ['Lawn Printed Suit', 'Summer Collection', '120', '1800'],
  ['Embroidered Kurti', 'Formal Wear', '30', '4500'],
];

const CUSTOMER_TEMPLATE = [
  ['customerName', 'phone', 'email', 'totalSpent', 'lastPurchaseDate'],
  ['Ahmed Khan', '03001234567', 'ahmed@gmail.com', '15000', '2026-03-15'],
  ['Sara Malik', '03121234567', 'sara@gmail.com', '28000', '2025-11-20'],
  ['Ayesha Khan', '03451234567', 'ayesha@gmail.com', '45000', '2026-04-01'],
];

const downloadTemplate = (type) => {
  const data = type === 'inventory' ? INVENTORY_TEMPLATE : CUSTOMER_TEMPLATE;
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = type + '_template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const ImportData = () => {
  const [importType, setImportType] = useState('inventory');
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [fileName, setFileName] = useState('');

  const validateInventoryRow = (row, index) => {
    const errs = [];
    if (!row.productName) errs.push('Row ' + (index + 2) + ': Product name is required');
    if (!row.category) errs.push('Row ' + (index + 2) + ': Category is required');
    if (!row.quantity || isNaN(row.quantity)) errs.push('Row ' + (index + 2) + ': Quantity must be a number');
    if (!row.price || isNaN(row.price)) errs.push('Row ' + (index + 2) + ': Price must be a number');
    return errs;
  };

  const validateCustomerRow = (row, index) => {
    const errs = [];
    if (!row.customerName) errs.push('Row ' + (index + 2) + ': Customer name is required');
    if (!row.phone) errs.push('Row ' + (index + 2) + ': Phone is required');
    return errs;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);
    setParsedData([]);
    setImportResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const allErrors = [];
        results.data.forEach((row, index) => {
          const rowErrors = importType === 'inventory'
            ? validateInventoryRow(row, index)
            : validateCustomerRow(row, index);
          allErrors.push(...rowErrors);
        });

        setErrors(allErrors);
        setParsedData(results.data);
        setStep(2);
      },
      error: (error) => {
        setErrors(['Failed to parse file: ' + error.message]);
      }
    });
  };

  const handleImport = async () => {
    if (errors.length > 0) return;
    setImporting(true);

    let successCount = 0;
    let failCount = 0;
    const failedRows = [];

    for (const row of parsedData) {
      try {
        if (importType === 'inventory') {
          await api.post('/inventory', {
            productName: row.productName,
            category: row.category,
            quantity: parseInt(row.quantity),
            price: parseFloat(row.price)
          });
        } else {
          await api.post('/customers', {
            customerName: row.customerName,
            phone: row.phone,
            email: row.email || '',
            totalSpent: parseFloat(row.totalSpent) || 0,
            lastPurchaseDate: row.lastPurchaseDate || new Date().toISOString()
          });
        }
        successCount++;
      } catch {
        failCount++;
        failedRows.push(importType === 'inventory'
          ? row.productName
          : row.customerName
        );
      }
    }

    setImportResult({ successCount, failCount, failedRows });
    setImporting(false);
    setStep(3);
  };

  const resetImport = () => {
    setStep(1);
    setParsedData([]);
    setErrors([]);
    setImportResult(null);
    setFileName('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className=" flex items-center gap-2 text-2xl font-bold text-white"><Import size={25} strokeWidth={2} className="text-sky-400"/> Import Data</h1>
        <p className="text-gray-400 mt-1">
          Upload your Excel or CSV file to import products and customers in bulk
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ' +
                (step >= s.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-500 border border-gray-700')
              }>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={
                'text-sm font-medium ' +
                (step >= s.id ? 'text-white' : 'text-gray-500')
              }>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={'flex-1 h-px mx-4 ' + (step > s.id ? 'bg-emerald-500' : 'bg-gray-800')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Upload */}
      {step === 1 && (
        <div className="space-y-4">

          {/* Import Type Selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              What do you want to import?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setImportType('inventory')}
                className={
                  'p-4 rounded-xl border-2 transition-colors text-left ' +
                  (importType === 'inventory'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600')
                }
              >
                <p className="text-2xl mb-2"><Store size={20} strokeWidth={2} className="text-sky-400" /></p>
                <p className="text-white font-medium">Products / Inventory</p>
                <p className="text-gray-400 text-xs mt-1">
                  Import your product catalog with prices and stock levels
                </p>
              </button>
              <button
                onClick={() => setImportType('customers')}
                className={
                  'p-4 rounded-xl border-2 transition-colors text-left ' +
                  (importType === 'customers'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600')
                }
              >
                <p className="text-2xl mb-2"><Users size={20} strokeWidth={2} className="text-sky-400" /></p>
                <p className="text-white font-medium">Customers</p>
                <p className="text-gray-400 text-xs mt-1">
                  Import your customer list with purchase history
                </p>
              </button>
            </div>
          </div>

          {/* Download Template */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">
              Step 1 — Download Template
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Download our CSV template and fill in your data. Then upload it below.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => downloadTemplate(importType)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span><Download size={20} strokeWidth={2} className="text-sky-400" /></span>
                Download {importType === 'inventory' ? 'Inventory' : 'Customer'} Template
              </button>
              <p className="text-gray-500 text-xs">
                Opens in Excel or Google Sheets
              </p>
            </div>

            {/* Template Preview */}
            <div className="mt-4 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-gray-400 text-xs font-medium">
                  Template format:
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {(importType === 'inventory'
                        ? INVENTORY_TEMPLATE[0]
                        : CUSTOMER_TEMPLATE[0]
                      ).map((col, i) => (
                        <th
                          key={i}
                          className="text-left text-emerald-400 font-medium px-4 py-2"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(importType === 'inventory'
                      ? INVENTORY_TEMPLATE.slice(1)
                      : CUSTOMER_TEMPLATE.slice(1)
                    ).map((row, i) => (
                      <tr key={i} className="border-b border-gray-700/50 last:border-0">
                        {row.map((cell, j) => (
                          <td key={j} className="text-gray-300 px-4 py-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">
              Step 2 — Upload Your File
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Upload your filled CSV file. Supports .csv and .xlsx files.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <p className="text-4xl mb-3"><File size={25} strokeWidth={2} className="text-yellow-400" /></p>
                <p className="text-white font-medium text-sm">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  CSV or Excel files supported
                </p>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

        </div>
      )}

      {/* Step 2 — Preview */}
      {step === 2 && (
        <div className="space-y-4">

          {/* File Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-white font-medium text-sm">{fileName}</p>
                <p className="text-gray-400 text-xs">
                  {parsedData.length} rows detected
                </p>
              </div>
            </div>
            <button
              onClick={resetImport}
              className="text-gray-400 hover:text-white text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span>🚨</span>
                <h3 className="text-red-400 font-semibold text-sm">
                  {errors.length} validation errors found
                </h3>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {errors.map((err, i) => (
                  <p key={i} className="text-red-300 text-xs">{err}</p>
                ))}
              </div>
              <p className="text-red-400 text-xs mt-3">
                Fix these errors in your CSV file and re-upload.
              </p>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-white font-semibold">
                  Data Preview
                </h2>
                <span className="text-gray-500 text-xs">
                  Showing first 5 rows
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {Object.keys(parsedData[0]).map(col => (
                        <th
                          key={col}
                          className="text-left text-emerald-400 text-xs font-medium px-6 py-3"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-gray-800 last:border-0">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="text-gray-300 text-xs px-6 py-3">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <div className="px-6 py-3 border-t border-gray-800">
                  <p className="text-gray-500 text-xs">
                    + {parsedData.length - 5} more rows will be imported
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Import Button */}
          {errors.length === 0 && parsedData.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    Ready to import {parsedData.length} {importType === 'inventory' ? 'products' : 'customers'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    This will add all rows to your {importType === 'inventory' ? 'inventory' : 'customer list'}
                  </p>
                </div>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      Import {parsedData.length} rows
                    </>
                  )}
                </button>
              </div>
              {importing && (
                <div className="mt-4 bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-400 text-xs text-center">
                    Adding records one by one... please wait
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Result */}
      {step === 3 && importResult && (
        <div className="space-y-4">
          <div className={
            'rounded-2xl p-8 text-center border ' +
            (importResult.failCount === 0
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-yellow-500/10 border-yellow-500/20')
          }>
            <p className="text-5xl mb-4">
              {importResult.failCount === 0 ? '🎉' : '⚠️'}
            </p>
            <h2 className="text-white font-bold text-2xl mb-2">
              Import Complete
            </h2>
            <p className={importResult.failCount === 0 ? 'text-emerald-400' : 'text-yellow-400'}>
              {importResult.successCount} records imported successfully
              {importResult.failCount > 0 && ', ' + importResult.failCount + ' failed'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{parsedData.length}</p>
              <p className="text-gray-400 text-xs mt-1">Total Rows</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">
                {importResult.successCount}
              </p>
              <p className="text-gray-400 text-xs mt-1">Imported</p>
            </div>
            <div className={
              'rounded-xl p-4 text-center ' +
              (importResult.failCount > 0
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-gray-900 border border-gray-800')
            }>
              <p className={
                'text-3xl font-bold ' +
                (importResult.failCount > 0 ? 'text-red-400' : 'text-gray-500')
              }>
                {importResult.failCount}
              </p>
              <p className="text-gray-400 text-xs mt-1">Failed</p>
            </div>
          </div>

          {importResult.failedRows.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm font-medium mb-2">
                Failed to import:
              </p>
              {importResult.failedRows.map((row, i) => (
                <p key={i} className="text-red-300 text-xs">{row}</p>
              ))}
            </div>
          )}

          {/* Next Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">
              What to do next
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href={importType === 'inventory' ? '/inventory' : '/customers'}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition-colors"
              >
                <span className="text-2xl">
                  {importType === 'inventory' ? '📦' : '👥'}
                </span>
                <div>
                  <p className="text-white text-sm font-medium">
                    View {importType === 'inventory' ? 'Inventory' : 'Customers'}
                  </p>
                  <p className="text-gray-500 text-xs">See imported data</p>
                </div>
              </a>
              <a
                href="/ai-assistant"
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition-colors"
              >
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-white text-sm font-medium">Ask AI</p>
                  <p className="text-gray-500 text-xs">Get insights now</p>
                </div>
              </a>
              <button
                onClick={resetImport}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition-colors text-left"
              >
                <span className="text-2xl">📥</span>
                <div>
                  <p className="text-white text-sm font-medium">
                    Import More
                  </p>
                  <p className="text-gray-500 text-xs">Upload another file</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportData;