import s from '../CSS/user.module.css'
import LogoutIcon from '@mui/icons-material/Logout';
import Header from "../components/header"
import AuthUser from '../components/authUser'
import { useEffect, useState, useRef } from "react"
import { useAuth } from '../context/user.context';
import axios from 'axios';

export default function User() {
    <AuthUser />
    const { token, logout } = useAuth();
    const [userData, setUserData] = useState({});

    const fetchData = async () => {

        const response = await axios.post('/getuserdata', {
            token
        }).catch(function (errore) {
            logout();
        });
        if (response.status === 401) {
            logout();
        } else {
            setUserData(response.data.data);
        }
        

    }

    useEffect(() => {
        fetchData()
    },[])

    useEffect(() => {
        console.log(userData);
    }, [userData]);

    const handleLogout = () => {
        logout();
    };

    return (
        <div>
            <Header />
            <div id={s.container}>
                <div id={s.main}>
                    <div id={s.main_left}>
                        <h1 class={s.main_headers}>{userData._id}</h1>
                        <button id={s.logoutButton} onClick={handleLogout}>
                            <LogoutIcon />
                            &nbsp;
                            Logout
                        </button>
                    </div>
                    <div id={s.main_right}>
                        <h1 class={s.main_headers}>Statistics</h1>
                        <p class={s.stats}>Total games won: {userData.wins}</p>
                        <p class={s.stats}>Total games played: {userData.played}</p>
                    </div>
                </div>
            </div>
            
        </div>
    )
}