import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";

export default function EmployeeDetailView({ employeeId, onBack }) {
  const [activeTab, setActiveTab] = useState("information");
  const [activeSubTab, setActiveSubTab] = useState("personal");
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);

  // Mock employee data - in a real app, this would be fetched based on employeeId
  const employee = {
    id: employeeId,
    firstName: "Rex",
    middleName: "-",
    lastName: "Abernathy",
    preferredName: "-",
    employeeId: "5",
    status: "Active",
    jobTitle: "Account Manager",
    hireDate: "01 October 2021",
    startDate: "17 December 2021",
    entity: "US Entity | Boston, Massachusetts, United States | Boston HQ",
    department: "-",
    division: "-",
    manager: "Greenholt, Eulah",
    directReports: "-",
    effectiveDate: "08 October 2021",
    employmentType: "Full-Time",
    jobLevel: "Senior",
    workplace: "-",
    expiryDate: "-",
    contractEndDate: "-",
    probationEndDate: "-",
    note: "-",
    workSchedule: "Full time | 9:00 AM - 6:00 PM | 5 days, 40 hours",
    country: "United States of America (the)",
    address: "51 Melcher Street, Boston, Massachusetts, United States, 02210",
    gender: "-",
    birthdate: "-",
    nationality: "Canadian",
    languagePreference: "English",
    maritalStatus: "Married",
    maritalCertificate: "-",
    phoneType: "Mobile",
    phone: "+18579909723",
    phoneExtension: "-",
    workEmail: "rex_abernathy@sampleemployee.com",
    personalEmail: "rex_abernathy@samplecandidate.com",
    chatType: "-",
    chatUsername: "-",
    socialMediaType: "-",
    socialMediaUrl: "-",
    // Salary Details from Wizard
    annualGrossSalary: "********",
    payFrequency: "********",
    periodsPerYear: "********",
    earnings: {
      overtime: "********",
      vacation: "********",
      bonus: "********",
      commissions: "********",
      taxableBenefits: "********",
      benefitPensionable: "********",
      benefitInsurable: "********",
    },
    td1: {
      federalMode: "********",
      federalTotal: "********",
      federalCode: "********",
      federalIndexing: "********",
      provincialMode: "********",
      provincialTotal: "********",
      provincialCode: "********",
      additionalTaxPerPay: "********",
    },
    ytd: {
      cpp: "********",
      cpp2: "********",
      qpp: "********",
      qpp2: "********",
      ei: "********",
      qpip: "********",
      tax: "********",
      nonPeriodic: "********",
    },
    credits: {
      rrsp: "********",
      rrspYtd: "********",
      rpp: "********",
      rppYtd: "********",
      unionDues: "********",
      alimony: "********",
      northernDeduction: "********",
      lcf: "********",
      lcp: "********",
      commissionEmployee: "********",
    },
    salaryEffectiveDate: "********",
    payType: "********",
    payRate: "********",
    paySchedule: "********",
    overtimeStatus: "********",
    reason: "********",
    salaryNote: "********",
    // Bank Details from Wizard
    bankName: "********",
    iban: "********",
    accountNumber: "********",
    accountHolder: "********",
    ifsc: "********",
    accountType: "********",
    // Basic Details from Wizard
    provinceEmployment: "Ontario",
    quebecEmployee: "No",
    locationCity: "Toronto",
    locationProvince: "ON",
    locationPostal: "M5H 2N2",
    portalAccess: "Enabled",
    statutory: {
      cppEnabled: "Yes",
      cpp2Enabled: "Yes",
      eiEnabled: "Yes",
      qpipEnabled: "No",
      exemptions: {
        cpp: "-",
        cpp2: "-",
        ei: "-",
        qpip: "-",
      },
    },
    // Personal Details from Wizard
    sin: "XXX XXX 789",
    dob: "-",
    age: "-",
    residentialAddress: {
      addr1: "51 Melcher Street",
      addr2: "Apt 4B",
      city: "Boston",
      province: "MA",
      postal: "02210",
      country: "United States",
    },
    consentEslips: "Yes",
    // Payment Information from Wizard
    paymentMethod: "Bank Transfer (Manual Process)",
    educationStartDate: "-",
    educationEndDate: "-",
    degree: "-",
    fieldOfStudy: "-",
    school: "-",
    workExpStartDate: "-",
    workExpEndDate: "-",
    workExpJobTitle: "-",
    workExpCompany: "-",
    workExpSummary: "-",
    workExpPresent: "-",
    skill: "-",
    language: "-",
    resumeFile: "-",
    emergencyContactName: "-",
    emergencyContactRelationship: "-",
    emergencyContactPhone: "-",
    emergencyContactEmail: "-",
    emergencyContactCountry: "-",
    emergencyContactAddress: "-",
  };

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
      { id: "legal", label: "LEGAL DOCUMENTS" },
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
              <p className="text-[15px] text-slate-900">{employee.firstName}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Middle name</label>
              <p className="text-[15px] text-slate-900">{employee.middleName}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Last name</label>
              <p className="text-[15px] text-slate-900">{employee.lastName}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Preferred name</label>
              <p className="text-[15px] text-slate-900">{employee.preferredName}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Employee ID</label>
              <p className="text-[15px] text-slate-900">{employee.employeeId}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Status</label>
              <p className="text-[15px] text-slate-900">{employee.status}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Date of Birth</label>
              <p className="text-[15px] text-slate-900">{employee.dob}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Age</label>
              <p className="text-[15px] text-slate-900">{employee.age}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Gender</label>
              <p className="text-[15px] text-slate-900">{employee.gender}</p>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">SIN (Social Insurance Number)</label>
              <p className="text-[15px] text-slate-900">{employee.sin}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Marital Status</label>
              <p className="text-[15px] text-slate-900">{employee.maritalStatus}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Nationality</label>
              <p className="text-[15px] text-slate-900">{employee.nationality}</p>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Language Preference</label>
              <p className="text-[15px] text-slate-900">{employee.languagePreference}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Consent to Electronic T4/RL-1</label>
              <p className="text-[15px] text-slate-900">{employee.consentEslips}</p>
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
              <p className="text-[15px] text-slate-900">{employee.residentialAddress.addr1}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Address Line 2</label>
              <p className="text-[15px] text-slate-900">{employee.residentialAddress.addr2}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">City</label>
              <p className="text-[15px] text-slate-900">{employee.residentialAddress.city}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Province</label>
              <p className="text-[15px] text-slate-900">{employee.residentialAddress.province}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Postal Code</label>
              <p className="text-[15px] text-slate-900">{employee.residentialAddress.postal}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Country</label>
              <p className="text-[15px] text-slate-900">{employee.residentialAddress.country}</p>
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
            <p className="text-[15px] text-blue-600 font-medium">{employee.phone}</p>
          </div>
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Work email</label>
            <p className="text-[15px] text-blue-600 font-medium">{employee.workEmail}</p>
          </div>
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Personal email</label>
            <p className="text-[15px] text-blue-600 font-medium">{employee.personalEmail}</p>
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
              <p className="text-[15px] text-slate-900">{employee.jobTitle}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Hire date</label>
              <p className="text-[15px] text-slate-900">{employee.hireDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Start date</label>
              <p className="text-[15px] text-slate-900">{employee.startDate}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Entity</label>
              <p className="text-[15px] text-slate-900">{employee.entity}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Department</label>
              <p className="text-[15px] text-slate-900">{employee.department}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Division</label>
              <p className="text-[15px] text-slate-900">{employee.division}</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Manager</label>
              <p className="text-[15px] text-blue-600 font-medium">{employee.manager}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Job Level</label>
              <p className="text-[15px] text-slate-900">{employee.jobLevel}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Direct reports</label>
              <p className="text-[15px] text-slate-900">{employee.directReports}</p>
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
              <label className="block text-sm text-slate-500 mb-1">City</label>
              <p className="text-[15px] text-slate-900">{employee.locationCity}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Province</label>
              <p className="text-[15px] text-slate-900">{employee.locationProvince}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Postal Code</label>
              <p className="text-[15px] text-slate-900">{employee.locationPostal}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Province/Territory of Employment</label>
              <p className="text-[15px] text-slate-900">{employee.provinceEmployment}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Quebec Employee</label>
              <p className="text-[15px] text-slate-900">{employee.quebecEmployee}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Portal Access</label>
              <p className="text-[15px] text-slate-900">{employee.portalAccess}</p>
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
              <p className="text-[15px] text-slate-900">{employee.statutory.cppEnabled}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP2 Enabled</label>
              <p className="text-[15px] text-slate-900">{employee.statutory.cpp2Enabled}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">EI Enabled</label>
              <p className="text-[15px] text-slate-900">{employee.statutory.eiEnabled}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">QPIP Enabled</label>
              <p className="text-[15px] text-slate-900">{employee.statutory.qpipEnabled}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP Exemption Reason</label>
              <p className="text-[15px] text-slate-900">{employee.statutory.exemptions.cpp}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">EI Exemption Reason</label>
              <p className="text-[15px] text-slate-900">{employee.statutory.exemptions.ei}</p>
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
              <label className="block text-sm text-slate-500 mb-1">Effective date</label>
              <p className="text-[15px] text-slate-900">{employee.effectiveDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Employment type</label>
              <p className="text-[15px] text-slate-900">{employee.employmentType}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Workplace</label>
              <p className="text-[15px] text-slate-900">{employee.workplace}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Probation End Date</label>
              <p className="text-[15px] text-slate-900">{employee.probationEndDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Contract End Date</label>
              <p className="text-[15px] text-slate-900">{employee.contractEndDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Expiry date</label>
              <p className="text-[15px] text-slate-900">{employee.expiryDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Note</label>
              <p className="text-[15px] text-slate-900">{employee.note}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Work schedule</label>
              <p className="text-[15px] text-blue-600 font-medium">{employee.workSchedule}</p>
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
              <p className="text-[15px] text-slate-900">{employee.annualGrossSalary}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Pay Frequency</label>
              <p className="text-[15px] text-slate-900">{employee.payFrequency}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Periods Per Year</label>
              <p className="text-[15px] text-slate-900">{employee.periodsPerYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Components Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Earnings Components</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Overtime</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.overtime}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Vacation Pay</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.vacation}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Bonus</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.bonus}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Commissions</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.commissions}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Taxable Benefits</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.taxableBenefits}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Benefit Pensionable</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.benefitPensionable}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Benefit Insurable</label>
              <p className="text-[15px] text-slate-900">{employee.earnings.benefitInsurable}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TD1 Tax Details Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">TD1 Tax Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Federal TD1 Mode</label>
              <p className="text-[15px] text-slate-900">{employee.td1.federalMode}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Federal TD1 Total</label>
              <p className="text-[15px] text-slate-900">{employee.td1.federalTotal}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Federal TD1 Code</label>
              <p className="text-[15px] text-slate-900">{employee.td1.federalCode}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Federal Indexing</label>
              <p className="text-[15px] text-slate-900">{employee.td1.federalIndexing}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Provincial TD1 Mode</label>
              <p className="text-[15px] text-slate-900">{employee.td1.provincialMode}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Provincial TD1 Total</label>
              <p className="text-[15px] text-slate-900">{employee.td1.provincialTotal}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Provincial TD1 Code</label>
              <p className="text-[15px] text-slate-900">{employee.td1.provincialCode}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Additional Tax Per Pay</label>
              <p className="text-[15px] text-slate-900">{employee.td1.additionalTaxPerPay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* YTD (Year-to-Date) Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Year-to-Date (YTD) Carry-ins</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.cpp}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">CPP2 YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.cpp2}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">QPP YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.qpp}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">QPP2 YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.qpp2}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">EI YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.ei}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">QPIP YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.qpip}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Tax YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.tax}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Non-Periodic YTD</label>
              <p className="text-[15px] text-slate-900">{employee.ytd.nonPeriodic}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Credits Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tax Credits & Deductions</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">RRSP</label>
              <p className="text-[15px] text-slate-900">{employee.credits.rrsp}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">RRSP YTD</label>
              <p className="text-[15px] text-slate-900">{employee.credits.rrspYtd}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">RPP</label>
              <p className="text-[15px] text-slate-900">{employee.credits.rpp}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">RPP YTD</label>
              <p className="text-[15px] text-slate-900">{employee.credits.rppYtd}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Union Dues</label>
              <p className="text-[15px] text-slate-900">{employee.credits.unionDues}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Alimony</label>
              <p className="text-[15px] text-slate-900">{employee.credits.alimony}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Northern Deduction</label>
              <p className="text-[15px] text-slate-900">{employee.credits.northernDeduction}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Limited Charitable (Federal)</label>
              <p className="text-[15px] text-slate-900">{employee.credits.lcf}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Limited Charitable (Provincial)</label>
              <p className="text-[15px] text-slate-900">{employee.credits.lcp}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Commission Employee</label>
              <p className="text-[15px] text-slate-900">{employee.credits.commissionEmployee}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Payment Method</label>
              <p className="text-[15px] text-slate-900">{employee.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Bank Account</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Account Holder Name</label>
              <p className="text-[15px] text-slate-900">{employee.accountHolder}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Bank name</label>
              <p className="text-[15px] text-slate-900">{employee.bankName}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Account number</label>
              <p className="text-[15px] text-slate-900">{employee.accountNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">IFSC Code</label>
              <p className="text-[15px] text-slate-900">{employee.ifsc}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Account Type</label>
              <p className="text-[15px] text-slate-900">{employee.accountType}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">IBAN</label>
              <p className="text-[15px] text-slate-900">{employee.iban}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExperienceTab = () => (
    <div className="space-y-8">
      {/* Education Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Education</h3>
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Start date</label>
              <p className="text-[15px] text-slate-900">{employee.educationStartDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">End date</label>
              <p className="text-[15px] text-slate-900">{employee.educationEndDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Degree</label>
              <p className="text-[15px] text-slate-900">{employee.degree}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Field of study</label>
              <p className="text-[15px] text-slate-900">{employee.fieldOfStudy}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">School</label>
              <p className="text-[15px] text-slate-900">{employee.school}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Work experience Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Work experience</h3>
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Start date</label>
              <p className="text-[15px] text-slate-900">{employee.workExpStartDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">End date</label>
              <p className="text-[15px] text-slate-900">{employee.workExpEndDate}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Job title</label>
              <p className="text-[15px] text-slate-900">{employee.workExpJobTitle}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Company</label>
              <p className="text-[15px] text-slate-900">{employee.workExpCompany}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Summary</label>
              <p className="text-[15px] text-slate-900">{employee.workExpSummary}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Present</label>
              <p className="text-[15px] text-slate-900">{employee.workExpPresent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Skill</label>
            <p className="text-[15px] text-slate-900">{employee.skill}</p>
          </div>
        </div>
      </div>

      {/* Languages Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Languages</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">Language</label>
            <p className="text-[15px] text-slate-900">{employee.language}</p>
          </div>
        </div>
      </div>

      {/* Resume Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resume</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#FBFBFB] rounded px-4 py-3">
            <label className="block text-sm text-slate-500 mb-1">File</label>
            <p className="text-[15px] text-slate-900">{employee.resumeFile}</p>
          </div>
        </div>
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
              <p className="text-[15px] text-slate-900">{employee.emergencyContactName}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Relationship</label>
              <p className="text-[15px] text-slate-900">{employee.emergencyContactRelationship}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Phone</label>
              <p className="text-[15px] text-slate-900">{employee.emergencyContactPhone}</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Email</label>
              <p className="text-[15px] text-slate-900">{employee.emergencyContactEmail}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Country</label>
              <p className="text-[15px] text-slate-900">{employee.emergencyContactCountry}</p>
            </div>
            <div className="bg-[#FBFBFB] rounded px-4 py-3">
              <label className="block text-sm text-slate-500 mb-1">Address</label>
              <p className="text-[15px] text-slate-900">{employee.emergencyContactAddress}</p>
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
        case "legal":
          return <div className="text-slate-600 py-8">Legal documents content coming soon...</div>;
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
                  <h2 className="text-base font-bold text-slate-900">{employee.lastName}, {employee.firstName}</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    SAMPLE
                  </span>
                </div>
                <p className="text-sm text-slate-600">{employee.jobTitle}</p>
              </div>
            </div>

            {/* Compact Actions */}
            <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60">
              Actions
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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
                  <h1 className="text-2xl font-bold text-slate-900">{employee.lastName}, {employee.firstName}</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    SAMPLE
                  </span>
                </div>
                <p className="text-base text-slate-700 font-medium mt-1">{employee.jobTitle} ({employee.employmentType})</p>
                <p className="text-sm text-slate-600 mt-1">{employee.entity}</p>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{employee.workEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium">{employee.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60">
                Actions
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
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
