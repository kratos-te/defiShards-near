import {
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";
import { useColor } from "../hooks";
import { Link, NavLink } from "react-router-dom";

interface Props {
  title: string;
  items?: Array<string>;
  url?: Array<string>;
}

export default function MenuBars({ title, items, url }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const color = useColor();
  return (
    <Menu isOpen={isOpen}>
      <MenuButton
        mx={1}
        px={4}
        _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
        aria-label="Courses"
        fontWeight="700"
        fontFamily="DM Sans"
        fontSize="16px"
        py="30px"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        {title}
      </MenuButton>
      {title == "Listings" || title == "Account" || title == "Console" ? (
        <MenuList
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          paddingY="0"
          mt={"-2"}
        >
          {/* {items.map((item, index) => (
            <NavLink
              key={index}
              end
              to={url[index]}
              style={(navData) => ({
                color: navData.isActive ? "#374151" : "#993ff4",
              })}
            >
              <MenuItem
                _hover={{ bg: color.menuHoverBg, color: color.menuHoverColor }}
                bg={color.menuBg}
                color={color.menuColor}
                textAlign="center"
              >
                {" "}
                {item}{" "}
              </MenuItem>
            </NavLink>
          ))} */}
        </MenuList>
      ) : (
        ""
      )}
    </Menu>
  );
}
