import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Homepage from './pages/homepage.js';
import User from './pages/user';
import Login from './pages/login';
import TicTacToe from './pages/TicTacToe';
import Checkers from './pages/checkers';
import ConnectFour from './pages/connect-four';
import Signup from './pages/signup';
import PrivateRoute from "./pages/PrivateRoute";
import { AuthProvider } from './context/user.context';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
              <Route index element={<Homepage />} />
              <Route path="/homepage" element={<Homepage />} />
              <Route element={<PrivateRoute />}>
                <Route exact path="/user" element={<User />} />
                <Route path="/TicTacToe" element={<TicTacToe />} />
                <Route path="/checkers" element={<Checkers />} />
                <Route path="/connect-four" element={<ConnectFour />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route exact path="/signup" element={<Signup />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
