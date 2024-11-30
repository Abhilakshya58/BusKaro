import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Button, Modal, message } from 'antd';
import { axiosInstance } from '../helpers/axiosInstance';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [todayBuses, setTodayBuses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchTodayBuses();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        message.error(response.data.message || 'Failed to fetch user profile.');
      }
    } catch (error) {
      message.error('Failed to fetch user profile.');
    }
  };

  // Fetch today's buses booked by the user
  const fetchTodayBuses = async () => {
    try {
      const response = await axiosInstance.get('/buses/get-booked-today-buses');
      if (response.data.success) {
        setTodayBuses(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch buses.');
      }
    } catch (error) {
      message.error('Failed to fetch buses.');
    }
  };

  // Fetch available coupons
  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get('/coupons/available');
      if (response.data.success) {
        setCoupons(response.data.data);
        setShowModal(true);
      } else {
        message.error(response.data.message || 'Failed to fetch coupons.');
      }
    } catch (error) {
      message.error('Failed to fetch coupons.');
    }
  };

  // Redeem a coupon
  const redeemCoupon = async (couponId) => {
    try {
      const response = await axiosInstance.post('/coupons/redeem', { couponId });
      if (response.data.success) {
        message.success('Coupon redeemed successfully!');
        fetchUserData();
        setShowModal(false);
      } else {
        message.error(response.data.message || 'Failed to redeem coupon.');
      }
    } catch (error) {
      message.error('Failed to redeem coupon.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {user && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={3}>{user.name}</Title>
          <Text type="secondary">{user.email}</Text>
          <div style={{ marginTop: '10px' }}>
            <Text strong>Coins: {user.coins}</Text>
          </div>
          <Button type="primary" onClick={fetchCoupons} style={{ marginTop: '10px' }}>
            Redeem Coupons
          </Button>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <Title level={4}>Today's Buses</Title>
        {todayBuses.length > 0 ? (
          todayBuses.map((bus) => (
            <Card key={bus._id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={5}>{bus.name}</Title>
                  <Text>From: {bus.from}</Text>
                  <br />
                  <Text>To: {bus.to}</Text>
                  <br />
                  <Text>Journey Date: {bus.journeyDate}</Text>
                  <br />
                  <Text>Departure: {bus.departure}</Text>
                </div>
                <div>
                  <Text>Driver: {bus.driverName || 'N/A'}</Text>
                  <br />
                  <Text>Contact: {bus.driverContact || 'N/A'}</Text>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Text>No buses running today.</Text>
        )}
      </div>

      <Modal
        title="Available Coupons"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <List
          itemLayout="horizontal"
          dataSource={coupons}
          renderItem={(coupon) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  onClick={() => redeemCoupon(coupon.id)}
                  disabled={user.coins < coupon.requiredCoins}
                >
                  Redeem
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={coupon.title}
                description={`Use at: ${coupon.description} | Cost: ${coupon.requiredCoins} Coins`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;
