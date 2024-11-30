import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../resources/busSec.css'; // Ensure the CSS file is imported

const Bus = ({ bus }) => {
  const navigate = useNavigate();

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const hours = parseInt(hour, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12; // Convert 0 to 12 for AM/PM format
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <div className="bus-card">
      <div className="bus-header">
        <h2 className="bus-name">{bus.name}</h2>
      </div>
      <div className="bus-details">
        <div className="bus-info">
          <p>
            <span>From:</span> {bus.from}
          </p>
          <p>
            <span>To:</span> {bus.to}
          </p>
        </div>
        <div className="bus-info">
          <p>
            <span>Journey Date:</span> {bus.journeyDate}
          </p>
          <p>
            <span>Departure:</span> {formatTime(bus.departure)}
          </p>
          <p>
            <span>Arrival:</span> {formatTime(bus.arrival)}
          </p>
        </div>
        <div className="bus-footer">
          <h3 className="bus-fare">
            Price: <span>₹{bus.fare}</span>
          </h3>
          <button
            className="select-seats-button"
            onClick={() => navigate(`/book-now/${bus._id}`)}
          >
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bus;
