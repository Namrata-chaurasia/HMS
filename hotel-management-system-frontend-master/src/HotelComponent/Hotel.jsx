import GetAllLocations from "../LocationComponent/GetAllLocations";
import LocationNavigator from "../LocationComponent/LocationNavigator";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import HotelCard from "./HotelCard";
import HotelCarousel from "./HotelCarousel";
import GetHotelFacilities from "../FacilityComponent/GetHotelFacilities";
import GetHotelReviews from "../HotelReviewComponent/GetHotelReviews";
import { useNavigate } from "react-router-dom";
import Footer from "../page/Footer";

const Hotel = () => {
  const { hotelId, locationId } = useParams();

  let user = JSON.parse(sessionStorage.getItem("active-customer"));
  let admin = JSON.parse(sessionStorage.getItem("active-admin"));

  const [quantity, setQuantity] = useState("");

  const [hotels, setHotels] = useState([]);

  let navigate = useNavigate();

  const [facilitiesToPass, setFacilitiesToPass] = useState([]);

  const [hotel, setHotel] = useState({
    id: "",
    name: "",
    description: "",
    street: "",
    pincode: "",
    emailId: "",
    pricePerDay: "",
    totalRoom: "",
    image1: "",
    image2: "",
    image3: "",
    userId: "",
    location: { id: "", city: "", description: "" },
    facility: [{ id: "", name: "", description: "" }],
  });

  const [booking, setBooking] = useState({
    userId: "",
    hotelId: "",
    checkIn: "",
    checkOut: "",
    totalRoom: "",
    totalAmount: "",
  });

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleBookingInput = (e) => {
    const { name, value } = e.target;
  
    if (name === "checkIn" || name === "checkOut" || name === "totalRoom") {
      const totalDays = calculateTotalDays();
      const totalAmount = hotel.pricePerDay * totalDays * value;
      setBooking({ ...booking, [name]: value, totalAmount: totalAmount });
    } else {
      setBooking({ ...booking, [name]: value });
    }
  };

  const retrieveHotel = async () => {
    const response = await axios.get(
      "http://localhost:8080/api/hotel/id?hotelId=" + hotelId
    );

    return response.data;
  };

  useEffect(() => {
    const getHotel = async () => {
      const retrievedHotel = await retrieveHotel();

      setHotel(retrievedHotel.hotel);
    };

    const getHotelsByLocation = async () => {
      const allHotels = await retrieveHotelsByLocation();
      if (allHotels) {
        setHotels(allHotels.hotels);
      }
    };

    getHotel();
    getHotelsByLocation();

    console.log("Print hotel");
    console.log(hotel.json);

    setFacilitiesToPass(hotel.facility);
  }, [hotelId]);

  const retrieveHotelsByLocation = async () => {
    const response = await axios.get(
      "http://localhost:8080/api/hotel/location?locationId=" + locationId
    );
    console.log(response.data);
    return response.data;
  };

  const saveProductToCart = (userId) => {
    fetch("http://localhost:8080/api/user/cart/add", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: quantity,
        userId: userId,
        hotelId: hotelId,
      }),
    }).then((result) => {
      console.log("result", result);

      toast.success("Products added to Cart Successfully!!!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      result.json().then((res) => {
        console.log("response", res);
      });
    });
  };
  const calculateTotalDays = () => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const totalDay = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return totalDay.toString();
  };

  const calculateTotalAmount = (pricePerDay, totalRoom, totalDays) => {
    const totalAmount = pricePerDay * totalRoom * totalDays;
    return totalAmount;
  };
  const bookHotel = async (e) => {
    if (user == null) {
      alert("Please login to book the hotels!!!");
      e.preventDefault();
    } else {
      //check room available
      const available = await isRoomAvailable(booking.checkIn, booking.checkOut,booking.totalRoom)
      console.log(available)
        if(available){

          const formData = new FormData();
          formData.append("userId", user.id);
          formData.append("hotelId", hotelId);
          formData.append("checkIn", booking.checkIn);
          formData.append("checkOut", booking.checkOut);
          formData.append("totalRoom", booking.totalRoom);
          const checkInDate = new Date(booking.checkIn);
          const checkOutDate = new Date(booking.checkOut);
          const totalDay = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
          // const totalAmount = calculateTotalAmount();
          console.log(formData);
          
          axios
          .post("http://localhost:8080/api/book/hotel/", formData)
        .then((result) => {
          result.json().then((res) => {
            console.log(res);
            console.log(res.responseMessage);
            alert("Hotel Booked Successfully!!!");
          });
        });
      } else{
        alert("Rooms are not available for the selected date range and quantity. Please choose different dates or reduce the number of rooms.");
      }
    }
    // }else {
    //   console.error("Error checkin room availability:", error);
    //   alert("An error occurred while checking room availability. Please try again later.");
    };
  
  
    
    const fetchBookedRooms = async (checkIn, checkOut) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/book/hotel/fetch/all`
      );
      // console.log("--------------------------------"+response.data.bookings)
      return response.data.bookings;
    } catch (error){
      console.error("Error fetching booked rooms:",error);
      throw error;
    }
  }

  const isRoomAvailable = async (checkIn, checkOut,totalRoom) =>{
    try{
      //Fetch the booked rooms for the given date range from the database
      const bookedRooms = await fetchBookedRooms(checkIn,checkOut);
      console.log("*************"+bookedRooms)
      // if(bookedRooms===null)
      // return true
      console.log("test")
      //Check if any booked rooms overlap with the desired date range
      const overlappingRooms = bookedRooms.filter((room) => (checkIn >= room.checkIn && checkIn <= room.checkOut) || (checkOut >= room.checkIn && checkOut <= room.checkOut));
      console.log(overlappingRooms)
      //Calculate the available rooms
      const availableRooms = totalRoom - overlappingRooms.length;

      //Check if the available rooms are sufficient
      return availableRooms >= 0;
    } catch (error){
      console.error("Error retrieving booked rooms:", error);
      return false; // Return false in case of any error or exception
    }
  };

  const navigateToAddHotelFacility = () => {
    navigate("/hotel/" + hotelId + "/add/facility");
  };

  const navigateToAddReviewPage = () => {
    navigate("/hotel/" + hotelId + "/location/" + locationId + "/add/review");
  };

  return (
    <div className="container-fluid mb-5">
      <div class="row">
        <div class="col-sm-3 mt-2">
          <div class="card form-card border-color custom-bg">
            <HotelCarousel
              item={{
                image1: hotel.image1,
                image2: hotel.image2,
                image3: hotel.image3,
              }}
            />
          </div>
        </div>
        <div class="col-sm-5 mt-2">
          <div class="card form-card border-color custom-bg">
            <div class="card-header bg-color">
              <div className="d-flex justify-content-between">
                <h1 className="custom-bg-text">{hotel.name}</h1>
              </div>
            </div>

            <div class="card-body text-left text-color">
              <div class="text-left mt-3">
                <h3>Description :</h3>
              </div>
              <h4 class="card-text">{hotel.description}</h4>
            </div>

            <div class="card-footer custom-bg">
              <div className="d-flex justify-content-between">
                <p>
                  <span>
                    <h4>Price : {hotel.pricePerDay}</h4>
                  </span>
                </p>

                <p class="text-color">
                  <b>Total Room : {hotel.totalRoom}</b>
                </p>
              </div>

              <div>
                <form class="row g-3" onSubmit={bookHotel}>
                  <div class="col-auto">
                    <label for="checkin">Check-in</label>
                    <input
                      type="date"
                      class="form-control"
                      id="checkin"
                      name="checkIn"
                      onChange={handleBookingInput}
                      value={booking.checkIn}
                      required
                    />
                  </div>
                  <div class="col-auto">
                    <label for="checkout">Check-out</label>
                    <input
                      type="date"
                      class="form-control"
                      id="checkout"
                      name="checkOut"
                      onChange={handleBookingInput}
                      value={booking.checkOut}
                      required
                    />
                  </div>
                  <div class="col-auto">
                    <label for="totalroom">Total Room</label>
                    <input
                      type="number"
                      class="form-control"
                      id="totalroom"
                      name="totalRoom"
                      onChange={handleBookingInput}
                      value={booking.totalRoom}
                      required
                    />
                  </div>

                  <div class="col-auto">
                    <label for="totalDay">Total Days</label>
                    <input
                      type="number"
                      class="form-control"
                      id="totalDay"
                      name="totalDay"
                      value={calculateTotalDays()}
                      required
                      readonly
                    />
                  </div>

                  <div class="col-auto">
                    <label for="totalAmount">Total Amount</label>
                    <input
                      type="number"
                      class="form-control"
                      id="totalAmount"
                      name="totalAmount"
                      value={booking.totalAmount}
                      required
                      readonly
                    />
                  </div>

                  <div className="d-flex justify-content-center">
                    <div>
                      <input
                        type="submit"
                        class="btn custom-bg bg-color mb-3"
                        value="Book Hotel"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {(() => {
                if (admin) {
                  console.log(admin);
                  return (
                    <div>
                      <input
                        type="submit"
                        className="btn custom-bg bg-color mb-3"
                        value="Add Facilities"
                        onClick={navigateToAddHotelFacility}
                      />
                    </div>
                  );
                }
              })()}

              {(() => {
                if (user) {
                  console.log(user);
                  return (
                    <div>
                      <input
                        type="submit"
                        className="btn custom-bg bg-color mb-3"
                        value="Add Review"
                        onClick={navigateToAddReviewPage}
                      />
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
        <div class="col-sm-2 mt-2">
          <GetHotelFacilities item={hotel} />
        </div>

        <div class="col-sm-2 mt-2">
          <GetHotelReviews item={hotel} />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-sm-12">
          <h2>Other Hotels in {hotel.location.city} Location:</h2>
          <div className="row row-cols-1 row-cols-md-4 g-4">
            {hotels.map((h) => {
              return <HotelCard item={h} />;
            })}
          </div>
        </div>
      </div>
      <br />
      <hr />
      <Footer />
    </div>
  );
};

export default Hotel;

