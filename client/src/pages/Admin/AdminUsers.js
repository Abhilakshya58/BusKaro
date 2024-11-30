import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { useDispatch } from 'react-redux';
import { ShowLoading, HideLoading } from '../../redux/alertSlice';
import { axiosInstance } from '../../helpers/axiosInstance';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.get('/users/get-all-users');
      dispatch(HideLoading());

      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      console.error("Error fetching users:", error); // Log error details
      message.error('Error fetching users');
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Admin Status', dataIndex: 'isAdmin', key: 'isAdmin', render: (isAdmin) => (isAdmin ? "Admin" : "User") },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin - User Records</h2>
      <Table columns={columns} dataSource={users} rowKey={(record) => record._id} pagination={{ pageSize: 5 }} />
    </div>
  );
};

export default AdminUsers;
