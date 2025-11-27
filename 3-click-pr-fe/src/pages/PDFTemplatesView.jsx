// src/pages/PDFTemplatesView.jsx
import { useState, useEffect } from "react";
import { Eye, Pencil, X } from "lucide-react";
import { organizationAPI } from "../utils/api";

// Sample template data
const TEMPLATES = {
  payslip: [
    {
      id: "elegant",
      name: "Elegant Template",
      category: "payslip",
      isDefault: false,
    },
  ],
  letter: [],
};

// Preview Modal Component
function TemplatePreviewModal({ template, onClose, organization }) {
  if (!template) return null;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const logoUrl = organization?.logo_url ? `${API_BASE_URL}/${organization.logo_url}` : null;

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Organization Logo */}
                  {logoUrl ? (
                    <div className="flex-shrink-0">
                      <img
                        src={logoUrl}
                        alt={organization?.company_name || "Company Logo"}
                        className="h-16 w-16 rounded-full object-cover"
                        onError={(e) => {
                          console.error('Logo failed to load:', logoUrl);
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="%236366f1"/><text x="32" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold">' + (organization?.company_name?.[0] || 'C') + '</text></svg>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {organization?.company_name?.[0] || 'C'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {organization?.company_name || "Huex Canada Inc."}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      {organization?.address || "123 Main Street, Suite 100, Toronto, ON M5H 2N2, Canada"}
                    </p>
                  </div>
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
                    { label: "Employee Name", value: "John Anderson" },
                    { label: "Designation", value: "Software Engineer" },
                    { label: "Employee ID", value: "CA-EMP-2014" },
                    { label: "Date of Joining", value: "September 21, 2014" },
                    { label: "Pay Period", value: "November 2025" },
                    { label: "Pay Date", value: "November 30, 2025" },
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
                    <p className="text-3xl font-bold text-slate-900">$6,240.50</p>
                    <p className="mt-1 text-sm text-slate-600">Total Net Pay</p>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-green-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Hours Worked</span>
                      <span className="font-medium text-slate-900">: 160</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Overtime Hours</span>
                      <span className="font-medium text-slate-900">: 8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="border-y border-slate-200 bg-slate-50 px-8 py-4">
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="flex">
                  <span className="w-36 text-slate-600">Social Insurance No</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">123-456-789</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">Employee Number</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">CA-EMP-2014</span>
                </div>
                <div className="flex">
                  <span className="w-36 text-slate-600">Bank Account No</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">0123-45678-910</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-slate-600">Transit Number</span>
                  <span className="mx-2 text-slate-400">:</span>
                  <span className="font-medium text-slate-900">12345-001</span>
                </div>
              </div>
            </div>

            {/* Earnings and Deductions Table */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Earnings */}
                <div>
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-slate-300">
                      <tr>
                        <th className="pb-2 text-left font-semibold text-slate-700 uppercase text-xs tracking-wide">Earnings</th>
                        <th className="pb-2 text-right font-semibold text-slate-700 uppercase text-xs tracking-wide">Amount</th>
                        <th className="pb-2 text-right font-semibold text-slate-700 uppercase text-xs tracking-wide">YTD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 text-slate-900">Regular Salary</td>
                        <td className="py-2 text-right font-medium text-slate-900">$7,200.00</td>
                        <td className="py-2 text-right text-slate-600">$79,200.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Overtime Pay</td>
                        <td className="py-2 text-right font-medium text-slate-900">$720.00</td>
                        <td className="py-2 text-right text-slate-600">$2,880.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Housing Allowance</td>
                        <td className="py-2 text-right font-medium text-slate-900">$500.00</td>
                        <td className="py-2 text-right text-slate-600">$5,500.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Travel Allowance</td>
                        <td className="py-2 text-right font-medium text-slate-900">$0.00</td>
                        <td className="py-2 text-right text-slate-600">$0.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Bonus</td>
                        <td className="py-2 text-right font-medium text-slate-900">$0.00</td>
                        <td className="py-2 text-right text-slate-600">$0.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Commission</td>
                        <td className="py-2 text-right font-medium text-slate-900">$0.00</td>
                        <td className="py-2 text-right text-slate-600">$0.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Vacation Pay</td>
                        <td className="py-2 text-right font-medium text-slate-900">$0.00</td>
                        <td className="py-2 text-right text-slate-600">$0.00</td>
                      </tr>
                      <tr className="border-t-2 border-slate-400">
                        <td className="py-2 font-bold text-slate-900">Gross Earnings</td>
                        <td className="py-2 text-right font-bold text-slate-900">$8,420.00</td>
                        <td className="py-2 text-right font-semibold text-slate-600"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div>
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-slate-300">
                      <tr>
                        <th className="pb-2 text-left font-semibold text-slate-700 uppercase text-xs tracking-wide">Deductions</th>
                        <th className="pb-2 text-right font-semibold text-slate-700 uppercase text-xs tracking-wide">Amount</th>
                        <th className="pb-2 text-right font-semibold text-slate-700 uppercase text-xs tracking-wide">YTD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 text-slate-900">Federal Tax</td>
                        <td className="py-2 text-right font-medium text-slate-900">$980.50</td>
                        <td className="py-2 text-right text-slate-600">$10,785.50</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Provincial Tax (ON)</td>
                        <td className="py-2 text-right font-medium text-slate-900">$520.00</td>
                        <td className="py-2 text-right text-slate-600">$5,720.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">CPP Contribution</td>
                        <td className="py-2 text-right font-medium text-slate-900">$460.00</td>
                        <td className="py-2 text-right text-slate-600">$5,060.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">EI Premium</td>
                        <td className="py-2 text-right font-medium text-slate-900">$139.00</td>
                        <td className="py-2 text-right text-slate-600">$1,529.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-900">Health Benefits</td>
                        <td className="py-2 text-right font-medium text-slate-900">$80.00</td>
                        <td className="py-2 text-right text-slate-600">$880.00</td>
                      </tr>
                      <tr className="border-t-2 border-slate-400">
                        <td className="py-2 font-bold text-slate-900">Total Deductions</td>
                        <td className="py-2 text-right font-bold text-slate-900">$2,179.50</td>
                        <td className="py-2 text-right font-semibold text-slate-600"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Total Net Payable */}
            <div className="mx-8 mb-6 rounded-lg border border-slate-200 bg-green-50/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Total Net Payable</p>
                  <p className="mt-1 text-xs text-slate-600">Gross Earnings - Total Deductions</p>
                </div>
                <div className="text-2xl font-bold text-slate-900">$6,240.50</div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
              <p className="text-center text-sm text-slate-600">
                <span className="font-medium">Amount In Words :</span> Six Thousand Two Hundred Forty Canadian Dollars and Fifty Cents Only
              </p>
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
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch organization data on component mount
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const orgData = await organizationAPI.get();
        setOrganization(orgData);
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

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

      </section>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          organization={organization}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
