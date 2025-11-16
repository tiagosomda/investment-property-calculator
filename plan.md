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

## Phase 0: Project Setup (Foundation)

### Step 0.1: Initialize React + TypeScript + Vite
- [ ] Create Vite project with React + TypeScript template
- [ ] Install dependencies: `npm create vite@latest . -- --template react-ts`
- [ ] Verify dev server runs: `npm run dev`

### Step 0.2: Configure Tailwind CSS
- [ ] Install Tailwind CSS and dependencies
- [ ] Create `tailwind.config.js` with mobile-first breakpoints
- [ ] Create `postcss.config.js`
- [ ] Add Tailwind directives to main CSS file
- [ ] Test with a simple styled component

### Step 0.3: Setup GitHub Pages Configuration
- [ ] Configure `vite.config.ts` with correct base path for GitHub Pages
- [ ] Add `homepage` field to `package.json`
- [ ] Update build output directory if needed

### Step 0.4: Create .gitignore
- [ ] Create `.gitignore` with Node.js, React, and build artifacts
- [ ] Include `dist/`, `node_modules/`, `.env`, etc.

### Step 0.5: Setup GitHub Actions Workflow
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Configure workflow to build and deploy to GitHub Pages
- [ ] Test deployment with basic app

### Step 0.6: Create Basic Project Structure
- [ ] Create `src/components/` directory
- [ ] Create `src/contexts/` directory
- [ ] Create `src/hooks/` directory
- [ ] Create `src/utils/` directory
- [ ] Create `src/types/` directory
- [ ] Create `scripts/` directory

### Step 0.7: Define TypeScript Types
- [ ] Create `src/types/property.ts` with Property interface
- [ ] Create `src/types/unit.ts` with Unit and Revenue interfaces
- [ ] Create `src/types/expense.ts` with Expense interfaces
- [ ] Create `src/types/comparison.ts` with comparison interfaces

---

## Phase 1: Component 1 - Property Details

### Step 1.1: Create Property Details Component Shell
- [ ] Create `src/components/PropertyDetails/PropertyDetails.tsx`
- [ ] Create basic mobile-responsive layout with sections
- [ ] Add component to main App

### Step 1.2: Basic Information Section
- [ ] Create input field: Purchase Price (number, required, formatted as currency)
- [ ] Create input field: Down Payment (%, default 20%)
- [ ] Create input field: Interest Rate (%, default 7.0%)
- [ ] Create input field: Loan Term (years, default 30)
- [ ] Create input field: Property Address (optional text)
- [ ] Add validation and error states

### Step 1.3: Initial Costs Section
- [ ] Create input field: Closing Costs (%, default 3.5%)
- [ ] Create input field: Initial Renovations ($)
- [ ] Create input field: Furnishing Budget ($)
- [ ] Create input field: Other Upfront Costs ($ with editable label)
- [ ] Calculate and display total initial investment

### Step 1.4: Property-Level Expenses Section
- [ ] Create input field: Property Tax Rate (%, default 1.0%)
- [ ] Create input field: Base Insurance ($ monthly, default $250)
- [ ] Create input field: HOA/Condo Fees ($ monthly, default $0)

### Step 1.5: Property State Management
- [ ] Create `src/contexts/PropertyContext.tsx`
- [ ] Implement useReducer for property state
- [ ] Create actions: UPDATE_BASIC_INFO, UPDATE_INITIAL_COSTS, UPDATE_PROPERTY_EXPENSES
- [ ] Connect PropertyDetails component to context

### Step 1.6: Local Storage Persistence
- [ ] Create `src/hooks/useLocalStorage.ts`
- [ ] Auto-save property data to localStorage on change
- [ ] Load property data from localStorage on mount

---

## Phase 2: Component 2 - Unit Configuration (Basic)

### Step 2.1: Unit List Component
- [ ] Create `src/components/Units/UnitList.tsx`
- [ ] Display list of units (empty state initially)
- [ ] Add "Add Unit" button (mobile-friendly)
- [ ] Add component to main App

### Step 2.2: Unit Card Component Shell
- [ ] Create `src/components/Units/UnitCard.tsx`
- [ ] Create collapsible/expandable card layout (mobile-friendly)
- [ ] Add Unit Label input field
- [ ] Add Remove Unit button
- [ ] Add unit type selector (radio buttons: STR/MTR/LTR)

### Step 2.3: STR Revenue Inputs
- [ ] Create `src/components/Units/STRInputs.tsx`
- [ ] Add Nightly Rate input ($)
- [ ] Add Occupancy Rate input (%, default 80%)
- [ ] Add Average Stay Length input (nights, default 2.5)
- [ ] Display calculated monthly turnovers
- [ ] Display calculated gross monthly revenue

### Step 2.4: MTR Revenue Inputs
- [ ] Create `src/components/Units/MTRInputs.tsx`
- [ ] Add Daily Rate OR Monthly Rate toggle
- [ ] Add rate input field (switches based on toggle)
- [ ] Add Occupancy Rate input (%, default 50%)
- [ ] Add Average Booking Length input (days, default 15)
- [ ] Display calculated gross monthly revenue

