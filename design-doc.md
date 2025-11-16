# Real Estate Investment Calculator - Design Document

## Overview

A multi-unit property investment calculator that allows users to model different rental strategies (STR/MTR/LTR) with configurable expenses and compare returns against alternative investments.

**Key Features:**
- Multi-project management (create, save, load multiple investment opportunities)
- Light/Dark/System theme support
- Mobile-first responsive design
- Local browser storage (no server required)

-----

## User Flow

1. **Project Selection** - Choose existing project or create new investment opportunity
1. **Property Setup** - Enter basic property and financing details
1. **Unit Configuration** - Add units and define rental strategy for each
1. **Expense Configuration** - Customize operating expenses with flexible calculation types
1. **Review & Compare** - View cash flow projections and compare to alternative investments

-----

## Component 0: Project Management

### Home Page

**Project List:**
- Grid view of all saved investment opportunities
- Each project card shows:
  - Project name and description
  - Created and last updated dates
  - Open and Delete actions
- Sort by most recently updated

**Project Operations:**
- **Create New Project** - Form with name (required) and description (optional)
- **Open Project** - Navigate to calculator view for selected project
- **Delete Project** - Remove project with confirmation (cannot be undone)
- **Theme Toggle** - Switch between Light/Dark/System theme

### Data Persistence

- All projects saved to browser localStorage
- Each project stored with unique ID
- Automatic save on any state change
- Current project ID tracked for session continuity

-----

## Component 1: Property Details

### Basic Information

- **Purchase Price** (number input, required)
- **Down Payment** (%, default: 20%)
- **Interest Rate** (%, default: 7.0%)
- **Loan Term** (years, default: 30)
- **Property Address** (optional, for reference)

### Initial Costs

- **Closing Costs** (%, default: 3.5% of purchase price)
- **Initial Renovations** ($ amount)
- **Furnishing Budget** ($ amount)
- **Other Upfront Costs** ($ amount, editable label)

### Property-Level Expenses

- **Property Tax Rate** (% of property value, default: 1.0%)
- **Base Insurance** ($ monthly, default: $250)
- **HOA/Condo Fees** ($ monthly, default: $0)

-----

## Component 2: Unit Configuration

### Unit Management

- **Add Unit** button - Creates new unit configuration
- **Remove Unit** button - Deletes unit
- **Unit Label** - User-defined name (e.g., “Unit 4046”, “Main Floor STR”)

### Unit Type Selection (Radio Buttons)

Each selection loads different pre-configured expense templates

#### STR (Short-Term Rental)

**Revenue Inputs:**

- Nightly Rate ($)
- Occupancy Rate (%, default: 80%)
- Average Stay Length (nights, default: 2.5)

**Auto-calculated:**

- Monthly turnovers = (30 × occupancy) / avg stay length
- Gross monthly revenue = nightly rate × 30 × occupancy

#### MTR (Medium-Term Rental)

**Revenue Inputs:**

- Daily Rate ($) OR Monthly Rate ($) - toggle between
- Occupancy Rate (%, default: 50%)
- Average Booking Length (days, default: 15)

#### LTR (Long-Term Rental)

**Revenue Inputs:**

- Monthly Rent ($)
- Annual Vacancy Rate (%, default: 5%)

-----

## Component 3: Configurable Expense System

### Expense Template Structure

Each unit type has default expenses, but all are editable/removable, and users can add custom expenses.

### Expense Configuration Fields

For each expense line item:

1. **Expense Name** (text input)
- e.g., “Cleaning”, “Utilities”, “Platform Fees”
1. **Calculation Type** (dropdown)
- **Fixed Monthly** - Flat amount per month
- **Percentage of Revenue** - % of gross revenue
- **Per Occurrence** - Cost × frequency
- **Percentage of Property Value** - % of total property value
- **Annual Fixed** - Yearly amount (auto-converts to monthly)
- **Custom Formula** - Advanced users can write expressions
1. **Value** (number input)
- The base amount or percentage
1. **Frequency** (conditional, appears for “Per Occurrence” type)
- Daily / Weekly / Monthly / Per Booking
- Number of occurrences
1. **Notes** (optional text)
- User can add context/assumptions
1. **Toggle: DIY vs Outsourced** (optional checkbox)
- If checked, shows alternative cost and hours/month estimate
- Helps calculate sweat equity value

### Expense Template Management

Users can customize the default expense templates for each unit type. These templates auto-populate when creating a new unit, but can be modified per-unit afterward.

**Template Settings Interface:**

- Accessible via Settings/Configuration menu
- Three tabs: STR Templates | MTR Templates | LTR Templates
- Each tab shows the expense list with full edit capabilities
- “Reset to System Defaults” button to restore original templates
- “Save Custom Template” to create named presets (e.g., “Beach Market STR”, “Self-Managed LTR”)

### System Default Templates

These are the initial templates that ship with the tool. Users can modify these or reset to them.

#### STR Default Expenses

|Expense |Calculation Type|Default Value|Frequency |
|--------------------------|----------------|-------------|-----------|
|Platform Fees (Airbnb) |% of Revenue |3% |- |
|Cleaning |Per Occurrence |$70 |Per Booking|
|Utilities - Electric |Fixed Monthly |$90 |- |
|Utilities - Water |Fixed Monthly |$45 |- |
|Utilities - Gas |Fixed Monthly |$25 |- |
|Supplies (toiletries, etc)|Fixed Monthly |$100 |- |
|Laundry Service |Per Occurrence |$15 |Per Booking|
|Maintenance Reserve |% of Revenue |5% |- |
|STR Insurance Add-on |Fixed Monthly |$50 |- |
|Internet/Cable |Fixed Monthly |$100 |- |
|Smart Lock Maintenance |Fixed Monthly |$10 |- |
|Pricing Software |Fixed Monthly |$20 |- |

