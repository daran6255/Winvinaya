import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import type { MenuItem } from '../layout/Sidebar';

export const menuItems: { label: string; items: MenuItem[] }[] = [
  {
    label: 'Manage',
    items: [
      { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
      { label: 'Users', icon: <PeopleOutlineIcon />, path: '/users' },
      { label: 'Candidates', icon: <AssignmentIndOutlinedIcon />, path: '/candidates' },
      {
        label: 'Sourcing',
        icon: <CheckCircleOutlineIcon />,
        children: [
          {
            label: 'Candidate Verification',
            path: '/sourcing/verification',
            icon: <CheckCircleOutlineIcon fontSize="small" />,
          },
          {
            label: 'Career Counseling',
            path: '/sourcing/counseling',
            icon: <PeopleOutlineIcon fontSize="small" />,
          },
        ],
      },
      {
        label: 'Training',
        icon: <WorkOutlineIcon />,
        children: [
          {
            label: 'Training Batches',
            path: '/training/batches',
            icon: <WorkOutlineIcon fontSize="small" />,
          },
          {
            label: 'Skill Evaluation',
            path: '/training/skills',
            icon: <AssignmentIndOutlinedIcon fontSize="small" />,
          },
        ],
      },
      {
        label: 'Placement',
        icon: <BusinessOutlinedIcon />,
        children: [
          {
            label: 'Company',
            path: '/placement/company',
            icon: <BusinessOutlinedIcon fontSize="small" />,
          },
          {
            label: 'Jobs',
            path: '/placement/jobs',
            icon: <WorkOutlineIcon fontSize="small" />,
          },
          {
            label: 'Job Mapping',
            path: '/placement/mapping',
            icon: <DashboardOutlinedIcon fontSize="small" />,
          },
          {
            label: 'Interview Status',
            path: '/placement/interview',
            icon: <CheckCircleOutlineIcon fontSize="small" />,
          },
          {
            label: 'Job Melas',
            path: '/placement/jobmelas',
            icon: <PeopleOutlineIcon fontSize="small" />,
          },
        ],
      },
    ],
  },
];
