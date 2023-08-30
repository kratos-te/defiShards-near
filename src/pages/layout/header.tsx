import { Link, NavLink } from "react-router-dom";
import { connect, Contract, keyStores, Near } from "near-api-js";
import {
  parseNearAmount,
  formatNearAmount,
} from "near-api-js/lib/utils/format";
import { useState, useEffect } from "react";
import { ReactComponent as LightBtnSvg } from "../../assets/img/icons/button_invert_to_normal.svg";
import { ReactComponent as DarkBtnSvg } from "../../assets/img/icons/button_normal_to_invert.svg";
import exitButtonHover from "../../assets/img/icons/exit-button-hover.svg";
import nearButton from "../../assets/img/icons/near.svg";
import swapButton from "../../assets/img/icons/swap.svg";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Input,
  Box,
  Flex,
  IconButton,
  useColorMode,
  Image,
  Spacer,
  Button,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Hide,
  MenuDivider,
  MenuOptionGroup,
  useColorModeValue,
} from "@chakra-ui/react";
import { BiLogOut as LogoutIcon } from "react-icons/bi";
import { useColor } from "../../hooks";
import Menubar from "../../components/menu";
import { useParams } from "react-router-dom";
import { useNearLogin, useNearContext, useProject } from "../../hooks";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  connectButtonStyle,
  connectButtonStyleDark,
} from "../../theme/ButtonStyles";
import {
  ShortMonthNames,
  TimeDivision,
  TokenDecimals,
} from "../../utils/const";
import { depositButtonStyle } from "../../theme/ButtonStyles";
import {
  GAS_FOR_NFT_TRANSFER,
  STORAGE_AMOUNT,
} from "../../hooks/Near/constants";

const NAV_LINKS = [
  {
    name: "HOME",
    url: "/"
    // items: ["Live Listing", "Register Project"]
  },
  {
    name: "MARKETPLACE",
    url: "/markerplace"
    // items: ["User Dashboard", "Project Dashboard"]
  },
  // {
  //   name: "POINTS",
  //   url: "/"
  //   // items: ["Dashboard", "Payment", "Live Panel"]
  // },
  // {
  //   name: "RAFFLE",
  //   url: "/"
  //   // items: ["Dashboard", "Payment", "Live Panel"]
  // },
  // {
  //   name: "SOCIALS",
  //   url: "/"
  //   // items: ["Dashboard", "Payment", "Live Panel"]
  // }
];

