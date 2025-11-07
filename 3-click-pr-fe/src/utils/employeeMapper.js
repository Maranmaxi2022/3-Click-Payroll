/**
 * Map frontend employee wizard form data to backend EmployeeCreate schema
 */

// Map province codes to backend enum values
const PROVINCE_MAP = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

// Map gender values
const GENDER_MAP = {
  "Female": "female",
  "Male": "male",
  "Non-binary": "other",
  "Prefer not to say": "prefer_not_to_say",
};

// Map pay frequency
const PAY_FREQUENCY_MAP = {
  "weekly": "weekly",
  "biweekly": "biweekly",
  "semimonthly": "semi_monthly",
  "monthly": "monthly",
};

/**
 * Transform wizard data to EmployeeCreate payload
 * @param {Object} wizardData - Complete wizard form data from onFinish
 * @returns {Object} Backend-compatible employee creation payload
 */
export function mapWizardDataToEmployeeCreate(wizardData) {
  const { form, compensation, personal, paymentMethod, bank } = wizardData;

  // Build the base payload with required fields
  const payload = {
    // Required fields
    first_name: form.firstName?.trim() || "",
    last_name: form.lastName?.trim() || "",
    email: form.workEmail?.trim() || "",
    employee_number: form.employeeId?.trim() || "",

    // Optional basic fields
    phone: form.mobile?.trim() || null,

    // Worker and employment details
    worker_category: "direct_employee", // Default, could be made configurable
    employment_type: "full_time", // Default, could be made configurable

    // Province mapping
    province_of_employment: form.provinceEmployment
      ? PROVINCE_MAP[form.provinceEmployment] || "Ontario"
      : "Ontario",

    // Job details
    job_title: form.designation?.trim() || null,
    department_name: form.department?.trim() || null,

    // Dates
    hire_date: form.doj || null,

    // Compensation
    annual_salary: compensation?.annualGross ? parseFloat(compensation.annualGross) : null,
    pay_frequency: compensation?.payFrequency
      ? PAY_FREQUENCY_MAP[compensation.payFrequency] || "biweekly"
      : "biweekly",
  };

  return payload;
}

/**
 * Transform wizard data to comprehensive EmployeeUpdate payload
 * This includes all the details from personal info, payment, etc.
 * @param {Object} wizardData - Complete wizard form data
 * @returns {Object} Backend-compatible employee update payload
 */
export function mapWizardDataToEmployeeUpdate(wizardData) {
  const { form, compensation, personal, paymentMethod, bank } = wizardData;

  const updatePayload = {
    // Personal information
    date_of_birth: personal?.dob || null,
    gender: personal?.gender ? GENDER_MAP[form.gender] : null,
    sin: personal?.sinHash || null, // Store the hashed version
    language_preference: personal?.langPref || "English",

    // Residential address
    residential_address: personal?.addr1 ? {
      street: `${personal.addr1}${personal.addr2 ? ', ' + personal.addr2 : ''}`,
      city: personal.city || null,
      province: personal.province ? PROVINCE_MAP[personal.province] : null,
      postal_code: personal.postal || null,
      country: personal.country || "Canada",
    } : null,

    // Statutory components
    statutory: {
      cpp_eligible: form.cppEnabled ?? true,
      ei_eligible: form.eiEnabled ?? true,
      qpip_eligible: form.qpipEnabled ?? false,
      income_tax_exempt: false,
    },

    // TD1 information (federal)
    td1_federal: compensation?.td1?.federal ? {
      total_claim_amount: compensation.td1.federal.mode === "total"
        ? parseFloat(compensation.td1.federal.total) || null
        : null,
      additional_tax_requested: parseFloat(compensation.td1.additionalTaxPerPay) || null,
    } : null,

    // TD1 provincial
    td1_provincial: compensation?.td1?.provincial ? {
      total_claim_amount: compensation.td1.provincial.mode === "total"
        ? parseFloat(compensation.td1.provincial.total) || null
        : null,
    } : null,

    // YTD carry-in values
    ytd_carry_in: compensation?.ytd ? {
      gross_earnings: 0, // Not captured in wizard yet
      cpp_contributions: parseFloat(compensation.ytd.cpp) || 0,
      cpp2_contributions: parseFloat(compensation.ytd.cpp2) || 0,
      ei_premiums: parseFloat(compensation.ytd.ei) || 0,
      federal_tax: parseFloat(compensation.ytd.tax) || 0,
      provincial_tax: 0, // Not separately captured
    } : null,

    // Payment method and bank account
    payment_method: paymentMethod || null,
    bank_account: paymentMethod === "bank" && bank ? {
      institution_number: null, // Not captured in current form
      transit_number: bank.ifsc?.trim() || null, // Using IFSC as placeholder
      account_number: bank.acc?.trim() || null,
      account_type: bank.type === "savings" ? "savings" : "checking",
    } : null,
  };

  return updatePayload;
}

/**
 * Two-step approach: Create minimal employee first, then update with full details
 * @param {Object} wizardData - Complete wizard form data
 * @returns {Object} { createPayload, updatePayload }
 */
export function mapWizardDataToTwoStepPayload(wizardData) {
  return {
    createPayload: mapWizardDataToEmployeeCreate(wizardData),
    updatePayload: mapWizardDataToEmployeeUpdate(wizardData),
  };
}
