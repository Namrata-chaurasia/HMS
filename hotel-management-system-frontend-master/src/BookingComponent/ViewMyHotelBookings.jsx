import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";

const ViewMyHotelBookings = () => {
  let user = JSON.parse(sessionStorage.getItem("active-hotel"));

  const [allBookings, setAllBookings] = useState([]);

  const [bookingStatus, setBookingStatus] = useState([]);

  const [updateBookingStatus, setUpdateBookingStatus] = useState({
    bookingId: "",
    bookingStatus: "",
  });

  const handleInput = (e) => {
    setUpdateBookingStatus({
      ...updateBookingStatus,
      [e.target.name]: e.target.value,
    });
  };

  const retrieveAllBookingStatus = async () => {
    const response = await axios.get(
      "http://localhost:8080/api/book/hotel/fetch/status"

    );
    console.log(response.data);
    return response.data;
  };

  useEffect(() => {
    const getAllBooking = async () => {
      const allBooking = await retrieveAllBooking();
      if (allBooking) {
        setAllBookings(allBooking.bookings);
      }
    };

    const getAllBookingStatus = async () => {
      const allBookingStatus = await retrieveAllBookingStatus();
      if (allBookingStatus) {
        setBookingStatus(allBookingStatus);
      }
    };

    getAllBookingStatus();
    getAllBooking();
  }, []);

  const retrieveAllBooking = async () => {
    const response = await axios.get(
      "http://localhost:8080/api/book/hotel/fetch/bookings?hotelId=" +
        user.hotelId
    );
    for(let i=0;i<response.data.bookings.length;i++){
      const response2 = await axios.get(
        "http://localhost:8080/api/hotel/id?hotelId=" + response.data.bookings[i].hotelId
      );
      console.log(response2.data.hotel.pricePerDay)
      const amt =CalculateTotalAmount(response2.data.hotel.pricePerDay,response.data.bookings[i].totalRoom,  response.data.bookings[i].checkIn,response.data.bookings[i].checkOut)
      response.data.bookings[i].totalAmount = amt
      console.log(amt)
    }
    console.log(response.data);
    return response.data;
  };

  const updateHotelBookingStatus = (e) => {
    fetch("http://localhost:8080/api/book/hotel/update/status", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateBookingStatus),
    }).then((result) => {
      console.log("result", result);
      result.json().then((res) => {
        console.log("response", res);
        setUpdateBookingStatus({
          bookingId: "",
          bookingStatus: "",
        });

        setAllBookings(res.bookings);
      });
    });

    e.preventDefault();
  };
  const calculateTotalDays = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalDays = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return totalDays;
  };
  const CalculateTotalAmount =  (pricePerDay, totalRoom, checkIn,checkOut) => {
    
    const totalAmount =pricePerDay * totalRoom * calculateTotalDays(checkIn,checkOut);
    return totalAmount;
  };
  return (
    <div className="mt-3">
      <div
        className="card form-card  mb-5 custom-bg border-color "
        style={{
          height: "45rem",
        }}
      >
        <div className="card-header custom-bg-text text-center bg-color">
          <h2>Hotel Bookings</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">Hotel</th>
                  <th scope="col">Hotel Name</th>
                  <th scope="col">Hotel Email</th>
                  <th scope="col">Hotel Contact</th>
                  <th scope="col">Booking Id</th>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Customer Contact</th>
                  <th scope="col">Check In</th>
                  <th scope="col">Check Out</th>
                  <th scope="col">Total Room</th>
                  <th scope="col">Total Day</th>
                  <th scope="col">Total Payable Amount</th>
                  <th scope="col">Booking Status</th>
                  <th scope="col">Update Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((booking) => {
                  return (
                    <tr key={booking.bookingId}>
                      <td>
                        <img
                          src={
                            "http://localhost:8080/api/hotel/" +
                            booking.hotelImage
                          }
                          className="img-fluid"
                          alt="product_pic"
                          style={{
                            maxWidth: "90px",
                          }}
                        />
                      </td>

                      <td>
                        <b>{booking.hotelName}</b>
                      </td>
                      <td>
                        <b>{booking.hotelEmail}</b>
                      </td>
                      <td>
                        <b>{booking.hotelContact}</b>
                      </td>

                      <td>
                        <b>{booking.bookingId}</b>
                      </td>
                      <td>
                        <b>{booking.customerName}</b>
                      </td>
                      <td>
                        <b>{booking.customerContact}</b>
                      </td>

                      <td>
                        <b>{booking.checkIn}</b>
                      </td>
                      <td>
                        <b>{booking.checkOut}</b>
                      </td>
                      <td>
                        <b>{booking.totalRoom}</b>
                      </td>

                      <td>
                        <b>{calculateTotalDays(booking.checkIn, booking.checkOut)}</b>
                      </td>
                      <td>
                        <b>{booking.totalAmount}</b>
                      </td>
                      <td>
                        <b>{booking.status}</b>
                      </td>

                      <td>
                        {booking.status === "Pending" && (
                          <>
                            <Link
                              to={`/hotel/verify/booking/${booking.id}`}
                              className="nav-link active btn btn-sm"
                              aria-current="page"
                            >
                              <b className="text-color">Verify Booking</b>
                            </Link>
                          </>
                        )}
                         {booking.status === "CheckIn" && (
                          <>
                            <Link
                              to={`/hotel/verify/booking/${booking.id}`}
                              className="nav-link active btn btn-sm"
                              aria-current="page"
                            >
                              <b className="text-color">Verify Booking</b>
                            </Link>
                          </>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMyHotelBookings;