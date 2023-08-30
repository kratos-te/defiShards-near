import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Image,
  VStack,
  HStack,
  Progress,
  Button,
  Icon,
  Input,
  Hide,
  Show,
  Link,
  Img,
} from "@chakra-ui/react";
import { BiChevronDown as ArrowDownIcon } from "react-icons/bi";
import { BiChevronLeft as ArrowLeftIcon } from "react-icons/bi";
import { AiOutlineInstagram as InstagramIcon } from "react-icons/ai";
import { GiCoins as CoingeckoIcon } from "react-icons/gi";
import { BiXCircle as ExitIcon } from "react-icons/bi";

import { RiGlobalLine as CoingekoIcon } from "react-icons/ri";
import { AiFillTwitterCircle as TwitterIcon } from "react-icons/ai";
import { IoInformationCircleSharp as InfoIcon } from "react-icons/io5";
import { TbBrandMeta as MetaIcon } from "react-icons/tb";
// import { BsCCircleFill as CoingekoIcon } from "react-icons/bs";
import { Tooltip } from "@chakra-ui/react";
import {
  useColor,
  useProject,
  useBalance,
  useNearLogin,
  useNearContext,
  useDepositInToken,
  useWithdrawInToken,
} from "../hooks";
import RuleCard from "../components/RuleCard";
import Loading from "../components/Loading";
import { ShortMonthNames, TimeDivision, TokenDecimals } from "../utils/const";
import { depositButtonStyle, withdrawButtonStyle } from "../theme/ButtonStyles";
import liveListing from "../assets/img/icons/live-listing-small.svg";
import cliffArrow from "../assets/img/icons/arrow-green-short.svg";
import releaseArrow from "../assets/img/icons/arrow-green.svg";
import exitButton from "../assets/img/icons/exit-button.svg";
import exitButtonHover from "../assets/img/icons/exit-button-hover.svg";
import { FtContract } from "../hooks/Near/classWrappers";
import { usdt, usdc, wnear } from "../utils/tokens";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { convertToFloat, cutDecimal } from "../utils/convert";

