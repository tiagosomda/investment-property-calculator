# Investment Property Calculator - Development Plan

## Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (mobile-first responsive design)
- **State Management**: React Context API + useReducer
- **Build Tool**: Vite
- **Deployment**: GitHub Pages via GitHub Actions
- **Testing**: Vitest + React Testing Library (optional, for later phases)

## Project Structure
```
investment-property-calculator/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   └── deploy.sh (if needed)
├── public/
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Phase 0: Project Setup (Foundation) ✅ COMPLETED

### Step 0.1: Initialize React + TypeScript + Vite ✅
- [x] Create Vite project with React + TypeScript template
- [x] Install dependencies: `npm create vite@latest . -- --template react-ts`
- [x] Verify dev server runs: `npm run dev`

### Step 0.2: Configure Tailwind CSS ✅
- [x] Install Tailwind CSS and dependencies
- [x] Create `tailwind.config.js` with mobile-first breakpoints
- [x] Create `postcss.config.js`
- [x] Add Tailwind directives to main CSS file
- [x] Test with a simple styled component

### Step 0.3: Setup GitHub Pages Configuration ✅
- [x] Configure `vite.config.ts` with correct base path for GitHub Pages
- [x] Add `homepage` field to `package.json`
- [x] Update build output directory if needed

### Step 0.4: Create .gitignore ✅
- [x] Create `.gitignore` with Node.js, React, and build artifacts
- [x] Include `dist/`, `node_modules/`, `.env`, etc.

### Step 0.5: Setup GitHub Actions Workflow ✅
- [x] Create `.github/workflows/deploy.yml`
- [x] Configure workflow to build and deploy to GitHub Pages
- [x] Test deployment with basic app

### Step 0.6: Create Basic Project Structure ✅
- [x] Create `src/components/` directory
- [x] Create `src/contexts/` directory
- [x] Create `src/hooks/` directory
- [x] Create `src/utils/` directory
- [x] Create `src/types/` directory
- [x] Create `scripts/` directory

### Step 0.7: Define TypeScript Types ✅
- [x] Create `src/types/property.ts` with Property interface
- [x] Create `src/types/unit.ts` with Unit and Revenue interfaces
- [x] Create `src/types/expense.ts` with Expense interfaces
- [x] Create `src/types/comparison.ts` with comparison interfaces

---

## Phase 1: Component 1 - Property Details ✅ COMPLETED

### Step 1.1: Create Property Details Component Shell ✅
- [x] Create `src/components/PropertyDetails/PropertyDetails.tsx`
- [x] Create basic mobile-responsive layout with sections
- [x] Add component to main App

### Step 1.2: Basic Information Section ✅
- [x] Create input field: Purchase Price (number, required, formatted as currency)
- [x] Create input field: Down Payment (%, default 20%)
- [x] Create input field: Interest Rate (%, default 7.0%)
- [x] Create input field: Loan Term (years, default 30)
- [x] Create input field: Property Address (optional text)
- [x] Add validation and error states

### Step 1.3: Initial Costs Section ✅
- [x] Create input field: Closing Costs (%, default 3.5%)
- [x] Create input field: Initial Renovations ($)
- [x] Create input field: Furnishing Budget ($)
- [x] Create input field: Other Upfront Costs ($ with editable label)
- [x] Calculate and display total initial investment

### Step 1.4: Property-Level Expenses Section ✅
- [x] Create input field: Property Tax Rate (%, default 1.0%)
- [x] Create input field: Base Insurance ($ monthly, default $250)
- [x] Create input field: HOA/Condo Fees ($ monthly, default $0)

### Step 1.5: Property State Management ✅
- [x] Create `src/contexts/PropertyContext.tsx`
- [x] Implement useReducer for property state
- [x] Create actions: UPDATE_BASIC_INFO, UPDATE_INITIAL_COSTS, UPDATE_PROPERTY_EXPENSES
- [x] Connect PropertyDetails component to context

### Step 1.6: Local Storage Persistence ✅
- [x] Create `src/hooks/useLocalStorage.ts`
- [x] Auto-save property data to localStorage on change
- [x] Load property data from localStorage on mount

---

## Phase 2: Component 2 - Unit Configuration (Basic) ✅ COMPLETED

### Step 2.1: Unit List Component ✅
- [x] Create `src/components/Units/UnitList.tsx`
- [x] Display list of units (empty state initially)
- [x] Add "Add Unit" button (mobile-friendly)
- [x] Add component to main App

### Step 2.2: Unit Card Component Shell ✅
- [x] Create `src/components/Units/UnitCard.tsx`
- [x] Create collapsible/expandable card layout (mobile-friendly)
- [x] Add Unit Label input field
- [x] Add Remove Unit button
- [x] Add unit type selector (radio buttons: STR/MTR/LTR)

### Step 2.3: STR Revenue Inputs ✅
- [x] Create `src/components/Units/STRInputs.tsx`
- [x] Add Nightly Rate input ($)
- [x] Add Occupancy Rate input (%, default 80%)
- [x] Add Average Stay Length input (nights, default 2.5)
- [x] Display calculated monthly turnovers
- [x] Display calculated gross monthly revenue

### Step 2.4: MTR Revenue Inputs ✅
- [x] Create `src/components/Units/MTRInputs.tsx`
- [x] Add Daily Rate OR Monthly Rate toggle
- [x] Add rate input field (switches based on toggle)
- [x] Add Occupancy Rate input (%, default 50%)
- [x] Add Average Booking Length input (days, default 15)
- [x] Display calculated gross monthly revenue

### Step 2.5: LTR Revenue Inputs ✅
- [x] Create `src/components/Units/LTRInputs.tsx`
- [x] Add Monthly Rent input ($)
- [x] Add Annual Vacancy Rate input (%, default 5%)
- [x] Display calculated effective monthly revenue

### Step 2.6: Unit State Management ✅
- [x] Add unit management to PropertyContext
- [x] Create actions: ADD_UNIT, REMOVE_UNIT, UPDATE_UNIT
- [x] Implement unit array state
- [x] Connect UnitList and UnitCard to context

---

## Phase 3: Component 3 - Expense System (Basic) ✅ COMPLETED

### Step 3.1: Expense List Component ✅
- [x] Create `src/components/Expenses/ExpenseList.tsx`
- [x] Display expense items for a unit
- [x] Add "Add Expense" button
- [x] Style for mobile (collapsible/expandable)

### Step 3.2: Expense Item Component ✅
- [x] Create `src/components/Expenses/ExpenseItem.tsx`
- [x] Add Expense Name input
- [x] Add Calculation Type dropdown (Fixed Monthly, % Revenue, Per Occurrence, etc.)
- [x] Add Value input (conditional based on type)
- [x] Add Remove button

### Step 3.3: Frequency Input (Conditional) ✅
- [x] Create conditional Frequency input (for "Per Occurrence" type)
- [x] Add frequency type dropdown (Daily/Weekly/Monthly/Per Booking)
- [x] Add occurrence count input

### Step 3.4: System Default Expense Templates ✅
- [x] Create `src/utils/expenseTemplates.ts`
- [x] Define STR default expenses (from design doc)
- [x] Define MTR default expenses
- [x] Define LTR default expenses
- [x] Create function to load template by unit type

### Step 3.5: Auto-populate Expenses on Unit Creation ✅
- [x] Update ADD_UNIT action to load default expense template
- [x] Apply appropriate template based on unit type (STR/MTR/LTR)

### Step 3.6: Expense Calculation Engine (Basic) ✅
- [x] Create `src/utils/calculations.ts`
- [x] Implement calculateExpense() for each calculation type
- [x] Implement calculateTotalExpenses() for a unit
- [x] Display total expenses per unit

---

## Phase 4: Component 4 - Calculations & Summary ✅ COMPLETED

### Step 4.1: Mortgage Calculator Utility ✅
- [x] Create `src/utils/mortgageCalculator.ts`
- [x] Implement monthly payment calculation (P&I)
- [x] Implement amortization schedule generator
- [x] Calculate principal paydown for Year 1

### Step 4.2: Per-Unit Summary Component ✅
- [x] Create `src/components/Summary/UnitSummary.tsx`
- [x] Display Gross Revenue
- [x] Display Total Operating Expenses (itemized)
- [x] Display Net Operating Income (NOI)
- [x] Add to each UnitCard

### Step 4.3: Property-Level Summary Component ✅
- [x] Create `src/components/Summary/PropertySummary.tsx`
- [x] Calculate and display Total Monthly Revenue (all units)
- [x] Calculate and display Total Monthly Expenses (units + property-level)
- [x] Display Mortgage Payment (P&I)
- [x] Display Monthly Cash Flow
- [x] Display Annual Cash Flow

### Step 4.4: Return Metrics Component ✅
- [x] Create `src/components/Summary/ReturnMetrics.tsx` (integrated into PropertySummary)
- [x] Calculate and display Total Investment
- [x] Calculate and display Cash-on-Cash Return
- [x] Calculate and display Total Return (Year 1)
- [x] Display Principal Paydown (Year 1)

### Step 4.5: Mobile-Optimized Summary Layout ✅
- [x] Design card-based layout for mobile
- [x] Add expand/collapse sections for detailed breakdowns
- [x] Ensure key metrics are prominently displayed
- [x] Test responsive design on various screen sizes

---

## Phase 5: Comparison Dashboard ✅ COMPLETED

### Step 5.1: Comparison Context Setup ✅
- [x] Add comparison rates to PropertyContext (HYSA, Index Funds)
- [x] Create settings for default comparison rates
- [x] Add inputs to configure comparison rates

### Step 5.2: Comparison Table Component ✅
- [x] Create `src/components/Comparison/ComparisonDashboard.tsx`
- [x] Calculate returns for HYSA (3% default)
- [x] Calculate returns for Index Funds (10% total, 2% dividend)
- [x] Display side-by-side comparison table
- [x] Make table mobile-responsive (possibly card-based stacking)

### Step 5.3: Qualitative Comparison Metrics ✅
- [x] Add Liquidity comparison row
- [x] Add Work Required comparison row (calculate from DIY hours)
- [x] Add visual indicators (icons, color coding)

### Step 5.4: Year 5 Wealth Projection ✅
- [x] Implement compound growth calculator
- [x] Calculate 5-year projection for property (cash flow + equity)
- [x] Calculate 5-year projection for HYSA
- [x] Calculate 5-year projection for Index Funds
- [x] Display in comparison table

---

## Phase 6: Template Management System

### Step 6.1: Template Settings Page/Modal
- [ ] Create `src/components/Templates/TemplateSettings.tsx`
- [ ] Create tabbed interface (STR/MTR/LTR)
- [ ] Add navigation/access from main app (settings icon)

### Step 6.2: Template Editor Component
- [ ] Create `src/components/Templates/TemplateEditor.tsx`
- [ ] Display editable expense list for template
- [ ] Allow add/remove/modify expenses
- [ ] "Reset to System Defaults" button

### Step 6.3: Custom Template Management
- [ ] Implement "Save Custom Template" functionality
- [ ] Create template list/picker component
- [ ] Allow naming custom templates
- [ ] Delete custom templates (not system defaults)

### Step 6.4: Template Selection on Unit Creation
- [ ] Update Add Unit flow to show template picker
- [ ] Options: Default, System Default, Custom Templates, Blank
- [ ] Load selected template into new unit

### Step 6.5: Import/Export Templates
- [ ] Implement export template as JSON
- [ ] Implement import template from JSON file
- [ ] Add validation for imported templates

---

## Phase 7: Advanced Features (Optional)

### Step 7.1: DIY vs Outsourced Toggle
- [ ] Add toggle checkbox to ExpenseItem
- [ ] Add alternative cost input when toggled
- [ ] Add hours/month estimate input
- [ ] Calculate sweat equity value in summary

### Step 7.2: Appreciation Scenarios
- [ ] Add appreciation rate inputs (0%, 2%, 3%, 5%)
- [ ] Calculate property value projections
- [ ] Display equity build-up over time
- [ ] Add to comparison dashboard

### Step 7.3: Multi-Year Projections
- [ ] Create `src/components/Advanced/ProjectionChart.tsx`
- [ ] Calculate 5/10/15 year projections
- [ ] Display compound growth scenarios
- [ ] Visualize with simple charts (consider lightweight library)

### Step 7.4: Sensitivity Analysis
- [ ] Create `src/components/Advanced/SensitivityAnalysis.tsx`
- [ ] Calculate impact of ±10% occupancy
- [ ] Calculate impact of ±$10 nightly rate (STR)
- [ ] Display range of possible outcomes

### Step 7.5: Scaling Scenario
- [ ] Model using annual cash flow to save for next property
- [ ] Calculate time to next purchase
- [ ] Show portfolio growth projection

---

## Phase 8: Polish & Optimization

### Step 8.1: Mobile UX Refinements
- [ ] Test all interactions on mobile devices
- [ ] Optimize touch targets (min 44x44px)
- [ ] Improve form field mobile keyboards (inputMode)
- [ ] Add smooth scrolling and transitions

### Step 8.2: Loading States & Error Handling
- [ ] Add loading states for calculations
- [ ] Add error boundaries
- [ ] Add user-friendly error messages
- [ ] Handle edge cases (divide by zero, etc.)

### Step 8.3: Accessibility (a11y)
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Check color contrast ratios (WCAG AA)

### Step 8.4: Performance Optimization
- [ ] Memoize expensive calculations
- [ ] Lazy load components if needed
- [ ] Optimize re-renders with React.memo
- [ ] Code splitting for route-based chunks (if applicable)

### Step 8.5: Documentation
- [ ] Add inline code comments
- [ ] Create README.md with usage instructions
- [ ] Document deployment process
- [ ] Add contributing guidelines (if open source)

### Step 8.6: Testing
- [ ] Write unit tests for calculation utilities
- [ ] Write component tests for key components
- [ ] Add E2E test for main user flow
- [ ] Test cross-browser compatibility

---

## Phase 9: Deployment & Launch

### Step 9.1: Pre-Launch Checklist
- [ ] Test production build locally
- [ ] Verify all features work in production mode
- [ ] Test on multiple mobile devices
- [ ] Check GitHub Pages deployment

### Step 9.2: Launch
- [ ] Deploy to GitHub Pages
- [ ] Verify live site works correctly
- [ ] Test sharing/URL functionality

### Step 9.3: Post-Launch
- [ ] Monitor for errors/issues
- [ ] Gather user feedback
- [ ] Create backlog for future improvements

---

## Notes

### Mobile-First Design Principles
- Design for 320px width minimum
- Use responsive breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons and inputs (min 44x44px)
- Collapsible sections to reduce scrolling
- Bottom navigation or floating action buttons
- Minimize text input where possible (use sliders, dropdowns)

### State Management Strategy
- Single source of truth in PropertyContext
- Derived calculations (not stored in state)
- Optimistic updates for better UX
- Debounce expensive calculations

### Calculation Performance
- Memoize calculation results
- Only recalculate affected units on change
- Use web workers for heavy calculations (if needed)

### Git Workflow
- Main branch protected
- Feature branches for each phase/step
- Pull requests for code review (if team)
- Semantic commit messages
