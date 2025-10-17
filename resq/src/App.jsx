import React, { useState, useRef } from "react";
import { FaHospital, FaFirstAid, FaBell } from "react-icons/fa";
import "./App.css";

export default function App() {
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | preparing | sent | failed
  const timerRef = useRef(null);
  const holdStartRef = useRef(null);

  // how long to hold the SOS button before it triggers
  const HOLD_DURATION = 1500;

  // 🔔 When long press completes
  const onTriggered = () => {
    setCountdown(null);
    setStatus("preparing");

    // 📍 Get location
    if (!navigator.geolocation) {
      setStatus("failed");
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const payload = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        // 🚨 Send the alert to backend
        sendAlert(payload)
          .then(() => setStatus("sent"))
          .catch((err) => {
            console.error(err);
            setStatus("failed");
          });
      },
      (err) => {
        console.error("Geolocation error", err);
        setStatus("failed");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 📡 Send alert to backend
  const sendAlert = async (payload) => {
    console.log("Sending alert payload:", payload);
    const response = await fetch("http://localhost:8080/api/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to send alert");
    }
  };

  // 🕒 Start hold timer
  const startHold = () => {
    setStatus("idle");
    setCountdown(Math.ceil(HOLD_DURATION / 1000));
    holdStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const rem = HOLD_DURATION - elapsed;
      setCountdown(rem > 0 ? Math.ceil(rem / 1000) : 0);

      if (rem <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        onTriggered();
      }
    }, 100);
  };

  // ❌ Cancel hold
  const cancelHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
  };

  // 👆 Handle mouse & touch
  const onMouseDown = (e) => {
    e.preventDefault();
    startHold();
  };
  const onMouseUp = (e) => {
    e.preventDefault();
    if (timerRef.current) cancelHold();
  };
  const onTouchStart = () => startHold();
  const onTouchEnd = () => {
    if (timerRef.current) cancelHold();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>SOS</h1>
      </header>

      <main className="content">
        <div className="alert-box">
          <h2>Emergency Alert</h2>
          <p>
            In case of emergency, press and hold the button below to send an
            alert with your location to your contacts.
          </p>

          <div className="sos-area">
            <button
              className={`sos-button ${status}`}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <FaBell size={28} />
              <span className="sos-text">SOS</span>
            </button>

            <div className="status-area">
              {countdown !== null && <div>Hold: {countdown}s</div>}
              {status === "preparing" && <div>Sending alert…</div>}
              {status === "sent" && <div>✅ Alert sent</div>}
              {status === "failed" && <div>❌ Failed to get location</div>}
              {status === "idle" && <div>Ready</div>}
            </div>
          </div>
        </div>
      </main>

      <footer className="bottom-nav">
        <div className="nav-item">
          <FaBell size={20} />
          <span>SOS</span>
        </div>
        <div className="nav-item">
          <FaHospital size={20} />
          <span>Hospitals</span>
        </div>
        <div className="nav-item">
          <FaFirstAid size={20} />
          <span>First Aid</span>
        </div>
      </footer>
    </div>
  );
}
