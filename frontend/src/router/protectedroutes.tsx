import React, { useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyToken } from '../helpers/service'; // Updated to use the service
import useCustomToast from '../hooks/useCustomToast'; // Custom Toast hook
import Spinner from '../components/common/spinner';
import { AxiosError } from 'axios'; // Import AxiosError for better type handling

type AuthProtectedProps = {
    children: ReactNode;
    roles?: string[]; // Optional roles
};

const AuthProtected: React.FC<AuthProtectedProps> = ({ children, roles }) => {
    const dispatch = useDispatch();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<{ role: string } | null>(null);
    const showToast = useCustomToast();

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await verifyToken(); // Verifying token
                const user = response.result; // Adjust according to your response structure
                setUserProfile(user);
                setIsAuthorized(true); // User is authorized
            } catch (error) {
                // Handle token verification failure
                if (error instanceof AxiosError) {
                    showToast('Authorization Failed', error.response?.data.message || 'Please log in again.', 'error');
                } else {
                    showToast('Authorization Failed', 'An unexpected error occurred. Please try again.', 'error');
                }
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [dispatch, showToast]);

    // Show spinner while loading
    if (loading) {
        return <Spinner />;
    }

    // Check if the user has the required role
    if (roles && userProfile && !roles.includes(userProfile.role)) {
        return <Navigate to="/page-not-found" />;
    }

    // Redirect to home if not authorized
    if (!isAuthorized) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

export default AuthProtected;
