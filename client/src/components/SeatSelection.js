import React, { useState, useEffect } from 'react';
import '../resources/bus.css';

const SeatSelection = ({ selectedSeats, setSelectedSeats, bus, lockedSeats }) => {
  const capacity = bus.capacity;
  const [bookedSeats] = useState(bus.seatsBooked);

  const selectOrUnselectSeats = (seatNumber) => {
    if (lockedSeats.includes(seatNumber) || bookedSeats.includes(seatNumber)) {
      return; // Prevent selecting locked or already booked seats
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  return (
    <div className="bus-container">
      <div className="driver-conductor-row">
        <div className="conductor">conductor</div>
        <div className="driver">driver</div>
      </div>
      <div className="seats-wrapper">
        {Array.from({ length: capacity / 4 }, (_, rowIndex) => (
          <div className="seat-row" key={rowIndex}>
            {[0, 1].map((offset) => {
              const seatNumber = rowIndex * 4 + offset + 1;
              return (
                <div
                  className={`seat ${
                    bookedSeats.includes(seatNumber)
                      ? 'booked-seat'
                      : lockedSeats.includes(seatNumber)
                      ? 'locked-seat'
                      : selectedSeats.includes(seatNumber)
                      ? 'selected-seat'
                      : ''
                  }`}
                  key={seatNumber}
                  onClick={() => selectOrUnselectSeats(seatNumber)}
                >
                  {seatNumber}
                </div>
              );
            })}
            <div className="aisle-gap"></div>
            {[2, 3].map((offset) => {
              const seatNumber = rowIndex * 4 + offset + 1;
              return (
                <div
                  className={`seat ${
                    bookedSeats.includes(seatNumber)
                      ? 'booked-seat'
                      : lockedSeats.includes(seatNumber)
                      ? 'locked-seat'
                      : selectedSeats.includes(seatNumber)
                      ? 'selected-seat'
                      : ''
                  }`}
                  key={seatNumber}
                  onClick={() => selectOrUnselectSeats(seatNumber)}
                >
                  {seatNumber}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatSelection;
