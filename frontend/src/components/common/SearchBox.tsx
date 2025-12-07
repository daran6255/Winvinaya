import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

export default function SearchBox() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[100],
        px: 2,
        py: 0.5,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        width: 250,
      }}
    >
      <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
      <InputBase
        placeholder="Search here"
        sx={{ flex: 1, fontSize: "0.9rem" }}
      />
    </Box>
  );
}
