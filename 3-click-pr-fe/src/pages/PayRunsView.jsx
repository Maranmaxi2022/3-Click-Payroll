// src/pages/PayRunsView.jsx
import { useState, useEffect } from "react";
import runIllustration from "../assets/Pay Runs.svg";
import historyIllustration from "../assets/Pay Runs_02.svg";
import { payRunAPI } from "../utils/api";

export default function PayRunsView() {
  const [tab, setTab] = useState("run"); // "run" | "history"
  const [payRuns, setPayRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingPayslips, setGeneratingPayslips] = useState({});

  // Fetch pay runs
  useEffect(() => {
    if (tab === "history") {
      fetchPayRuns();
    }
  }, [tab]);

  const fetchPayRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await payRunAPI.getAll({ limit: 50 });
      setPayRuns(data || []);
    } catch (err) {
      setError(err.message || "Failed to load pay runs");
      console.error("Error fetching pay runs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async (payRunId) => {
    setGeneratingPayslips((prev) => ({ ...prev, [payRunId]: true }));
    try {
      const result = await payRunAPI.generatePayslips(payRunId);
      alert(`Successfully generated ${result.total_payslips} payslips!`);
      fetchPayRuns(); // Refresh the list
    } catch (err) {
      alert(`Failed to generate payslips: ${err.message}`);
      console.error("Error generating payslips:", err);
    } finally {
      setGeneratingPayslips((prev) => ({ ...prev, [payRunId]: false }));
    }
  };

  const handleDownloadAllPayslips = async (payRunId, payRunNumber) => {
    try {
      const blob = await payRunAPI.downloadAllPayslips(payRunId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslips_${payRunNumber}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Failed to download payslips: ${err.message}`);
      console.error("Error downloading payslips:", err);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-700",
      calculated: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      processed: "bg-purple-100 text-purple-700",
      completed: "bg-indigo-100 text-indigo-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.draft}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft"}
      </span>
    );
  };

  const Tab = ({ id, children }) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        className={[
          "px-3 py-2 text-sm",
          active
            ? "text-slate-900 font-medium border-b-2 border-blue-600"
            : "text-slate-600 hover:text-slate-800 border-b-2 border-transparent",
        ].join(" ")}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="py-4">
      {/* Heading + right action */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold text-slate-800">Pay Runs</h1>
        <button
          type="button"
          className="hidden sm:inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          title="Create a new pay run"
        >
          Create Pay Run
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-slate-200">
        <nav className="flex gap-2">
          <Tab id="run">Run Payroll</Tab>
          <Tab id="history">Payroll History</Tab>
        </nav>
      </div>

      {/* RUN PAYROLL tab */}
      {tab === "run" && (
        <div className="grid place-items-center rounded-xl border border-slate-200 bg-white py-16 px-6">
          <img
            src={runIllustration}
            alt="Run payroll illustration"
            className="mb-4 h-36 w-auto select-none"
            draggable="false"
          />
          <p className="max-w-[560px] text-center text-[15px] text-slate-700">
            You are all set to run your first payroll! We&apos;ll notify you when the pay run is ready to be processed.
          </p>
        </div>
      )}

      {/* PAYROLL HISTORY tab */}
      {tab === "history" && (
        <div className="rounded-xl border border-slate-200 bg-white">
          {/* Filter row */}
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500">
              <path d="M4 7h16M6 12h12M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-medium">Payroll Type :</span>
            <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-sm hover:bg-slate-50">
              All
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-slate-500">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid place-items-center px-6 py-16">
              <p className="text-sm text-slate-600">Loading pay runs...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="grid place-items-center px-6 py-16">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && payRuns.length === 0 && (
            <div className="grid place-items-center px-6 pb-16 pt-6">
              <img
                src={historyIllustration}
                alt="No pay runs illustration"
                className="mb-4 h-36 w-auto select-none"
                draggable="false"
              />
              <p className="max-w-[560px] text-center text-[15px] text-slate-700">
                You don&apos;t have any pay runs for the filter applied
              </p>
            </div>
          )}

          {/* Pay runs table */}
          {!loading && !error && payRuns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Pay Run
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Pay Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Total Net Pay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {payRuns.map((payRun) => (
                    <tr key={payRun._id || payRun.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{payRun.pay_run_number}</div>
                        {payRun.pay_run_name && (
                          <div className="text-xs text-slate-500">{payRun.pay_run_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {payRun.period_start_date} to {payRun.period_end_date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {payRun.pay_date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {payRun.total_employees || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                        ${(payRun.total_net_pay || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(payRun.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {/* Generate Payslips Button - show for calculated, approved, or completed */}
                          {['calculated', 'approved', 'completed'].includes(payRun.status) && (
                            <button
                              onClick={() => handleGeneratePayslips(payRun._id || payRun.id)}
                              disabled={generatingPayslips[payRun._id || payRun.id]}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                              title="Generate PDF payslips for all employees"
                            >
                              {generatingPayslips[payRun._id || payRun.id] ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    <path d="M14 3v4a1 1 0 001 1h4" />
                                  </svg>
                                  Generate Payslips
                                </>
                              )}
                            </button>
                          )}

                          {/* Download All Payslips Button - show for calculated, approved, or completed */}
                          {['calculated', 'approved', 'completed'].includes(payRun.status) && (
                            <button
                              onClick={() => handleDownloadAllPayslips(payRun._id || payRun.id, payRun.pay_run_number)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                              title="Download all payslips as ZIP"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                              </svg>
                              Download All
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
