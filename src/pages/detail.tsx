import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  SkeletonCircle,
  Hide,
  Show,
} from "@chakra-ui/react";
import { BiChevronLeft as ArrowLeftIcon } from "react-icons/bi";
import {
  useColor,
  useProject,
  useBalance,
  useNearLogin,
  useNearContext,
  useWithdrawOutToken,
} from "../hooks";
import { FtContract } from "../hooks/Near/classWrappers";
import RuleCard from "../components/RuleCard";
import Loading from "../components/Loading";
import InfoCard from "../components/InfoCard";
import { ShortMonthNames, TimeDivision, TokenDecimals } from "../utils/const";
import {
  depositButtonStyle,
  secondaryButtonStyle,
} from "../theme/ButtonStyles";
import liveListing from "../assets/img/icons/live-listing-small.svg";
import DotArrow from "../assets/img/dot_arrow.svg";
import InfoCard2 from "../components/InfoCard2";
import { usdt, usdc, wnear } from "../utils/tokens";
import { convertToFloat, cutDecimal } from "../utils/convert";

export default function Detail() {
  const navigate = useNavigate();
  const now = Date.now();
  const { projectId } = useParams();
  const { project } = useProject(Number(projectId));
  const { getBalance, getWithdrawnBalance } = useBalance();

  const color = useColor();
  const { isLoggedInNear } = useNearLogin();
  const { config, initFtContract } = useNearContext();
  const { projectWithdrawOutToken } = useWithdrawOutToken();
  const [userDepositedBalance, setUserDepositedBalance] = useState<string>("0");
  const [userWithdrawnBalance, setUserWithdrawnBalance] = useState<string>("0");
  const [decimals, setDecimals] = useState<number>(6);

  const getDepositedBalance = async () => {
    const balance = await getBalance(Number(projectId));
    setUserDepositedBalance(balance);
    const withdrawnBalance = await getWithdrawnBalance(Number(projectId));
    setUserWithdrawnBalance(withdrawnBalance);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleOutTokenWithdraw = async (contractId: string) => {
    const ftContract = new FtContract(initFtContract(contractId));
    const res = await projectWithdrawOutToken({
      projectId: Number(projectId),
      amount: null,
      ftContract,
    });
    console.log("res", res);
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
    getDecimals(project.value.out_token_account_id);
    const inToken =
      project.value.in_token_account_id === config.usdtContractId
        ? usdt
        : project.value.in_token_account_id === config.usdcContractId
        ? usdc
        : wnear;

    const inTokenDecimals =
      project.value.in_token_account_id === config.usdcContractId
        ? TokenDecimals.usdc
        : project.value.in_token_account_id === config.usdtContractId
        ? TokenDecimals.usdt
        : TokenDecimals.wnear;
    const endTime = new Date(project.value.end_time / TimeDivision);
    const ended = project.value.end_time / TimeDivision < now ? true : false;
    const remainDuration = project.value.end_time / TimeDivision - now;
    const remainTime = new Date(remainDuration);
    const cliffStartTime = project.value.end_time / TimeDivision;
    const cliffEndTime =
      project.value.end_time / TimeDivision +
      Number(project.value.cliff_period / TimeDivision);
    const cliffRemainDays =
      project.value.cliff_period / TimeDivision / 1000 / 24 / 3600;
    const startingPrice = convertToFloat(
      project.value.starting_price,
      5,
      inTokenDecimals
    );
    const softCap =
      convertToFloat(project.value.total_tokens, 5, decimals) * startingPrice;
    const cliffProgressValue =
      cliffStartTime > now
        ? 0
        : cliffEndTime < now
        ? 100
        : (100 * (now - cliffStartTime)) /
          (project.value.cliff_period / TimeDivision);
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
          background={color.cardBg}
          borderRadius="20px"
          flexDirection="column"
        >
          <Flex width="100%" flexDirection={"column"} marginY={8}>
            <Flex justifyContent={"center"}>
              <Image
                src={"/logos/" + project.value.logo}
                fallback={<SkeletonCircle />}
                boxSize="50px"
              />
            </Flex>
            <Flex flexDirection={"column"} marginY={2}>
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
                color={color.cardBoxTitle}
              >
                {ended
                  ? "Ended"
                  : `Ending in ${
                      remainTime.getUTCDate() - 1
                    } days ${remainTime.getUTCHours()} hours ${remainTime.getUTCMinutes()} mins`}
              </Text>
              <Text
                fontSize="14px"
                textAlign="center"
                padding="2px 0px 0px 8px"
                color={color.green}
              >
                {project.value.title} IDO {ended ? "has been" : "will be"}{" "}
                completed as at {ShortMonthNames[endTime.getMonth()]}{" "}
                {endTime.getDate()}, {endTime.getFullYear()}
              </Text>
            </Flex>
          </Flex>

          <Show above="md">
            <Flex width={"100%"} flexDirection={"column"} paddingX={8}>
              <Flex justifyContent={"space-between"}>
                <Flex width={"45%"} flexDirection={"column"}>
                  <Flex flexDirection={"column"}>
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

                  {/* progress bar on the left side of the page */}
                  <Flex flexDirection={"column"} marginY={8}>
                    <Flex
                      paddingX={4}
                      marginY={2}
                      alignItems="end"
                      justifyContent={"space-between"}
                    >
                      <Flex width={"20%"} marginLeft={"10%"}>
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="start"
                        >
                          {new Date(cliffStartTime).getDate()}{" "}
                          {ShortMonthNames[new Date(cliffStartTime).getMonth()]}{" "}
                          {new Date(cliffStartTime).getFullYear()}
                        </Text>
                      </Flex>
                      <Flex
                        width={"40%"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                      >
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="center"
                          color={color.blue}
                        >
                          (
                          {cliffProgressValue >= 100
                            ? "Completed"
                            : "In-Progress"}
                          )
                        </Text>
                        <Image paddingBottom={"10px"} src={DotArrow} />
                      </Flex>
                      <Flex
                        width={"20%"}
                        justifyContent={"end"}
                        marginRight={"10%"}
                      >
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="end"
                        >
                          {new Date(cliffEndTime).getDate()}{" "}
                          {ShortMonthNames[new Date(cliffEndTime).getMonth()]}{" "}
                          {new Date(cliffEndTime).getFullYear()}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex
                      flexDirection={"column"}
                      minWidth="100%"
                      minHeight="100%"
                      // paddingY="2"
                      height="30px"
                      paddingX="2"
                      alignItems="center"
                      borderRadius="50px"
                      bgColor={"#4040FF"}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        width={`${cliffProgressValue}%`}
                        left="0"
                        bgColor={"#76DEFF"}
                        height="100%"
                        zIndex={1}
                        position="absolute"
                      ></Box>
                      <Flex
                        position="absolute"
                        zIndex={1}
                        justifyContent="center"
                        flexDirection={"column"}
                        minWidth="100%"
                      >
                        <Text
                          fontSize="10px"
                          textAlign="center"
                          paddingTop="2"
                          color="white"
                        >
                          TOKEN LOCK
                        </Text>
                        <Text
                          fontSize="20px"
                          textAlign="center"
                          paddingBottom="2"
                          color="white"
                        >
                          {cliffRemainDays}{" "}
                          {cliffRemainDays
                            ? "DAYS CLIFF PERIOD"
                            : "DAY CLIFF PERIOD"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex width={"45%"} flexDirection={"column"}>
                  <Flex flexDirection={"column"}>
                    <Text
                      as="h1"
                      fontSize="40px"
                      textAlign="end"
                      color={color.cardTitle}
                    >
                      {cutDecimal(
                        liveTokenPrice,
                        liveTokenPrice > 0.001 ? 3 : 5
                      )}{" "}
                      {inToken.symbol}
                    </Text>
                    <Text
                      as="h2"
                      fontSize="14px"
                      textAlign="end"
                      marginTop="0px"
                      color={color.cardSubtitle}
                    >
                      LAST TOKEN PRICE DURING IDO
                    </Text>
                  </Flex>

                  {/* progress bar on the right side of the page */}
                  <Flex flexDirection={"column"} marginY={8}>
                    <Flex
                      paddingX={4}
                      marginY={2}
                      alignItems="end"
                      justifyContent={"space-between"}
                    >
                      <Flex width={"30%"} marginLeft={"10%"}>
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="start"
                        >
                          {new Date(cliffEndTime).getDate()}{" "}
                          {ShortMonthNames[new Date(cliffEndTime).getMonth()]}{" "}
                          {new Date(cliffEndTime).getFullYear()}
                        </Text>
                      </Flex>
                      <Flex
                        width={"70%"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        marginRight={"10%"}
                      >
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="center"
                          color={color.blue}
                          marginRight={"10px"}
                        >
                          (Onwards)
                        </Text>
                        <Image paddingBottom={"10px"} src={DotArrow} />
                      </Flex>
                    </Flex>
                    <Flex
                      flexDirection={"column"}
                      minWidth="100%"
                      minHeight="100%"
                      paddingX="2"
                      height="30px"
                      alignItems="center"
                      borderRadius="50px"
                      border={"1px solid"}
                      borderColor="#34d399"
                      position="relative"
                      overflow="hidden"
                    >
                      {/* <Flex
                    flexDirection={"column"}
                    minWidth="100%"
                    minHeight="100%"
                    // paddingY="2"
                    height="50px"
                    paddingX="2"
                    alignItems="center"
                    borderRadius="50px"
                    borderColor={color.lightGreen}
                    position="relative"
                    overflow="hidden"
                    border={"1px solid"}
                  > */}
                      <Box
                        width={`100%`}
                        left="0"
                        bgColor="#34d399"
                        height="100%"
                        zIndex={1}
                        position="absolute"
                      ></Box>
                      <Flex
                        position="absolute"
                        zIndex={1}
                        justifyContent="center"
                        flexDirection={"column"}
                        minWidth="100%"
                      >
                        <Text
                          fontSize="10px"
                          textAlign="center"
                          paddingTop="2"
                          color="white"
                        >
                          TOKEN UNLOCK
                        </Text>
                        <Text
                          fontSize="20px"
                          textAlign="center"
                          paddingBottom="2"
                          color={"white"}
                        >
                          TOKEN DISTRIBUTION
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex justifyContent="center">
                    <Button
                      mt={10}
                      width={"85%"}
                      {...depositButtonStyle}
                      onClick={() =>
                        handleOutTokenWithdraw(
                          project.value.out_token_account_id
                        )
                      }
                      isDisabled={
                        now < cliffEndTime ||
                        userWithdrawnBalance !== "0" ||
                        userDepositedBalance === "0"
                      }
                    >
                      WITHDRAW {project.value.title}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
              <Flex width={"100%"} marginY="8" flexDirection={"column"}>
                {/* OutToken */}
                <Flex
                  width={"100%"}
                  justifyContent={"space-between"}
                  marginY={2}
                >
                  <InfoCard
                    title={"Total Tokens On Sale"}
                    value={convertToFloat(
                      project.value.total_tokens,
                      5,
                      decimals
                    ).toLocaleString()}
                    tokenTitle={project.value.title}
                    tokenLogo={"/logos/" + project.value.logo}
                    tokenTicker={project.value.title}
                  />
                  <InfoCard
                    title={"Softcap"}
                    value={softCap.toLocaleString()}
                    tokenTitle={project.value.title}
                    tokenLogo={"/logos/" + project.value.logo}
                    tokenTicker={project.value.title}
                  />
                  <InfoCard
                    title={"Your Token Purchased"}
                    value={estimatedTokenPurchased.toLocaleString()}
                    tokenTitle={project.value.title}
                    tokenLogo={"/logos/" + project.value.logo}
                    tokenTicker={project.value.title}
                  />
                </Flex>

                {/* InToken */}
                <Flex
                  width={"100%"}
                  justifyContent={"space-between"}
                  marginY={2}
                >
                  <InfoCard
                    title={"Total IDO Deposits"}
                    value={convertToFloat(
                      project.value.total_deposits,
                      5,
                      inTokenDecimals
                    ).toLocaleString()}
                    tokenTitle={inToken.name}
                    tokenLogo={inToken.icon}
                    tokenTicker={inToken.symbol}
                  />
                  <InfoCard
                    title={"Your Confirmed Deposits"}
                    value={convertToFloat(
                      userDepositedBalance,
                      5,
                      inTokenDecimals
                    ).toLocaleString()}
                    tokenTitle={inToken.name}
                    tokenLogo={inToken.icon}
                    tokenTicker={inToken.symbol}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Show>

          <Hide above="md">
            <Flex
              width="100%"
              marginY="4"
              padding="8"
              // shadow="lg"
              // border="1px solid"
              // borderRadius="2xl"
              // borderColor={color.cardBorder}
              flexDirection="column"
              // bgColor={color.cardBg}
            >
              <Flex justifyContent="space-between">
                <Flex flexDirection="column" width="100%">
                  <Flex flexDirection={"column"}>
                    <Text
                      as="h1"
                      fontSize="40px"
                      textAlign="center"
                      color={color.cardTitle}
                    >
                      {project.value.title}
                    </Text>
                    <Text
                      as="h2"
                      fontSize="14px"
                      textAlign="center"
                      marginTop="0px"
                      color={color.cardSubtitle}
                    >
                      {project.value.sub_title}
                    </Text>
                  </Flex>
                  <Flex flexDirection={"column"}>
                    <Text
                      as="h1"
                      fontSize="40px"
                      textAlign="center"
                      color={color.cardTitle}
                    >
                      {cutDecimal(
                        liveTokenPrice,
                        liveTokenPrice > 0.001 ? 3 : 5
                      )}{" "}
                      {inToken.symbol}
                    </Text>
                    <Text
                      as="h2"
                      fontSize="14px"
                      textAlign="center"
                      marginTop="0px"
                      color={color.cardSubtitle}
                    >
                      LAST TOKEN PRICE DURING IDO
                    </Text>
                  </Flex>

                  <Flex flexDirection={"column"} marginY={8}>
                    <Flex
                      paddingX={4}
                      marginY={2}
                      alignItems="end"
                      justifyContent={"space-between"}
                    >
                      <Flex width={"20%"} marginLeft={"10%"}>
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="start"
                        >
                          {new Date(cliffStartTime).getDate()}{" "}
                          {ShortMonthNames[new Date(cliffStartTime).getMonth()]}{" "}
                          {new Date(cliffStartTime).getFullYear()}
                        </Text>
                      </Flex>
                      <Flex
                        width={"40%"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                      >
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="center"
                          color={color.blue}
                        >
                          (
                          {cliffProgressValue >= 100
                            ? "Completed"
                            : "In-Progress"}
                          )
                        </Text>
                        <Image paddingBottom={"10px"} src={DotArrow} />
                      </Flex>
                      <Flex
                        width={"20%"}
                        justifyContent={"end"}
                        marginRight={"10%"}
                      >
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="end"
                        >
                          {new Date(cliffEndTime).getDate()}{" "}
                          {ShortMonthNames[new Date(cliffEndTime).getMonth()]}{" "}
                          {new Date(cliffEndTime).getFullYear()}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex
                      flexDirection={"column"}
                      minWidth="100%"
                      minHeight="100%"
                      // paddingY="2"
                      height="30px"
                      paddingX="2"
                      alignItems="center"
                      borderRadius="50px"
                      bgColor={"#4040FF"}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        width={`${cliffProgressValue}%`}
                        left="0"
                        bgColor={"#76DEFF"}
                        height="100%"
                        zIndex={1}
                        position="absolute"
                      ></Box>
                      <Flex
                        position="absolute"
                        zIndex={1}
                        justifyContent="center"
                        flexDirection={"column"}
                        minWidth="100%"
                      >
                        <Text
                          fontSize="8px"
                          textAlign="center"
                          paddingTop="2"
                          color="white"
                        >
                          TOKEN LOCK
                        </Text>
                        <Text
                          fontSize="16px"
                          textAlign="center"
                          paddingBottom="2"
                          color="white"
                        >
                          {cliffRemainDays}{" "}
                          {cliffRemainDays
                            ? "DAYS CLIFF PERIOD"
                            : "DAY CLIFF PERIOD"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex flexDirection={"column"} marginY={8}>
                    <Flex
                      paddingX={4}
                      marginY={2}
                      alignItems="end"
                      justifyContent={"space-between"}
                    >
                      <Flex width={"30%"} marginLeft={"10%"}>
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="start"
                        >
                          {new Date(cliffEndTime).getDate()}{" "}
                          {ShortMonthNames[new Date(cliffEndTime).getMonth()]}{" "}
                          {new Date(cliffEndTime).getFullYear()}
                        </Text>
                      </Flex>
                      <Flex
                        width={"70%"}
                        flexDirection={"column"}
                        justifyContent={"center"}
                        marginRight={"10%"}
                      >
                        <Text
                          as="h5"
                          fontSize="14px"
                          fontWeight="500"
                          fontFamily="DM Sans"
                          textAlign="center"
                          color={color.blue}
                          marginRight={"10px"}
                        >
                          (Onwards)
                        </Text>
                        <Image paddingBottom={"10px"} src={DotArrow} />
                      </Flex>
                    </Flex>
                    <Flex
                      flexDirection={"column"}
                      minWidth="100%"
                      minHeight="100%"
                      paddingX="2"
                      height="30px"
                      alignItems="center"
                      borderRadius="50px"
                      border={"1px solid"}
                      borderColor="#34d399"
                      position="relative"
                      overflow="hidden"
                    >
                      {/* <Flex
                    flexDirection={"column"}
                    minWidth="100%"
                    minHeight="100%"
                    // paddingY="2"
                    height="50px"
                    paddingX="2"
                    alignItems="center"
                    borderRadius="50px"
                    borderColor={color.lightGreen}
                    position="relative"
                    overflow="hidden"
                    border={"1px solid"}
                  > */}
                      <Box
                        width={`100%`}
                        left="0"
                        bgColor="#34d399"
                        height="100%"
                        zIndex={1}
                        position="absolute"
                      ></Box>
                      <Flex
                        position="absolute"
                        zIndex={1}
                        justifyContent="center"
                        flexDirection={"column"}
                        minWidth="100%"
                      >
                        <Text
                          fontSize="8px"
                          textAlign="center"
                          paddingTop="2"
                          color="white"
                        >
                          TOKEN UNLOCK
                        </Text>
                        <Text
                          fontSize="16px"
                          textAlign="center"
                          paddingBottom="2"
                          color={"white"}
                        >
                          TOKEN DISTRIBUTION
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex justifyContent="center">
                    <Button
                      mt={10}
                      width={"85%"}
                      {...depositButtonStyle}
                      onClick={() =>
                        handleOutTokenWithdraw(
                          project.value.out_token_account_id
                        )
                      }
                      isDisabled={
                        now < cliffEndTime ||
                        userWithdrawnBalance !== "0" ||
                        userDepositedBalance === "0"
                      }
                    >
                      WITHDRAW
                    </Button>
                  </Flex>

                  <Flex justifyContent="center" mt={10} width={"100%"}>
                    <InfoCard2
                      title={"Total Tokens On Sale"}
                      value={convertToFloat(
                        project.value.total_tokens,
                        5,
                        decimals
                      ).toLocaleString()}
                      tokenTitle={project.value.title}
                      tokenLogo={"/logos/" + project.value.logo}
                      tokenTicker={project.value.title}
                    />
                  </Flex>
                  <Flex justifyContent="center" mt={10} width={"100%"}>
                    <InfoCard2
                      title={"Total IDO Deposits"}
                      value={convertToFloat(
                        project.value.total_deposits,
                        5,
                        inTokenDecimals
                      ).toLocaleString()}
                      tokenTitle={inToken.name}
                      tokenLogo={inToken.icon}
                      tokenTicker={inToken.symbol}
                    />
                  </Flex>
                  <Flex justifyContent="center" mt={10} width={"100%"}>
                    <InfoCard2
                      title={"Softcap"}
                      value={softCap.toLocaleString()}
                      tokenTitle={project.value.title}
                      tokenLogo={"/logos/" + project.value.logo}
                      tokenTicker={project.value.title}
                    />
                  </Flex>

                  <Flex justifyContent="center" mt={10} width={"100%"}>
                    <InfoCard2
                      title={"Your Token Purchased"}
                      value={estimatedTokenPurchased.toLocaleString()}
                      tokenTitle={project.value.title}
                      tokenLogo={"/logos/" + project.value.logo}
                      tokenTicker={project.value.title}
                    />
                  </Flex>

                  <Flex justifyContent="center" mt={10} width={"100%"}>
                    <InfoCard2
                      title={"Your Confirmed Deposits"}
                      value={convertToFloat(
                        userDepositedBalance,
                        5,
                        inTokenDecimals
                      ).toLocaleString()}
                      tokenTitle={inToken.name}
                      tokenLogo={inToken.icon}
                      tokenTicker={inToken.symbol}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
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
                By clicking the withdraw button, you agree to withdraw the IDO
                tokens in full to your wallet. DefiShards will not be liable
                for any losses or damages that may arise from the use of it’s
                products, services, or facilities. Do take note of the cliff
                period and distribution on the right pane. You acknowledge that
                you are solely responsible for managing your funds and ensuring
                their security.
              </Text>
            </Flex>
            <RuleCard />
          </Flex>
        </Flex>
      </>
    );
  }
}
