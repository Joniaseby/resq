import React, { useState, useRef, useEffect } from "react";
import {
  FaHospital,
  FaFirstAid,
  FaBell,
  FaMapMarkerAlt,
  FaPhone,
  FaDirections,
  FaUserPlus,
} from "react-icons/fa";
import "./App.css";

export default function App() {
  const [countdown, setCountdown] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeTab, setActiveTab] = useState("sos");
  const [hospitals, setHospitals] = useState([]);
  const [firstAidGuides, setFirstAidGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    relation: "",
    phone: "",
  });
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const timerRef = useRef(null);
  const holdStartRef = useRef(null);

  // --- Load saved contacts ---
  useEffect(() => {
    const saved = localStorage.getItem("contacts");
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  // --- Save contacts ---
  useEffect(() => {
    localStorage.setItem("contacts", JSON.stringify(contacts));
  }, [contacts]);

  // --- SOS Trigger ---
  const onTriggered = async () => {
    setCountdown(null);
    setStatus("preparing");
    setErrorMsg("");

    if (!navigator.geolocation) {
      setStatus("failed");
      setErrorMsg("Geolocation not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          timestamp: new Date().toISOString(),
        };

        try {
          // Step 1️⃣: Log alert to backend
          await sendAlert(payload);

          // Step 2️⃣: Send SMS alerts to all emergency contacts
          for (const contact of contacts) {
            await sendAlertToContact(contact, payload);
          }

          setStatus("sent");
          setShowSuccessMsg(true);
          setTimeout(() => setShowSuccessMsg(false), 3000);
        } catch (err) {
          console.error(err);
          setStatus("failed");
          setErrorMsg("Failed to send alert. Please try again.");
        }
      },
      () => {
        setStatus("failed");
        setErrorMsg("Unable to fetch your location.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- Send alert log to backend ---
  const sendAlert = async (payload) => {
    const res = await fetch("http://localhost:8082/api/alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to send alert log to backend");
  };

  // --- Send alert to each contact ---
  const sendAlertToContact = async (contact, payload) => {
    const message = `🚨 Emergency Alert!\n${contact.name}, your contact is in trouble.\n\nLocation: https://www.google.com/maps?q=${payload.lat},${payload.lon}`;

    const res = await fetch("http://localhost:8082/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: contact.phone,
        message,
      }),
    });
    if (!res.ok) throw new Error(`Failed to alert ${contact.name}`);
  };

  // --- Fetch hospitals ---
  useEffect(() => {
    if (activeTab === "hospitals") {
      fetch("http://localhost:8082/api/hospitals")
        .then((res) => res.json())
        .then((data) => setHospitals(data))
        .catch((err) => console.error("Hospital fetch error:", err));
    }
  }, [activeTab]);

  // --- Fetch first aid guides ---
  useEffect(() => {
    if (activeTab === "firstaid") {
      fetch("http://localhost:8082/api/firstaid")
        .then((res) => res.json())
        .then((data) => setFirstAidGuides(data))
        .catch((err) => console.error("First aid fetch error:", err));
    }
  }, [activeTab]);

  // --- Add new contact ---
  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone || !newContact.relation) {
      alert("Please fill in all fields.");
      return;
    }

    const phonePattern = /^[0-9]{7,15}$/;
    if (!phonePattern.test(newContact.phone)) {
      alert("Please enter a valid phone number (7–15 digits).");
      return;
    }

    setContacts([...contacts, newContact]);
    setNewContact({ name: "", relation: "", phone: "" });
    setShowContactForm(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 2000);
  };

  const handleGetDirections = (hospitalAddress) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        hospitalAddress
      )}`,
      "_blank"
    );
  };

  return (
    <div className="app">
      {/* 🔹 Floating Add Contact Icon — Top Left */}
      {activeTab === "sos" && (
        <button
          className="add-contact-fixed"
          onClick={() => setShowContactForm(true)}
          title="Add Emergency Contact"
        >
          <FaUserPlus size={18} />
        </button>
      )}

      {/* --- Header --- */}
      <header className="header">
        <h1>
          {activeTab === "sos"
            ? "ResQ+"
            : activeTab === "hospitals"
            ? "Hospitals"
            : "First Aid"}
        </h1>
      </header>

      {/* ✅ Toasts */}
      {showSuccessMsg && (
        <div className="success-toast">✅ Action completed successfully!</div>
      )}
      {errorMsg && <div className="error-toast">{errorMsg}</div>}

      {/* --- Main Content --- */}
      <main className="content">
        {/* --- SOS PAGE --- */}
        {activeTab === "sos" && (
          <div className="alert-box">
            <h2>Emergency Alert</h2>
            <p>
              In case of emergency, press the button below to send an alert with
              your location to your emergency contacts.
            </p>

            <div className="sos-area">
              <button
                className={`sos-button ${status}`}
                onClick={() => setShowConfirm(true)}
              >
                <FaBell size={28} />
                <span className="sos-text">SOS</span>
              </button>

              <div className="status-area">
                {status === "preparing" && <div>Sending alert…</div>}
                {status === "sent" && <div>✅ Alert sent</div>}
                {status === "failed" && <div>❌ Failed</div>}
                {status === "idle" && <div>Ready</div>}
              </div>
            </div>

            {/* --- Emergency Contacts --- */}
            {contacts.length > 0 && (
              <div className="contacts-card">
                <h3 className="contacts-title">
                  <FaUserPlus style={{ marginRight: "8px" }} /> Emergency
                  Contacts
                </h3>
                <div className="contacts-container">
                  {contacts.map((c, i) => (
                    <div className="contact-item" key={i}>
                      <div className="contact-info">
                        <strong className="contact-name">{c.name}</strong>
                        <span className="contact-relation">{c.relation}</span>
                      </div>
                      <div className="contact-phone">
                        <FaPhone className="phone-icon" /> {c.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Confirm SOS Popup --- */}
            {showConfirm && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <h3>Confirm Emergency SOS?</h3>
                  <p>
                    This will send your location and an emergency alert to your
                    contacts. Are you sure you want to continue?
                  </p>
                  <div className="confirm-buttons">
                    <button
                      className="cancel-btn"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-btn"
                      onClick={() => {
                        setShowConfirm(false);
                        onTriggered();
                      }}
                    >
                      Yes, Send Alert
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- Add Contact Form --- */}
            {showContactForm && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <h3>Add Emergency Contact</h3>
                  <form onSubmit={handleAddContact} className="contact-form">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g. Spouse, Friend)"
                      value={newContact.relation}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          relation: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                      required
                    />
                    <div className="confirm-buttons">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setShowContactForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="confirm-btn">
                        Save Contact
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Hospitals Page --- */}
        {activeTab === "hospitals" && (
          <div className="hospitals-page">
            <div className="hospital-list">
              {hospitals.map((h) => (
                <div className="hospital-card" key={h.id}>
                  <img
                    src="/hospital.jpg"
                    alt="hospital"
                    className="hospital-img"
                  />
                  <div className="hospital-info">
                    <h3>{h.name}</h3>
                    <p>
                      <FaMapMarkerAlt /> {h.address}
                    </p>
                    <p>
                      <FaPhone /> {h.phone}
                    </p>
                    <p>
                      <strong>2.5 miles away (10 min drive)</strong>
                    </p>
                    <button
                      className="directions-btn"
                      onClick={() => handleGetDirections(h.address)}
                    >
                      <FaDirections /> Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- First Aid Page --- */}
        {activeTab === "firstaid" && (
          <div className="firstaid-page">
            <h2 className="firstaid-title">First Aid Guides</h2>
            <p className="firstaid-subtext">
              Select a topic below for step-by-step first aid instructions.
            </p>
            <div className="firstaid-container">
              {firstAidGuides.map((guide, index) => (
                <div key={index} className="accordion">
                  <div
                    className="accordion-header"
                    onClick={() =>
                      setSelectedGuide(selectedGuide === index ? null : index)
                    }
                  >
                    <span>{guide.title}</span>
                    <span>{selectedGuide === index ? "▲" : "▼"}</span>
                  </div>
                  {selectedGuide === index && (
                    <div className="accordion-body">
                      <ul>
                        {guide.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- Bottom Navigation --- */}
      <footer className="bottom-nav">
        <div
          className={`nav-item ${activeTab === "sos" ? "active" : ""}`}
          onClick={() => setActiveTab("sos")}
        >
          <FaBell size={20} />
          <span>SOS</span>
        </div>
        <div
          className={`nav-item ${activeTab === "hospitals" ? "active" : ""}`}
          onClick={() => setActiveTab("hospitals")}
        >
          <FaHospital size={20} />
          <span>Hospitals</span>
        </div>
        <div
          className={`nav-item ${activeTab === "firstaid" ? "active" : ""}`}
          onClick={() => setActiveTab("firstaid")}
        >
          <FaFirstAid size={20} />
          <span>First Aid</span>
        </div>
      </footer>
    </div>
  );
}
