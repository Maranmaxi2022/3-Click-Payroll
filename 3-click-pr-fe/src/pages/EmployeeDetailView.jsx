import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function EmployeeDetailView({ employeeId, onBack }) {
  const [activeTab, setActiveTab] = useState("information");
  const [activeSubTab, setActiveSubTab] = useState("personal");
  const [showSensitiveData, setShowSensitiveData] = useState(false);

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
    workplace: "-",
    expiryDate: "-",
    note: "-",
    workSchedule: "Full time | 9:00 AM - 6:00 PM | 5 days, 40 hours",
    country: "United States of America (the)",
    address: "51 Melcher Street, Boston, Massachusetts, United States, 02210",
    gender: "-",
    birthdate: "-",
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
    salaryEffectiveDate: "********",
    payType: "********",
    payRate: "********",
    paySchedule: "********",
    overtimeStatus: "********",
    reason: "********",
    salaryNote: "********",
    bankName: "********",
    iban: "********",
    accountNumber: "********",
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
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">First name</label>
              <p className="text-base text-slate-900">{employee.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Middle name</label>
              <p className="text-base text-slate-900">{employee.middleName}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Last name</label>
              <p className="text-base text-slate-900">{employee.lastName}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Preferred name</label>
              <p className="text-base text-slate-900">{employee.preferredName}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Employee ID</label>
              <p className="text-base text-slate-900">{employee.employeeId}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Status</label>
              <p className="text-base text-slate-900">{employee.status}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Country</label>
              <p className="text-base text-slate-900">{employee.country}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Address</label>
              <p className="text-base text-slate-900">{employee.address}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Gender</label>
              <p className="text-base text-slate-900">{employee.gender}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-sm text-slate-600">Birthdate</label>
              <p className="text-base text-slate-900">{employee.birthdate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marital Status Section */}
      <div className="pt-6 border-t border-slate-200">
        <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Marital status
        </h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-600">Status</label>
            <p className="text-base text-slate-900">{employee.maritalStatus}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Certificate</label>
            <p className="text-base text-slate-900">{employee.maritalCertificate}</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>

        {/* Phone */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone
          </h4>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Type</label>
              <p className="text-base text-slate-900">{employee.phoneType}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Phone</label>
              <p className="text-base text-blue-600 font-medium">{employee.phone}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Extension</label>
              <p className="text-base text-slate-900">{employee.phoneExtension}</p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-600">Work email</label>
              <p className="text-base text-blue-600 font-medium">{employee.workEmail}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Personal email</label>
              <p className="text-base text-blue-600 font-medium">{employee.personalEmail}</p>
            </div>
          </div>
        </div>

        {/* Chat & video call */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat & video call
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-600">Type</label>
              <p className="text-base text-slate-900">{employee.chatType}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Username</label>
              <p className="text-base text-slate-900">{employee.chatUsername}</p>
            </div>
          </div>
        </div>

        {/* Social media */}
        <div>
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Social media
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-600">Type</label>
              <p className="text-base text-slate-900">{employee.socialMediaType}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">URL</label>
              <p className="text-base text-slate-900">{employee.socialMediaUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobTab = () => (
    <div className="space-y-8">
      {/* Basic Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Job title</label>
              <p className="text-base text-slate-900">{employee.jobTitle}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Hire date</label>
              <p className="text-base text-slate-900">{employee.hireDate}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Start date</label>
              <p className="text-base text-slate-900">{employee.startDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Entity</label>
              <p className="text-base text-slate-900">{employee.entity}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Department</label>
              <p className="text-base text-slate-900">{employee.department}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Division</label>
              <p className="text-base text-slate-900">{employee.division}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Manager</label>
              <p className="text-base text-blue-600 font-medium">{employee.manager}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Direct reports</label>
              <p className="text-base text-slate-900">{employee.directReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Employment</h3>

        {/* Contract details */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Contract details
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Effective date</label>
                <p className="text-base text-slate-900">{employee.effectiveDate}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Employment type</label>
                <p className="text-base text-slate-900">{employee.employmentType}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Workplace</label>
                <p className="text-base text-slate-900">{employee.workplace}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">Expiry date</label>
                <p className="text-base text-slate-900">{employee.expiryDate}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Note</label>
                <p className="text-base text-slate-900">{employee.note}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work schedule */}
        <div>
          <label className="text-sm text-slate-600 block mb-1">Work schedule</label>
          <p className="text-base text-blue-600 font-medium">{employee.workSchedule}</p>
        </div>
      </div>
    </div>
  );

  const renderCompensationTab = () => (
    <div className="space-y-8">
      {/* Salary Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary</h3>

        {/* Salary details */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Salary details
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Effective date</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.salaryEffectiveDate : "********"}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Pay type</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.payType : "********"}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Pay rate</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.payRate : "********"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Pay schedule</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.paySchedule : "********"}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Overtime status</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.overtimeStatus : "********"}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Reason</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.reason : "********"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-sm text-slate-600">Note</label>
                <p className="text-base text-slate-900">{showSensitiveData ? employee.salaryNote : "********"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank account Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Bank account</h3>

        {/* Bank details */}
        <div>
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Bank details
          </h4>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-slate-600">Bank name</label>
              <p className="text-base text-slate-900">{showSensitiveData ? employee.bankName : "********"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">IBAN</label>
              <p className="text-base text-slate-900">{showSensitiveData ? employee.iban : "********"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Account number</label>
              <p className="text-base text-slate-900">{showSensitiveData ? employee.accountNumber : "********"}</p>
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

        {/* Education details */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            Education details
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Start date</label>
                <p className="text-base text-slate-900">{employee.educationStartDate}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">End date</label>
                <p className="text-base text-slate-900">{employee.educationEndDate}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Degree</label>
                <p className="text-base text-slate-900">{employee.degree}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-600">Field of study</label>
                <p className="text-base text-slate-900">{employee.fieldOfStudy}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">School</label>
                <p className="text-base text-slate-900">{employee.school}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work experience Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Work experience</h3>

        {/* Job details */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Job details
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Start date</label>
                <p className="text-base text-slate-900">{employee.workExpStartDate}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">End date</label>
                <p className="text-base text-slate-900">{employee.workExpEndDate}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Job title</label>
                <p className="text-base text-slate-900">{employee.workExpJobTitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Company</label>
                <p className="text-base text-slate-900">{employee.workExpCompany}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Summary</label>
                <p className="text-base text-slate-900">{employee.workExpSummary}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Present</label>
                <p className="text-base text-slate-900">{employee.workExpPresent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills</h3>
        <div>
          <label className="text-sm text-slate-600">Skill</label>
          <p className="text-base text-slate-900">{employee.skill}</p>
        </div>
      </div>

      {/* Languages Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Languages</h3>
        <div>
          <label className="text-sm text-slate-600">Language</label>
          <p className="text-base text-slate-900">{employee.language}</p>
        </div>
      </div>

      {/* Resume Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resume</h3>
        <div>
          <label className="text-sm text-slate-600">File</label>
          <p className="text-base text-slate-900">{employee.resumeFile}</p>
        </div>
      </div>
    </div>
  );

  const renderEmergencyTab = () => (
    <div className="space-y-8">
      {/* Contact Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>

        {/* Contact details */}
        <div className="mb-6">
          <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Contact details
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <p className="text-base text-slate-900">{employee.emergencyContactName}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Relationship</label>
                <p className="text-base text-slate-900">{employee.emergencyContactRelationship}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Phone</label>
                <p className="text-base text-slate-900">{employee.emergencyContactPhone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <p className="text-base text-slate-900">{employee.emergencyContactEmail}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Country</label>
                <p className="text-base text-slate-900">{employee.emergencyContactCountry}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Address</label>
                <p className="text-base text-slate-900">{employee.emergencyContactAddress}</p>
              </div>
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
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>

      {/* Employee Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl border border-slate-200/60 overflow-hidden mb-6">
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

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id === "information") setActiveSubTab("personal");
              }}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === t.id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
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
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-200">
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
              <div className="flex items-center gap-2 pb-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  Show sensitive data
                  <input
                    type="checkbox"
                    checked={showSensitiveData}
                    onChange={(e) => setShowSensitiveData(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="pb-8">
          {renderContent()}
        </div>

        {/* Updates Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Updates (0)</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
