import ApiDocs from '../clients/ApiDocs';
import CandidateRegistration from '../pages/candidate_registration';
import CompanyDetailsForm from '../pages/company_registration';
import Dashboard from '../pages/Dashboard';
// import JobMappingPage from '../../../job_mapping';
import JobMelaDetailPage from '../pages/JobMelaDetailPage';
import JobsRegistrationForm from '../pages/jobs_registration';
import Login from '../pages/Login';
import PageNotFound from '../pages/others/pagenotfound';
import Signup from '../pages/signup';

const authProtectedRoutes = [
    { path: '/dashboard', component: <Dashboard /> },
    // { path: '/jobs/map/:job_id', component: <JobMappingPage /> },
    { path: '/jobmela/:jobmela_id', component: <JobMelaDetailPage /> },


];

const publicRoutes = [
    { path: '/signup', component: <Signup /> },
    { path: '/login', component: <Login /> },
    { path: '/api/docs', component: <ApiDocs /> },
    { path: '/candidate/reg', component: <CandidateRegistration /> },
    { path: '/company/registration', component: <CompanyDetailsForm /> },
    { path: '/jobs/add', component: <JobsRegistrationForm /> },
    // Page Not Found route
    { path: '/page-not-found', component: <PageNotFound /> }
];

export { authProtectedRoutes, publicRoutes };
