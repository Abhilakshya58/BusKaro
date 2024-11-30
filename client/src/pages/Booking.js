import React, { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";
import { useDispatch } from "react-redux";
import { message, Modal, Table, Typography, Divider, Button } from "antd";
import { ShowLoading, HideLoading } from "../redux/alertSlice";
import { axiosInstance } from "../helpers/axiosInstance";
import "../resources/booking.css";

const { Text } = Typography;

const Booking = () => {
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const dispatch = useDispatch();
    const [bookings, setBookings] = useState([]);

    const getBookings = async () => {
        try {
            dispatch(ShowLoading());
            const response = await axiosInstance.post(
                "/bookings/get-bookings-by-user-id",
                { userId: "default_user_id" } // Replace with actual user ID logic if needed
            );
            dispatch(HideLoading());

            if (response.data.success) {
                const mappedData = response.data.data.map((booking) => ({
                    ...booking,
                    ...booking.bus,
                    key: booking._id,
                }));
                setBookings(mappedData);
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    const formatTime = (time) => {
        if (!time) return "N/A"; // Handle undefined or null time values
        const [hours, minutes] = time.split(":");
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    const columns = [
        { title: "Bus Name", dataIndex: "name", key: "bus" },
        { title: "Bus Number", dataIndex: "number", key: "bus" },
        { title: "Journey Date", dataIndex: "journeyDate" },
        {
            title: "Journey Time",
            dataIndex: "departure",
            render: (time) => (time ? formatTime(time) : "N/A"),
        },
        {
            title: "Seats",
            dataIndex: "seats",
            render: (seats) => (seats ? seats.join(", ") : "N/A"),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record) => (
                <div>
                    <Text
                        underline
                        className="action-link"
                        onClick={() => {
                            setSelectedBooking(record);
                            setShowPrintModal(true);
                        }}
                    >
                        Print Ticket
                    </Text>
                </div>
            ),
        },
    ];

    useEffect(() => {
        getBookings();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="booking-container">
            <PageTitle title="Bookings" />
            <div className="booking-table">
                <Table
                    dataSource={bookings}
                    columns={columns}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 500 }}
                />
            </div>
            {showPrintModal && (
                <Modal
                    title="Ticket Details"
                    onCancel={() => {
                        setShowPrintModal(false);
                        setSelectedBooking(null);
                    }}
                    open={showPrintModal}
                    centered
                    footer={[
                        <Button type="primary" onClick={handlePrint}>
                            Print Ticket
                        </Button>,
                        <Button onClick={() => setShowPrintModal(false)}>Close</Button>,
                    ]}
                >
                    <div id="ticketContent" className="modal-content">
                        <div className="modal-row">
                            <Text className="modal-label">Bus Name:</Text>
                            <Text className="modal-value">{selectedBooking?.name || "N/A"}</Text>
                        </div>

                        <Divider />

                        <div className="modal-row">
                            <Text className="modal-label">Date:</Text>
                            <Text className="modal-value">{selectedBooking?.journeyDate || "N/A"}</Text>
                        </div>
                        <div className="modal-row">
                            <Text className="modal-label">Departure Time:</Text>
                            <Text className="modal-value">
                                {selectedBooking?.departure ? formatTime(selectedBooking.departure) : "N/A"}
                            </Text>
                        </div>
                        <div className="modal-row">
                            <Text className="modal-label">Arrival Time:</Text>
                            <Text className="modal-value">
                                {selectedBooking?.arrival ? formatTime(selectedBooking.arrival) : "N/A"}
                            </Text>
                        </div>
                        <div className="modal-row">
                            <Text className="modal-label">Seats:</Text>
                            <Text className="modal-value">
                                {selectedBooking?.seats ? selectedBooking.seats.join(", ") : "N/A"}
                            </Text>
                        </div>
                        <div className="modal-row">
                            <Text className="modal-label">Amount:</Text>
                            <Text className="modal-value">
                                ₹{" "}
                                {selectedBooking?.fare && selectedBooking?.seats
                                    ? selectedBooking.fare * selectedBooking.seats.length
                                    : "N/A"}{" "}
                                /-
                            </Text>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Booking;
