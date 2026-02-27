import { BrowserRouter as Router, Routes, Route  } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import PublishBike from "./pages/PublishBike";
// import BikeList from "./pages/BikeList";
import BikeDetails from "./pages/BikeDetails";
import ExploreBikes from "./pages/ExploreBikes";
import BookingPage from "./pages/BookingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/publish-bike" element={<PublishBike />} />
      {/* <Route path="/bikes" element={<BikeList />} /> */}
      {/* <Route path="/explore" element={<ExploreBikes/>} /> */}
      {/* <Route path="/book/:bikeId" element={<BookingPage />} /> */}
      <Route path="/bikes" element={<ExploreBikes />} />
      <Route path="/bikes/:bikeId" element={<BikeDetails />} />
      <Route path="/booking/:bikeId" element={<BookingPage />} />
    </Routes>
  );
}

export default App;