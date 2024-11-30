import React, { useEffect, useState } from 'react';
import PageTitle from '../../components/PageTitle';
import BusForm from '../../components/BusForm';
import { HideLoading, ShowLoading } from '../../redux/alertSlice';
import { useDispatch } from 'react-redux';
import { message, Table } from 'antd';
import { axiosInstance } from '../../helpers/axiosInstance';

const AdminBuses = () => {
  const dispatch = useDispatch();
  const [showBusForm, setShowBusForm] = useState(false);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  // Fetch all buses from the backend
  const getBuses = async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post(
        "/buses/get-all-buses",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(HideLoading());
      if (response.data.success) {
        setBuses(response.data.data); // Update the buses in the state
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  // Delete a bus from the backend
  const deleteBus = async (busId) => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.delete(`/buses/delete-bus/${busId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(HideLoading());

      if (response.data.success) {
        message.success(response.data.message);
        // Remove the deleted bus from the state (to update the table)
        setBuses(buses.filter((bus) => bus._id !== busId));
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  // Columns for the buses table
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Number",
      dataIndex: "number",
    },
    {
      title: "From",
      dataIndex: "from",
    },
    {
      title: "To",
      dataIndex: "to",
    },
    {
      title: "Journey Date",
      dataIndex: "journeyDate",
      render: (text, record) => {
        return record.journeyDate ? new Date(record.journeyDate).toLocaleDateString() : "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="d-flex gap-3">
            <i className="ri-edit-box-line"
              onClick={() => {
                setSelectedBus(record); // Set the selected bus for editing
                setShowBusForm(true); // Show the form
              }}
            ></i>
            <i
              className="ri-delete-bin-5-line"
              onClick={() => {
                deleteBus(record._id); // Call deleteBus when the user clicks the delete icon
              }}
            ></i>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getBuses(); // Fetch buses when the component mounts
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between">
        <PageTitle title="Buses" />
        <button
          className="primary-btn"
          onClick={() => {
            setSelectedBus(null); // Clear the selected bus when adding a new one
            setShowBusForm(true);
          }}
        >
          Add Bus
        </button>
      </div>

      <Table columns={columns} dataSource={buses} />

      {/* Render the BusForm modal */}
      <BusForm
        showBusForm={showBusForm}
        setShowBusForm={setShowBusForm}
        type={selectedBus ? "edit" : "add"}
        selectedBus={selectedBus}
        getData={getBuses} // Refresh the buses after form submission
      />
    </div>
  );
};

export default AdminBuses;
