# Canadian Payroll Tax Calculation API Documentation

## Overview

This document describes the complete implementation of Canadian payroll tax calculations based on CRA T4127 Payroll Deductions Formulas (2025 Edition).

## Table of Contents

1. [Features](#features)
2. [Services](#services)
3. [API Endpoints](#api-endpoints)
4. [Tax Calculation Details](#tax-calculation-details)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [PDOC Verification](#pdoc-verification)

---

## Features

### Implemented Calculations

- ✅ **CPP (Canada Pension Plan)** - 5.95% rate, $71,300 YMPE, basic exemption
- ✅ **CPP2 (Additional CPP)** - 4% rate on earnings between YMPE and YAMPE
- ✅ **EI (Employment Insurance)** - 1.64% federal, 1.27% Quebec
- ✅ **QPIP (Quebec Parental Insurance Plan)** - 0.494% for Quebec employees
- ✅ **Federal Income Tax** - Progressive brackets with TD1 support
- ✅ **Provincial Income Tax** - All 13 provinces/territories
- ✅ **YTD Accumulation** - Automatic tracking and maximum enforcement
- ✅ **Bonus Tax Calculation** - Cumulative method for non-periodic payments
- ✅ **Pre-tax Deductions** - RRSP, RPP, pension contributions
- ✅ **Taxable Benefits** - Group life insurance, etc.

### Worker Categories

- **Direct Employee** - Full CPP/EI eligibility, all benefits
- **Contract Worker** - CPP/EI eligible, limited benefits
- **Agent Worker** - CPP/EI exempt, no benefits, T4A reporting

---

## Services

### 1. Income Tax Service

**Location:** `src/services/income_tax_service.py`

Calculates federal and provincial income tax using CRA T4127 formulas.

#### Key Methods:

```python
# Calculate federal income tax
calculate_federal_tax(
    gross_income: float,
    pay_frequency: str,
    td1_total_claim: Optional[float] = None,
    claim_code: Optional[int] = None,
    additional_tax: float = 0.0,
    ytd_federal_tax: float = 0.0,
    ytd_gross_income: float = 0.0
) -> float

# Calculate provincial income tax
calculate_provincial_tax(
    gross_income: float,
    province: str,
    pay_frequency: str,
    td1_total_claim: Optional[float] = None,
    claim_code: Optional[int] = None,
    additional_tax: float = 0.0,
    ytd_provincial_tax: float = 0.0,
    ytd_gross_income: float = 0.0
) -> float

# Calculate tax on bonus/retroactive pay
calculate_tax_on_bonus(
    bonus_amount: float,
    cumulative_earnings_ytd: float,
    federal_td1_claim: float,
    provincial_td1_claim: float,
    province: str
) -> Tuple[float, float]

# Get complete tax breakdown
get_tax_breakdown(
    gross_income: float,
    province: str,
    pay_frequency: str,
    federal_td1_claim: Optional[float] = None,
    provincial_td1_claim: Optional[float] = None,
    federal_claim_code: Optional[int] = None,
    provincial_claim_code: Optional[int] = None,
    additional_federal_tax: float = 0.0,
    additional_provincial_tax: float = 0.0
) -> Dict[str, float]
```

### 2. Payroll Calculation Service

**Location:** `src/services/payroll_calculation_service.py`

Orchestrates complete payroll calculations including all statutory deductions.

#### Key Methods:

```python
# Calculate individual pay period
calculate_pay_period(
    employee: Dict[str, Any],
    earnings: List[Dict[str, Any]],
    deductions: List[Dict[str, Any]] = None,
    benefits: List[Dict[str, Any]] = None,
    ytd_totals: Optional[Dict[str, float]] = None,
    pay_frequency: str = "biweekly",
    is_bonus: bool = False
) -> Dict[str, Any]

# Calculate pay run for multiple employees
calculate_pay_run(
    employees: List[Dict[str, Any]],
    pay_period_start: datetime,
    pay_period_end: datetime,
    pay_date: datetime,
    pay_frequency: str = "biweekly"
) -> Dict[str, Any]

# Validate YTD maximums
validate_ytd_maximums(
    ytd_totals: Dict[str, float],
    province: str = "ON"
) -> Dict[str, bool]
```

### 3. Worker Category Service

**Location:** `src/services/worker_category_service.py`

Determines eligibility and calculates CPP/EI based on worker category.

#### Key Methods:

```python
# Eligibility checks
is_cpp_eligible(employee: Dict[str, Any]) -> bool
is_ei_eligible(employee: Dict[str, Any]) -> bool
is_qpip_eligible(employee: Dict[str, Any]) -> bool

# CPP calculations
calculate_pensionable_earnings(gross_earnings, pay_frequency, ytd_pensionable_earnings) -> float
calculate_cpp_contribution(pensionable_earnings, ytd_cpp_contributions) -> float
calculate_cpp2_pensionable_earnings(gross_earnings, ytd_gross_earnings) -> float
calculate_cpp2_contribution(cpp2_pensionable_earnings, ytd_cpp2_contributions) -> float

# EI calculations
calculate_insurable_earnings(gross_earnings, ytd_insurable_earnings) -> float
calculate_ei_premium(insurable_earnings, province, ytd_ei_premiums) -> float
```

### 4. PDOC Verification Service

**Location:** `src/services/pdoc_verification_service.py`

Tools for verifying calculations against CRA's PDOC calculator.

---

## API Endpoints

### Pay Run Endpoints

All endpoints are under `/api/v1/payruns`

#### 1. Create Pay Run

```http
POST /api/v1/payruns/
```

**Request Body:**
```json
{
  "pay_run_name": "January 15, 2025 - Biweekly",
  "pay_period_type": "regular",
  "period_start_date": "2025-01-01",
  "period_end_date": "2025-01-15",
  "pay_date": "2025-01-20",
  "employee_ids": ["emp1", "emp2"],
  "notes": "Regular pay run"
}
```

**Response:**
```json
{
  "id": "pay_run_id",
  "pay_run_number": "PR-2025-00001",
  "status": "draft",
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### 2. Calculate Pay Run

```http
POST /api/v1/payruns/{pay_run_id}/calculate
```

**Request Body:**
```json
{
  "recalculate": false
}
```

**Response:**
```json
{
  "id": "pay_run_id",
  "pay_run_number": "PR-2025-00001",
  "status": "calculated",
  "total_employees": 30,
  "total_gross_earnings": 75000.00,
  "total_net_pay": 55000.00,
  "total_cpp": 3500.00,
  "total_cpp2": 150.00,
  "total_ei": 1000.00,
  "total_federal_tax": 8500.00,
  "total_provincial_tax": 2850.00,
  "pay_periods": [
    {
      "employee_id": "emp_001",
      "employee_number": "EMP001",
      "employee_name": "John Doe",
      "gross_earnings": 2500.00,
      "statutory_deductions": {
        "cpp_contribution": 116.67,
        "cpp2_contribution": 5.00,
        "ei_premium": 41.00,
        "qpip_premium": 0.00,
        "federal_tax": 283.50,
        "provincial_tax": 95.00,
        "total": 541.17
      },
      "net_pay": 1958.83,
      "ytd_gross": 2500.00,
      "ytd_cpp": 116.67,
      "ytd_ei": 41.00,
      "ytd_federal_tax": 283.50,
      "ytd_provincial_tax": 95.00
    }
  ]
}
```

#### 3. Approve Pay Run

```http
POST /api/v1/payruns/{pay_run_id}/approve
```

**Request Body:**
```json
{
  "approved_by": "manager_id",
  "notes": "Approved for processing"
}
```

#### 4. Process Pay Run

```http
POST /api/v1/payruns/{pay_run_id}/process
```

Updates employee YTD totals and marks pay run as completed.

#### 5. Get Pay Runs

```http
GET /api/v1/payruns/?status=calculated&limit=50&skip=0
```

#### 6. Get Pay Run by ID

```http
GET /api/v1/payruns/{pay_run_id}
```

#### 7. Delete Pay Run

```http
DELETE /api/v1/payruns/{pay_run_id}
```

Only allowed for draft or calculated pay runs.

---

## Tax Calculation Details

### Federal Tax Calculation

Based on CRA T4127 formula:

1. **Annualize Income**: `annual_income = gross_per_period × periods_per_year`
2. **Apply Progressive Brackets**:
   - 15% on first $55,867
   - 20.5% on $55,867 to $111,733
   - 26% on $111,733 to $173,205
   - 29% on $173,205 to $246,752
   - 33% on income over $246,752
3. **Calculate Tax Credits**: `tax_credits = TD1_claim_amount × 0.15`
4. **Net Tax**: `annual_tax = bracket_tax - tax_credits`
5. **Per Period Tax**: `period_tax = annual_tax / periods_per_year`
6. **Add Additional**: `final_tax = period_tax + additional_tax_requested`

### Provincial Tax Calculation

Similar progressive calculation using provincial brackets and rates.

**Example - Ontario 2025:**
- 5.05% on first $51,446
- 9.15% on $51,446 to $102,894
- 11.16% on $102,894 to $150,000
- 12.16% on $150,000 to $220,000
- 13.16% on income over $220,000

### CPP Calculation

```
Pensionable Earnings = Gross - (Basic Exemption / Pay Periods)
CPP Contribution = Pensionable Earnings × 5.95%
Maximum: $4,034.10 annually
```

### CPP2 Calculation

```
CPP2 applies to earnings between $71,300 (YMPE) and $81,200 (YAMPE)
CPP2 Contribution = Earnings in Range × 4%
Maximum: $396.00 annually
```

### EI Calculation

```
EI Premium = Insurable Earnings × Rate
Federal Rate: 1.64%
Quebec Rate: 1.27%
Maximum Insurable: $65,700
Maximum Premium: $1,077.48 (federal), $834.39 (Quebec)
```

---

## Usage Examples

### Example 1: Calculate Single Pay Period

```python
from src.services.payroll_calculation_service import PayrollCalculationService

payroll_service = PayrollCalculationService(tax_year=2025)

employee = {
    "employee_number": "EMP001",
    "first_name": "John",
    "last_name": "Doe",
    "workerCategory": "direct_employee",
    "province": "ON",
    "dateOfBirth": "1990-01-01",
    "td1_federal": {"total_claim_amount": 15705.0},
    "td1_provincial": {"total_claim_amount": 11865.0}
}

earnings = [
    {
        "type": "regular",
        "hours": 80,
        "rate": 25.0,
        "amount": 2000.0,
        "taxable": True
    }
]

result = payroll_service.calculate_pay_period(
    employee=employee,
    earnings=earnings,
    pay_frequency="biweekly"
)

print(f"Gross: ${result['summary']['gross_earnings']:.2f}")
print(f"CPP: ${result['statutory_deductions']['cpp_contribution']:.2f}")
print(f"EI: ${result['statutory_deductions']['ei_premium']:.2f}")
print(f"Federal Tax: ${result['statutory_deductions']['federal_tax']:.2f}")
print(f"Provincial Tax: ${result['statutory_deductions']['provincial_tax']:.2f}")
print(f"Net Pay: ${result['summary']['net_pay']:.2f}")
```

### Example 2: Calculate Bonus Tax

```python
from src.services.income_tax_service import IncomeTaxService

tax_service = IncomeTaxService(tax_year=2025)

federal_tax, provincial_tax = tax_service.calculate_tax_on_bonus(
    bonus_amount=5000.0,
    cumulative_earnings_ytd=25000.0,
    federal_td1_claim=15705.0,
    provincial_td1_claim=11865.0,
    province="ON"
)

print(f"Federal Tax on Bonus: ${federal_tax:.2f}")
print(f"Provincial Tax on Bonus: ${provincial_tax:.2f}")
print(f"Net Bonus: ${5000.0 - federal_tax - provincial_tax:.2f}")
```

### Example 3: Verify YTD Maximums

```python
from src.services.payroll_calculation_service import PayrollCalculationService

payroll_service = PayrollCalculationService(tax_year=2025)

ytd_totals = {
    "cpp_contributions": 4034.10,
    "ei_premiums": 1077.48
}

validation = payroll_service.validate_ytd_maximums(
    ytd_totals=ytd_totals,
    province="ON"
)

if validation["cpp_maxed_out"]:
    print("CPP contributions have reached the annual maximum")

if validation["ei_maxed_out"]:
    print("EI premiums have reached the annual maximum")
```

---

## Testing

### Run All Tests

```bash
cd 3-click-pr-be
pytest tests/ -v
```

### Run Specific Test Suites

```bash
# Income tax tests only
pytest tests/test_income_tax_service.py -v

# Payroll calculation tests only
pytest tests/test_payroll_calculation_service.py -v
```

### Test Coverage

```bash
pytest tests/ --cov=src/services --cov-report=html
```

---

## PDOC Verification

### Generate Verification Report

```python
from src.services.pdoc_verification_service import PDOCVerificationService
from datetime import date

pdoc_service = PDOCVerificationService()

report = pdoc_service.generate_pdoc_verification_report(
    employee=employee_data,
    gross_income=2000.0,
    pay_frequency="biweekly",
    calculated_deductions=statutory_deductions,
    pay_date=date(2025, 1, 20)
)

print(f"PDOC URL: {report['pdoc_url']}")
print(f"Instructions: {report['instructions']}")
print(f"Inputs: {report['pdoc_inputs']}")
print(f"Calculated: {report['calculated_results']}")
```

### Compare with PDOC Results

```python
# After manually entering values in PDOC and getting results
pdoc_results = {
    "cpp_contribution": 95.00,
    "cpp2_contribution": 4.00,
    "ei_premium": 32.80,
    "federal_tax": 196.50,
    "provincial_tax": 65.25
}

comparison = pdoc_service.compare_with_pdoc(
    calculated_deductions=calculated_deductions,
    pdoc_results=pdoc_results,
    tolerance=0.01
)

if comparison["status"] == "PASS":
    print("✓ All calculations match PDOC")
else:
    print(f"⚠ Discrepancies found: {comparison['discrepancies']}")
```

---

## 2025 Tax Rates Summary

### Federal
- Basic Personal Amount: $15,705
- CPP Rate: 5.95% (max $4,034.10)
- CPP2 Rate: 4% (max $396)
- EI Rate: 1.64% (max $1,077.48)

### Provincial Basic Personal Amounts
- Alberta: $21,885
- British Columbia: $12,580
- Manitoba: $10,855
- New Brunswick: $13,044
- Newfoundland and Labrador: $10,382
- Nova Scotia: $8,744
- Northwest Territories: $16,593
- Nunavut: $17,925
- Ontario: $11,865
- Prince Edward Island: $13,500
- Quebec: $18,056
- Saskatchewan: $18,491
- Yukon: $15,705

### Quebec Specific
- EI Rate: 1.27%
- QPIP Rate: 0.494% (max insurable $94,000)

---

## Notes

1. **Rounding**: All monetary values are rounded to 2 decimal places
2. **Pay Frequencies**: Supported frequencies are weekly (52), biweekly (26), semi-monthly (24), and monthly (12)
3. **Worker Categories**: Agent workers are exempt from CPP/EI
4. **Quebec**: Has special rates for EI and requires QPIP
5. **YTD Tracking**: Automatically enforces statutory maximums
6. **Bonus Method**: Uses cumulative method as per CRA T4127

---

## Support

For questions or issues:
- Review CRA T4127 documentation
- Check PDOC calculator at https://apps.cra-arc.gc.ca/ebci/rhpd/start
- Run test suite to verify calculations

## Version

Current Version: 1.0.0
Tax Year: 2025
Compliance: CRA T4127 (2025 Edition)
Last Updated: January 2025
