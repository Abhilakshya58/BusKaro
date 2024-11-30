import React, { useEffect, useState, useCallback } from 'react';
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../redux/alertSlice';
import { axiosInstance } from '../../helpers/axiosInstance';

const AdminBookings = () => {
    const dispatch = useDispatch();
    const [bookings, setBookings] = useState([]);

    const getBookings = useCallback(async () => {
        try {
            dispatch(ShowLoading());
            const response = await axiosInstance.post('/bookings/get-all-bookings');
            dispatch(HideLoading());

            if (response.data.success) {
                const formattedData = response.data.data.map((booking) => {
                    const bus = booking.bus || {};
                    const fare = bus.fare || 0;
                    const seatsCount = booking.seats.length || 0;
                    const amount = fare * seatsCount;

                    return {
                        ...booking,
                        busName: bus.name || "N/A",
                        busNumber: bus.number || "N/A",
                        from: bus.from || "N/A",
                        to: bus.to || "N/A",
                        departure: bus.departure || "N/A",
                        seats: seatsCount,
                        amount,
                    };
                });
                setBookings(formattedData);
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            dispatch(HideLoading());
            console.error("Error fetching bookings:", error);
            message.error('Error fetching bookings');
        }
    }, [dispatch]);

    useEffect(() => {
        getBookings();
    }, [getBookings]);

    const columns = [
        { title: 'Bus Name', dataIndex: 'busName', key: 'busName' },
        { title: 'Bus Number', dataIndex: 'busNumber', key: 'busNumber' },
        { title: 'From', dataIndex: 'from', key: 'from' },
        { title: 'To', dataIndex: 'to', key: 'to' },
        { title: 'Departure', dataIndex: 'departure', key: 'departure' },
        { title: 'Seats', dataIndex: 'seats', key: 'seats' },
        { title: 'Payment Amount (₹)', dataIndex: 'amount', key: 'amount' },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Admin - Booking Records</h2>
            <Table
                columns={columns}
                dataSource={bookings}
                rowKey={(record) => record._id}
                pagination={{ pageSize: 5 }}
            />
        </div>
    );
};

export default AdminBookings;
