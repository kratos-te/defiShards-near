import {
  Flex,
  Text,
  Image,
  Grid,
  GridItem,
  Box,
  Show,
  Hide,
  Spacer,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import { useColor } from "../../hooks";
import Phone from "../../assets/img/icons/phone.svg";
import Message from "../../assets/img/icons/message.svg";
import MessageDark from "../../assets/img/icons/message_dark.svg";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Footer() {
  const color = useColor();
  const [nearPrice, setNearPrice] = useState<number>(0);
  const { colorMode } = useColorMode();

  const fetchNearPrice = async () => {
    const res = await axios.get(
      "https://coingecko.p.rapidapi.com/simple/price",
      {
        params: {
          ids: "near",
          vs_currencies: "usd",
        },
        headers: {
          "X-RapidAPI-Key":
            "c29f83791bmshea0a5702a742566p179740jsn1d6db32ce9fb",
          "X-RapidAPI-Host": "coingecko.p.rapidapi.com",
        },
      }
    );
    if (res.data && res.data.near && res.data.near.usd) {
      setNearPrice(res.data.near.usd);
    }
  };

  useEffect(() => {
    fetchNearPrice();
  }, []);

  return (
    <Box pt={100}>
      <Show above="md">
        <Grid
          position={"absolute"}
          bottom="0"
          as="footer"
          width="full"
          paddingY="2"
          paddingX="8"
          alignItems="center"
          templateColumns={"repeat(3, 1fr)"}
          bgColor={color.background2}
          // bgGradient='linear(to-b, #ffffff00,  #ffffff)'
          color={color.cardBorder}
          background={color.background2}
          borderTop="1px solid #D4B5FE"
        >
          <GridItem justifySelf={"left"} display="flex">
            <Text
              as="h3"
              fontSize="14px"
              textAlign="start"
              color={color.currencySymbol}
              fontWeight="bold"
            >
              NEAR
            </Text>
            <Text
              as="h3"
              ml="2"
              fontSize="14px"
              textAlign="start"
              color={color.currencyValue}
            >
              ${nearPrice} USD
            </Text>
          </GridItem>
          <GridItem justifySelf={"center"}></GridItem>
          <GridItem justifySelf={"right"}>
            <Text
              as="h5"
              fontSize="20px"
              textAlign="start"
              color={color.currencyValue}
            >
              FAQ
            </Text>
          </GridItem>
        </Grid>
      </Show>
      <Hide above="md">
        <Grid
          as="footer"
          width="full"
          paddingY="4"
          paddingX="8"
          alignItems="center"
          templateRows={"repeat(2, 1fr)"}
          bgColor={color.background}
          color={color.cardBorder}
          borderTop="1px solid"
        >
          <GridItem>
            <Flex alignItems={"center"} marginLeft={"10px"}>
              <Box>
                <Text
                  as="h3"
                  fontSize="14px"
                  textAlign="start"
                  color={color.currencySymbol}
                  fontWeight="bold"
                >
                  NEAR
                </Text>
                <Text
                  as="h3"
                  fontSize="14px"
                  textAlign="start"
                  color={color.currencyValue}
                >
                  ${nearPrice} USD
                </Text>
              </Box>
              <Spacer />
              <Box>
                <Text
                  as="h3"
                  fontSize="14px"
                  textAlign="start"
                  color={color.currencyValue}
                >
                  FAQ
                </Text>
              </Box>
            </Flex>
          </GridItem>
        </Grid>
      </Hide>
    </Box>
  );
}
