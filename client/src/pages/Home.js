import React, { useState, useEffect } from "react";
import { Row, Col, message, Input, Button, DatePicker, Typography } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../redux/alertSlice";
import { axiosInstance } from "../helpers/axiosInstance";
import Bus from "../components/Bus";
import moment from "moment";
import "../resources/home.css";

const { Text } = Typography;

const Home = () => {
  const dispatch = useDispatch();
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    from: "",
    to: "",
    journeyDate: "",
  });

  const getBuses = async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/buses/get-all-buses");
      dispatch(HideLoading());
      if (response.data.success) {
        const availableBuses = response.data.data.filter(
          (bus) => bus.status === "Yet-to-Start"
        );
        setBuses(availableBuses);
        setFilteredBuses(availableBuses);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error fetching buses");
      dispatch(HideLoading());
    }
  };

  const handleSearch = () => {
    const { from, to, journeyDate } = searchCriteria;
    const filtered = buses.filter((bus) => {
      return (
        (!from || bus.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || bus.to.toLowerCase().includes(to.toLowerCase())) &&
        (!journeyDate || bus.journeyDate === journeyDate)
      );
    });
    setFilteredBuses(filtered);
  };

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

  useEffect(() => {
    getBuses();
  }, []);

  return (
    <div className="home-container">
      {/* Banner Section */}
      <div className="banner">
        <div className="search-container">
          {/* Search Row */}
          <div className="search-row">
            <div className="search-field">
              <Input
                placeholder="From Station"
                onChange={(e) =>
                  setSearchCriteria({ ...searchCriteria, from: e.target.value })
                }
              />
            </div>
            <div className="search-field">
              <Input
                placeholder="To Station"
                onChange={(e) =>
                  setSearchCriteria({ ...searchCriteria, to: e.target.value })
                }
              />
            </div>
            <div className="search-field">
              <DatePicker
                placeholder="Journey Date"
                disabledDate={disablePastDates}
                onChange={(date, dateString) =>
                  setSearchCriteria({
                    ...searchCriteria,
                    journeyDate: dateString,
                  })
                }
              />
            </div>
            <div className="search-button-wrapper">
              <Button
                // type="primary"
                className="search-button"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bus List Section */}
      <div className="bus-list">
        {filteredBuses.length > 0 ? (
          <Row gutter={[16, 16]} style={{ padding: '0 15px' }}>
          {filteredBuses.map((bus) => (
            <Col span={24} key={bus._id}>
              <Bus bus={bus} />
            </Col>
          ))}
        </Row>
        
        ) : (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Text
              type="warning"
              style={{ fontSize: "18px", color: "#ff4d4f" }}
            >
              Oops, no bus runs on this route or date. Please try searching for
              other buses.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
