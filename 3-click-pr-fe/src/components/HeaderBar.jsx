import React from "react";
import { Bell, Settings } from "lucide-react";

import { BRANDING_DEFAULT } from "../utils/branding";

export default function HeaderBar({
  brand,
  q,
  setQ,
  onOpenSidebar,
  appearance: _appearance = BRANDING_DEFAULT.appearance,
  accent: _accent = BRANDING_DEFAULT.accent,
  subHeader,
  inSettings = false,
  onCloseSettings,
}) {
  const brandPaneClass = "hidden md:flex h-16 shrink-0 items-center bg-[#21263C] text-white pl-3 pr-3";
  const brandLogoContainerClass = "logo-container flex items-center rounded-lg";
  const brandLogoClass = "logo block";
  const brandNameClass = "product-name";
  const brandLogoContainerStyle = {
    backgroundColor: "#21263C",
    color: "#FFFFFF",
    fontFamily:
      '"ZohoPuvi", Inter, -apple-system, "system-ui", "Segoe UI", Roboto, sans-serif',
    padding: "0 16px 0 0",
  };
  const brandLogoStyle = {
    width: "24px",
    height: "24px",
    margin: "12px 0 12px 16px",
  };
  const brandNameStyle = {
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: "28.8px",
    marginLeft: "8px",
    marginRight: "8px",
    color: "#FFFFFF",
  };

  return (
    // Fixed to the viewport (no movement on vertical or horizontal scroll)
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 pl-0 pr-4">
        {/* Mobile menu */}
        <button
          className="md:hidden rounded-lg p-2 hover:bg-slate-100"
          aria-label="Open menu"
          onClick={onOpenSidebar}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Brand block (matches sidebar width on desktop) */}
        <div className={brandPaneClass} style={{ width: "var(--sidebar-w)" }}>
          <div className={brandLogoContainerClass} style={brandLogoContainerStyle}>
            <img
              name="logo"
              src={brand.logo}
              alt={brand?.name ?? "Payroll"}
              className={brandLogoClass}
              style={brandLogoStyle}
            />
            <div className={brandNameClass} style={brandNameStyle}>
              Payroll
            </div>
          </div>
        </div>

        {/* Search or Close Settings */}
        <div className={`${inSettings ? "-ml-3" : "ml-3"} w-full md:w-[560px] lg:w-[620px] shrink-0`}>
          {inSettings ? (
            <div className="px-4 md:px-8 lg:px-12 xl:px-16">
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-lg border border-[#DDE3F3] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                onClick={
                  onCloseSettings || (() => (window.location.hash = "dashboard"))
                }
              >
                Close Settings ✕
              </button>
            </div>
          ) : (
            <div className="group flex h-9 w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 shadow-[0_1px_0_0_rgba(0,0,0,0.02)] backdrop-blur-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <button type="button" aria-label="Advanced Search" className="flex items-center gap-1 pl-2.5 pr-2 py-1.5 text-slate-600 hover:bg-slate-100">
                <svg viewBox="0 0 512 512" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M505.2 475.8l-87.3-87.3C453.6 346.1 473 293 473 237c0-63-24.5-122.3-69.1-166.9C359.3 25.5 300 1 237 1S114.7 25.5 70.1 70.1C25.5 114.7 1 174 1 237s24.5 122.3 69.1 166.9C114.7 448.5 174 473 237 473c55.9 0 108.9-19.3 151.2-54.8l87.3 87.3c4.1 4.1 9.5 6.2 14.8 6.2s10.7-2 14.8-6.2c8.3-8.2 8.3-21.5.1-29.7zM43 237c0-107 87-194 194-194s194 87 194 194-87 194-194 194S43 344 43 237z" />
                </svg>
                <svg viewBox="0 0 16 16" className="h-3 w-3 text-slate-500" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <input
                placeholder="Search in Employee"
                className="flex-1 bg-transparent px-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search in Employee"
              />
              <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="mx-1 rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <svg viewBox="0 0 512 512" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M308.4 256L500.6 63.8c14.5-14.5 14.5-37.9 0-52.4s-37.9-14.5-52.4 0L256 203.6 63.8 11.4c-14.5-14.5-37.9-14.5-52.4 0s-14.5 37.9 0 52.4L203.6 256 11.4 448.2c-14.5 14.5-14.5 37.9 0 52.4 7.2 7.2 16.7 10.9 26.2 10.9s19-3.6 26.2-10.9L256 308.4l192.2 192.2c7.2 7.2 16.7 10.9 26.2 10.9s19-3.6 26.2-10.9c14.5-14.5 14.5-37.9 0-52.4L308.4 256z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="hidden flex-1 md:block" />
        <div className="hidden items-center gap-2 md:flex ml-auto">
          {!inSettings && (
            <>
              <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </button>
            </>
          )}
          <button className="overflow-hidden rounded-full ring-2 ring-slate-200" aria-label="Account">
            <img
              alt="User"
              className="h-8 w-8 object-cover"
              src="https://lh3.googleusercontent.com/rd-ogw/AF2bZyhueXZK0M1HrNR2ZPHvUacjW0l9rrVdLRJ6DKLPBOn5KH1mzdK7navrVi9vyX0_XG8KPk4HhFkDfwzxB7tHCxwyHaWamymCBv0fqkVz8nWSn_PKYjr0wyjsVntGgSzlJ3Qmgq701lid2d-57u-QAUYANUbRAcuHC2uVehT08l-cFCXCRJpeiRFhtfv33Fu5OtpryR-i2cyEZiDsxEGsjAfjeNCV1Sarz2pVIYu_h6g42PpUori4AyKEd0Cs1dNyp24E3vVUFEu1PDD445hl4SaOQAobPqK8_Y98Xyg2r0LjmKbpzcUdmlvcYpxnoupiKrJWARvE-7UZXeisQy-m9Rkvj_EOZzuLWnb5WhTIZJeuTKAJOH-Ja34jPaHjzoGf02hWm2iBoSwVzh17PKNrsNJfE6_Q_1PpZUOId0Wsr06RBo2h1RX4VJVu--gTuU4wy9CbsPHKoqwka6nppSOdkNrI1rqyg616cpaHjlzUJwtoKyd43u5yGVrf19q2duD0kgL_YqdHPdsulC1qHr809Hg3Qzpi6G1nl2ELz5LFirAFmBay8mrL8qr-KOUQYnHkDpuZG4WL65cxSW5t0grzv5ChAv7SBmgQdej-GJFMp76zSevC5PbtlE8MTigyjfnkgLDq0NWwrLt2jNDuauQoyBG1ex0KeNANDrzkFU2b1Qp7K-pzZwYM4UxE-4chfUgP81kAkvHllIlDyRRdo-5mUyNZfRT4AQVxM2q6UHSG8J5ql_ULHaxB4qPNVCAZlPycmTBjv7sibbByuZgb4xlcCZg1i8O3IOJDXUDl-XWUWnWFUdXRdLU_ivVtyPaKL5XwqzdoMK6cy2sFjJFC9rbHJRcsYdMRzeFWJc-NIkojZVC1KZnOskcrVmRmesLZ9R28XSg9AIh-RGRgkIEOqlPQGzSQgOYpWpYSo9xA7EaLbTS2Hl3eNwc06aH0ZEvEvEPS3rQsT9SmTnp0GZfiS-In5HXszLt_98r9jpco5fsuP-UbV5yqnQX551rB7eukTCHe_fFrMvb-xXiHFSs60XbgISeyxNWPuYvWqysTcSAJQQ=s64-c"
            />
          </button>
        </div>
      </div>
      {subHeader ? (
        <div
          className="hidden lg:block fixed right-0 z-40"
          style={{ left: "calc(var(--sidebar-w))", top: "64px" }}
        >
          <div className="relative bg-white py-5 shadow-sm border-b border-slate-200">
            <div className="px-4 md:px-8 lg:px-12 xl:px-16">
              {subHeader}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
