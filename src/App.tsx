import Layout from "./layouts/Layout";
import ClockPage from "./pages/ClockPage";
import { ClockSettingsProvider } from "./context/ClockSettingsContext";
import { TimerProvider } from "./context/TimerContext";

function App() {
  return (
    <ClockSettingsProvider>
      <TimerProvider>
        <Layout>
          <ClockPage />
        </Layout>
      </TimerProvider>
    </ClockSettingsProvider>
  );
}

export default App;
