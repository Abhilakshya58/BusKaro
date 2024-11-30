import React, { useEffect } from 'react';
import { Col, Form, message, Modal, Row } from 'antd';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../helpers/axiosInstance';
import { HideLoading, ShowLoading } from '../redux/alertSlice';

const BusForm = ({ showBusForm, setShowBusForm, type = 'add', getData, selectedBus }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm(); // Create form instance

  // Populate the form with selected bus data when editing
  useEffect(() => {
    if (selectedBus) {
      const formattedBus = {
        ...selectedBus,
        journeyDate: selectedBus.journeyDate || null, // Use the existing string directly
      };
      form.setFieldsValue(formattedBus); // Set the form values
    } else {
      form.resetFields(); // Reset form if no selectedBus
    }
  }, [selectedBus, form]);

  // Submit handler for adding or editing a bus
  const onFinish = async (values) => {
    try {
      values.capacity = parseInt(values.capacity, 10);
      values.fare = parseFloat(values.fare);
      console.log("Submitting form values:", values); // Debugging payload
  
      dispatch(ShowLoading());
      const endpoint = type === "add" ? "/buses/add-bus" : `/buses/update-bus/${selectedBus._id}`;
      const response = await axiosInstance.post(endpoint, values);
  
      if (response?.data?.success) {
        message.success(response.data.message);
        getData();
        setShowBusForm(false);
      } else {
        message.error(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      message.error(error.message || "Error occurred");
    } finally {
      dispatch(HideLoading());
    }
  };
  
  


  return (
    <Modal
      width={800}
      title={type === 'add' ? 'Add Bus' : 'Edit Bus'}
      visible={showBusForm}
      onCancel={() => setShowBusForm(false)}
      footer={false}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={[10, 10]}>
          <Col lg={24} xs={24}>
            <Form.Item label="Bus Name" name="name" rules={[{ required: true, message: 'Please enter bus name' }]}>
              <input type="text" className="form-control" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Bus Number" name="number" rules={[{ required: true, message: 'Please enter bus number' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Capacity" name="capacity" rules={[{ required: true, message: 'Please enter bus capacity' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="From" name="from" rules={[{ required: true, message: 'Please enter starting point' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="To" name="to" rules={[{ required: true, message: 'Please enter destination' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Journey Date" name="journeyDate" rules={[{ required: true, message: 'Please select journey date' }]}>
              <input type="date" />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Departure" name="departure" rules={[{ required: true, message: 'Please enter departure time' }]}>
              <input type="time" />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Arrival" name="arrival" rules={[{ required: true, message: 'Please enter arrival time' }]}>
              <input type="time" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please enter bus type' }]}>
              <select name="type">
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Fare" name="fare" rules={[{ required: true, message: 'Please enter fare' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Driver Name" name="driverName" rules={[{ required: true, message: 'Please enter driver name' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Driver Contact" name="driverContact" rules={[{ required: true, message: 'Please enter driver contact' }]}>
              <input type="text" />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status' }]}>
              <select name="status">
                <option value="Yet-to-Start">Yet to Start</option>
                <option value="Running">Running</option>
                <option value="Completed">Completed</option>
              </select>
            </Form.Item>
          </Col>
        </Row>
        <div className="d-flex justify-content-end">
          <button className="primary-btn" type="submit">
            Save
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default BusForm;
