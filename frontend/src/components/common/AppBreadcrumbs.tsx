import { Breadcrumbs, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{
        mb: 2,
        fontSize: "0.875rem",
      }}
    >
      {items.map((item, idx) =>
        item.path ? (
          <MuiLink
            key={idx}
            component={RouterLink}
            to={item.path}
            underline="hover"
            color="inherit"
          >
            {item.label}
          </MuiLink>
        ) : (
          <Typography
            key={idx}
            color="text.primary"
            sx={{ fontWeight: 500 }}
          >
            {item.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
}
