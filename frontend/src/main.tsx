import { ChakraProvider } from "@chakra-ui/react"
import ReactDOM from "react-dom/client"
import { StrictMode } from "react"
import theme from "./theme"
import Route from './router';
import 'react-phone-input-2/lib/style.css';


ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <Route />
    </ChakraProvider>
  </StrictMode>,
)
