import { useState, useEffect } from "react";
import { employeeAPI } from "../utils/api";

export default function EmployeesView() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeAPI.getAll({
        status: "active",
        page: 1,
        page_size: 100,
      });
      setEmployees(response.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // Transform backend employee data to display format
  const transformEmployee = (emp) => {
    const fullName = `${emp.last_name}, ${emp.first_name}`;
    const jobTitle = emp.job_title || "No Title";
    const employmentType = emp.employment_type?.replace(/_/g, "-") || "Full-Time";
    const title = `${jobTitle} (${employmentType.charAt(0).toUpperCase() + employmentType.slice(1)})`;

    // Format location
    const province = emp.province_of_employment || "";
    const location = emp.work_location_name
      ? `${emp.work_location_name} | ${province}`
      : province || "No location";

    return {
      id: emp.id,
      name: fullName,
      title: title,
      email: emp.email || "",
      phone: emp.phone || "",
      dept: emp.department_name || "No department",
      location: location,
      manager: emp.manager_name || "No manager",
      avatar: null,
      initial: emp.first_name?.[0]?.toUpperCase() || "?",
      status: emp.status || "Active",
    };
  };

  const rows = employees.map(transformEmployee);

  // Filter employees based on search term
  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(search) ||
      r.email.toLowerCase().includes(search) ||
      r.phone.includes(search) ||
      r.dept.toLowerCase().includes(search)
    );
  });

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleViewProfile = (employee) => {
    window.location.hash = `employees/${employee.id}`;
    setOpenMenuId(null);
  };

  const handleEditProfile = (employee) => {
    console.log('EmployeesView - handleEditProfile called for employee:', employee.id);
    const newHash = `employees/${employee.id}/edit`;
    console.log('EmployeesView - Setting hash to:', newHash);
    window.location.hash = newHash;
    setOpenMenuId(null);
  };

  const handleCardClick = (employee) => {
    window.location.hash = `employees/${employee.id}`;
  };

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
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#408dfb' }}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Loading State */}
      {loading && (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-sm text-slate-600">Loading employees...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="text-red-600">
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Failed to load employees</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchEmployees}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRows.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-800">No employees found</h3>
          <p className="mt-2 text-sm text-slate-600">
            {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first employee"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => { window.location.hash = "employees/new"; }}
              type="button"
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#408dfb' }}
            >
              Add Employee
            </button>
          )}
        </div>
      )}

      {/* Employee Cards */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="mt-3 space-y-3">
          {filteredRows.map((r, i) => (
          <div
            key={i}
            className="flex flex-col bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-md hover:border-slate-300/60 transition-all duration-200 cursor-pointer"
            onClick={() => handleCardClick(r)}
          >
            {/* Top Row - Three Sections */}
            <div className="flex items-center gap-0">
              {/* Left Section - Avatar and Name */}
              <div className="flex flex-1 items-center gap-5 px-6 py-5 border-r border-slate-200/60">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 shadow-md ring-2 ring-white">
                    <img
                      src="https://i.pravatar.cc/150?img=12"
                      alt={r.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {r.name}
                  </h3>
                </div>
              </div>

              {/* Middle Section - Contact Info */}
              <div className="flex flex-col justify-center gap-3 px-6 py-5 min-w-[360px] border-r border-slate-200/60">
                <div className="flex items-center gap-3 text-[15px] text-slate-700">
                  <svg
                    className="h-[18px] w-[18px] text-slate-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">{r.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[15px] text-slate-700">
                  <svg
                    className="h-[18px] w-[18px] text-slate-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="font-medium">{r.phone}</span>
                </div>
              </div>

              {/* Right Section - Reports To */}
              <div className="flex items-center justify-between px-6 py-5 min-w-[300px]">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Reports to
                  </span>
                  <span className="text-[15px] font-bold text-slate-800">{r.manager}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(r.id);
                    }}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === r.id && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />

                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProfile(r);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          View profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProfile(r);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Edit profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row - Title and Location */}
            <div className="border-t border-slate-200/60 px-6 py-4 bg-gradient-to-r from-slate-50/80 to-slate-50/40">
              <p className="text-sm text-slate-700 font-medium mb-2">{r.title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{r.location}</p>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
