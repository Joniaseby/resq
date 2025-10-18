import React, { useEffect, useState } from "react";
import "./App.css";

export default function FirstAidPage() {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Fetch data from backend
  useEffect(() => {
    fetch("http://localhost:8081/api/firstaid")
      .then((res) => res.json())
      .then((data) => setGuides(data))
      .catch((err) => console.error("Error loading first aid data:", err));
  }, []);

  // If user clicks a guide
  const handleSelect = (guide) => {
    setSelectedGuide(guide);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>First Aid</h1>
      </header>

      <main className="content">
        <div className="firstaid-container">
          {!selectedGuide ? (
            <>
              <h2>Emergency Situations</h2>
              <div className="firstaid-list">
                {guides.map((guide, index) => (
                  <div
                    key={index}
                    className="firstaid-card"
                    onClick={() => handleSelect(guide)}
                  >
                    <h3>{guide.title}</h3>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="firstaid-details">
              <button
                className="back-btn"
                onClick={() => setSelectedGuide(null)}
              >
                ← Back
              </button>
              <h2>{selectedGuide.title}</h2>
              <ul>
                {selectedGuide.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