export default function Listing() {
  const navigate = useNavigate();
  const now = Date.now();
  const { projectId } = useParams();
  const { project } = useProject(Number(projectId));
  const { getBalance } = useBalance();
  const [hovered, setHovered] = useState<boolean>(false);

  const color = useColor();
  const { isLoggedInNear, accountIdNear } = useNearLogin();
  const { config, initFtContract } = useNearContext();
  const inTokenContract = new FtContract(initFtContract());
  const { projectDepositInToken } = useDepositInToken();
  const { projectWithdrawInToken } = useWithdrawInToken();
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [userDepositedBalance, setUserDepositedBalance] = useState<string>("0");
  const [depositBalance, setDepositBalance] = useState<number>(1);
  const [withdrawBalance, setWithdrawBalance] = useState<number>(1);
  const [decimals, setDecimals] = useState<number>(6);

  const getDepositedBalance = async () => {
    const balance = await getBalance(Number(projectId));
    setUserDepositedBalance(balance);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleExit = () => {
    setDepositOpen(false);
    setWithdrawOpen(false);
    setDepositBalance(500);
    setWithdrawBalance(1);
  };

  const handleDeposit = async (contractId: string) => {
    if (depositBalance <= 0) return;
    const ftContract = new FtContract(initFtContract(contractId));
    await projectDepositInToken({
      accountId: accountIdNear,
      projectId: Number(projectId),
      ftContract,
      amount: depositBalance,
    });
  };

  const handleWithdraw = async (contractId: string) => {
    if (withdrawBalance <= 0) return;
    const ftContract = new FtContract(initFtContract(contractId));
    await projectWithdrawInToken({
      projectId: Number(projectId),
      amount: withdrawBalance,
      ftContract,
    });
  };

  const getUserBalance = async (contractId: string) => {
    const ftContract = new FtContract(initFtContract(contractId));
    let balance = await ftContract.getFtBalanceOfOwnerFormatted(accountIdNear);
    setUserBalance(balance);
  };

  const getDecimals = async (contractId: string) => {
    const ftContract = new FtContract(initFtContract(contractId));
    const metadata = await ftContract!.getFtMetadata();
    setDecimals(metadata.decimals);
  };

  useEffect(() => {
    if (isLoggedInNear) {
      getDepositedBalance();
    }
  }, [isLoggedInNear]);

  if (project.isLoading || project.isError) return <Loading />;
  else {
    const inToken =
      project.value.in_token_account_id === config.usdtContractId
        ? usdt
        : project.value.in_token_account_id === config.usdcContractId
        ? usdc
        : wnear;

    getDecimals(project.value.out_token_account_id);
    getUserBalance(project.value.in_token_account_id);
    const inTokenDecimals =
      project.value.in_token_account_id == config.usdcContractId
        ? TokenDecimals.usdc
        : project.value.in_token_account_id == config.usdtContractId
        ? TokenDecimals.usdt
        : TokenDecimals.wnear;
    const startTime = new Date(project.value.start_time / TimeDivision);
    const endTime = new Date(project.value.end_time / TimeDivision);
    const projectDuration =
      project.value.end_time / TimeDivision -
      project.value.start_time / TimeDivision;
    const expiredDuration = now - project.value.start_time / TimeDivision;
    const activated = project.value.start_time / TimeDivision > now ||
      project.value.end_time / TimeDivision < now ||
      !project.value.is_activated ||
      !project.value.is_published ||
      !isLoggedInNear
        ? false
        : true;
    const ended = project.value.end_time / TimeDivision < now ? true : false;
    const remainDuration = project.value.end_time / TimeDivision - now;
    const remainTime = new Date(remainDuration);
    const progressValue = project.value.start_time / TimeDivision > now ||
      project.value.end_time / TimeDivision < now ||
      !project.value.is_activated ||
      !project.value.is_published
        ? 0
        : (100 * expiredDuration) / projectDuration;
    const startingPrice = convertToFloat(
      project.value.starting_price,
      5,
      inTokenDecimals
    );
    const softCap =
      convertToFloat(project.value.total_tokens, 5, decimals) * startingPrice;
    const estimatedTokenPurchased =
      softCap > convertToFloat(project.value.total_deposits, 5, inTokenDecimals)
        ? convertToFloat(userDepositedBalance, 5, inTokenDecimals) /
          startingPrice
        : project.value.total_deposits === "0"
        ? 0
        : (convertToFloat(project.value.total_tokens, 5, decimals) *
            convertToFloat(userDepositedBalance, 5, inTokenDecimals)) /
          convertToFloat(project.value.total_deposits, 5, inTokenDecimals);
    const liveTokenPrice =
      softCap > convertToFloat(project.value.total_deposits, 5, inTokenDecimals)
        ? startingPrice
        : convertToFloat(project.value.total_deposits, 5, inTokenDecimals) /
          convertToFloat(project.value.total_tokens, 5, decimals);

    const mainColor = activated ? "#34D399" : color.main;
    return (
      <>
        <Flex>
          <Button
            variant="ghost"
            colorScheme="purple"
            leftIcon={<ArrowLeftIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Flex>
        <Flex
          minHeight="14"
          minWidth="12"
          width="100%"
          shadow="lg"
          paddingY="4"
          paddingX="8"
          alignItems="center"
          border="1px solid"
          borderColor={color.cardBorder}
          backgroundColor={color.cardBg}
          borderRadius="20px"
          flexDirection="column"
        >
          <Show above="sm">
            <Flex width={"100%"} padding={"25px"}>
              {/* <Show above="sm">
                <Flex>
                  <Text color={color.cardSubtitle}>Details</Text>
                  <Icon color={color.cardSubtitle} as={ArrowDownIcon} />
                </Flex>
              </Show> */}
              <Flex mr={"auto"}>
                <HStack spacing={4}>
                  {project.value.coingecko == null ||
                  project.value.coingecko === "" ? (
                    <></>
                  ) : (
                    <Link
                      bgColor={color.facebookBtnBg}
                      borderRadius={"50%"}
                      width={"37px"}
                      height={"37px"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      transition={"0.1s"}
                      _hover={{ bgColor: "#333333" }}
                      href={project.value.coingecko}
                      isExternal
                    >
                      <Icon
                        transition={"0.1s"}
                        as={CoingekoIcon}
                        color={color.metaIcon}
                        boxSize={9}
                        zIndex={10}
                      />
                    </Link>
                  )}
                  {project.value.facebook == null ||
                  project.value.facebook === "" ? (
                    <></>
                  ) : (
                    <Link
                      bgColor={color.facebookBtnBg}
                      borderRadius={"50%"}
                      width={"37px"}
                      height={"37px"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      transition={"0.1s"}
                      _hover={{ bgColor: "#3763DA" }}
                      href={project.value.facebook}
                      isExternal
                    >
                      <Icon
                        mt={"1px"}
                        as={MetaIcon}
                        color={color.metaIcon}
                        boxSize={8}
                      />
                    </Link>
                  )}
                  {project.value.twitter == null ||
                  project.value.twitter === "" ? (
                    <></>
                  ) : (
                    <Link href={project.value.twitter} isExternal>
                      <Icon
                        transition={"0.1s"}
                        as={TwitterIcon}
                        color={color.socialBtn}
                        boxSize={10}
                        _hover={{ color: "#2079FF" }}
                      />
                    </Link>
                  )}
                  {project.value.instagram == null ||
                  project.value.instagram == "" ? (
                    <></>
                  ) : (
                    <Link
                      bg={color.facebookBtnBg}
                      borderRadius={"50%"}
                      width={"37px"}
                      height={"37px"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      transition={"0.1s"}
                      _hover={{
                        bg: "linear-gradient(#a03dfb, #ff8538)",
                      }}
                      href={project.value.instagram}
                      isExternal
                    >
                      <Icon
                        transition={"0.1s"}
                        as={InstagramIcon}
                        color={color.metaIcon}
                        boxSize={8}
                        // borderColor={color.metaIcon}
                        // _hover={{ color: color.cardBg }}
                      />
                    </Link>
                  )}
                  <Tooltip
                    hasArrow
                    label={project.value.description}
                    placement="right-start"
                    bg={"#10B981"}
                  >
                    <Box>
                      <Icon
                        transition={"0.1s"}
                        as={InfoIcon}
                        color={color.socialBtn}
                        boxSize={10}
                        border={"1px solid"}
                        borderRadius={"50%"}
                        borderColor={color.socialBtn}
                        _hover={{ color: "#76DEFF", borderColor: "#76DEFF" }}
                      />
                    </Box>
                  </Tooltip>
                </HStack>
              </Flex>
              <Flex ml={"auto"}>
                <Text color={color.cardSubtitle}>Details</Text>
                <Icon color={color.cardSubtitle} as={ArrowDownIcon} />
              </Flex>
            </Flex>
          </Show>
          <Hide above="sm">
            <Flex width={"100%"} justifyContent={"center"} mb={"30px"}>
              <HStack spacing={4}>
                {project.value.coingecko == null ||
                project.value.coingecko === "" ? (
                  <></>
                ) : (
                  <Link
                    bgColor={color.facebookBtnBg}
                    borderRadius={"50%"}
                    width={"37px"}
                    height={"37px"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    display={"flex"}
                    transition={"0.1s"}
                    _hover={{ bgColor: "#333333" }}
                    href={project.value.coingecko}
                    isExternal
                  >
                    <Icon
                      transition={"0.1s"}
                      as={CoingekoIcon}
                      color={color.metaIcon}
                      boxSize={9}
                      zIndex={10}
                    />
                  </Link>
                )}
                {project.value.facebook == null ||
                project.value.facebook === "" ? (
                  <></>
                ) : (
                  <Link
                    bgColor={color.facebookBtnBg}
                    borderRadius={"50%"}
                    width={"37px"}
                    height={"37px"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    display={"flex"}
                    transition={"0.1s"}
                    _hover={{ bgColor: "#3763DA" }}
                    href={project.value.facebook}
                    isExternal
                  >
                    <Icon
                      mt={"1px"}
                      as={MetaIcon}
                      color={color.metaIcon}
                      boxSize={8}
                    />
                  </Link>
                )}
                {project.value.twitter == null ||
                project.value.twitter === "" ? (
                  <></>
                ) : (
                  <Link href={project.value.twitter} isExternal>
                    <Icon
                      transition={"0.1s"}
                      as={TwitterIcon}
                      color={color.socialBtn}
                      boxSize={10}
                      _hover={{ color: "#2079FF" }}
                    />
                  </Link>
                )}
                {project.value.instagram == null ||
                project.value.instagram === "" ? (
                  <></>
                ) : (
                  <Link
                    bg={color.facebookBtnBg}
                    borderRadius={"50%"}
                    width={"37px"}
                    height={"37px"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    display={"flex"}
                    transition={"0.1s"}
                    _hover={{
                      bg: "linear-gradient(#a03dfb, #ff8538)",
                    }}
                    href={project.value.instagram}
                    isExternal
                  >
                    <Icon
                      transition={"0.1s"}
                      as={InstagramIcon}
                      color={color.metaIcon}
                      boxSize={8}
                      // borderColor={color.metaIcon}
                      // _hover={{ color: color.cardBg }}
                    />
                  </Link>
                )}
                <Tooltip
                  hasArrow
                  label={project.value.description}
                  placement="right-start"
                  bg={"#10B981"}
                >
                  <Box>
                    <Icon
                      transition={"0.1s"}
                      as={InfoIcon}
                      color={color.socialBtn}
                      boxSize={10}
                      border={"1px solid"}
                      borderRadius={"50%"}
                      borderColor={color.socialBtn}
                      _hover={{ color: "#76DEFF", borderColor: "#76DEFF" }}
                    />
                  </Box>
                </Tooltip>
              </HStack>
            </Flex>
          </Hide>
          <VStack width="100%" spacing="24px">
            <Image src={"/logos/" + project.value.logo} boxSize="200px" />
            <Text
              fontFamily="DM Sans"
              fontSize="35px"
              textAlign="center"
              color={color.green}
            >
              DEPOSIT IS{" "}
              {project.value.is_activated &&
              project.value.is_published &&
              project.value.end_time / TimeDivision > Date.now() &&
              project.value.start_time / TimeDivision < Date.now()
                ? "ACTIVE"
                : "INACTIVE"}
            </Text>
            <Text
              fontFamily="Noto Sans Gujarati"
              fontWeight="400"
              fontSize="36px"
              textAlign="center"
              color={color.cardSubtitle}
            >
              {ended
                ? "Ended"
                : `Ending in ${
                    remainTime.getUTCDate() - 1
                  } days ${remainTime.getUTCHours()} hours ${remainTime.getUTCMinutes()} mins`}
            </Text>
            <Flex minWidth="100%">
              <Text as="h5" fontSize="10px" textAlign="start" width="50%">
                {ShortMonthNames[startTime.getMonth()]} {startTime.getDate()},{" "}
                {startTime.getFullYear()}
              </Text>
              <Text as="h5" fontSize="10px" textAlign="end" width="50%">
                {ShortMonthNames[endTime.getMonth()]} {endTime.getDate()},{" "}
                {endTime.getFullYear()}
              </Text>
            </Flex>
            <Progress
              hasStripe
              className="progress-bar"
              // height="24px"
              marginTop="10px !important"
              minWidth="100%"
              borderRadius="4px"
              value={progressValue}
              sx={{
                "& > div": {
                  background:
                    "linear-gradient(90deg, rgba(129,235,161,1), rgba(156,235,142,1), rgba(226,235,95,1), rgba(129,235,161,1) , rgba(129,235,161,1))",
                },
              }}
            />
            <Flex alignItems="center">
              <Box
                width="19px"
                height="19px"
                borderRadius="19px"
                bgColor={color.green}
              ></Box>
              <Text
                fontSize="14px"
                textAlign="center"
                padding="2px 0px 0px 8px"
                color={color.green}
                marginBottom={0}
              >
                Currently Raised:{" "}
                {convertToFloat(
                  project.value.total_deposits,
                  5,
                  inTokenDecimals
                )}{" "}
                {inToken.name}
              </Text>
            </Flex>
          </VStack>

          <Show above="md">
            <Flex width="100%" margin="36px" justifyContent="space-between">
              <VStack
                spacing="40px"
                width={{ lg: "400px", md: "250px", sm: "150px" }}
                paddingX="24px"
              >
                <Flex width="100%" flexDirection={"column"}>
                  <Text
                    as="h1"
                    fontSize="40px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    {project.value.title}
                  </Text>
                  <Text
                    as="h2"
                    fontSize="14px"
                    textAlign="start"
                    marginTop="0px"
                    color={color.cardSubtitle}
                  >
                    {project.value.sub_title}
                  </Text>
                </Flex>
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
                  <Box width="100%">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      Live Deposits
                    </Text>
                    <Text
                      as="h2"
                      fontSize="18px"
                      textAlign="start"
                      marginTop="10px"
                      color={color.cardSubtitle}
                    >
                      {convertToFloat(
                        project.value.total_deposits,
                        5,
                        inTokenDecimals
                      ).toLocaleString()}
                    </Text>
                  </Box>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex margin="5px" justifyContent="end">
                      <Text
                        fontSize="0.7vw"
                        textAlign="end"
                        marginTop="10px"
                        width="max-content"
                        color={color.cardSubtitle}
                        marginBottom={"0px"}
                        padding={"10px 0px"}
                        lineHeight={0}
                      >
                        {inToken.name}
                      </Text>
                    </Flex>
                    <Flex justifyContent="end" margin="5px">
                      <Image src={inToken.icon} boxSize="25px" />
                      <Text
                        as="h1"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardTitle}
                      >
                        {inToken.symbol}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
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
                  <Box width="100%" margin="5px">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      Total Tokens On Sale
                    </Text>
                    <Text
                      as="h2"
                      fontSize="18px"
                      textAlign="start"
                      marginTop="10px"
                      color={color.cardSubtitle}
                    >
                      {convertToFloat(
                        project.value.total_tokens,
                        5,
                        decimals
                      ).toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Flex
                      width="100%"
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          fontSize="0.7vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardSubtitle}
                          marginBottom={"0px"}
                          padding={"10px 0px"}
                          lineHeight={0}
                        >
                          {project.value.title}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Image
                          src={"/logos/" + project.value.logo}
                          boxSize="25px"
                        />
                        <Text
                          as="h1"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardTitle}
                        >
                          {project.value.title}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                </Flex>
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
                  <Box width="100%" margin="5px">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      SoftCap
                    </Text>
                    <Text
                      as="h2"
                      fontSize="18px"
                      textAlign="start"
                      marginTop="10px"
                      color={color.cardSubtitle}
                    >
                      {softCap.toLocaleString()}
                    </Text>
                  </Box>
                </Flex>
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
                  margin="40 0px"
                >
                  <Box width="100%">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      No. of Participants
                    </Text>
                    <Text
                      as="h2"
                      fontSize="18px"
                      textAlign="start"
                      marginTop="10px"
                      color={color.cardSubtitle}
                    >
                      {project.value.investors}
                    </Text>
                  </Box>
                </Flex>
              </VStack>
              {depositOpen ? (
                <VStack
                  width={{ lg: "400px", md: "250px", sm: "150px" }}
                  border="1px solid"
                  borderColor={color.cardBorder}
                  borderRadius="20px"
                >
                  <Flex
                    width={"87%"}
                    justifyContent={"flex-end"}
                    paddingTop="28px"
                  >
                    <Image
                      aria-label="Exit panel"
                      src={hovered ? exitButtonHover : exitButton}
                      onMouseOver={() => setHovered(true)}
                      onMouseOut={() => setHovered(false)}
                      cursor={"pointer"}
                      onClick={handleExit}
                    />
                  </Flex>
                  <Flex flexDirection={"column"} width={"87%"}>
                    <Text
                      as="h1"
                      fontStyle="normal"
                      fontWeight="500"
                      fontSize="20px"
                      color={"#26A17B"}
                    >
                      DEPOSIT FUNDS
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
                      {Number(userBalance).toLocaleString() == "0"
                        ? "You have not deposit any funds yet"
                        : `You are about to deposit funds to ${project.value.title} pool. Please input the amount intended`}
                    </Text>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    justifyContent={"center"}
                    paddingBottom={4}
                  >
                    <Input
                      minHeight={"60px"}
                      color={color.cardTitle}
                      fontSize={"64px"}
                      fontWeight={700}
                      textAlign={"center"}
                      border={"none"}
                      type={"number"}
                      max={userBalance.toLocaleString()}
                      min={startingPrice.toLocaleString()}
                      defaultValue={depositBalance.toLocaleString()}
                      onChange={(e) =>
                        setDepositBalance(Number(e.target.value))
                      }
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
                      {inToken.symbol}
                    </Text>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    minWidth="87%"
                    justifyContent={"center"}
                  >
                    <Flex
                      minWidth="87%"
                      minHeight="14"
                      paddingY="2"
                      paddingX="2"
                      alignItems="center"
                      border="1px solid"
                      borderColor={color.cardSubtitle}
                      borderRadius="10px"
                      bgColor={color.cardBg}
                    >
                      <Flex width="40%" margin="5px">
                        <Text
                          as="h1"
                          fontSize="14px"
                          textAlign="start"
                          color={color.cardTitle}
                        >
                          AVAILABLE TO DEPOSIT
                        </Text>
                      </Flex>
                      <Flex
                        width="100%"
                        justifyContent="end"
                        flexDirection="column"
                      >
                        <Flex margin="5px" justifyContent="end">
                          <Text
                            fontSize="0.7vw"
                            textAlign="end"
                            marginTop="10px"
                            width="max-content"
                            color={color.cardTitle}
                          >
                            {inToken.name}
                          </Text>
                        </Flex>
                        <Flex justifyContent="end" margin="5px">
                          <Image src={inToken.icon} boxSize="25px" />
                          <Text
                            as="h2"
                            fontSize="16px"
                            textAlign="end"
                            marginLeft="15px"
                            color={color.cardSubtitle}
                          >
                            {Number(userBalance).toLocaleString()}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex
                      minWidth="87%"
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
                      <Flex width="40%" margin="5px">
                        <Text
                          as="h1"
                          fontSize="14px"
                          textAlign="start"
                          color={color.cardTitle}
                        >
                          DEPOSIT TO POOL
                        </Text>
                      </Flex>
                      <Flex
                        width="100%"
                        justifyContent="end"
                        flexDirection="column"
                      >
                        <Flex margin="5px" justifyContent="end">
                          <Text
                            fontSize="0.7vw"
                            textAlign="end"
                            marginTop="10px"
                            width="max-content"
                            color={color.cardSubtitle}
                          >
                            {""}
                          </Text>
                        </Flex>
                        <Flex justifyContent="end" margin="5px">
                          <Text
                            as="h2"
                            fontSize="16px"
                            textAlign="end"
                            marginLeft="15px"
                            color={color.cardSubtitle}
                          >
                            {project.value.title}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex minWidth="100%" minHeight="14" justifyContent="center">
                    <Button
                      width="87%"
                      onClick={() =>
                        handleDeposit(project.value.in_token_account_id)
                      }
                      isDisabled={
                        withdrawOpen ||
                        Number(userBalance).toLocaleString() == "0"
                      }
                      {...depositButtonStyle}
                    >
                      DEPOSIT
                    </Button>
                  </Flex>
                  <Flex
                    minWidth="100%"
                    minHeight="14"
                    justifyContent="center"
                    paddingBottom={"7"}
                  >
                    <Button
                      width="87%"
                      isDisabled={depositOpen}
                      onClick={() =>
                        handleWithdraw(project.value.in_token_account_id)
                      }
                      {...withdrawButtonStyle}
                    >
                      WITHDRAW
                    </Button>
                  </Flex>
                </VStack>
              ) : withdrawOpen ? (
                <VStack
                  width={{ lg: "400px", md: "250px", sm: "150px" }}
                  border="1px solid"
                  borderColor={color.cardBorder}
                  borderRadius="20px"
                >
                  <Flex
                    width={"87%"}
                    justifyContent={"flex-end"}
                    paddingTop="28px"
                  >
                    <Image
                      aria-label="Exit panel"
                      cursor={"pointer"}
                      src={hovered ? exitButtonHover : exitButton}
                      onMouseOver={() => setHovered(true)}
                      onMouseOut={() => setHovered(false)}
                      onClick={handleExit}
                    />
                  </Flex>
                  <Flex flexDirection={"column"} paddingX={8}>
                    <Text
                      as="h1"
                      fontStyle="normal"
                      fontWeight="500"
                      fontSize="20px"
                      color={"#26A17B"}
                    >
                      WITHDRAW FUNDS
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
                      {convertToFloat(
                        userDepositedBalance,
                        5,
                        inTokenDecimals
                      ).toLocaleString() == "0"
                        ? "You have insufficient funds to withdraw"
                        : `You are about to withdraw funds from ${project.value.title} pool to your
                      wallet. Please input the amount intended`}
                    </Text>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    paddingBottom={4}
                    margin={0}
                    justifyContent={"center"}
                  >
                    <Input
                      minHeight={"60px"}
                      fontSize={"64px"}
                      fontWeight={700}
                      textAlign={"center"}
                      border={"none"}
                      type={"number"}
                      color={color.cardTitle}
                      max={convertToFloat(
                        userDepositedBalance,
                        5,
                        inTokenDecimals
                      ).toLocaleString()}
                      min={1}
                      defaultValue={withdrawBalance.toLocaleString()}
                      onChange={(e) =>
                        setWithdrawBalance(Number(e.target.value))
                      }
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
                      {inToken.symbol}
                    </Text>
                  </Flex>
                  <Flex
                    flexDirection={"column"}
                    justifyContent={"center"}
                    minWidth="87%"
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
                      <Flex width="40%" margin="5px">
                        <Text
                          as="h1"
                          fontSize="14px"
                          textAlign="start"
                          color={color.cardTitle}
                        >
                          AVAILABLE TO WITHDRAW
                        </Text>
                      </Flex>
                      <Flex
                        width="100%"
                        justifyContent="end"
                        flexDirection="column"
                      >
                        <Flex margin="5px" justifyContent="end">
                          <Text
                            fontSize="0.7vw"
                            textAlign="end"
                            marginTop="10px"
                            width="max-content"
                            color={color.cardTitle}
                          >
                            {inToken.name}
                          </Text>
                        </Flex>
                        <Flex justifyContent="end" margin="5px">
                          <Image src={inToken.icon} boxSize="25px" />
                          <Text
                            as="h2"
                            fontSize="16px"
                            textAlign="end"
                            marginLeft="15px"
                            color={color.cardSubtitle}
                          >
                            {convertToFloat(
                              userDepositedBalance,
                              5,
                              inTokenDecimals
                            ).toLocaleString()}
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
                          WITHDRAW FROM POOL
                        </Text>
                      </Flex>
                      <Flex
                        width="100%"
                        justifyContent="end"
                        flexDirection="column"
                      >
                        <Flex margin="5px" justifyContent="end">
                          <Text
                            fontSize="0.7vw"
                            textAlign="end"
                            marginTop="10px"
                            width="max-content"
                            color={color.cardTitle}
                          >
                            {""}
                          </Text>
                        </Flex>
                        <Flex justifyContent="end" margin="5px">
                          <Text
                            as="h2"
                            fontSize="16px"
                            textAlign="end"
                            marginLeft="15px"
                            color={color.cardSubtitle}
                          >
                            {project.value.title}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex minWidth="100%" minHeight="14" justifyContent="center">
                    <Button
                      width="87%"
                      onClick={() =>
                        handleDeposit(project.value.in_token_account_id)
                      }
                      isDisabled={withdrawOpen}
                      {...depositButtonStyle}
                    >
                      DEPOSIT
                    </Button>
                  </Flex>
                  <Flex
                    minWidth="100%"
                    minHeight="14"
                    justifyContent="center"
                    paddingBottom={"7"}
                  >
                    <Button
                      width="87%"
                      isDisabled={
                        depositOpen ||
                        convertToFloat(
                          userDepositedBalance,
                          5,
                          inTokenDecimals
                        ) === 0
                      }
                      onClick={() =>
                        handleWithdraw(project.value.in_token_account_id)
                      }
                      {...withdrawButtonStyle}
                    >
                      WITHDRAW
                    </Button>
                  </Flex>
                </VStack>
              ) : (
                <Show above="md">
                  <VStack
                    width={{ lg: "400px", md: "250px", sm: "150px" }}
                    paddingX={"24px"}
                    border="1px solid"
                    borderColor={color.cardSubtitle}
                    borderRadius="20px"
                  >
                    <Text
                      as="h1"
                      fontFamily="Noto Sans Gujarati"
                      fontStyle="normal"
                      fontWeight="400"
                      fontSize="20px"
                      paddingY="8"
                      color={color.cardTitle}
                    >
                      Please choose an option below
                    </Text>
                    <Flex
                      minWidth="100%"
                      minHeight="14"
                      justifyContent="center"
                    >
                      <Button
                        width="87%"
                        onClick={() => {
                          setDepositOpen(true);
                        }}
                        isDisabled={!activated}
                        {...depositButtonStyle}
                      >
                        DEPOSIT
                      </Button>
                    </Flex>
                    <Flex
                      minWidth="100%"
                      minHeight="14"
                      justifyContent="center"
                    >
                      <Button
                        width="87%"
                        onClick={() => {
                          setWithdrawOpen(true);
                        }}
                        isDisabled={!activated}
                        {...withdrawButtonStyle}
                      >
                        WITHDRAW
                      </Button>
                    </Flex>
                  </VStack>
                </Show>
              )}
              <VStack
                spacing="40px"
                width={{ lg: "400px", md: "250px", sm: "150px" }}
                paddingX="24px"
              >
                <Box width="100%">
                  <Text
                    as="h1"
                    fontSize="40px"
                    textAlign="end"
                    color={color.cardTitle}
                  >
                    {cutDecimal(liveTokenPrice, liveTokenPrice > 0.001 ? 3 : 5)}{" "}
                    {inToken.symbol}
                  </Text>
                  <Text
                    as="h2"
                    fontSize="14px"
                    textAlign="end"
                    marginTop="0px"
                    color={color.cardSubtitle}
                  >
                    LIVE TOKEN PRICE
                  </Text>
                </Box>
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
                  marginTop="20px !important"
                >
                  <Box width="100%">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      User Current Deposit
                    </Text>
                    <Text
                      as="h2"
                      fontSize="18px"
                      textAlign="start"
                      marginTop="10px"
                      color={color.cardSubtitle}
                    >
                      {convertToFloat(
                        userDepositedBalance,
                        5,
                        inTokenDecimals
                      ).toLocaleString()}
                    </Text>
                  </Box>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex margin="5px" justifyContent="end">
                      <Text
                        fontSize="0.7vw"
                        textAlign="end"
                        marginTop="10px"
                        width="max-content"
                        color={color.cardSubtitle}
                        marginBottom={"0px"}
                        padding={"10px 0px"}
                        lineHeight={0}
                      >
                        {inToken.name}
                      </Text>
                    </Flex>
                    <Flex justifyContent="end" margin="5px">
                      <Image src={inToken.icon} boxSize="25px" />
                      <Text
                        as="h1"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardTitle}
                      >
                        {inToken.symbol}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
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
                  margin="40px 0px"
                >
                  <Box width="100%" margin="5px">
                    <Text
                      as="h1"
                      fontSize="14px"
                      textAlign="start"
                      color={color.cardTitle}
                    >
                      Estimated Token Purchased
                    </Text>
                    <Text
                      as="h2"
                      fontSize="18px"
                      textAlign="start"
                      marginTop="10px"
                      color={color.cardSubtitle}
                    >
                      {estimatedTokenPurchased.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Flex
                      width="100%"
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          fontSize="0.7vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardSubtitle}
                          marginBottom={"0px"}
                          padding={"10px 0px"}
                          lineHeight={0}
                        >
                          {project.value.title}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Image
                          src={"/logos/" + project.value.logo}
                          boxSize="25px"
                        />
                        <Text
                          as="h1"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardTitle}
                        >
                          {project.value.title}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                </Flex>
                {/* cliff period */}
                <Flex minWidth="100%" minHeight="14" flexDirection="column">
                  <Flex
                    marginX="8px"
                    alignItems="center"
                    justifyContent={"center"}
                  >
                    <Text
                      as="h5"
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="DM Sans"
                      textAlign="start"
                      width="40%"
                      marginLeft={"10%"}
                    >
                      {startTime.getDate()}{" "}
                      {ShortMonthNames[startTime.getMonth()]}{" "}
                      {startTime.getFullYear()}
                    </Text>
                    <Image
                      paddingBottom={"10px"}
                      height={"full"}
                      maxWidth={"90px"}
                      src={cliffArrow}
                    ></Image>
                    <Text
                      as="h5"
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="DM Sans"
                      textAlign="end"
                      width="40%"
                      marginRight={"10%"}
                    >
                      {endTime.getDate()} {ShortMonthNames[endTime.getMonth()]}{" "}
                      {endTime.getFullYear()}
                    </Text>
                  </Flex>

                  <Flex
                    flexDirection="column"
                    minWidth="100%"
                    minHeight="14"
                    paddingY="2"
                    paddingX="2"
                    alignItems="center"
                    border="1px solid"
                    borderColor={color.cliffPeriod}
                    borderRadius="50px"
                    bgColor={color.cardBg}
                  >
                    <Text fontSize="10px" textAlign="center" marginBottom="2px">
                      TOKEN LOCK
                    </Text>
                    <Text
                      fontSize="20px"
                      textAlign="center"
                      color={color.cliffPeriod}
                      marginBottom="2px"
                    >
                      CLIFF PERIOD
                    </Text>
                  </Flex>
                </Flex>
                {/* release */}
                <Flex minWidth="100%" minHeight="14" flexDirection="column">
                  <Flex marginX="8px" alignItems="end">
                    <Flex flexDirection="column" width={"70%"}>
                      <Text
                        as="h5"
                        fontSize="14px"
                        fontWeight="500"
                        fontFamily="DM Sans"
                        textAlign="center"
                        color={color.onwardsRelease}
                        marginBottom={0}
                        marginLeft={"25%"}
                      >
                        (Onwards)
                      </Text>
                      <Image
                        width={"80%"}
                        marginLeft={"auto"}
                        height={"full"}
                        paddingBottom={"10px"}
                        src={releaseArrow}
                      ></Image>
                    </Flex>
                    <Flex
                      flexDirection="row"
                      alignItems="end"
                      width={"30%"}
                      marginLeft="2px"
                      marginRight={"10%"}
                    >
                      <Text
                        as="h5"
                        fontSize="14px"
                        fontWeight="500"
                        fontFamily="DM Sans"
                        textAlign="center"
                      >
                        {endTime.getDate()}{" "}
                        {ShortMonthNames[endTime.getMonth()]}{" "}
                        {endTime.getFullYear()}
                      </Text>
                    </Flex>
                  </Flex>

                  <Flex
                    flexDirection="column"
                    minWidth="100%"
                    minHeight="14"
                    // paddingY='2'
                    paddingX="2"
                    alignItems="center"
                    border="1px solid"
                    borderColor={color.onwardsRelease}
                    borderRadius="50px"
                    bgColor={color.cardBg}
                    position="relative"
                    overflow="hidden"
                  >
                    <Text fontSize="10px" textAlign="center" paddingTop="2" marginBottom="2px">
                      TOKEN LOCK
                    </Text>
                    <Text
                      fontSize="20px"
                      textAlign="center"
                      color={color.onwardsRelease}
                      paddingBottom="2"
                      marginBottom="2px"
                    >
                      RELEASE
                    </Text>
                    <Box
                      width="0%"
                      position="absolute"
                      left="0"
                      bgColor={color.fadeText}
                      height="100%"
                    ></Box>
                  </Flex>
                </Flex>
              </VStack>
            </Flex>
          </Show>

          <Hide above="md">
            <Box width="100%">
              <Text
                as="h1"
                fontSize="40px"
                textAlign="center"
                color={color.cardTitle}
              >
                {cutDecimal(liveTokenPrice, liveTokenPrice > 0.001 ? 3 : 5)}{" "}
                {inToken.symbol}
              </Text>
              <Text
                as="h2"
                fontSize="14px"
                textAlign="center"
                marginTop="0px"
                color={color.cardSubtitle}
              >
                LIVE TOKEN PRICE
              </Text>
            </Box>

            {depositOpen ? (
              <VStack
                width={{ md: "400px", sm: "400px" }}
                border="1px solid"
                borderColor={color.cardBorder}
                borderRadius="20px"
              >
                <Flex
                  width={"87%"}
                  justifyContent={"flex-end"}
                  paddingTop="28px"
                >
                  <Image
                    aria-label="Exit panel"
                    src={hovered ? exitButtonHover : exitButton}
                    onMouseOver={() => setHovered(true)}
                    onMouseOut={() => setHovered(false)}
                    cursor={"pointer"}
                    onClick={handleExit}
                  />
                </Flex>
                <Flex flexDirection={"column"} width={"87%"}>
                  <Text
                    as="h1"
                    fontStyle="normal"
                    fontWeight="500"
                    fontSize="20px"
                    color={"#26A17B"}
                  >
                    DEPOSIT FUNDS
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
                    {Number(userBalance).toLocaleString() == "0"
                      ? "You have not deposit any funds yet"
                      : `You are about to deposit funds to ${project.value.title} pool. Please input the amount intended`}
                  </Text>
                </Flex>
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  paddingBottom={4}
                >
                  <Input
                    minHeight={"60px"}
                    color={color.cardTitle}
                    fontSize={"64px"}
                    fontWeight={700}
                    textAlign={"center"}
                    border={"none"}
                    type={"number"}
                    max={userBalance.toLocaleString()}
                    min={startingPrice.toLocaleString()}
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
                    {inToken.symbol}
                  </Text>
                </Flex>
                <Flex
                  flexDirection={"column"}
                  minWidth="87%"
                  justifyContent={"center"}
                >
                  <Flex
                    minWidth="87%"
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
                        AVAILABLE TO DEPOSIT
                      </Text>
                    </Flex>
                    <Flex
                      width="100%"
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          fontSize="0.7vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardTitle}
                        >
                          {inToken.name}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Image src={inToken.icon} boxSize="25px" />
                        <Text
                          as="h2"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardSubtitle}
                        >
                          {Number(userBalance).toLocaleString()}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex
                    minWidth="87%"
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
                        DEPOSIT TO POOL
                      </Text>
                    </Flex>
                    <Flex
                      width="100%"
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          fontSize="0.7vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardSubtitle}
                        >
                          {""}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Text
                          as="h2"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardSubtitle}
                        >
                          {project.value.title}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex minWidth="100%" minHeight="14" justifyContent="center">
                  <Button
                    width="87%"
                    onClick={() =>
                      handleDeposit(project.value.in_token_account_id)
                    }
                    isDisabled={
                      withdrawOpen ||
                      Number(userBalance).toLocaleString() == "0"
                    }
                    {...depositButtonStyle}
                  >
                    DEPOSIT
                  </Button>
                </Flex>
                <Flex
                  minWidth="100%"
                  minHeight="14"
                  justifyContent="center"
                  paddingBottom={"7"}
                >
                  <Button
                    width="87%"
                    isDisabled={depositOpen}
                    onClick={() =>
                      handleWithdraw(project.value.in_token_account_id)
                    }
                    {...withdrawButtonStyle}
                  >
                    WITHDRAW
                  </Button>
                </Flex>
              </VStack>
            ) : withdrawOpen ? (
              <VStack
                width={{ lg: "400px", md: "250px", sm: "150px" }}
                border="1px solid"
                borderColor={color.cardBorder}
                borderRadius="20px"
              >
                <Flex
                  width={"87%"}
                  justifyContent={"flex-end"}
                  paddingTop="28px"
                >
                  <Image
                    aria-label="Exit panel"
                    cursor={"pointer"}
                    src={hovered ? exitButtonHover : exitButton}
                    onMouseOver={() => setHovered(true)}
                    onMouseOut={() => setHovered(false)}
                    onClick={handleExit}
                  />
                </Flex>
                <Flex flexDirection={"column"} paddingX={8}>
                  <Text
                    as="h1"
                    fontStyle="normal"
                    fontWeight="500"
                    fontSize="20px"
                    color={"#26A17B"}
                  >
                    WITHDRAW FUNDS
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
                    {convertToFloat(
                      userDepositedBalance,
                      5,
                      inTokenDecimals
                    ) === 0
                      ? "You have insufficient funds to withdraw"
                      : `You are about to withdraw funds from ${project.value.title} pool to your
                      wallet. Please input the amount intended`}
                  </Text>
                </Flex>
                <Flex
                  flexDirection={"column"}
                  paddingBottom={4}
                  margin={0}
                  justifyContent={"center"}
                >
                  <Input
                    minHeight={"60px"}
                    fontSize={"64px"}
                    fontWeight={700}
                    textAlign={"center"}
                    border={"none"}
                    type={"number"}
                    color={color.cardTitle}
                    max={convertToFloat(
                      userDepositedBalance,
                      5,
                      inTokenDecimals
                    ).toLocaleString()}
                    min={1}
                    defaultValue={withdrawBalance.toLocaleString()}
                    onChange={(e) => setWithdrawBalance(Number(e.target.value))}
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
                    {inToken.symbol}
                  </Text>
                </Flex>
                <Flex
                  flexDirection={"column"}
                  justifyContent={"center"}
                  minWidth="87%"
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
                    <Flex width="40%" margin="5px">
                      <Text
                        as="h1"
                        fontSize="14px"
                        textAlign="start"
                        color={color.cardTitle}
                      >
                        AVAILABLE TO WITHDRAW
                      </Text>
                    </Flex>
                    <Flex
                      width="100%"
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          fontSize="0.7vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardTitle}
                        >
                          {inToken.name}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Image src={inToken.icon} boxSize="25px" />
                        <Text
                          as="h2"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardSubtitle}
                        >
                          {convertToFloat(
                            userDepositedBalance,
                            5,
                            inTokenDecimals
                          ).toLocaleString()}
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
                        WITHDRAW FROM POOL
                      </Text>
                    </Flex>
                    <Flex
                      width="100%"
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          fontSize="0.7vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardTitle}
                        >
                          {""}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Text
                          as="h2"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardSubtitle}
                        >
                          {project.value.title}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex minWidth="100%" minHeight="14" justifyContent="center">
                  <Button
                    width="87%"
                    onClick={() =>
                      handleDeposit(project.value.in_token_account_id)
                    }
                    isDisabled={withdrawOpen}
                    {...depositButtonStyle}
                  >
                    DEPOSIT
                  </Button>
                </Flex>
                <Flex
                  minWidth="100%"
                  minHeight="14"
                  justifyContent="center"
                  paddingBottom={"7"}
                >
                  <Button
                    width="87%"
                    isDisabled={
                      depositOpen ||
                      convertToFloat(
                        userDepositedBalance,
                        5,
                        inTokenDecimals
                      ) === 0
                    }
                    onClick={() =>
                      handleWithdraw(project.value.in_token_account_id)
                    }
                    {...withdrawButtonStyle}
                  >
                    WITHDRAW
                  </Button>
                </Flex>
              </VStack>
            ) : (
              <Hide above="md">
                <VStack
                  width={{ md: "450px", sm: "450px" }}
                  paddingX={"24px"}
                  border="1px solid"
                  borderColor={color.cardSubtitle}
                  borderRadius="20px"
                >
                  <Text
                    as="h1"
                    fontFamily="Noto Sans Gujarati"
                    fontStyle="normal"
                    fontWeight="400"
                    fontSize="20px"
                    paddingY="8"
                    color={color.cardTitle}
                  >
                    Please choose an option below
                  </Text>
                  <Flex minWidth="100%" minHeight="14" justifyContent="center">
                    <Button
                      width="87%"
                      onClick={() => {
                        setDepositOpen(true);
                      }}
                      isDisabled={!activated}
                      {...depositButtonStyle}
                    >
                      DEPOSIT
                    </Button>
                  </Flex>
                  <Flex minWidth="100%" minHeight="14" justifyContent="center">
                    <Button
                      width="87%"
                      onClick={() => {
                        setWithdrawOpen(true);
                      }}
                      isDisabled={!activated}
                      {...withdrawButtonStyle}
                    >
                      WITHDRAW
                    </Button>
                  </Flex>
                </VStack>
              </Hide>
            )}
            <VStack
              width={{ md: "400px", sm: "400px" }}
              padding={"24px"}
              // border="1px solid"
              // borderColor={color.cardSubtitle}
              // borderRadius="20px"
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
                <Box width="100%">
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    Live Deposits
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                  >
                    {convertToFloat(
                      project.value.total_deposits,
                      5,
                      inTokenDecimals
                    ).toLocaleString()}
                  </Text>
                </Box>
                <Flex width="100%" justifyContent="end" flexDirection="column">
                  <Flex margin="5px" justifyContent="end">
                    <Text
                      fontSize="0.7vw"
                      textAlign="end"
                      marginTop="10px"
                      width="max-content"
                      color={color.cardSubtitle}
                    >
                      {inToken.name}
                    </Text>
                  </Flex>
                  <Flex justifyContent="end" margin="5px">
                    <Image src={inToken.icon} boxSize="25px" />
                    <Text
                      as="h1"
                      fontSize="16px"
                      textAlign="end"
                      marginLeft="15px"
                      color={color.cardTitle}
                    >
                      {inToken.symbol}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
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
                <Box width="100%" margin="5px">
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    Total Tokens On Sale
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                  >
                    {convertToFloat(
                      project.value.total_tokens,
                      5,
                      decimals
                    ).toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex margin="5px" justifyContent="end">
                      <Text
                        fontSize="0.7vw"
                        textAlign="end"
                        marginTop="10px"
                        width="max-content"
                        color={color.cardSubtitle}
                      >
                        Token
                      </Text>
                    </Flex>
                    <Flex justifyContent="end" margin="5px">
                      <Image
                        src={"/logos/" + project.value.logo}
                        boxSize="25px"
                      />
                      <Text
                        as="h1"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardTitle}
                      >
                        {project.value.title}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
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
                <Box width="100%" margin="5px">
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    SoftCap
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                  >
                    {softCap.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex margin="5px" justifyContent="end">
                      <Text
                        fontSize="0.7vw"
                        textAlign="end"
                        marginTop="10px"
                        width="max-content"
                        color={color.cardSubtitle}
                      >
                        {inToken.name}
                      </Text>
                    </Flex>
                    <Flex justifyContent="end" margin="5px">
                      <Image src={inToken.icon} boxSize="25px" />
                      <Text
                        as="h1"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardTitle}
                      >
                        {inToken.symbol}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
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
                margin="40 0px"
              >
                <Box width="100%">
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    No. of Participants
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                  >
                    {project.value.investors}
                  </Text>
                </Box>
              </Flex>

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
                marginTop="20px !important"
              >
                <Box width="100%">
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    User Current Deposit
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                  >
                    {convertToFloat(
                      userDepositedBalance,
                      5,
                      inTokenDecimals
                    ).toLocaleString()}
                  </Text>
                </Box>
                <Flex width="100%" justifyContent="end" flexDirection="column">
                  <Flex margin="5px" justifyContent="end">
                    <Text
                      fontSize="0.7vw"
                      textAlign="end"
                      marginTop="10px"
                      width="max-content"
                      color={color.cardSubtitle}
                    >
                      {inToken.name}
                    </Text>
                  </Flex>
                  <Flex justifyContent="end" margin="5px">
                    <Image src={inToken.icon} boxSize="25px" />
                    <Text
                      as="h1"
                      fontSize="16px"
                      textAlign="end"
                      marginLeft="15px"
                      color={color.cardTitle}
                    >
                      {inToken.symbol}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
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
                margin="40px 0px"
              >
                <Box width="100%" margin="5px">
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="start"
                    color={color.cardTitle}
                  >
                    Estimated Token Purchased
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                  >
                    {estimatedTokenPurchased.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Flex
                    width="100%"
                    justifyContent="end"
                    flexDirection="column"
                  >
                    <Flex margin="5px" justifyContent="end">
                      <Text
                        fontSize="0.7vw"
                        textAlign="end"
                        marginTop="10px"
                        width="max-content"
                        color={color.cardSubtitle}
                      >
                        Token
                      </Text>
                    </Flex>
                    <Flex justifyContent="end" margin="5px">
                      <Image
                        src={"/logos/" + project.value.logo}
                        boxSize="25px"
                      />
                      <Text
                        as="h1"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardTitle}
                      >
                        {project.value.title}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
              {/* cliff period */}
              <Flex minWidth="100%" minHeight="14" flexDirection="column">
                <Flex marginX="8px" alignItems="center">
                  <Text
                    as="h5"
                    fontSize="14px"
                    fontWeight="500"
                    fontFamily="DM Sans"
                    textAlign="start"
                    width="40%"
                    marginLeft={"10%"}
                  >
                    {startTime.getDate()}{" "}
                    {ShortMonthNames[startTime.getMonth()]}{" "}
                    {startTime.getFullYear()}
                  </Text>
                  <Image
                    height={"full"}
                    paddingBottom={"10px"}
                    maxWidth={"100px"}
                    src={cliffArrow}
                  ></Image>
                  <Text
                    as="h5"
                    fontSize="14px"
                    fontWeight="500"
                    fontFamily="DM Sans"
                    textAlign="end"
                    width="40%"
                    marginRight={"10%"}
                  >
                    {endTime.getDate()} {ShortMonthNames[endTime.getMonth()]}{" "}
                    {endTime.getFullYear()}
                  </Text>
                </Flex>

                <Flex
                  flexDirection="column"
                  minWidth="100%"
                  minHeight="14"
                  paddingY="2"
                  paddingX="2"
                  alignItems="center"
                  border="1px solid"
                  borderColor={color.blue}
                  borderRadius="50px"
                  bgColor={color.cardBg}
                >
                  <Text fontSize="8px" textAlign="center" marginBottom="2px">
                    TOKEN LOCK
                  </Text>
                  <Text fontSize="16px" textAlign="center" color={color.blue} marginBottom="2px">
                    CLIFF PERIOD
                  </Text>
                </Flex>
              </Flex>
              {/* release */}
              <Flex minWidth="100%" minHeight="14" flexDirection="column">
                <Flex marginX="8px" alignItems="end">
                  <Flex flexDirection="column" width={"70%"}>
                    <Text
                      as="h5"
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="DM Sans"
                      textAlign="center"
                      color={color.onwardsRelease}
                      marginBottom={0}
                      marginLeft={"25%"}
                    >
                      (Onwards)
                    </Text>
                    <Image
                      width={"80%"}
                      marginLeft={"auto"}
                      height={"full"}
                      paddingBottom={"10px"}
                      src={releaseArrow}
                    ></Image>
                  </Flex>
                  <Flex
                    flexDirection="row"
                    alignItems="end"
                    width={"30%"}
                    marginLeft="16px"
                    marginRight={"10%"}
                  >
                    <Text
                      as="h5"
                      fontSize="14px"
                      fontWeight="500"
                      fontFamily="DM Sans"
                      textAlign="center"
                      marginRight={"auto"}
                    >
                      {endTime.getDate()} {ShortMonthNames[endTime.getMonth()]}{" "}
                      {endTime.getFullYear()}
                    </Text>
                  </Flex>
                </Flex>

                <Flex
                  flexDirection="column"
                  minWidth="100%"
                  minHeight="14"
                  // paddingY='2'
                  paddingX="2"
                  alignItems="center"
                  border="1px solid"
                  borderColor={color.green}
                  borderRadius="50px"
                  bgColor={color.cardBg}
                  position="relative"
                  overflow="hidden"
                >
                  <Text fontSize="8px" textAlign="center" paddingTop="2" marginBottom="2px">
                    TOKEN LOCK
                  </Text>
                  <Text
                    fontSize="16px"
                    textAlign="center"
                    color={color.green}
                    paddingBottom="2"
                    marginBottom="2px"
                  >
                    RELEASE
                  </Text>
                  <Box
                    width="0%"
                    position="absolute"
                    left="0"
                    bgColor={color.fadeText}
                    height="100%"
                  ></Box>
                </Flex>
              </Flex>
            </VStack>
          </Hide>

          <Flex marginY={4} flexDirection={"column"}>
            <Flex flexDirection={"column"}>
              <Text
                as="h1"
                fontSize="16px"
                textAlign="justify"
                fontWeight="bold"
                marginY={2}
                color={color.cardTitle}
              >
                DISCLAIMER
              </Text>
              <Text
                as="h1"
                fontSize="14px"
                lineHeight={"18px"}
                textAlign="justify"
                fontWeight="bold"
                marginY={2}
                color={color.cardSubtitle}
              >
                By clicking the deposit button, you agree to deposit the
                specified amount into the pool and the tokens purchased are
                bound to agreed cliff period set by project owners. You may
                withdraw your deposits before the deposit period ends. However,
                deposits cannot be reversed nor refunded after the sales end
                and/or deposit period is over. Do take note of the cliff period
                and distribution on the right pane. You acknowledge that you are
                solely responsible for managing your funds and ensuring their
                security.
              </Text>
            </Flex>
            <RuleCard />
          </Flex>
        </Flex>
      </>
    );
  }
}
