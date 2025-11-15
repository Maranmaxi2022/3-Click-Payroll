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
 * - floatingLabel?: boolean (default true, uses placeholder as floating label)
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
  floatingLabel = true,
  offsetForExternalLabel = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const rootRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const menuSearchRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const selected = React.useMemo(() => options.find((o) => o.value === value) || null, [options, value]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      (o.label || "").toLowerCase().includes(q) ||
      (o.category || "").toLowerCase().includes(q)
    );
  }, [options, query]);

  // Group options by category
  const groupedOptions = React.useMemo(() => {
    const groups = {};
    filtered.forEach((opt) => {
      const cat = opt.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(opt);
    });
    return groups;
  }, [filtered]);

  const hasCategories = React.useMemo(() => {
    return options.some((opt) => opt.category);
  }, [options]);

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

  const hasValue = !!(selected?.label);
  const floatActive = open || hasValue || (!!query && !searchInMenu);
  const effectivePlaceholder = floatingLabel ? " " : placeholder;

  const inputBox = (
    <div
      className={cx(
        // Match input height and center contents so placeholder and chevron align
        "relative w-full rounded-md border bg-white h-9 px-3 flex items-center",
        open
          ? "border-blue-500 ring-2 ring-blue-300/50 shadow-sm"
          : "border-slate-200 hover:border-slate-300",
        inputClassName
      )}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      onClick={(e) => {
        // Avoid re-opening immediately when clicking inside the menu
        if (menuRef.current && menuRef.current.contains(e.target)) return;
        setOpen(true);
      }}
    >
      {floatingLabel && (
        <span
          className={cx(
            "pointer-events-none absolute left-2 z-10 select-none rounded bg-white px-1 transition-all",
            floatActive
              ? "top-0 -translate-y-1/2 text-[11px] text-slate-500"
              : "top-1/2 -translate-y-1/2 text-[14px] text-slate-400"
          )}
        >
          {placeholder}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        className="w-full bg-transparent pr-6 text-sm leading-5 text-slate-800 placeholder:text-slate-400 focus:outline-none"
        placeholder={effectivePlaceholder}
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
    <div className={cx("relative", floatingLabel && offsetForExternalLabel ? "mt-3" : "", className)} ref={rootRef}>
      {inputBox}
      {open && (
        <div
          ref={menuRef}
          className={cx(
            "absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg",
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
                    "w-full border border-slate-300 bg-white py-2 pl-7 pr-2 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-md",
                    menuSearchClassName || "rounded-md"
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
          {hasCategories ? (
            // Render grouped options
            Object.entries(groupedOptions).map(([category, opts]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50">
                  {category}
                </div>
                {opts.map((opt) => {
                  const globalIdx = filtered.indexOf(opt);
                  const selected = opt.value === value;
                  const active = globalIdx === activeIndex;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      onClick={() => pick(opt)}
                      className={cx(
                        "mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[14px]",
                        selected ? "text-white" : active ? "bg-blue-50" : "",
                      )}
                      style={selected ? { backgroundColor: '#408dfb' } : undefined}
                      role="option"
                      aria-selected={selected}
                    >
                      <span className={cx("flex-1 font-medium", selected ? "text-white" : "text-slate-800")}>{opt.label}</span>
                      {selected && <Check className={cx("h-4 w-4", selected ? "text-white" : "")} style={selected ? undefined : { color: '#408dfb' }} />}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            // Render flat list
            filtered.map((opt, idx) => {
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
                    selected ? "text-white" : active ? "bg-blue-50" : "",
                  )}
                  style={selected ? { backgroundColor: '#408dfb' } : undefined}
                  role="option"
                  aria-selected={selected}
                >
                  <span className={cx("flex-1 font-medium", selected ? "text-white" : "text-slate-800")}>{opt.label}</span>
                  {selected && <Check className={cx("h-4 w-4", selected ? "text-white" : "")} style={selected ? undefined : { color: '#408dfb' }} />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
