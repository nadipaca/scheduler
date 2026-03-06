# Work Order Schedule Timeline

An interactive production scheduling UI built with **Angular 17** that lets planners visualize, create, and manage work orders across multiple work centers on a zoomable timeline.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
cd work-order-timeline
npm install
npm start
```

Navigate to **http://localhost:4200**. The app hot-reloads on file changes.

### Run Unit Tests

```bash
npm test
```

---

## Features

| Feature | Details |
|---|---|
| **Timeline Grid** | Day / Week / Month zoom levels, horizontally scrollable |
| **Work Order Bars** | Positioned by date, colour-coded by status, name + status badge visible |
| **Today Indicator** | Vertical line marking the current date |
| **Create Work Order** | Click any empty row cell → slide-out panel pre-fills the clicked date |
| **Edit Work Order** | Three-dot menu → Edit → panel pre-populates all fields |
| **Delete Work Order** | Three-dot menu → Delete |
| **Overlap Detection** | Error shown if a new/edited order overlaps an existing one on the same work center |
| **Tooltip on Hover** | Hover a bar to see name, date range, and status |
| **localStorage Persistence** | Work orders survive page refresh (bonus) |

---

## Status Colours

| Status | Colour |
|---|---|
| Open | Blue |
| In Progress | Purple/Blue |
| Complete | Green |
| Blocked | Yellow/Amber |

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # TypeScript interfaces (WorkCenter, WorkOrder, Document)
│   │   └── services/        # WorkScheduleService — all CRUD + overlap logic
│   ├── features/
│   │   └── schedule/        # All timeline components
│   │       ├── schedule-timeline-page.component   # Root page, wires everything
│   │       ├── timeline-header.component           # Zoom dropdown + date column headers
│   │       ├── timeline-grid.component             # Scrollable grid + today-line
│   │       ├── work-center-row.component           # One row per work center
│   │       ├── work-order-bar.component            # Individual bar + tooltip + menu
│   │       └── work-order-panel.component          # Slide-out create/edit form
│   └── shared/
│       ├── components/status-badge/               # Reusable status pill
│       └── utils/
│           ├── date-range.util.ts                 # Date ↔ pixel position calculations
│           ├── overlap.util.ts                    # Overlap detection logic
│           └── timeline-zoom.config.ts            # Pixels-per-day per zoom level
└── data/
    └── sample-work-data.ts  # Hardcoded work centers + work orders
```

---

## Key Technical Decisions

### Date → Pixel Positioning
Bar positions are calculated purely from the visible date range and `pixelsPerDay` for the active zoom level (`date-range.util.ts`). No third-party Gantt library is used — positioning is plain arithmetic, keeping the bundle lean and behaviour predictable.

### Single Panel for Create & Edit
`WorkOrderPanelComponent` operates in `'create' | 'edit'` mode. In create mode the form resets and the start date is pre-filled from the click X position. In edit mode all fields are populated from the existing work order. This avoids duplicating form logic.

### Overlap Detection
`WorkScheduleService.findOverlapError()` checks a candidate date range against every order on the same work center before any write. The same check runs for both create and edit (edit excludes its own `docId`).

### OnPush Change Detection
All components use `ChangeDetectionStrategy.OnPush`. `WorkScheduleService` emits new array references (never mutates in place) via `BehaviorSubject`, satisfying `OnPush` requirements and keeping rendering efficient.

### localStorage Persistence (Bonus)
Work orders are serialised to `localStorage` on every mutation and rehydrated on startup. If storage is empty the sample data seeds the store.

---

## Libraries Used

| Library | Why |
|---|---|
| `@ng-bootstrap/ng-bootstrap` | `ngb-datepicker` for date inputs, `ngbTooltip` for bar hover tooltips, `ngbDropdown` for three-dot menus |
| `@ng-select/ng-select` | Status dropdown in the panel (matches design spec requirement) |
| `date-fns` | Clean, tree-shakeable date arithmetic (add days, format, parse) |
| `bootstrap` | Base CSS reset and utility classes |

---

## Approach

1. Started with a static timeline (hardcoded columns, no data) to nail layout and scrolling
2. Added bar positioning maths (`date-range.util.ts`) and rendered sample bars
3. Wired up zoom switching (recalculates `visibleRange` and `pixelsPerDay`)
4. Built the slide-out panel with Reactive Forms
5. Added overlap detection in the service layer
6. Added tooltip, localStorage persistence, and polish

---

## Running the App

```bash
npm start
# → http://localhost:4200
```
