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
  // Track page scroll to show a subtle divider when content scrolls under the navbar
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(typeof window !== "undefined" && window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialize state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex h-16 items-center gap-0 pl-0 pr-4">
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

        {/* Close Settings (search removed) */}
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
        ) : null}

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
              src="https://lh3.googleusercontent.com/rd-ogw/AF2bZygSGs1JL52SqAfUjgLZ0xhNMgfhITtU8jC5aW3L51eVgKfhbDj1fppw2nAmanabs7MbjO18PhcbnHInXREDOrHkf32U3psjvc0NIOQsrJGo95HL1YPmxHjx--AtgQYsl3Jr-QwNUlxz5UOLDG1mb35GGRfMKFR8yhfDKTqeYzPQUFWW9hlv5Z83uOn7s3Eroh7dUwI_YgjTlJnZ39Q5wNa1d7G-N7nbExdB4GyGu0Bk1hXkLdld8NAsSz1M7ivFCXL61bPrTCYCV2d8m3g4izsDyaWlpaWsdJIS-CDAZtlSz9KeEPdBZ7FJv7VsVk_TOpsLzDP04Y1-2LY1qxMXC9uwIIhHMo8KKlhK-DejTz1W6rggJ5sb8z6TCDn_u697Ub9QqZlW9vWuhK8JAgKG0ulevZP_48Bpl53YFQoOQHJq0CkjQUKRDt8-cZCiq33w5Nz5dQ3DMmNl5gd31zzVThQ5AW_yEClZbozBJfRaTSNWUV8re445ohSBAkBoJzkeOWvBh8Fri6Vh-jRIbkrdj-k4hDHB3_nUeZavvZ9LKllETGIDOyBlGERksWlrQDG3UULNNgQ79hbu9miYCmL8p6uH2cC288X-XBEn4VzBQH3baKRC_ldITzpv2Q_cPPE9AazkIFysozODrntlg3GrUdvXcWGFX9Sea0WQUgAhG5ZX2Y3MaBXucwy2C4QAa40SYynu3HSlrejrpcJHC1zJNOlJXMJZbFuExbr7qAiyFkJQpb-ObdQDWyWVvLIBuYx0N-GtlMpOPlukWoUWtP2fI7ASoOnoX9805-AV33RM5NhtAteOAbPPJAE5IANkL6vxngSPdUM5E5DviHCJgY8QIxLZp2KLHZrOku6iMtoS38HyqD2r_xsNr9L86MWHn2G7mPAqcdy7tTot7Jifjg8D7Ff6NyqzzOLXuVleFNTSCfGWa8XxN7JAg4y-D4SMmTm9K2Dnn_WXaJNeO_DJj0DiE-Gceqn2F3wM6jnln1mT0t_UjAHqhCqFycprMWpBYKCxulpyVEV6Gs84rUyeVBWjSjM6XTSZsNe86rD9b72LBg=s64-c"
            />
          </button>
        </div>
      </div>
      {subHeader ? (
        <div
          className="hidden lg:block fixed right-0 z-40"
          style={{ left: "calc(var(--sidebar-w))", top: "64px" }}
        >
          <div className={"relative bg-white py-5 border-t border-slate-200 " + (scrolled ? "border-b" : "")}>
            <div className="px-4 md:px-8 lg:px-12 xl:px-16">
              {subHeader}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
