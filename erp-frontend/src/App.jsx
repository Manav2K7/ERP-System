import AppRoutes from "./routes/AppRoutes";

/**
 * "/" resolves to the Dashboard since F7 (AppRoutes handles all routes).
 */
export default function App() {
  return <AppRoutes />;
}
