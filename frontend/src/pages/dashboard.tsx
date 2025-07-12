import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { Box, Heading, Text } from '@chakra-ui/react';
import DashboardNavbar from '../components/dashboard/Dashboard_Navbar';
import { LoginResponse } from '../helpers/model';
import JobmelaLayout from '../components/dashboard/Jobmela_layout';
import Footer from '../components/common/Footer';

type UserType = Exclude<LoginResponse["result"], string>;

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { user: LoginResponse["result"] })?.user;

  const user: UserType | null = typeof result === "string" ? null : result;

  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null; // Or a loading spinner

  return (
    <>
      <DashboardNavbar user={user} />
      <JobmelaLayout />
      <Footer />

    </>
  );
};

export default Dashboard;
