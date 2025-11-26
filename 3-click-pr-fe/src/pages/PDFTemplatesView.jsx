// src/pages/PDFTemplatesView.jsx
import React, { useState } from "react";
import { Eye, Pencil, X } from "lucide-react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

// Sample template data
const TEMPLATES = {
  payslip: [
    {
      id: "elegant",
      name: "Elegant Template",
      category: "payslip",
      isDefault: false,
    },
    {
      id: "standard",
      name: "Standard Template",
      category: "payslip",
      isDefault: false,
    },
    {
      id: "mini",
      name: "Mini Template",
      category: "payslip",
      isDefault: false,
    },
    {
      id: "simple",
      name: "Simple Template",
      category: "payslip",
      isDefault: false,
    },
    {
      id: "lite",
      name: "Lite Template",
      category: "payslip",
      isDefault: false,
    },
    {
      id: "spreadsheet",
      name: "Simple Spreadsheet Template",
      category: "payslip",
      isDefault: false,
    },
  ],
  letter: [
    {
      id: "salary-certificate",
      name: "Salary Certificate",
      category: "letter",
    },
    {
      id: "salary-revision",
      name: "Salary Revision Letter",
      category: "letter",
    },
    {
      id: "bonus-letter",
      name: "Bonus Letter",
      category: "letter",
    },
  ],
};

// Preview Modal Component
function TemplatePreviewModal({ template, onClose }) {
  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content - Elegant Payslip */}
        <div className="overflow-y-auto max-h-[calc(90vh-64px)] bg-slate-50 p-8">
          <div className="mx-auto max-w-4xl bg-white shadow-lg">
            {/* Payslip Header */}
            <div className="border-b border-slate-200 px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">huex</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    123, Anna Salai Mount Road Chennai Tamil Nadu 600002 India
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Payslip For the Month</p>
                  <p className="text-xl font-bold text-slate-900">November 2025</p>
                </div>
              </div>
            </div>

            {/* Employee Summary and Net Pay */}
            <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-2">
              {/* Left: Employee Summary */}
              <div>
                <h2 className="mb-4 text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Employee Summary
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Employee Name", value: "Preet Setty" },
                    { label: "Designation", value: "Software Engineer" },
                    { label: "Employee ID", value: "emp012" },
                    { label: "Date of Joining", value: "21-09-2014" },
                    { label: "Pay Period", value: "November 2025" },
                    { label: "Pay Date", value: "30/11/2025" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex text-sm">
                      <span className="w-40 text-slate-600">{item.label}</span>
                      <span className="mx-2 text-slate-400">:</span>
                      <span className="font-medium text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Total Net Pay Box */}
              <div className="flex items-start justify-end">
                <div className="w-full max-w-sm rounded-lg border-2 border-green-200 bg-green-50/50 p-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-3xl font-bold text-slate-900">₹97,870.00</p>
                    <p className="mt-1 text-sm text-slate-600">Total Net Pay</p>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-green-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paid Days</span>
                      <span className="font-medium text-slate-900">: 28</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">LOP Days</span>
                      <span className="font-medium text-slate-900">: 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="border-y border-slate-200 bg-slate-50 px-8 py-4">
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="flex">
                  <span className="w-36 text-slate-600">PF A/C Number</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">AA/AAA/0000000/000/0000000</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-slate-600">UAN</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">101010101010</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-600">Bank Account No</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">101010101010101</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-slate-600">ESI Number</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">1234567890</span>
                </div>
              </div>
            </div>

            {/* Earnings and Deductions Table */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Earnings */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Earnings
                    </h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-slate-300">
                      <tr>
                        <th className="pb-2 text-left font-semibold text-slate-700">Component</th>
                        <th className="pb-2 text-right font-semibold text-slate-700">Amount</th>
                        <th className="pb-2 text-right font-semibold text-slate-700">YTD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 text-slate-900">Basic</td>
                        <td className="py-2 text-right font-medium text-slate-900">₹60,000.00</td>
                        <td className="py-2 text-right text-slate-600">₹4,80,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">House Rent Allowance</td>
                        <td className="py-2 text-right font-medium text-slate-900">₹60,000.00</td>
                        <td className="py-2 text-right text-slate-600">₹4,80,000.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Conveyance Allowance</td>
                        <td className="py-2 text-right font-medium text-slate-900">₹0.00</td>
                        <td className="py-2 text-right text-slate-600">₹0.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Fixed Allowance</td>
                        <td className="py-2 text-right font-medium text-slate-900">₹0.00</td>
                        <td className="py-2 text-right text-slate-600">₹0.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Bonus</td>
                        <td className="py-2 text-right font-medium text-slate-900">₹0.00</td>
                        <td className="py-2 text-right text-slate-600">₹0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Deductions
                    </h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-slate-300">
                      <tr>
                        <th className="pb-2 text-left font-semibold text-slate-700">Component</th>
                        <th className="pb-2 text-right font-semibold text-slate-700">Amount</th>
                        <th className="pb-2 text-right font-semibold text-slate-700">YTD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 text-slate-900">Income Tax</td>
                        <td className="py-2 text-right font-medium text-slate-900">₹22,130.00</td>
                        <td className="py-2 text-right text-slate-600">₹2,65,554.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onPreview, onEdit }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg">
      {/* Template Preview Thumbnail */}
      <div className="relative aspect-[3/4] bg-slate-50 p-4">
        {/* Simple placeholder preview */}
        <div className="h-full w-full rounded border border-slate-200 bg-white p-3">
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-200"></div>
            <div className="h-2 w-1/2 rounded bg-slate-100"></div>
            <div className="mt-4 space-y-1">
              <div className="h-2 w-full rounded bg-slate-100"></div>
              <div className="h-2 w-full rounded bg-slate-100"></div>
              <div className="h-2 w-3/4 rounded bg-slate-100"></div>
            </div>
            <div className="mt-4 h-16 rounded bg-green-50 border border-green-200"></div>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onPreview}
            className="rounded-lg bg-white p-3 text-slate-700 shadow-lg transition-colors hover:bg-slate-50"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg bg-white p-3 text-slate-700 shadow-lg transition-colors hover:bg-slate-50"
            title="Edit"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        {/* Default Badge */}
        {template.isDefault && (
          <div className="absolute bottom-2 left-2 right-2 rounded bg-slate-900 px-2 py-1 text-center text-xs font-medium text-white">
            DEFAULT
          </div>
        )}

        {/* Green checkmark for active template */}
        {template.isDefault && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Template Name */}
      <div className="border-t border-slate-200 px-4 py-3">
        <h3 className="text-sm font-medium text-slate-900">{template.name}</h3>
      </div>
    </div>
  );
}

export default function PDFTemplatesView() {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const handleEdit = (template) => {
    alert(`Edit functionality for ${template.name} coming soon!`);
  };

  return (
    <div className="space-y-8">
      {/* PAYSLIP Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payslip</h2>
        </div>

        {/* Payslip Category */}
        <div className="mb-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Regular Payslips</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.payslip.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => handlePreview(template)}
                onEdit={() => handleEdit(template)}
              />
            ))}
          </div>
        </div>

        {/* Final Settlement could go here */}
        <div className="mb-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Final Settlement Payslip</h3>
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No templates available</p>
          </div>
        </div>
      </section>

      {/* LETTER TEMPLATES Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Letter Templates</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.letter.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => handlePreview(template)}
              onEdit={() => handleEdit(template)}
            />
          ))}
        </div>
      </section>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
