## Fix: Optimize TaskCard re-renders and address code smells

**Motivation:**
Following the prompt instructions to proactively identify tech debt and prioritize high-impact improvements, an analysis of the component tree revealed that the `TaskList` was passing rapidly changing states (like the search input and GPS-driven `userLocation`) to a large list of `TaskCard` elements. Because `TaskCard` was not memoized, this caused every single item in the task list to unnecessarily re-render on every keystroke and GPS update.

**Improvements:**
- Wrapped `TaskCard` with `React.memo` to prevent unnecessary re-renders.
- Confirmed that the event handlers passed to `TaskCard` from `TaskList` (`toggleTask`, `setEditingTask`) are stable.
- Added a unit test to `TaskCard.test.tsx` using `vi.spyOn` to explicitly verify that the component does not re-render when its props do not change.
- Note on documentation alignment: The README specifies "Google Gemini 3 Flash", but the code (`services/gemini.ts`) uses `gemini-2.0-flash`. Following memory instructions, the valid working model version was retained in the code to avoid runtime regressions, noting this discrepancy here.

**Business/Performance Benefit:**
- Significantly reduces CPU cycles during GPS tracking (which happens often in the background) and when typing in the Smart Add input.
- Enhances overall list scrolling and interaction fluidity (UX) on low-end devices.
