import React from 'react';
import { Form, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertSlice';
import '../resources/login.css';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        try {
            dispatch(ShowLoading());
            const response = await axios.post('http://localhost:5001/api/users/login', values);
            dispatch(HideLoading());
            if (response.data.success) {
                message.success(response.data.message);
                localStorage.setItem("token", response.data.data);
                navigate("/");
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            dispatch(HideLoading());
            message.error(error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="welcome-message">Welcome to BusKaro</div> {/* Welcome message */}
            <div className="subheading">🎉 Woohoo! Hop on and grab the best seats in town! 🎉</div>
            <div className="left-image-section">
                <img src="/images/bus.jpg" alt="Bus" className="bus-image" />
            </div>
            <div className="right-section">
                <div className="login-card">
                    <h2 className="login-title">Sign in to your account</h2>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email!' }]}>
                            <input type="text" className="input-field" placeholder="Enter your email" />
                        </Form.Item>
                        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
                            <input type="password" className="input-field" placeholder="Enter your password" />
                        </Form.Item>
                        <div className="login-options">
                            <Link to="/register" className="register-link">New to BusKaro? Register</Link>
                        </div>
                        <button className="primary-btn" type="submit">Sign In</button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
