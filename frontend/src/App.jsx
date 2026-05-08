import "./App.css";
import CameraFeed from "./components/CameraFeed";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="app-header__title">Glow Up</h1>
          <p className="app-header__subtitle">Real-time beauty enhancement</p>
        </div>
      </header>
      <main className="app-main">
        <CameraFeed />
      </main>
    </div>
  );
}

export default App;
