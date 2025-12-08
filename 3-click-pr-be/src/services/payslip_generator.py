"""
Payslip PDF Generation Service

Generates professional payslips in PDF format using ReportLab.
Based on the elegant template design from the frontend.
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
from typing import Dict, Optional
import io
import os


def number_to_words(num: float) -> str:
    """
    Convert a number to words (Canadian English)

    Args:
        num: Number to convert

    Returns:
        String representation of the number in words
    """
    # Handle negative numbers
    if num < 0:
        return "Minus " + number_to_words(abs(num))

    # Handle zero
    if num == 0:
        return "Zero Dollars"

    # Split into dollars and cents
    dollars = int(num)
    cents = int(round((num - dollars) * 100))

    # Number names
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
             "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    thousands = ["", "Thousand", "Million", "Billion"]

    def convert_group(n):
        """Convert a 3-digit group to words"""
        result = ""

        # Hundreds place
        hundreds = n // 100
        if hundreds > 0:
            result += ones[hundreds] + " Hundred "

        # Tens and ones
        remainder = n % 100
        if remainder >= 10 and remainder < 20:
            result += teens[remainder - 10]
        else:
            tens_digit = remainder // 10
            ones_digit = remainder % 10
            if tens_digit > 0:
                result += tens[tens_digit] + " "
            if ones_digit > 0:
                result += ones[ones_digit]

        return result.strip()

    # Convert dollars
    result = ""
    group_index = 0

    while dollars > 0:
        group = dollars % 1000
        if group > 0:
            group_words = convert_group(group)
            if thousands[group_index]:
                group_words += " " + thousands[group_index]
            result = group_words + " " + result
        dollars //= 1000
        group_index += 1

    result = result.strip() + " Dollars"

    # Add cents if present
    if cents > 0:
        result += " and " + convert_group(cents) + " Cents"
    else:
        result += " Only"

    return result


class PayslipGenerator:
    """Generate PDF payslips from pay run data"""

    def __init__(self, organization_data: Dict):
        """
        Initialize payslip generator

        Args:
            organization_data: Company information including name, address, logo, etc.
        """
        self.organization = organization_data
        self.styles = getSampleStyleSheet()

        # Custom styles
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=20,
            alignment=TA_CENTER
        )

        self.section_header_style = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=8,
            fontName='Helvetica-Bold'
        )

        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#374151')
        )

    def generate_payslip(
        self,
        pay_period: Dict,
        pay_run: Dict,
        employee_details: Dict,
        output_path: Optional[str] = None
    ) -> bytes:
        """
        Generate a payslip PDF for a single employee

        Args:
            pay_period: Pay period data from PayRun.pay_periods
            pay_run: Pay run information (dates, pay run number, etc.)
            employee_details: Full employee information (from Employee document)
            output_path: Optional file path to save PDF. If None, returns bytes.

        Returns:
            PDF content as bytes
        """
        # Create PDF buffer
        buffer = io.BytesIO()

        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )

        # Build content
        story = []

        # Header with logo and company info
        story.extend(self._build_header())
        story.append(Spacer(1, 0.2*inch))

        # Employee summary box
        story.extend(self._build_employee_summary(
            pay_period, pay_run, employee_details
        ))
        story.append(Spacer(1, 0.15*inch))

        # Net pay highlight box
        story.append(self._build_net_pay_box(pay_period))
        story.append(Spacer(1, 0.15*inch))

        # Earnings table
        story.append(Paragraph("Earnings", self.section_header_style))
        story.append(self._build_earnings_table(pay_period))
        story.append(Spacer(1, 0.15*inch))

        # Deductions table
        story.append(Paragraph("Deductions", self.section_header_style))
        story.append(self._build_deductions_table(pay_period))
        story.append(Spacer(1, 0.15*inch))

        # Benefits table (if any)
        if pay_period.get("benefits") and len(pay_period["benefits"]) > 0:
            story.append(Paragraph("Benefits", self.section_header_style))
            story.append(self._build_benefits_table(pay_period))
            story.append(Spacer(1, 0.15*inch))

        # Net pay in words
        story.append(self._build_net_pay_words(pay_period))
        story.append(Spacer(1, 0.1*inch))

        # Footer
        story.extend(self._build_footer())

        # Build PDF
        doc.build(story)

        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()

        # Save to file if path provided
        if output_path:
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)

        return pdf_bytes

    def _build_header(self):
        """Build header with company logo and name"""
        elements = []

        # Company name
        company_name = self.organization.get('company_name', 'Company Name')
        elements.append(Paragraph(company_name, self.title_style))

        # Company address
        address_parts = []
        if self.organization.get('street'):
            address_parts.append(self.organization['street'])
        city_province = []
        if self.organization.get('city'):
            city_province.append(self.organization['city'])
        if self.organization.get('province'):
            city_province.append(self.organization['province'])
        if city_province:
            address_parts.append(", ".join(city_province))
        if self.organization.get('postal_code'):
            address_parts.append(self.organization['postal_code'])

        if address_parts:
            address_text = " | ".join(address_parts)
            elements.append(Paragraph(address_text, self.subtitle_style))

        return elements

    def _build_employee_summary(self, pay_period, pay_run, employee):
        """Build employee information summary box"""
        elements = []

        # Title
        elements.append(Paragraph("Pay Statement", self.section_header_style))

        # Employee details table
        employee_name = pay_period.get('employee_name', 'N/A')
        employee_number = pay_period.get('employee_number', 'N/A')
        department = employee.get('department_name', 'N/A')
        designation = employee.get('designation_name', employee.get('job_title', 'N/A'))

        # Pay period details
        period_start = pay_run.get('period_start_date')
        period_end = pay_run.get('period_end_date')
        pay_date = pay_run.get('pay_date')
        pay_run_number = pay_run.get('pay_run_number', 'N/A')

        # Format dates
        if isinstance(period_start, str):
            period_start = datetime.fromisoformat(period_start.replace('Z', '+00:00')).date()
        if isinstance(period_end, str):
            period_end = datetime.fromisoformat(period_end.replace('Z', '+00:00')).date()
        if isinstance(pay_date, str):
            pay_date = datetime.fromisoformat(pay_date.replace('Z', '+00:00')).date()

        data = [
            ['Employee:', employee_name, 'Pay Period:', f"{period_start} to {period_end}"],
            ['Employee ID:', employee_number, 'Pay Date:', str(pay_date)],
            ['Department:', department, 'Pay Run:', pay_run_number],
            ['Position:', designation, '', ''],
        ]

        table = Table(data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
        table.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), 'Helvetica', 9),
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 9),
            ('FONT', (2, 0), (2, -1), 'Helvetica-Bold', 9),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ]))

        elements.append(table)
        return elements

    def _build_net_pay_box(self, pay_period):
        """Build highlighted net pay box"""
        net_pay = pay_period.get('net_pay', 0.0)

        # Calculate total hours if available
        total_hours = 0.0
        for earning in pay_period.get('earnings', []):
            if earning.get('hours'):
                total_hours += earning['hours']

        data = [
            [Paragraph('<b>Net Pay</b>', self.normal_style),
             Paragraph(f'<b>${net_pay:,.2f}</b>',
                      ParagraphStyle('NetPayAmount', fontSize=16, textColor=colors.HexColor('#059669'), alignment=TA_RIGHT))]
        ]

        if total_hours > 0:
            data.append([
                Paragraph('Total Hours Worked:', self.normal_style),
                Paragraph(f'{total_hours:.2f}', ParagraphStyle('Hours', fontSize=10, alignment=TA_RIGHT))
            ])

        table = Table(data, colWidths=[4*inch, 3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#d1fae5')),
            ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#059669')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ]))

        return table

    def _build_earnings_table(self, pay_period):
        """Build earnings breakdown table"""
        earnings = pay_period.get('earnings', [])

        # Table header
        data = [['Description', 'Hours', 'Rate', 'Amount']]

        # Add each earning
        for earning in earnings:
            earning_type = earning.get('type', 'N/A').replace('_', ' ').title()
            hours = f"{earning.get('hours', 0):.2f}" if earning.get('hours') else '-'
            rate = f"${earning.get('rate', 0):,.2f}" if earning.get('rate') else '-'
            amount = f"${earning.get('amount', 0):,.2f}"

            data.append([earning_type, hours, rate, amount])

        # Total row
        gross_earnings = pay_period.get('gross_earnings', 0.0)
        data.append(['', '', 'Gross Earnings:', f"${gross_earnings:,.2f}"])

        table = Table(data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        table.setStyle(TableStyle([
            # Header style
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
            ('ALIGN', (1, 0), (-1, 0), 'RIGHT'),

            # Body style
            ('FONT', (0, 1), (-1, -2), 'Helvetica', 9),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#374151')),

            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9fafb')]),

            # Total row style
            ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold', 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#dbeafe')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#1e40af')),

            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#3b82f6')),

            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))

        return table

    def _build_deductions_table(self, pay_period):
        """Build deductions breakdown table"""
        statutory = pay_period.get('statutory_deductions', {})
        deductions = pay_period.get('deductions', [])

        # Table header
        data = [['Description', 'Current', 'YTD']]

        # Statutory deductions
        cpp = statutory.get('cpp_contribution', 0.0)
        cpp2 = statutory.get('cpp2_contribution', 0.0)
        ei = statutory.get('ei_premium', 0.0)
        qpip = statutory.get('qpip_premium', 0.0)
        federal_tax = statutory.get('federal_tax', 0.0)
        provincial_tax = statutory.get('provincial_tax', 0.0)

        ytd_cpp = pay_period.get('ytd_cpp', 0.0)
        ytd_cpp2 = pay_period.get('ytd_cpp2', 0.0)
        ytd_ei = pay_period.get('ytd_ei', 0.0)
        ytd_federal = pay_period.get('ytd_federal_tax', 0.0)
        ytd_provincial = pay_period.get('ytd_provincial_tax', 0.0)

        if cpp > 0:
            data.append(['CPP', f"${cpp:,.2f}", f"${ytd_cpp:,.2f}"])
        if cpp2 > 0:
            data.append(['CPP2 (Enhanced)', f"${cpp2:,.2f}", f"${ytd_cpp2:,.2f}"])
        if ei > 0:
            data.append(['EI Premium', f"${ei:,.2f}", f"${ytd_ei:,.2f}"])
        if qpip > 0:
            data.append(['QPIP', f"${qpip:,.2f}", '-'])
        if federal_tax > 0:
            data.append(['Federal Income Tax', f"${federal_tax:,.2f}", f"${ytd_federal:,.2f}"])
        if provincial_tax > 0:
            province = pay_period.get('province_of_employment', 'Provincial')
            data.append([f'{province} Income Tax', f"${provincial_tax:,.2f}", f"${ytd_provincial:,.2f}"])

        # Other deductions
        for deduction in deductions:
            deduction_type = deduction.get('type', 'N/A').replace('_', ' ').title()
            amount = f"${deduction.get('amount', 0):,.2f}"
            data.append([deduction_type, amount, '-'])

        # Total row
        total_deductions = pay_period.get('total_deductions', 0.0)
        statutory_total = statutory.get('total', 0.0)
        other_deductions_total = sum(d.get('amount', 0) for d in deductions)
        total = statutory_total + other_deductions_total

        data.append(['Total Deductions:', f"${total:,.2f}", ''])

        table = Table(data, colWidths=[4*inch, 1.5*inch, 1.5*inch])
        table.setStyle(TableStyle([
            # Header style
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ef4444')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
            ('ALIGN', (1, 0), (-1, 0), 'RIGHT'),

            # Body style
            ('FONT', (0, 1), (-1, -2), 'Helvetica', 9),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#374151')),

            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9fafb')]),

            # Total row style
            ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold', 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fee2e2')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#b91c1c')),

            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#ef4444')),

            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))

        return table

    def _build_benefits_table(self, pay_period):
        """Build benefits breakdown table"""
        benefits = pay_period.get('benefits', [])

        if not benefits:
            return Spacer(1, 0)

        # Table header
        data = [['Benefit', 'Employee', 'Employer', 'Total']]

        # Add each benefit
        total_employee = 0.0
        total_employer = 0.0

        for benefit in benefits:
            benefit_type = benefit.get('type', 'N/A').replace('_', ' ').title()
            employee_contribution = benefit.get('employee_contribution', 0.0)
            employer_contribution = benefit.get('employer_contribution', 0.0)
            total = employee_contribution + employer_contribution

            data.append([
                benefit_type,
                f"${employee_contribution:,.2f}",
                f"${employer_contribution:,.2f}",
                f"${total:,.2f}"
            ])

            total_employee += employee_contribution
            total_employer += employer_contribution

        # Total row
        data.append([
            'Total Benefits:',
            f"${total_employee:,.2f}",
            f"${total_employer:,.2f}",
            f"${total_employee + total_employer:,.2f}"
        ])

        table = Table(data, colWidths=[3*inch, 1.5*inch, 1.5*inch, 1*inch])
        table.setStyle(TableStyle([
            # Header style
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold', 10),
            ('ALIGN', (1, 0), (-1, 0), 'RIGHT'),

            # Body style
            ('FONT', (0, 1), (-1, -2), 'Helvetica', 9),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#374151')),

            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9fafb')]),

            # Total row style
            ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold', 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#d1fae5')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#047857')),

            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#10b981')),

            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))

        return table

    def _build_net_pay_words(self, pay_period):
        """Build net pay in words"""
        net_pay = pay_period.get('net_pay', 0.0)
        words = number_to_words(net_pay)

        text = f"<b>Net Pay in Words:</b> {words}"
        para = Paragraph(text, self.normal_style)

        # Add box around it
        data = [[para]]
        table = Table(data, colWidths=[7*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f3f4f6')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))

        return table

    def _build_footer(self):
        """Build footer with disclaimer"""
        elements = []

        footer_text = (
            "<i>This is a computer-generated payslip and does not require a signature. "
            "Please retain this payslip for your records. For questions or concerns, "
            "please contact your payroll department.</i>"
        )

        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#9ca3af'),
            alignment=TA_CENTER
        )

        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph(footer_text, footer_style))

        return elements
