import { message, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SetUser } from "../redux/userSlice";
import { HideLoading, ShowLoading } from "../redux/alertSlice";
import DefaultLayout from "./DefaultLayout";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    try {
      console.log("Validating token...");
      dispatch(ShowLoading());

      const response = await axios.post(
        "http://localhost:5001/api/users/get-user-by-id",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Token Validation Response:", response.data);

      dispatch(HideLoading());

      if (response.data.success) {
        console.log("Token validated successfully. User data:", response.data.data);
        dispatch(SetUser(response.data.data));
        setLoading(false);
      } else {
        console.warn("Token validation failed. Message:", response.data.message);
        message.error(response.data.message || "Session expired, please log in again.");
        localStorage.removeItem("token");
        setLoading(false);
        navigate("/login");
      }
    } catch (error) {
      dispatch(HideLoading());
      console.error(
        "Error during token validation:",
        error.response ? error.response.data : error.message
      );

      if (error.response && error.response.data.message === "Auth failed. Token expired.") {
        message.error("Session expired, please log in again.");
      } else {
        message.error("Authentication failed. Please log in again.");
      }

      localStorage.removeItem("token");
      setLoading(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken();
    } else {
      console.log("No token found. Redirecting to login...");
      setLoading(false);
      navigate("/login");
    }
  }, []);

  if (loading) {
    console.log("Page is loading...");
    return <Spin tip="Loading..." style={{ display: "block", marginTop: "20%" }} />;
  }

  if (!user) {
    console.log("User not found. Redirecting to login...");
    return null;
  }

  console.log("User authenticated. Rendering layout.");
  return <DefaultLayout>{children}</DefaultLayout>;
};

export default ProtectedRoute;
