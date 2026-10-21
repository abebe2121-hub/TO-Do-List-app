import "./App.css";

// import Header from "./components/layout/Header";
// import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="app">
      {/* <Header /> */}

      <main>
        <AppRoutes />
      </main>

      {/* <Footer /> */}
    </div>
  );
}

export default App;
