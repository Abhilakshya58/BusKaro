import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertSlice";
import { Col, message, Row, Input, Button, Typography } from "antd";
import { useParams } from "react-router-dom";
import "../resources/booknow.css";
import SeatSelection from "../components/SeatSelection";
import StripeCheckout from "react-stripe-checkout";

const { Text } = Typography;

const BookNow = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState({});
  const [bus, setBus] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountedFare, setDiscountedFare] = useState(0);
  const [originalFare, setOriginalFare] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponId, setCouponId] = useState(null);
  const socketRef = useRef(null);
  const params = useParams();
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const stripePublishableKey =
    "pk_test_51QFEBnKxYn7bBbnUkLCcgqxfBm7viCySaiBqc9eJa3mWKrLUlU13mNxDhsn4weyuVESP7gNwCwGf4GLM50aHLyty00SVNkds54";

  // WebSocket for real-time seat locking
  useEffect(() => {
    const connectWebSocket = () => {
      socketRef.current = new WebSocket("ws://localhost:5001");

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
      };

      socketRef.current.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.action === "seat_locked") {
          setLockedSeats((prev) => ({ ...prev, [data.seatId]: data.userId }));
        } else if (data.action === "seat_unlocked") {
          setLockedSeats((prev) => {
            const updatedLockedSeats = { ...prev };
            delete updatedLockedSeats[data.seatId];
            return updatedLockedSeats;
          });
        }
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Fetch Bus Details
  const getBus = async () => {
    if (!params.id) return;
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/buses/get-bus-by-id", { _id: params.id });
      dispatch(HideLoading());
      if (response.data.success) {
        setBus(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Failed to fetch bus details. Please try again.");
    }
  };

  // Apply Coupon
  const applyCoupon = async () => {
    if (!couponCode) {
        message.error("Please enter a coupon code.");
        return;
    }

    try {
        dispatch(ShowLoading());

        // Call the backend to validate the coupon
        const response = await axiosInstance.post("/coupons/apply", { couponCode });

        dispatch(HideLoading());

        if (response.data.success) {
            const totalFare = selectedSeats.length * (bus?.fare || 0);

            setOriginalFare(totalFare); // Save original fare
            setDiscountedFare(totalFare - totalFare * response.data.discount); // Apply discount
            setDiscountPercentage(response.data.discount * 100);
            setCouponId(response.data.couponId); // Save coupon ID
            message.success(response.data.message);
        } else {
            // This block will only execute if backend sends an error message
            message.error(response.data.message);
        }
    } catch (error) {
        dispatch(HideLoading());
        // Display error message from backend if coupon is invalid or used
        message.error(error.response?.data?.message || "Failed to apply coupon.");
    }
};




  // Book Now Logic
  const bookNow = async (transactionId) => {
    try {
      const response = await axiosInstance.post("/bookings/book-seat", {
        busId: bus._id,
        seats: selectedSeats,
        transactionId,
        couponId, // Pass the applied coupon ID
      });

      if (response.data.success) {
        message.success("Booking successful!");
        window.location.reload();
      } else {
        message.error(response.data.message || "Booking failed");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  // Handle Payment Token
  const onToken = async (token) => {
    const totalFare = discountedFare || bus.fare * selectedSeats.length;
    const amount = totalFare * 100;

    if (amount < 4000) {
      message.error("Minimum booking amount is ₹40.");
      return;
    }

    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/payments/make-payment", {
        token,
        amount,
        couponId, // Include coupon ID
      });
      dispatch(HideLoading());
      if (response.data.success) {
        message.success("Payment successful!");

        // If coupon is applied, mark it as used
        if (couponCode) {
          try {
            const markUsedResponse = await axiosInstance.post("/coupons/mark-used", {
              couponCode,
            });
            if (markUsedResponse.data.success) {
              message.success(markUsedResponse.data.message);
            }
          } catch {
            message.error("Failed to mark coupon as used.");
          }
        }

        // Proceed with booking
        bookNow(response.data.data.transactionId);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    getBus();
  }, [params.id]);

  return (
    <div className="book-now-container">
      {bus && (
        <Row className="mt-3" gutter={20}>
          <Col lg={12} xs={24} sm={24}>
            <div className="bus-details-container">
              <h1 className="text-2xl text-secondary bus-name">{bus.name}</h1>
              <h2 className="text-lg text-muted bus-route">
                {bus.from} - {bus.to}
              </h2>
              <hr className="bus-divider" />
              <div className="bus-info">
                <p>Date: {bus.journeyDate}</p>
                <p>Departure Time: {bus.departure}</p>
                <p>Fare per Seat: ₹{bus.fare} /-</p>
                <p>Seats Left: {bus.capacity - bus.seatsBooked.length}</p>
              </div>
            </div>
            <div className="action-container">
              <h1 className="text-2xl">Selected Seats: {selectedSeats.join(", ")}</h1>
              <h1 className="text-2xl mt-2">
                Total Fare: ₹{originalFare > 0 ? originalFare : bus.fare * selectedSeats.length}
              </h1>
              {discountedFare > 0 && (
                <h1 className="text-lg text-success mt-1">
                  Discount Applied: {discountPercentage}%<br />
                  <Text delete>₹{originalFare}</Text> → <Text strong>₹{discountedFare}</Text>
                </h1>
              )}
              <div className="apply-coupon-container">
                <Input
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ width: "200px", marginRight: "10px" }}
                />
                <Button className="apply-coupon-btn" onClick={applyCoupon}>
                  Apply Coupon
                </Button>
              </div>
              {selectedSeats.length > 0 ? (
                <StripeCheckout
                  billingAddress
                  token={onToken}
                  amount={(discountedFare || bus.fare * selectedSeats.length) * 100}
                  currency="INR"
                  stripeKey={stripePublishableKey}
                >
                  <button className="btn primary-btn">Book Now</button>
                </StripeCheckout>
              ) : (
                <button className="btn primary-btn disabled-btn" disabled>
                  Book Now
                </button>
              )}
            </div>
          </Col>
          <Col lg={12} xs={24} sm={24}>
            <SeatSelection
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              bus={bus}
              lockedSeats={Object.keys(lockedSeats)}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default BookNow;
