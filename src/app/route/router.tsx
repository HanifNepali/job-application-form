import { createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";

// PHASE 1 SCOPE NOTE: routes are wide open right now — no guard.
// The route guard (checking furthestValidStep, redirecting on direct URL
// entry / refresh / a previously-valid step going stale) is Phase 4 scope.
// It needs per-step validation (Phase 3) to exist before there's anything
// to guard against, so it can't land here yet.

export const router = createBrowserRouter(routes);
