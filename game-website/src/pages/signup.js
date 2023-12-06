import { Link } from "react-router-dom";
import Header from "../components/header";
import { useState } from 'react';
import { useAuth } from '../context/user.context';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Invalid from '../components/invalid'
import s from "../CSS/login.module.css"


export default function Signup() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordconf, setPasswordConf] = useState('');
    const [condition, setCondition] = useState('')
    const [invalid, setInvalid] = useState(false);

    const redirect = () => {
        const redirectTo = location.search.replace("?redirectTo=", "");
        navigate(redirectTo ? redirectTo : "/user");
    }

    const handleSignup = async (e) => {
        e.preventDefault(); // Prevent the form from submitting the traditional way.
        setInvalid(false);

        if (username.length <= 5) {
            setInvalid(true)
            setCondition('userShort')
        } else if (password != passwordconf) {
            setCondition('notMatch')
            setInvalid(true)
        } else if (password.length <= 7) {
            setCondition('passShort')
            setInvalid(true)
        }
        else if (invalid == false) {
            try {
                const response = await axios.post('/register', {
                    username,
                    password,
                });

                if (response.data.result === 'USER_ADDED') {
                    const response = await axios.post('/login', {
                        username,
                        password,
                    });

                    if (response.data.token) {
                        login(response.data.token);
                        redirect();
                    }
                    else {
                    }
                }
                else {
                    setInvalid(true)
                    setCondition('exists')
                }
            }
            catch (error) {
                console.error(error);
            }
        }

    };

    return (
        <div>
            <Header />
            <body>
                <div id={s.formContainer}>
                    <Invalid invalid={invalid} condition={condition} />
                    <div id={s.formBox}>
                        <h1>
                            Signup
                        </h1>
                        <form onSubmit={handleSignup}>
                            <label for="text">Username</label>
                            <input type="text" onChange={(e) => setUsername(e.target.value)} id={s.username} name="username"></input>

                            <label for="password">Password</label>
                            <input type="password" onChange={(e) => setPassword(e.target.value)} id="password" name="password"></input>

                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" onChange={(e) => setPasswordConf(e.target.value)} id="confirmPassword" name="confirmPassword"></input>

                            <button type="submit" id={s.button}>Signup</button>
                        </form>
                        <p>Have an account already? <Link to="/login" className={s.link}>Login</Link></p>
                    </div> 
                </div>
            </body>
        </div>
    )
}