export default function Header() {
  const { projectId } = useParams();
  const { project } = useProject(Number(projectId));
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hovered, setHovered] = useState<boolean>(false);
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<string | null>("");
  const [userWrapBalance, setUserWrapBalance] = useState<string | null>("");
  const [userDepositedBalance, setUserDepositedBalance] = useState<number>(0);
  const [depositBalance, setDepositBalance] = useState<number>(1);
  const [withdrawBalance, setWithdrawBalance] = useState<number>(1);
  const color = useColor();
  const [swapDirection, setSwapDirection] = useState<boolean>(true);
  const { colorMode, toggleColorMode } = useColorMode();
  const buttonStyle = useColorModeValue(
    connectButtonStyle,
    connectButtonStyleDark
  );

  const { isLoggedInNear, accountIdNear, signInNear, signOutNear } =
    useNearLogin();

  const { role, wallet, near } = useNearContext();

  const wrapNear: any = new Contract(wallet, "wrap.testnet", {
    viewMethods: ["ft_balance_of"],
    changeMethods: ["near_deposit", "storage_deposit"]
  });
  const getUserBalance = async () => {
    if (!wallet) return;
    const nearBalance = await (
      await near.account(wallet.accountId)
    ).getAccountBalance();
    const wrapBalance = await wrapNear.ft_balance_of({
      account_id: wallet.accountId
    });
    setUserBalance(nearBalance.available);
    setUserWrapBalance(formatNearAmount(wrapBalance));
  };
  useEffect(() => {
    getUserBalance();
  }, [wallet]);

  const handleConnectNear = () => {
    if (isLoggedInNear) {
      signOutNear();
    } else {
      signInNear();
    }
  };

  const handleExit = () => {
    setDepositOpen(false);
    setDepositBalance(500);
  };

  const handleDeposit = async () => {
    if (!wallet) return;
    const attachedDeposit = parseNearAmount(depositBalance.toString());
    if (swapDirection) {
      const outcome = await wallet.wallet?.signAndSendTransactions({
        transactions: [
          {
            signerId: wallet.accountId,
            receiverId: "wrap.testnet",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "storage_deposit",
                  args: {
                    account_id: wallet.accountId,
                    registration_only: true
                  },
                  gas: "30000000000000",
                  deposit: STORAGE_AMOUNT
                }
              }
            ]
          },
          {
            signerId: wallet.accountId,
            receiverId: "wrap.testnet",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "near_deposit",
                  args: {},
                  gas: GAS_FOR_NFT_TRANSFER,
                  deposit: attachedDeposit!
                }
              }
            ]
          }
        ]
      });
    } else {
      const outcome = await wallet.wallet?.signAndSendTransactions({
        transactions: [
          {
            signerId: wallet.accountId,
            receiverId: "wrap.testnet",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "near_withdraw",
                  args: { amount: attachedDeposit! },
                  gas: GAS_FOR_NFT_TRANSFER,
                  deposit: "1"
                }
              }
            ]
          }
        ]
      });
    }
    getUserBalance();
  };
  const displayAccountId =
    accountIdNear && accountIdNear.length > 20
      ? `${accountIdNear.substring(0, 19)}...`
      : accountIdNear;

  const connectWallet = (
    <Button
      aria-label="Connect Wallet"
      {...buttonStyle}
      onClick={handleConnectNear}
    >
      <Text size="sm" sx={{ pr: 1 }} marginBottom={"0"}>
        {isLoggedInNear ? displayAccountId : "Connect Wallet"}
      </Text>
      {isLoggedInNear && <LogoutIcon />}
    </Button>
  );

  return (
    <>
      <Flex
        as="header"
        width="full"
        position="sticky"
        height={"85px"}
        top={0}
        left={0}
        minHeight="14"
        shadow="md"
        paddingX="8"
        alignItems="center"
        zIndex={10000}
        bgColor={color.background}
        // bgGradient='linear(to-t, #ffffff00, #ffffffee, #ffffff)'
        borderBottom="1px solid #D5B5FF"
      >
        <Flex
          alignItems={"center"}
          width={{ base: "80px", md: "100px", lg: "110px" }}
        >
          <Show above="lg">
            <Link to="/">
              {/* <Image src={color.logoMode} /> */}
              <Image
                className="main-nav-logo"
                src={color.mainLogoMode}
                width="210px"
              />
            </Link>
          </Show>
        </Flex>
        <Spacer />
        <Flex gap="10" alignItems="center" justifyContent="center">
          <Hide above="lg">
            <Link to="/">
              {/* <Image src={color.logoMode} /> */}
              <Image
                className="main-nav-logo"
                src={color.mainLogoMode}
                width="140px"
                marginLeft={"-100px"}
              />
            </Link>
          </Hide>
          <Show above="lg">
            <Flex
              position={"absolute"}
              width={"100%"}
              height={"100px"}
              alignItems={"center"}
              justifyContent={"center"}
              left={"0%"}
            >
              <Flex>
                <NavLink
                  end
                  to={"/"}
                  style={(navData) => ({
                    color: navData.isActive ? color.navLight : color.navDark
                  })}
                >
                  <Menubar
                    title={"DASHBOARD"}
                    // items={["Live Listing", "Register Project"]}
                    // url={["/", "/create"]}
                  />
                </NavLink>
                <NavLink
                  end
                  to={"/markerplace"}
                  style={(navData) => ({
                    color: navData.isActive ? color.navLight : color.navDark
                  })}
                >
                  <Menubar
                    title={"MARKETPLACE"}
                    items={["User Dashboard", "Project Dashboard"]}
                    url={["/markerplace"]}
                  />
                </NavLink>
                {/* <NavLink
                  end
                  to={"https://near-genesis.gitbook.io/"}
                  target="_blank"
                >
                  <Button
                    mx={1}
                    px={4}
                    color={color.navDark}
                    bg={"inherit"}
                    _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
                    aria-label="Courses"
                    fontWeight="700"
                    fontFamily="DM Sans"
                    fontSize="16px"
                    py="30px"
                    display={"flex"}
                    alignItems={"center"}
                    height={"100%"}
                    borderRadius={"none"}
                  >
                    POINTS
                  </Button>
                </NavLink>
                <NavLink
                  end
                  to={
                    "https://near-genesis.gitbook.io/introduction/near-genesis/audits"
                  }
                  target="_blank"
                >
                  <Button
                    mx={1}
                    px={4}
                    color={color.navDark}
                    bg={"inherit"}
                    _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
                    aria-label="Courses"
                    fontWeight="700"
                    fontFamily="DM Sans"
                    fontSize="16px"
                    py="30px"
                    display={"flex"}
                    alignItems={"center"}
                    height={"100%"}
                    borderRadius={"none"}
                  >
                    RAFFLE
                  </Button>
                </NavLink>
                <NavLink
                  end
                  to={
                    "https://near-genesis.gitbook.io/introduction/near-genesis/audits"
                  }
                  target="_blank"
                >
                  <Button
                    mx={1}
                    px={4}
                    color={color.navDark}
                    bg={"inherit"}
                    _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
                    aria-label="Courses"
                    fontWeight="700"
                    fontFamily="DM Sans"
                    fontSize="16px"
                    py="30px"
                    display={"flex"}
                    alignItems={"center"}
                    height={"100%"}
                    borderRadius={"none"}
                  >
                    SOCIALS
                  </Button>
                </NavLink> */}
               
              </Flex>
            </Flex>
          </Show>
        </Flex>
        <Spacer />
        <Flex
          gap="5"
          as="div"
          width="ls"
          justifyContent="center"
          alignItems="center"
        >
          <Show above="lg">
            {/* <IconButton
              aria-label="Switch theme"
              icon={<color.changeMode />}
              isRound
              variant="solid"
              onClick={toggleColorMode}
            /> */}
            {/* <Button w={50}
              onClick={toggleColorMode}> */}
            <Box
              zIndex={999999}
              w={45}
              onClick={toggleColorMode}
              className="color-mode-btn"
            >
              {colorMode === "light" ? <DarkBtnSvg /> : <LightBtnSvg />}
            </Box>
            {/* <Box zIndex={999999} onClick={onOpen} className="color-mode-btn">
              <Image src={swapButton} boxSize="50px" />
            </Box> */}
            {/* </Button> */}
            {connectWallet}
          </Show>
          <Hide above="lg">
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="outline"
              />
              <MenuList color={color.blue} paddingX="10px" zIndex={999999}>
                {NAV_LINKS.map((navLink, index) =>
                  role === "admin" ||
                  (role !== "admin" && navLink.name !== "Console") ? (
                    <Link to={navLink.url}>
                      <Box>
                        <MenuOptionGroup
                          color={color.contact}
                          fontSize={"18px"}
                          defaultValue="desc"
                          title={navLink.name}
                        >
                          {/* {navLink.map((m, i) => (
                          <MenuItem key={i}>
                            <Link to={m}>
                              <Text width={"100%"}>{navLink.items[i]}</Text>
                            </Link>
                          </MenuItem>
                        ))} */}
                        </MenuOptionGroup>
                        <MenuDivider />
                      </Box>
                    </Link>
                  ) : (
                    role !== "admin" &&
                    navLink.name !== "Console" && (
                      <Box>
                        <MenuItem key={index}>
                          <Link to={navLink.url[0]}>
                            <Text width={"100%"}>{navLink.name}</Text>
                          </Link>
                        </MenuItem>
                        <MenuDivider />
                      </Box>
                    )
                  )
                )}
               
              </MenuList>
            </Menu>
          </Hide>
        </Flex>
      </Flex>
      <Hide above="lg">
        <Box height={"80px"}></Box>
      </Hide>

      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />
        <ModalContent
          zIndex={999999999}
          border="3px solid"
          borderColor={"black"}
        >
          <ModalCloseButton />
          <ModalBody>
            <VStack
              width={{ md: "400px", sm: "400px" }}
              border="1px solid"
              borderColor={color.cardBorder}
              borderRadius="20px"
              margin="30px 0px"
            >
              <Flex flexDirection={"column"} width={"87%"}>
                <Text
                  as="h1"
                  fontStyle="normal"
                  fontWeight="500"
                  fontSize="20px"
                  color={"#26A17B"}
                  marginTop={"20px"}
                >
                  SWAP
                </Text>
                <Text
                  as="h2"
                  fontStyle="normal"
                  fontWeight="500"
                  fontSize="14px"
                  lineHeight={"18px"}
                  textAlign={"justify"}
                  paddingY="4"
                  color={color.cardSubtitle}
                >
                  {`You are about to swap ${depositBalance} ` +
                    (swapDirection ? `NEAR` : `wNEAR`) +
                    ` with ${depositBalance} ` +
                    (swapDirection ? `wNEAR` : `NEAR`) +
                    `. Please input the amount intended.`}
                </Text>
              </Flex>
              <Flex
                flexDirection={"column"}
                alignItems={"center"}
                paddingBottom={4}
              >
                <Input
                  minHeight={"60px"}
                  color={color.cardTitle}
                  fontSize={"36px"}
                  fontWeight={400}
                  textAlign={"center"}
                  border={"none"}
                  type={"number"}
                  max={userBalance!}
                  min=""
                  width={"87%"}
                  defaultValue={depositBalance.toLocaleString()}
                  onChange={(e) => setDepositBalance(Number(e.target.value))}
                />
                <Text
                  as="h2"
                  fontStyle="normal"
                  fontWeight="500"
                  fontSize="14px"
                  lineHeight={"18px"}
                  textAlign={"center"}
                  color={color.cardSubtitle}
                >
                  {swapDirection ? `Near` : `wNEAR`}
                </Text>
              </Flex>
              <Flex
                flexDirection={"column"}
                width="87%"
                justifyContent={"center"}
              >
                <Flex
                  minWidth="100%"
                  minHeight="14"
                  paddingY="2"
                  paddingX="2"
                  alignItems="center"
                  border="1px solid"
                  borderColor={color.cardSubtitle}
                  borderRadius="10px"
                  bgColor={color.cardBg}
                >
                  <Flex width="100%" margin="5px">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      NEAR Balance
                    </Text>
                  </Flex>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex
                      justifyContent="end"
                      margin="5px"
                      alignItems={"center"}
                    >
                      <Image src={nearButton} boxSize="25px" />
                      <Text
                        as="h2"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        marginBottom={"0px"}
                        color={color.cardSubtitle}
                        overflow={"hidden"}
                      >
                        {parseFloat(
                          formatNearAmount(userBalance?.toLocaleString()!)
                        ).toFixed(2)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex
                  minWidth="100%"
                  minHeight="14"
                  marginY={4}
                  paddingY="2"
                  paddingX="2"
                  alignItems="center"
                  justifyContent={"center"}
                >
                  <Button
                    onClick={() => {
                      setSwapDirection(!swapDirection);
                    }}
                  >
                    {swapDirection ? `↓` : `↑`}
                  </Button>
                </Flex>
                <Flex
                  minWidth="100%"
                  minHeight="14"
                  marginY={4}
                  paddingY="2"
                  paddingX="2"
                  alignItems="center"
                  border="1px solid"
                  borderColor={color.cardSubtitle}
                  borderRadius="10px"
                  bgColor={color.cardBg}
                >
                  <Flex width="100%" margin="5px">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      Wrapped Near Balance
                    </Text>
                  </Flex>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex justifyContent="end" margin="5px">
                      <Text
                        as="h2"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardSubtitle}
                      >
                        {userWrapBalance}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex minWidth="100%" minHeight="14" justifyContent="center">
                <Button
                  width="87%"
                  onClick={() => {
                    handleDeposit();
                  }}
                  isDisabled={Number(userBalance).toLocaleString() == "0"}
                  {...depositButtonStyle}
                >
                  SWAP
                </Button>
              </Flex>
            </VStack>
            {/* <Lorem count={2} /> */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
