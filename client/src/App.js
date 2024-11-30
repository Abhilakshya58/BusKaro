import './resources/global.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import { useSelector } from 'react-redux';
import AdminHome from './pages/Admin/AdminHome';
import AdminBuses from './pages/Admin/AdminBuses';
import AdminUsers from './pages/Admin/AdminUsers';
import BookNow from './pages/BookNow';
import Booking from './pages/Booking';
import AdminBookings from './pages/Admin/AdminBookings';
import ProfilePage from './pages/ProfilePage'; // Import the ProfilePage component

function App() {

  const {loading} = useSelector(state =>state.alerts);

  return (
    <div>
        {loading && <Loader/>}

        <BrowserRouter>
          <Routes>
              <Route path='/' element={<ProtectedRoute><Home/></ProtectedRoute>}/>
              {/* <Route path='/' element={<Home />} /> */}

              {/* Admin Routes */}
              <Route path='/admin/buses' element={<ProtectedRoute><AdminBuses/></ProtectedRoute>}/>
              <Route path='/admin/users' element={<ProtectedRoute><AdminUsers/></ProtectedRoute>}/>
              <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />

              {/* Auth Routes */}
              <Route path='/register' element={<PublicRoute><Register/></PublicRoute>} />
              <Route path='/login' element={<PublicRoute><Login/></PublicRoute>}/>

              {/* User Routes */}
              <Route path='/book-now/:id' element={<ProtectedRoute><BookNow/></ProtectedRoute>}/>
              <Route path='/bookings' element={<ProtectedRoute><Booking/></ProtectedRoute>}/>
              <Route path='/profile' element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} /> {/* New Profile Page Route */}
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