### Step 2.5: LTR Revenue Inputs
- [ ] Create `src/components/Units/LTRInputs.tsx`
- [ ] Add Monthly Rent input ($)
- [ ] Add Annual Vacancy Rate input (%, default 5%)
- [ ] Display calculated effective monthly revenue

### Step 2.6: Unit State Management
- [ ] Add unit management to PropertyContext
- [ ] Create actions: ADD_UNIT, REMOVE_UNIT, UPDATE_UNIT
- [ ] Implement unit array state
- [ ] Connect UnitList and UnitCard to context

---

## Phase 3: Component 3 - Expense System (Basic)

### Step 3.1: Expense List Component
- [ ] Create `src/components/Expenses/ExpenseList.tsx`
- [ ] Display expense items for a unit
- [ ] Add "Add Expense" button
- [ ] Style for mobile (collapsible/expandable)

### Step 3.2: Expense Item Component
- [ ] Create `src/components/Expenses/ExpenseItem.tsx`
- [ ] Add Expense Name input
- [ ] Add Calculation Type dropdown (Fixed Monthly, % Revenue, Per Occurrence, etc.)
- [ ] Add Value input (conditional based on type)
- [ ] Add Remove button

### Step 3.3: Frequency Input (Conditional)
- [ ] Create conditional Frequency input (for "Per Occurrence" type)
- [ ] Add frequency type dropdown (Daily/Weekly/Monthly/Per Booking)
- [ ] Add occurrence count input

### Step 3.4: System Default Expense Templates
- [ ] Create `src/utils/expenseTemplates.ts`
- [ ] Define STR default expenses (from design doc)
- [ ] Define MTR default expenses
- [ ] Define LTR default expenses
- [ ] Create function to load template by unit type

### Step 3.5: Auto-populate Expenses on Unit Creation
- [ ] Update ADD_UNIT action to load default expense template
- [ ] Apply appropriate template based on unit type (STR/MTR/LTR)

### Step 3.6: Expense Calculation Engine (Basic)
- [ ] Create `src/utils/calculations.ts`
- [ ] Implement calculateExpense() for each calculation type
- [ ] Implement calculateTotalExpenses() for a unit
- [ ] Display total expenses per unit

---

## Phase 4: Component 4 - Calculations & Summary

### Step 4.1: Mortgage Calculator Utility
- [ ] Create `src/utils/mortgageCalculator.ts`
- [ ] Implement monthly payment calculation (P&I)
- [ ] Implement amortization schedule generator
- [ ] Calculate principal paydown for Year 1

### Step 4.2: Per-Unit Summary Component
- [ ] Create `src/components/Summary/UnitSummary.tsx`
- [ ] Display Gross Revenue
- [ ] Display Total Operating Expenses (itemized)
- [ ] Display Net Operating Income (NOI)
- [ ] Add to each UnitCard

### Step 4.3: Property-Level Summary Component
- [ ] Create `src/components/Summary/PropertySummary.tsx`
- [ ] Calculate and display Total Monthly Revenue (all units)
- [ ] Calculate and display Total Monthly Expenses (units + property-level)
- [ ] Display Mortgage Payment (P&I)
- [ ] Display Monthly Cash Flow
- [ ] Display Annual Cash Flow

### Step 4.4: Return Metrics Component
- [ ] Create `src/components/Summary/ReturnMetrics.tsx`
- [ ] Calculate and display Total Investment
- [ ] Calculate and display Cash-on-Cash Return
- [ ] Calculate and display Total Return (Year 1)
- [ ] Display Principal Paydown (Year 1)

### Step 4.5: Mobile-Optimized Summary Layout
- [ ] Design card-based layout for mobile
- [ ] Add expand/collapse sections for detailed breakdowns
- [ ] Ensure key metrics are prominently displayed
- [ ] Test responsive design on various screen sizes

---

## Phase 5: Comparison Dashboard

### Step 5.1: Comparison Context Setup
- [ ] Add comparison rates to PropertyContext (HYSA, Index Funds)
- [ ] Create settings for default comparison rates
- [ ] Add inputs to configure comparison rates

### Step 5.2: Comparison Table Component
- [ ] Create `src/components/Comparison/ComparisonTable.tsx`
- [ ] Calculate returns for HYSA (3% default)
- [ ] Calculate returns for Index Funds (10% total, 2% dividend)
- [ ] Display side-by-side comparison table
- [ ] Make table mobile-responsive (possibly card-based stacking)

### Step 5.3: Qualitative Comparison Metrics
- [ ] Add Liquidity comparison row
- [ ] Add Work Required comparison row (calculate from DIY hours)
- [ ] Add visual indicators (icons, color coding)

### Step 5.4: Year 5 Wealth Projection
- [ ] Implement compound growth calculator
- [ ] Calculate 5-year projection for property (cash flow + equity)
- [ ] Calculate 5-year projection for HYSA
- [ ] Calculate 5-year projection for Index Funds
- [ ] Display in comparison table

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
