import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            console.log("Token exists, redirecting to home page."); // Debug: Token case
            navigate('/');
        }
    }, [navigate]); // Added navigate as a dependency

    return <div>{children}</div>;
};

export default PublicRoute;
