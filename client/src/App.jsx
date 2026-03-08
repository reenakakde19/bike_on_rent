import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import PublishBike from "./pages/PublishBike";
import BikeDetails from "./pages/BikeDetails";
import UserDashboard from "./pages/UserDashboard";
import ExploreBikes from "./pages/ExploreBikes";
import BookingPage from "./pages/BookingPage";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/publish-bike" element={<PublishBike />} />
        <Route path="/bikes" element={<ExploreBikes />} />
        <Route path="/bikes/:bikeId" element={<BikeDetails />} />
        <Route path="/booking/:bikeId" element={<BookingPage />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;