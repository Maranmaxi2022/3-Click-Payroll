// src/pages/PayRunsView.jsx
import React, { useState } from "react";
import runIllustration from "../assets/Pay Runs.svg";
import historyIllustration from "../assets/Pay Runs_02.svg";

export default function PayRunsView() {
  const [tab, setTab] = useState("run"); // "run" | "history"

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
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700">
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

          {/* Empty state */}
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
        </div>
      )}
    </div>
  );
}