#### MTR Default Expenses

|Expense |Calculation Type|Default Value |
|-------------------------|----------------|----------------|
|Utilities (if owner-paid)|Fixed Monthly |$150 |
|Maintenance Reserve |% of Revenue |8% |
|Cleaning (turnover) |Per Occurrence |$150 (quarterly)|

#### LTR Default Expenses

|Expense |Calculation Type|Default Value |
|-------------------|----------------|-----------------------|
|Maintenance Reserve|% of Revenue |10% |
|Property Management|% of Revenue |10% (0 if self-managed)|
|Leasing Fee |Per Occurrence |$500 (annual) |

### Custom Template Features

**Template Operations:**

- **Edit Template** - Modify expenses in the template (add/remove/change values)
- **Duplicate Template** - Clone existing template as starting point
- **Create New Template** - Build from scratch
- **Delete Template** - Remove custom templates (can’t delete system defaults)
- **Import/Export** - Share templates as JSON files

**Template Selection:**
When adding a new unit, users can choose:

- Default STR/MTR/LTR template (their customized version)
- System default template
- Any saved custom template
- Start blank (no pre-filled expenses)

-----

## Component 4: Calculations & Outputs

### Monthly Summary (Per Unit)

- Gross Revenue
- Total Operating Expenses (itemized)
- Net Operating Income (NOI)

### Property-Level Summary

- Total Monthly Revenue (all units)
- Total Monthly Expenses (all units + property-level)
- Mortgage Payment (P&I)
- **Monthly Cash Flow**
- **Annual Cash Flow**

### Return Metrics

- **Total Investment**
- Down payment + closing + renovations + furnishing
- **Cash-on-Cash Return**
- Annual cash flow / Total investment
- **Total Return (Year 1)**
- (Cash flow + Principal paydown) / Total investment
- **Principal Paydown** (Year 1)
- Calculated from amortization schedule

### Comparison Dashboard

Side-by-side comparison with same capital:

|Metric |This Property |HYSA |Index Funds |
|-------------------|----------------|---------------|---------------|
|Initial Investment |[calculated] |[same] |[same] |
|Annual Cash Return |[calculated] |3% × investment|2% × investment|
|Annual Total Return|[cash + equity] |3% |10% |
|Year 5 Wealth |[projected] |[calculated] |[calculated] |
|Liquidity |Low |High |High |
|Work Required |[hours estimate]|None |None |

### Advanced Outputs (Optional Toggles)

- **Appreciation Scenarios** - Add 0%, 2%, 3%, 5% appreciation projections
- **5/10/15 Year Projections** - Compound growth with assumptions
- **Scaling Scenario** - Model using cash flow to buy additional properties
- **Sensitivity Analysis** - Show impact of ±10% occupancy, ±$10 nightly rate

-----

## Technical Considerations

### Data Structure

```javascript
property: {
purchasePrice: number,
downPaymentPercent: number,
interestRate: number,
loanTerm: number,
closingCostsPercent: number,
renovationBudget: number,
furnishingBudget: number,
propertyTaxRate: number,
baseInsurance: number
}

units: [
{
id: string,
label: string,
type: 'STR' | 'MTR' | 'LTR',
revenue: {
nightlyRate?: number,
monthlyRate?: number,
occupancyPercent: number,
avgStayLength?: number
},
expenses: [
{
id: string,
name: string,
calculationType: 'fixed-monthly' | 'percent-revenue' | 'per-occurrence' | 'percent-property' | 'annual-fixed',
value: number,
frequency?: { type: string, count: number },
isDIY?: boolean,
diyHours?: number,
notes?: string
}
]
}
]

comparisons: {
hysaRate: number,
indexFundRate: number,
indexDividendRate: number
}
```

### Calculations Engine

- Mortgage calculator (P&I, amortization schedule)
- Revenue aggregator across units
- Expense calculator with type-specific logic
- NOI calculator
- Return metrics calculator
- Comparison calculator

### State Management

- Property-level state
- Unit array state
- Expense configuration state
- Calculated results (derived state)

-----

## UI/UX Features

### Theme System

**Theme Options:**
- **Light Mode** - Traditional light background with dark text
- **Dark Mode** - Dark background with light text, reduced eye strain
- **System** - Automatically follows OS/browser theme preference

**Implementation:**
- Theme toggle dropdown in header (both home and calculator views)
- Preference saved to localStorage
- System preference detection with automatic updates
- Comprehensive dark mode styling across all components
- Smooth transitions between themes

### Responsive Design

**Mobile-First Approach:**
- Optimized for phone screens (320px+)
- Touch-friendly tap targets
- Responsive typography (text scales appropriately)
- Grid layouts adapt from 1 column (mobile) to 2 columns (tablet+)
- Sticky tab navigation for easy access
- Horizontal scroll for tabs on narrow screens

**Component Responsiveness:**
- Cards and inputs scale appropriately
- Theme toggle shows icon only on mobile, icon + label on desktop
- Header elements stack/flex based on screen size
- Form elements use full width on mobile

### Accessibility

- Focus indicators on all interactive elements
- ARIA labels on buttons
- Semantic HTML structure
- Keyboard navigation support
- High contrast ratios in both light and dark modes