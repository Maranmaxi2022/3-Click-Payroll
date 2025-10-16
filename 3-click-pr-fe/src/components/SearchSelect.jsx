// src/components/SearchSelect.jsx
import React from "react";
import { ChevronDown, Check, Search } from "lucide-react";

const cx = (...xs) => xs.filter(Boolean).join(" ");

/**
 * Searchable, stylable select dropdown.
 * props:
 * - options: [{ value, label, icon? }] (icon can be an emoji, text, or image URL)
 * - value: current value
 * - onChange(option)
 * - placeholder?: string
 * - className?: string (applied to root)
 * - inputClassName?: string (applied to input box)
 */
export default function SearchSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className,
  inputClassName,
  searchInMenu = false,
  menuClassName,
  menuSearchClassName,
  searchPlaceholder = "",
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const rootRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const menuSearchRef = React.useRef(null);

  const selected = React.useMemo(() => options.find((o) => o.value === value) || null, [options, value]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label || "").toLowerCase().includes(q));
  }, [options, query]);

  React.useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  React.useEffect(() => {
    if (open) {
      if (searchInMenu) {
        setQuery("");
        setTimeout(() => menuSearchRef.current?.focus(), 0);
      } else {
        setTimeout(() => inputRef.current?.focus(), 0);
        // When opening via click, show the full list.
        // Do not pre-filter by the currently selected label.
        setQuery("");
      }
      const idx = filtered.findIndex((o) => o.value === selected?.value);
      setActiveIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (opt) => {
    onChange?.(opt);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min((i < 0 ? -1 : i) + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[Math.max(0, activeIndex)];
      if (opt) pick(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputBox = (
    <div
      className={cx(
        "relative w-full rounded-xl border bg-white px-3 py-2",
        open
          ? "border-blue-500 ring-2 ring-blue-300/50"
          : "border-slate-300 hover:border-slate-400",
        inputClassName
      )}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={() => setOpen((o) => !o)}
    >
      <input
        ref={inputRef}
        type="text"
        className="w-full bg-transparent pr-6 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
        placeholder={placeholder}
        value={searchInMenu ? (selected?.label || "") : (open ? query : selected?.label || "")}
        onChange={(e) => {
          if (searchInMenu) return; // input acts as display only
          setQuery(e.target.value);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        readOnly={searchInMenu}
      />
      <ChevronDown className={cx("pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-transform", open ? "rotate-180" : "")} />
    </div>
  );

  return (
    <div className={cx("relative", className)} ref={rootRef}>
      {inputBox}
      {open && (
        <div
          className={cx(
            "absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white",
            menuClassName
          )}
          role="listbox"
        >
          {searchInMenu && (
            <div className="sticky top-0 z-10 bg-white p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  ref={menuSearchRef}
                  type="text"
                  className={cx(
                    "w-full border border-slate-300 bg-white py-2 pl-7 pr-2 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
                    menuSearchClassName || "rounded-xl"
                  )}
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">No results</div>
          )}
          {filtered.map((opt, idx) => {
            const selected = opt.value === value;
            const active = idx === activeIndex;
            return (
              <button
                type="button"
                key={opt.value}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => pick(opt)}
                className={cx(
                  "mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[14px]",
                  selected ? "bg-blue-600 text-white" : active ? "bg-blue-50" : "",
                )}
                role="option"
                aria-selected={selected}
              >
                <span className={cx("flex-1 font-medium", selected ? "text-white" : "text-slate-800")}>{opt.label}</span>
                {selected && <Check className={cx("h-4 w-4", selected ? "text-white" : "text-blue-600")} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
