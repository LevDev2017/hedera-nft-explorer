import { Container, Box } from "@mui/material";
import { Outlet } from "react-router-dom"

export const Layout = () => {
  return (
    <Container maxWidth={false}>
      <Box sx={{ my: 4 }}>
        <Outlet />
      </Box>
    </Container>
  );
}