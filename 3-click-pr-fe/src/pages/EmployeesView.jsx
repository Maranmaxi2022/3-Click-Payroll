import React from "react";

export default function EmployeesView() {
  const rows = [
    {
      name: "Thamilmaran Mohanarasa - 204212L",
      title: "Front End Developer",
      email: "thamilmaranmohanarasa@gmail.com",
      dept: "Engineering",
      status: "Active",
      initial: "T",
    },
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[18px] font-semibold text-slate-800">
          Active Employees
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              window.location.hash = "employees/new";
            }}
            aria-label="Add Employee"
            className="inline-flex items-center justify-center gap-2
             h-9 px-4 rounded-full text-[14px] font-medium
             bg-blue-600 text-white shadow-sm
             hover:bg-blue-700 active:translate-y-px
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
             cursor-pointer"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <input
            className="h-9 w-72 rounded-md border border-slate-200 bg-white px-8 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search in Employee"
          />
          <svg
            viewBox="0 0 24 24"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
          >
            <path
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50">
          Select Work Location
        </button>
        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50">
          Select Department
        </button>
        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50">
          Select Designation
        </button>
        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm hover:bg-slate-50">
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
              <th className="w-10">
                <input type="checkbox" />
              </th>
              <th>Employee Name</th>
              <th>Work Email</th>
              <th>Department</th>
              <th className="w-28">Employee Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {rows.map((r, i) => (
              <tr
                key={i}
                className="border-t border-slate-200 hover:bg-slate-50/60"
              >
                <td className="px-3 py-3 align-top">
                  <input type="checkbox" />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-800 font-semibold">
                      {r.initial}
                    </div>
                    <div>
                      <a
                        href="#"
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {r.name}
                      </a>
                      <div className="text-xs text-slate-500">{r.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">{r.email}</td>
                <td className="px-3 py-3 align-top">{r.dept}</td>
                <td className="px-3 py-3 align-top">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
