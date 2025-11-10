import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { employeeAPI } from "../utils/api";

export default function EmployeeDetailView({ employeeId, onBack }) {
  const [activeTab, setActiveTab] = useState("information");
  const [activeSubTab, setActiveSubTab] = useState("personal");
  const [isScrolled, setIsScrolled] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showStickyActionsMenu, setShowStickyActionsMenu] = useState(false);
  const headerRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const stickyActionsMenuRef = useRef(null);

  // Fetch employee data when component mounts or employeeId changes
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeeAPI.getById(employeeId);
        setEmployee(data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError(err.message || "Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  // Scroll handler for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // Trigger sticky header when the header has scrolled past the top of the viewport
        // We add a small buffer (64px for the fixed HeaderBar) to account for the fixed header
        setIsScrolled(rect.bottom <= 64);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Check initial state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close main actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionsMenu]);

  // Close sticky actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stickyActionsMenuRef.current && !stickyActionsMenuRef.current.contains(event.target)) {
        setShowStickyActionsMenu(false);
      }
    };

    if (showStickyActionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStickyActionsMenu]);

  // Handle edit profile
  const handleEditProfile = () => {
    console.log('handleEditProfile called - navigating to:', `employees/${employeeId}/edit`);
    window.location.hash = `employees/${employeeId}/edit`;
    setShowActionsMenu(false);
    setShowStickyActionsMenu(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="py-4 px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-slate-600">Loading employee details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-4 px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Employee</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no employee data
  if (!employee) {
    return (
      <div className="py-4 px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-600">No employee data found</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to safely get nested properties with fallback
  const getField = (path, fallback = "-") => {
    const keys = path.split(".");
    let value = employee;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    return value || fallback;
  };

  const tabs = [
    { id: "information", label: "Information" },
    { id: "files", label: "Files" },
    { id: "timeOff", label: "Time off" },
    { id: "timeTracking", label: "Time tracking" },
    { id: "performance", label: "Performance" },
  ];

  const subTabs = {
    information: [
      { id: "personal", label: "PERSONAL" },
      { id: "job", label: "JOB" },
      { id: "compensation", label: "COMPENSATION & BENEFITS" },
      { id: "experience", label: "EXPERIENCE" },
      { id: "emergency", label: "EMERGENCY" },
    ],
  };

  const renderPersonalTab = () => (
    <div className="space-y-8">
      {/* Basic Section */}
      <div>
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">First name</label>
              <p className="text-[15px] text-slate-900">{getField("first_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Middle name</label>
              <p className="text-[15px] text-slate-900">{getField("middle_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Last name</label>
              <p className="text-[15px] text-slate-900">{getField("last_name")}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Preferred name</label>
              <p className="text-[15px] text-slate-900">{getField("preferred_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Employee ID</label>
              <p className="text-[15px] text-slate-900">{getField("employee_number")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Status</label>
              <p className="text-[15px] text-slate-900">{getField("status", "Active")}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Date of Birth</label>
              <p className="text-[15px] text-slate-900">{getField("date_of_birth")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Age</label>
              <p className="text-[15px] text-slate-900">{getField("age")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Gender</label>
              <p className="text-[15px] text-slate-900">{getField("gender")}</p>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">SIN (Social Insurance Number)</label>
              <p className="text-[15px] text-slate-900">{getField("sin")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Marital Status</label>
              <p className="text-[15px] text-slate-900">{getField("marital_status")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Nationality</label>
              <p className="text-[15px] text-slate-900">{getField("nationality")}</p>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Language Preference</label>
              <p className="text-[15px] text-slate-900">{getField("language_preference")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Consent to Electronic T4/RL-1</label>
              <p className="text-[15px] text-slate-900">{getField("consent_to_electronic_slips")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Residential Address Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Residential Address</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Address Line 1</label>
              <p className="text-[15px] text-slate-900">{getField("address_line_1")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Address Line 2</label>
              <p className="text-[15px] text-slate-900">{getField("address_line_2")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">City</label>
              <p className="text-[15px] text-slate-900">{getField("city")}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Province</label>
              <p className="text-[15px] text-slate-900">{getField("province")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Postal Code</label>
              <p className="text-[15px] text-slate-900">{getField("postal_code")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Country</label>
              <p className="text-[15px] text-slate-900">{getField("country")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Phone</label>
            <p className="text-[15px] text-blue-600 font-medium">{getField("phone")}</p>
          </div>
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Work email</label>
            <p className="text-[15px] text-blue-600 font-medium">{getField("email")}</p>
          </div>
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Personal email</label>
            <p className="text-[15px] text-blue-600 font-medium">{getField("personal_email")}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobTab = () => (
    <div className="space-y-8">
      {/* Basic Section */}
      <div>
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Job title</label>
              <p className="text-[15px] text-slate-900">{getField("job_title")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Hire date</label>
              <p className="text-[15px] text-slate-900">{getField("hire_date")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Start date</label>
              <p className="text-[15px] text-slate-900">{getField("start_date")}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Entity</label>
              <p className="text-[15px] text-slate-900">{getField("entity_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Department</label>
              <p className="text-[15px] text-slate-900">{getField("department_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Division</label>
              <p className="text-[15px] text-slate-900">{getField("division")}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Manager</label>
              <p className="text-[15px] text-blue-600 font-medium">{getField("manager_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Job Level</label>
              <p className="text-[15px] text-slate-900">{getField("job_level")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Direct reports</label>
              <p className="text-[15px] text-slate-900">{getField("direct_reports_count", "0")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Location Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Work Location</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Work Location</label>
              <p className="text-[15px] text-slate-900">{getField("work_location_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Province/Territory of Employment</label>
              <p className="text-[15px] text-slate-900">{getField("province_of_employment")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Quebec Employee</label>
              <p className="text-[15px] text-slate-900">{getField("is_quebec_employee") ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Components Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Statutory Components (Canada)</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP/QPP Enabled</label>
              <p className="text-[15px] text-slate-900">{getField("cpp_enabled") ? "Yes" : "No"}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP2 Enabled</label>
              <p className="text-[15px] text-slate-900">{getField("cpp2_enabled") ? "Yes" : "No"}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">EI Enabled</label>
              <p className="text-[15px] text-slate-900">{getField("ei_enabled") ? "Yes" : "No"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">QPIP Enabled</label>
              <p className="text-[15px] text-slate-900">{getField("qpip_enabled") ? "Yes" : "No"}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP Exemption Reason</label>
              <p className="text-[15px] text-slate-900">{getField("cpp_exemption_code")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">EI Exemption Reason</label>
              <p className="text-[15px] text-slate-900">{getField("ei_exemption_code")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Employment</h3>

        {/* Contract details */}
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Employment type</label>
              <p className="text-[15px] text-slate-900">{getField("employment_type")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Employment status</label>
              <p className="text-[15px] text-slate-900">{getField("status")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Termination date</label>
              <p className="text-[15px] text-slate-900">{getField("termination_date")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompensationTab = () => (
    <div className="space-y-8">
      {/* Annual Compensation Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Annual Compensation</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Annual Gross Salary (CAD)</label>
              <p className="text-[15px] text-slate-900">{getField("annual_salary", "********")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Pay Frequency</label>
              <p className="text-[15px] text-slate-900">{getField("pay_frequency", "********")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Pay Schedule</label>
              <p className="text-[15px] text-slate-900">{getField("pay_schedule", "********")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Note: Additional compensation details */}
      <div className="border-t border-slate-200 pt-8">
        <p className="text-sm text-slate-500 italic">
          Additional compensation, tax, and payment details are available through the payroll system.
          Contact HR or Payroll for sensitive financial information.
        </p>
      </div>
    </div>
  );

  const renderExperienceTab = () => (
    <div className="space-y-8">
      <div className="text-center py-8">
        <p className="text-slate-500">
          Experience, education, and skills information is not currently stored in the system.
        </p>
      </div>
    </div>
  );

  const renderEmergencyTab = () => (
    <div className="space-y-8">
      {/* Contact Section */}
      <div>
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Name</label>
              <p className="text-[15px] text-slate-900">{getField("emergency_contact_name")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Relationship</label>
              <p className="text-[15px] text-slate-900">{getField("emergency_contact_relationship")}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Phone</label>
              <p className="text-[15px] text-slate-900">{getField("emergency_contact_phone")}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Email</label>
              <p className="text-[15px] text-slate-900">{getField("emergency_contact_email")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === "information") {
      switch (activeSubTab) {
        case "personal":
          return renderPersonalTab();
        case "job":
          return renderJobTab();
        case "compensation":
          return renderCompensationTab();
        case "experience":
          return renderExperienceTab();
        case "emergency":
          return renderEmergencyTab();
        default:
          return null;
      }
    }

    return <div className="text-slate-600 py-8">This section is under development...</div>;
  };

  return (
    <div className="py-4">
      {/* Sticky Header - Appears on Scroll */}
      <div
        className={`fixed left-0 md:left-[var(--sidebar-w)] right-0 z-40 bg-white shadow-md transition-all duration-300 ${
          isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        style={{ top: '64px' }}
      >
        {/* Top bar with employee info and actions */}
        <div className="px-8 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Compact Avatar */}
              <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 shadow ring-2 ring-white">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  alt={`${employee.lastName}, ${employee.firstName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Compact Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{getField("last_name")}, {getField("first_name")}</h2>
                  {employee?.is_sample && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      SAMPLE
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{getField("job_title")}</p>
              </div>
            </div>

            {/* Compact Actions */}
            <div className="relative" ref={stickyActionsMenuRef}>
              <button
                onClick={() => setShowStickyActionsMenu(!showStickyActionsMenu)}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
              >
                Actions
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showStickyActionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowStickyActionsMenu(false);
                      // Scroll to top to show full profile
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View profile
                  </button>
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="bg-white px-8">
          {activeTab === "information" && (
            <div className="flex gap-6">
              {subTabs.information.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveSubTab(st.id)}
                  className={`pb-3 pt-2 px-1 border-b-2 font-semibold text-xs tracking-wide transition-colors ${
                    activeSubTab === st.id
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>

        {/* Employee Header */}
        <div ref={headerRef} className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-slate-200/60 overflow-hidden mb-6">
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 shadow-lg ring-4 ring-white">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  alt={`${employee.lastName}, ${employee.firstName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{getField("last_name")}, {getField("first_name")}</h1>
                  {employee?.is_sample && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      SAMPLE
                    </span>
                  )}
                </div>
                <p className="text-base text-slate-700 font-medium mt-1">{getField("job_title")} ({getField("employment_type", "Full-Time")})</p>
                <p className="text-sm text-slate-600 mt-1">{getField("work_location_name") || getField("province_of_employment")}</p>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{getField("email")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">{getField("phone")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="relative" ref={actionsMenuRef}>
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
              >
                Actions
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      // Scroll to top to show full profile
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View profile
                  </button>
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Tabs and Content Card */}
        <div className="border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="bg-white px-8 py-4 border-b border-slate-200">
            <div className="flex gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    if (t.id === "information") setActiveSubTab("personal");
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === t.id
                      ? "bg-slate-800 text-white"
                      : "bg-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tabs and Content */}
          <div className="bg-white">
          {activeTab === "information" && (
            <div className="border-b border-slate-200 px-8 pt-6">
              <div className="flex gap-6">
                {subTabs.information.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveSubTab(st.id)}
                    className={`pb-3 px-1 border-b-2 font-semibold text-xs tracking-wide transition-colors ${
                      activeSubTab === st.id
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="pb-8 px-8 pt-6">
            {renderContent()}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
