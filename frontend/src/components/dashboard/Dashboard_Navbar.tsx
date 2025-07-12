import React from "react";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ChevronDown,
  Menu as MenuIcon,
  LogOut,
  Settings,
  BookOpenCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { logout } from "../../helpers/service"; // assuming you have a logout function
import { useNavigate } from "react-router-dom";
import useCustomToast from '../../hooks/useCustomToast';

// Replace with your logo path
const logoUrl = "assets/images/WVIS_Logo.png";

interface DashboardNavbarProps {
  user: {
    id: number;
    name: string;
    email: string;
    verified: boolean;
    role: string;
  };
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user }) => {
  const userName = user.name;
  const { isOpen, onOpen, onClose } = useDisclosure();
	const navigate = useNavigate();
	const showToast = useCustomToast();

	const handleLogout = async () => {
	try {
		await logout();
		localStorage.removeItem("user"); // Optional: clean up user data
		showToast("Logged Out", "You have been successfully logged out.", "success");
		navigate("/login");
	} catch (error) {
		console.error("Logout error:", error);
		showToast("Logout Failed", "There was an error during logout.", "error");
	}
	};


  const menuBg = useColorModeValue("white", "gray.800");

  return (
    <Box px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        {/* Left Logo */}
        <Box display="flex" alignItems="center">
          <Image src={logoUrl} alt="Company Logo" h="40px" />
        </Box>

        {/* Desktop Menu */}
        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDown />} variant="ghost">
              Registration
            </MenuButton>
            <MenuList bg={menuBg}>
              <MenuItem as={Link} to="/candidates/registration">
                Candidate Registration
              </MenuItem>
              <MenuItem as={Link} to="/company/registration">
                Company Registration
              </MenuItem>
              <MenuItem as={Link} to="/jobs/add">
                Add Job Description
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Avatar/Profile */}
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="ghost"
              cursor="pointer"
              minW={0}
              aria-label="User menu"
            >
              <Avatar name={userName} size="sm" />
            </MenuButton>
            <MenuList bg={menuBg}>
              <MenuItem icon={<Settings size={16} />} as={Link} to="/settings">
                Settings
              </MenuItem>
              <MenuItem icon={<BookOpenCheck size={16} />} as={Link} to="/api/docs">
                API Docs
              </MenuItem>
			<MenuItem icon={<LogOut size={16} />} onClick={handleLogout}>
			Logout
			</MenuItem>

            </MenuList>
          </Menu>
        </HStack>

        {/* Mobile Hamburger */}
        <IconButton
          size="md"
          icon={<MenuIcon />}
          aria-label="Open Menu"
          display={{ md: "none" }}
          onClick={onOpen}
          color="ui.main"
        />
      </Flex>

      {/* Mobile Drawer Menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader bg="ui.secondary" color="white">
            Menu
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="start">
              <Box>
                <Text fontWeight="bold" color="ui.main">
                  Registration
                </Text>
                <VStack pl={4} align="start">
                  <Button as={Link} to="/candidates/registration" variant="ghost" onClick={onClose}>
                    Candidate Registration
                  </Button>
                  <Button as={Link} to="/company/registration" variant="ghost" onClick={onClose}>
                    Comapany Registration
                  </Button>
                  <Button as={Link} to="/jobs/add" variant="ghost" onClick={onClose}>
                    Add Job Description
                  </Button>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="bold" color="ui.main">
                  Account
                </Text>
                <VStack pl={4} align="start">
                  <Button as={Link} to="/settings" leftIcon={<Settings size={16} />} variant="ghost" onClick={onClose}>
                    Settings
                  </Button>
                  <Button as={Link} to="/api-docs" leftIcon={<BookOpenCheck size={16} />} variant="ghost" onClick={onClose}>
                    API Docs
                  </Button>
                  <Button leftIcon={<LogOut size={16} />} variant="ghost" onClick={handleLogout}>
                  Logout
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default DashboardNavbar;
