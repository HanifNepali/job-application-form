import { Outlet } from "react-router-dom";

// Shared shell for every step route. Router renders this once and swaps
// only the <Outlet /> content when navigating between steps — so anything
// that should persist across steps (stepper, theme toggle) lives here,
// not inside individual step components.
//
// The Stepper itself isn't wired in yet — that's for a later phase
export function FormLayout() {
  return (
    <div>
      {/* Stepper/progress bar goes here */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
