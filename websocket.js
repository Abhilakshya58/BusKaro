const WebSocket = require('ws');
const Bus = require('./models/busModels'); // Import Bus model

// WebSocket server initialization
function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      const data = JSON.parse(message);

      switch (data.action) {
        case 'lock_seat':
          await handleSeatLock(ws, data, wss);
          break;
        case 'unlock_seat':
          await handleSeatUnlock(ws, data, wss);
          break;
        default:
          ws.send(JSON.stringify({ success: false, message: 'Unknown action' }));
      }
    });

    ws.on('close', () => {
      console.log('Connection closed');
    });
  });
}

// Lock a seat
const handleSeatLock = async (ws, { busId, seatId, userId }, wss) => {
  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      ws.send(JSON.stringify({ success: false, message: 'Bus not found' }));
      return;
    }

    if (bus.seatsBooked.includes(seatId)) {
      ws.send(JSON.stringify({ success: false, message: 'Seat already booked' }));
      return;
    }

    if (!bus.lockedSeats[seatId]) {
      bus.lockedSeats[seatId] = userId;
      await bus.save();

      broadcast(wss, {
        action: 'seat_locked',
        busId,
        seatId,
        userId,
      });

      ws.send(JSON.stringify({ success: true, message: 'Seat locked successfully', seatId }));
    } else {
      ws.send(JSON.stringify({ success: false, message: 'Seat already locked' }));
    }
  } catch (error) {
    ws.send(JSON.stringify({ success: false, message: 'Error locking seat', error: error.message }));
  }
};

// Unlock a seat
const handleSeatUnlock = async (ws, { busId, seatId, userId }, wss) => {
  try {
    const bus = await Bus.findById(busId);
    if (!bus) {
      ws.send(JSON.stringify({ success: false, message: 'Bus not found' }));
      return;
    }

    if (bus.lockedSeats[seatId] === userId) {
      delete bus.lockedSeats[seatId];
      await bus.save();

      broadcast(wss, {
        action: 'seat_unlocked',
        busId,
        seatId,
      });

      ws.send(JSON.stringify({ success: true, message: 'Seat unlocked successfully', seatId }));
    } else {
      ws.send(JSON.stringify({ success: false, message: 'Unauthorized seat unlock attempt' }));
    }
  } catch (error) {
    ws.send(JSON.stringify({ success: false, message: 'Error unlocking seat', error: error.message }));
  }
};

// Broadcast a message to all clients
const broadcast = (wss, message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = { initializeWebSocket };
