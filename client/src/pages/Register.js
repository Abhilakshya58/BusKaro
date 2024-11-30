import React from 'react';
import { Form, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertSlice';
import '../resources/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await axios.post('http://localhost:5001/api/users/register', values);
      dispatch(HideLoading());
      if (response.data.success) {
        message.success(response.data.message);
        navigate('/login');
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="welcome-message">
        <h1>Welcome to BusKaro</h1>
      </div>
      <div className="subheading">
        <h2>Heyyy, awesome to have you onboard! 🌟 We're beyond thrilled to be part of your journey. Buckle up, because together, we're about to make your travels legendary! 🚌✨</h2>
      </div>
      <div className="left-image-section">
        <img src="/images/bus.jpg" alt="Bus" className="bus-image" />
      </div>
      <div className="right-section">
        <div className="register-card">
          <h2 className="register-title">BusKaro - Register</h2>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name!' }]}>
              <input type="text" className="input-field" placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email!' }]}>
              <input type="text" className="input-field" placeholder="Enter your email" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
              <input type="password" className="input-field" placeholder="Enter your password" />
            </Form.Item>

            <div className="register-options">
              <Link to="/login">Already have an account? Login</Link>
            </div>
            <button className="primary-btn" type="submit">Register</button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
