import { useAuth } from '../context/user.context';
import { Navigate } from 'react-router-dom';

export default function AuthUser() {
    const { token } = useAuth();

    if (!token) {
        // If the user is not authenticated, redirect to the login page.
        return <Navigate to="/login" />;
    }
}