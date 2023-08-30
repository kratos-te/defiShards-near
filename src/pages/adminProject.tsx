import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flex,
  Text,
  Input,
  Button,
  Image,
  IconButton,
  useColorMode,
  useColorModeValue,
  Box,
  Show,
  Hide,
} from "@chakra-ui/react";
import { BiRightArrowAlt as PageRightIcon } from "react-icons/bi";
import { BiLeftArrowAlt as PageLeftIcon } from "react-icons/bi";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import TitleCard from "../components/TitleCard";
import LabelCard from "../components/LabelCard";
import Loading from "../components/Loading";
import {
  useColor,
  useNearLogin,
  useProjects,
  useActiveProject,
  useNearContext,
  useUpdateProject,
  ProjectInput,
} from "../hooks";
import "cropperjs/dist/cropper.css";
import {
  depositButtonStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  withdrawButtonStyle,
} from "../theme/ButtonStyles";
import { FtContract } from "../hooks/Near/classWrappers";
import { TimeDivision, TokenDecimals } from "../utils/const";
import InputCard from "../components/InputCard";
import { convertToFloat } from "../utils/convert";
import SelectCard from "../components/SelectCard";

const initData = {
  title: "",
  subTitle: "",
  email: "",
  telegram: "",
  coingecko: "",
  facebook: "",
  instagram: "",
  twitter: "",
  description: "",
  startTime: 0,
  endTime: 0,
  cliffPeriod: 0,
};

export default function ProjectDashboard() {
  const navigate = useNavigate();
  const buttonStyle = useColorModeValue(primaryButtonStyle, depositButtonStyle);
  const { accountIdNear, isLoggedInNear } = useNearLogin();
  const { config, initFtContract } = useNearContext();

  const { projects } = useProjects(null, null);
  const { activeProject } = useActiveProject();
  const { updateProject } = useUpdateProject();
  const color = useColor();
  const [submitOpen, setSubmitOpen] = useState<boolean>();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [depositBalance, setDepositBalance] = useState<number>(0);
  const [projectIndex, setProjectIndex] = useState<number>(0);
  const [decimals, setDecimals] = useState<number>(0);

  const [spin, setSpin] = useState<boolean>(false);

  // Input States
  const [projectId, setProjectId] = useState<number>(0);
  const [logo, setLogo] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [subTitle, setSubTitle] = useState<string>("");
  const [outTokenId, setOutTokenId] = useState<string>("");
  const [startingPrice, setStartingPrice] = useState<string>("0");
  const [email, setEmail] = useState<string>("");
  const [telegram, setTelegram] = useState<string>("");
  const [inTokenId, setInTokenId] = useState<string>("");
  const [inTokenDecimals, setInTokenDecimals] = useState<number>(24);
  const [outTokenDecimals, setOutTokenDecimals] = useState<number>(24);
  const [totalTokens, setTotalTokens] = useState<string>("0");
  const [coingecko, setCoingecko] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [cliffPeriod, setCliffPeriod] = useState<number>(0);
  const [description, setDescription] = useState<string>("");

  // Error
  const [errors, setErrors] = useState<any>(initData);

  const getDecimals = async (contractId: string) => {
    const ftContract = new FtContract(initFtContract(contractId));
    const metadata = await ftContract!.getFtMetadata();
    setDecimals(metadata.decimals);
  };

  const getUserBalance = async (ftContractId: string) => {
    const ftContract = new FtContract(initFtContract(ftContractId));
    const balance = await ftContract.getFtBalanceOfOwnerFormatted(
      accountIdNear
    );
    setUserBalance(balance);
  };

  const handlePrev = (max: number, current: number) => {
    if (current - 1 < 0) setProjectIndex(max);
    else setProjectIndex((projectIndex) => projectIndex - 1);
  };

  const handleNext = (max: number, current: number) => {
    if (current + 1 > max) setProjectIndex(0);
    else setProjectIndex((projectIndex) => projectIndex + 1);
  };

  const handleStartTimeChange = (newStartTime: any) => {
    setStartTime(newStartTime.toDate());
  };

  const handleEndTimeChange = (newEndTime: any) => {
    setEndTime(newEndTime.toDate());
  };

  const handleUpdateProject = async (
    projectIndex: number,
    logo: string,
    inTokenId: string,
    outTokenId: string
  ) => {
    let error = false;
    if (!title) {
      errors.title = "Empty title";
      error = true;
    }
    if (!subTitle) {
      errors.subTitle = "Empty subtitle";
      error = true;
    }

    if (!email) {
      errors.email = "Empty email";
      error = true;
    }
    if (!telegram) {
      errors.telegram = "Empty telegram";
      error = true;
    }

    if (!description) {
      errors.description = "Empty description";
      error = true;
    }

    if (!startTime || new Date(startTime).getTime() < Date.now() + 300 * 1000) {
      errors.startTime = 9;
      error = true;
    }

    if (!endTime) {
      errors.endTime = 9;
      error = true;
    }

    if (!cliffPeriod) {
      errors.cliffPeriod = 9;
      error = true;
    }

    if (error) {
      console.log(error);
      setSubmitOpen(false);
      return;
    }

    if (!startTime || !endTime) return;
    const startTimeStamp = Math.floor(new Date(startTime).getTime());
    const endTimeStamp = Math.floor(new Date(endTime).getTime());
    const period =
      cliffPeriod == 1
        ? 0.01 // 30 :
        : cliffPeriod == 2
        ? 60
        : cliffPeriod == 3
        ? 90
        : 365;
    const wrappedCliffPeriod = period * 24 * 3600 * 1000;

    setSpin(true);

    const res = await updateProject({
      projectId,
      projectInput: {
        title,
        sub_title: subTitle,
        logo: logo ? logo : "",
        starting_price: startingPrice,
        email,
        telegram: telegram,
        in_token_account_id: inTokenId,
        in_token_decimals: inTokenDecimals,
        out_token_account_id: outTokenId,
        out_token_decimals: outTokenDecimals,
        total_tokens: totalTokens,
        coingecko,
        facebook,
        instagram,
        twitter,
        description,
        start_time: (startTimeStamp * TimeDivision).toString(),
        end_time: (endTimeStamp * TimeDivision).toString(),
        cliff_period: (wrappedCliffPeriod * TimeDivision).toString(),
      },
    });
    console.log("Result is --> ", res);
  };

  useEffect(() => {
    if (!projects.isError && !projects.isLoading) {
      const userProjects = projects.value;
      setProjectId(userProjects[projectIndex].project_id);
      setLogo(userProjects[projectIndex].logo);
      setTitle(userProjects[projectIndex].title);
      setSubTitle(userProjects[projectIndex].sub_title);
      setInTokenId(userProjects[projectIndex].in_token_account_id);
      setOutTokenId(userProjects[projectIndex].out_token_account_id);
      setInTokenDecimals(userProjects[projectIndex].in_token_decimals);
      setOutTokenDecimals(userProjects[projectIndex].out_token_decimals);
      setStartingPrice(userProjects[projectIndex].starting_price);
      setEmail(userProjects[projectIndex].email);
      setTelegram(userProjects[projectIndex].telegram);
      setTotalTokens(userProjects[projectIndex].total_tokens);
      setCoingecko(userProjects[projectIndex].coingecko || "");
      setFacebook(userProjects[projectIndex].facebook || "");
      setInstagram(userProjects[projectIndex].instagram || "");
      setTwitter(userProjects[projectIndex].twitter || "");
      setDescription(userProjects[projectIndex].description);
      setStartTime(
        new Date(userProjects[projectIndex].start_time / TimeDivision)
      );
      setEndTime(new Date(userProjects[projectIndex].end_time / TimeDivision));
      const cliff_period =
        userProjects[projectIndex].cliff_period /
        TimeDivision /
        1000 /
        24 /
        3600;
      setCliffPeriod(
        cliff_period == 365
          ? 4
          : cliff_period == 90
          ? 3
          : cliff_period == 60
          ? 2
          : 1
      );
    }
  }, [projectIndex, submitOpen]);

  if (projects.isLoading || projects.isError) return <Loading />;
  else {
    const userProjects = projects.value;
    if (userProjects.length) {
      getDecimals(userProjects[projectIndex].out_token_account_id);
      const activate = !depositBalance || !isLoggedInNear ? false : true;
      const inTokenDecimals =
        userProjects[projectIndex].in_token_account_id === config.usdcContractId
          ? TokenDecimals.usdc
          : userProjects[projectIndex].in_token_account_id ===
            config.usdtContractId
          ? TokenDecimals.usdt
          : TokenDecimals.wnear;

      const startPrice = convertToFloat(startingPrice, 5, inTokenDecimals);
      const softCap =
        convertToFloat(userProjects[projectIndex].total_tokens, 5, decimals) *
        startPrice;
      const totalDeposit = convertToFloat(
        userProjects[projectIndex].total_deposits,
        5,
        inTokenDecimals
      );
      const liveTokenPrice =
        softCap > totalDeposit
          ? startPrice
          : convertToFloat(
              userProjects[projectIndex].total_deposits,
              5,
              inTokenDecimals
            ) /
            convertToFloat(
              userProjects[projectIndex].total_tokens,
              5,
              decimals
            );

      // const startTime = new Date(
      //   userProjects[projectIndex].start_time / TimeDivision
      // );
      // const endTime = new Date(userProjects[projectIndex].end_time / TimeDivision);

      if (isLoggedInNear)
        getUserBalance(userProjects[projectIndex].out_token_account_id);
      return (
        <>
          <TitleCard title={"Dashboard"} />
          <>
            <Flex
              width={"100%"}
              justifyContent={"flex-end"}
              alignItems="center"
            >
              <IconButton
                variant="ghost"
                aria-label="Prev project"
                icon={<PageLeftIcon />}
                onClick={() =>
                  handlePrev(userProjects.length - 1, projectIndex)
                }
              />
              <Text color={color.cardSubtitle}>Pages</Text>
              <IconButton
                variant="ghost"
                aria-label="Next project"
                icon={<PageRightIcon />}
                onClick={() =>
                  handleNext(userProjects.length - 1, projectIndex)
                }
              />
            </Flex>
            <Show above="md">
              <Flex
                width="100%"
                marginY="4"
                padding="8"
                shadow="lg"
                border="1px solid"
                borderRadius="2xl"
                borderColor={color.cardBorder}
                bgColor={color.cardBg}
                flexDirection="column"
              >
                <Flex justifyContent="space-between">
                  <Flex flexDirection="column" width="65%">
                    <InputCard
                      title="PROJECT / TOKEN NAME"
                      placeholder="E.G. PROJECT ATLAS"
                      required={true}
                      setData={setTitle}
                      value={title || userProjects[projectIndex].title}
                      error={errors.title}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="SUB TITLE"
                      placeholder="E.G. 2% LAUNCH SALE"
                      required={true}
                      setData={setSubTitle}
                      value={subTitle || userProjects[projectIndex].sub_title}
                      error={errors.subTitle}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="TOKEN ID"
                      required={false}
                      setData={() => {}}
                      value={userProjects[projectIndex].out_token_account_id}
                      disabled={true}
                    />
                    <Flex justifyContent={"space-between"}>
                      <InputCard
                        title="TOKEN TICKER"
                        required={false}
                        setData={() => {}}
                        value={userProjects[projectIndex].title}
                        disabled={true}
                      />
                      <InputCard
                        title="STARTING PRICE (USD)"
                        required={false}
                        setData={() => {}}
                        value={startPrice.toString()}
                        disabled={true}
                      />
                    </Flex>
                    <InputCard
                      title="E-MAIL"
                      placeholder="hello@johndoe.com"
                      required={true}
                      setData={setEmail}
                      value={email || userProjects[projectIndex].email}
                      error={errors.email}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="TELEGRAM CONTACT"
                      placeholder="cryptonear"
                      required={true}
                      setData={setTelegram}
                      value={telegram || userProjects[projectIndex].telegram}
                      error={errors.telegram}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="CHOOSE TOKEN TICKER TO RECEIVE"
                      required={false}
                      setData={() => {}}
                      value={userProjects[projectIndex].in_token_account_id}
                      disabled={true}
                    />
                    <InputCard
                      title="TOTAL DEPOSIT TOKEN AMOUNT(FOR LAUNCHPAD)"
                      required={false}
                      setData={() => {}}
                      value={convertToFloat(
                        userProjects[projectIndex].total_tokens,
                        5,
                        decimals
                      ).toString()}
                      disabled={true}
                    />
                    <InputCard
                      title="COINGECKO / COINMARKETCAP LINK (OPTIONAL)"
                      placeholder="https://www.coingecko.com/en/coins/bitcoin/"
                      required={false}
                      setData={setCoingecko}
                      value={
                        coingecko || userProjects[projectIndex].coingecko || ""
                      }
                      error={""}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="FACEBOOK (OPTIONAL)"
                      placeholder="https://www.facebook.com/projectname"
                      required={false}
                      setData={setFacebook}
                      value={
                        facebook || userProjects[projectIndex].facebook || ""
                      }
                      error={""}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="INSTAGRAM (OPTIONAL)"
                      placeholder="https://www.instagram.com/projectname"
                      required={false}
                      setData={setInstagram}
                      value={
                        instagram || userProjects[projectIndex].instagram || ""
                      }
                      error={""}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="TWITTER (OPTIONAL)"
                      placeholder="https://www.twitter.com/projectname"
                      required={false}
                      setData={setTwitter}
                      value={twitter || userProjects[projectIndex].twitter || ""}
                      error={""}
                      disabled={!submitOpen}
                    />
                    <InputCard
                      title="Total Deposit"
                      placeholder=""
                      required={false}
                      value={totalDeposit}
                      setData={() => {}}
                      error={""}
                      disabled={true}
                    />
                    <InputCard
                      title="Live Token Price"
                      placeholder=""
                      required={false}
                      setData={() => {}}
                      value={liveTokenPrice}
                      error={""}
                      disabled={true}
                    />
                    <InputCard
                      title="Softcap"
                      placeholder=""
                      setData={() => {}}
                      required={false}
                      value={softCap}
                      error={""}
                      disabled={true}
                    />
                  </Flex>
                  <Flex flexDirection="column" width="30%">
                    <Flex marginBottom="2" justifyContent="flex-end">
                      <Text
                        as="h1"
                        fontSize="20px"
                        fontWeight="700"
                        textAlign="end"
                        color={color.cardTitle}
                      >
                        PROJECT PARTICULARS
                      </Text>
                    </Flex>
                    <Flex>
                      <Flex flexDirection="column" width="full">
                        <Image
                          src={"/logos/" + userProjects[projectIndex].logo}
                          alt="cropped nft image"
                          width="full"
                          height="18rem"
                          cursor="pointer"
                          fallback={
                            <Flex
                              width="full"
                              height="18rem"
                              bgColor={color.inputbg}
                              justifyContent="center"
                              alignItems="center"
                              flexDirection="column"
                              border="1px solid"
                              borderRadius="2xl"
                              borderColor={color.border}
                              cursor="pointer"
                            >
                              <Text
                                as="h1"
                                color={color.placeholder}
                                fontSize="36"
                              >
                                LOGO
                              </Text>
                              <Text
                                as="span"
                                color={color.placeholder}
                                fontSize="12"
                              >
                                DRAG & DROP LOGO
                              </Text>
                            </Flex>
                          }
                          border="1px solid"
                          borderRadius="2xl"
                        />
                      </Flex>
                    </Flex>
                    <Box marginTop={5}>
                      <Text
                        as="h1"
                        color={
                          errors.startTime === 0
                            ? color.cardTitle
                            : color.required
                        }
                        fontSize="16"
                        align={"left"}
                      >
                        IDO START DATE & TIME (Must be several minutes later than
                        registration time cause of BlockTime Difference)
                        <span style={{ color: "red" }}>*</span>
                      </Text>
                      <LabelCard
                        title=""
                        value={`${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`}
                      />
                      {submitOpen ? (
                        <Datetime
                          onChange={handleStartTimeChange}
                          value={startTime}
                          input={false}
                        />
                      ) : (
                        <></>
                      )}
                    </Box>
                    <Box marginTop={5}>
                      <Text
                        as="h1"
                        color={
                          errors.endTime === 0 ? color.cardTitle : color.required
                        }
                        fontSize="16"
                        align={"left"}
                      >
                        IDO END DATE & TIME<span style={{ color: "red" }}>*</span>
                      </Text>
                      <LabelCard
                        title=""
                        value={`${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()}`}
                      />
                      {submitOpen ? (
                        <Datetime
                          onChange={handleEndTimeChange}
                          value={endTime}
                          input={false}
                        />
                      ) : (
                        <></>
                      )}
                    </Box>
                    {submitOpen ? (
                      <SelectCard
                        title="CLIFF PERIOD"
                        placeholder="PLEASE SELECT"
                        options={[
                          "30 DAYS (DEFAULT)",
                          "60 DAYS (2 MONTHS)",
                          "90 DAYS (3 MONTHS)",
                          "365 DAYS (1 YEAR)",
                        ]}
                        required={true}
                        setData={setCliffPeriod}
                        value={cliffPeriod}
                        error={errors.cliffPeriod}
                      />
                    ) : (
                      <LabelCard
                        title="CLIFF PERIOD(Days)"
                        value={(
                          userProjects[projectIndex].cliff_period /
                          TimeDivision /
                          1000 /
                          24 /
                          3600
                        ).toString()}
                      />
                    )}
                  </Flex>
                </Flex>
                <Flex justifyContent="center" flexDirection="column">
                  <InputCard
                    title="BRIEF PROJECT DESCRIPTION"
                    placeholder="description of your project"
                    required={true}
                    setData={setDescription}
                    value={
                      description || userProjects[projectIndex].description || ""
                    }
                    error={errors.description}
                    disabled={!submitOpen}
                  />
                </Flex>
                <Flex width="100%" paddingLeft="2" marginTop={"4"}>
                  <Text as="h3" fontSize="14px" textAlign="start">
                    {"PAYMENT (LISTING)"}
                  </Text>
                </Flex>
                <Flex
                  marginTop={"8"}
                  width={"100%"}
                  justifyContent="space-between"
                >
                  {submitOpen ? (
                    <Flex gap={4}>
                      <Button
                        width={40}
                        {...secondaryButtonStyle}
                        onClick={() =>
                          handleUpdateProject(
                            projectIndex,
                            userProjects[projectIndex].logo,
                            userProjects[projectIndex].in_token_account_id,
                            userProjects[projectIndex].out_token_account_id
                          )
                        }
                      >
                        SAVE
                      </Button>
                      <Button
                        width={40}
                        {...secondaryButtonStyle}
                        onClick={() => setSubmitOpen(false)}
                      >
                        CANCEL
                      </Button>
                    </Flex>
                  ) : (
                    <Button
                      width={40}
                      {...secondaryButtonStyle}
                      onClick={() => setSubmitOpen(true)}
                    >
                      EDIT DETAILS
                    </Button>
                  )}
                  <Flex justifyContent="end">
                    {/* <Button
                      width={40}
                      position="relative"
                      {...buttonStyle}
                      onClick={() => setSubmitOpen(true)}
                      isDisabled={userProjects[projectIndex].is_activated}
                    >
                      UPCOMING IDO
                    </Button> */}
                    {/* <Button
                      width={40}
                      position="relative"
                      {...secondaryButtonStyle}
                      onClick={() => setSubmitOpen(true)}
                      isDisabled={userProjects[projectIndex].is_activated}
                      marginLeft={"20px"}
                    >
                      PAID
                    </Button> */}
                    {userProjects[projectIndex].end_time / TimeDivision <
                    Date.now() ? (
                      <Flex
                        width={"150px"}
                        height={"40px"}
                        border="1px solid"
                        borderColor="grey"
                        bgColor="grey"
                        borderRadius="10px"
                        justifyContent={"center"}
                        alignItems={"center"}
                      >
                        <Text color="white" marginBottom={0}>
                          ENDED
                        </Text>
                      </Flex>
                    ) : (
                      <>
                        {userProjects[projectIndex].is_activated &&
                          userProjects[projectIndex].is_published &&
                          userProjects[projectIndex].end_time / TimeDivision >
                            Date.now() &&
                          userProjects[projectIndex].start_time / TimeDivision <
                            Date.now() && (
                            <Flex
                              width={"150px"}
                              height={"40px"}
                              bgColor="green"
                              borderRadius="10px"
                              marginRight={5}
                              justifyContent={"center"}
                              alignItems={"center"}
                            >
                              <Text color="white" marginBottom={0}>
                                LIVE
                              </Text>
                            </Flex>
                          )}
                        {userProjects[projectIndex].is_activated &&
                          userProjects[projectIndex].is_published &&
                          userProjects[projectIndex].start_time / TimeDivision >=
                            Date.now() && (
                            <Flex
                              width={"150px"}
                              height={"40px"}
                              bgColor="green"
                              borderRadius="10px"
                              justifyContent={"center"}
                              marginRight={5}
                              alignItems={"center"}
                            >
                              <Text color="white" marginBottom={0}>
                                UPCOMING IDO
                              </Text>
                            </Flex>
                          )}
                        {userProjects[projectIndex].is_activated && (
                          <Flex
                            width={"150px"}
                            height={"40px"}
                            borderRadius="10px"
                            justifyContent={"center"}
                            alignItems={"center"}
                            marginRight={5}
                            bgColor="green"
                            >
                            <Text color={"white"} marginBottom={0}>
                              ACTIVATED
                            </Text>
                          </Flex>
                        )}
                        {userProjects[projectIndex].is_published && (
                          <Flex
                            width={"150px"}
                            height={"40px"}
                            borderRadius="10px"
                            justifyContent={"center"}
                            alignItems={"center"}
                            marginRight={5}
                            bgColor="green"
                            >
                            <Text color={"white"} marginBottom={0}>
                              PUBLISHED
                            </Text>
                          </Flex>
                        )}
                      </>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Show>
            <Hide above="md">
              
              <Flex
                  width="100%"
                  marginY="4"
                  padding="8"
                  shadow="lg"
                  border="1px solid"
                  borderRadius="2xl"
                  borderColor={color.cardBorder}
                  bgColor={color.cardBg}
                  flexDirection="column"
                >
                  <Flex justifyContent="space-between">
                    <Flex flexDirection="column" width="100%">
                      
                    <Flex flexDirection="column" width="100%">
                      <Flex marginBottom="2" justifyContent="flex-end">
                        <Text
                          as="h1"
                          fontSize="20px"
                          fontWeight="700"
                          textAlign="end"
                          color={color.cardTitle}
                        >
                          PROJECT PARTICULARS
                        </Text>
                      </Flex>
                      <Flex>
                        <Flex flexDirection="column" width="full">
                          <Image
                            src={"/logos/" + userProjects[projectIndex].logo}
                            alt="cropped nft image"
                            width="full"
                            height="18rem"
                            cursor="pointer"
                            fallback={
                              <Flex
                                width="full"
                                height="18rem"
                                bgColor={color.inputbg}
                                justifyContent="center"
                                alignItems="center"
                                flexDirection="column"
                                border="1px solid"
                                borderRadius="2xl"
                                borderColor={color.border}
                                cursor="pointer"
                              >
                                <Text
                                  as="h1"
                                  color={color.placeholder}
                                  fontSize="36"
                                >
                                  LOGO
                                </Text>
                                <Text
                                  as="span"
                                  color={color.placeholder}
                                  fontSize="12"
                                >
                                  DRAG & DROP LOGO
                                </Text>
                              </Flex>
                            }
                            border="1px solid"
                            borderRadius="2xl"
                          />
                        </Flex>
                      </Flex>
                      <Box marginTop={5}>
                        <Text
                          as="h1"
                          color={
                            errors.startTime === 0
                              ? color.cardTitle
                              : color.required
                          }
                          fontSize="16"
                          align={"left"}
                        >
                          IDO START DATE & TIME (Must be several minutes later than
                          registration time cause of BlockTime Difference)
                          <span style={{ color: "red" }}>*</span>
                        </Text>
                        <LabelCard
                          title=""
                          value={`${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`}
                        />
                        {submitOpen ? (
                          <Datetime
                            onChange={handleStartTimeChange}
                            value={startTime}
                            input={false}
                          />
                        ) : (
                          <></>
                        )}
                      </Box>
                      <Box marginTop={5}>
                        <Text
                          as="h1"
                          color={
                            errors.endTime === 0 ? color.cardTitle : color.required
                          }
                          fontSize="16"
                          align={"left"}
                        >
                          IDO END DATE & TIME<span style={{ color: "red" }}>*</span>
                        </Text>
                        <LabelCard
                          title=""
                          value={`${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()}`}
                        />
                        {submitOpen ? (
                          <Datetime
                            onChange={handleEndTimeChange}
                            value={endTime}
                            input={false}
                          />
                        ) : (
                          <></>
                        )}
                      </Box>
                      {submitOpen ? (
                        <SelectCard
                          title="CLIFF PERIOD"
                          placeholder="PLEASE SELECT"
                          options={[
                            "30 DAYS (DEFAULT)",
                            "60 DAYS (2 MONTHS)",
                            "90 DAYS (3 MONTHS)",
                            "365 DAYS (1 YEAR)",
                          ]}
                          required={true}
                          setData={setCliffPeriod}
                          value={cliffPeriod}
                          error={errors.cliffPeriod}
                        />
                      ) : (
                        <LabelCard
                          title="CLIFF PERIOD(Days)"
                          value={(
                            userProjects[projectIndex].cliff_period /
                            TimeDivision /
                            1000 /
                            24 /
                            3600
                          ).toString()}
                        />
                      )}
                    </Flex>
                      <InputCard
                        title="PROJECT / TOKEN NAME"
                        placeholder="E.G. PROJECT ATLAS"
                        required={true}
                        setData={setTitle}
                        value={title || userProjects[projectIndex].title}
                        error={errors.title}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="SUB TITLE"
                        placeholder="E.G. 2% LAUNCH SALE"
                        required={true}
                        setData={setSubTitle}
                        value={subTitle || userProjects[projectIndex].sub_title}
                        error={errors.subTitle}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="TOKEN ID"
                        required={false}
                        setData={() => {}}
                        value={userProjects[projectIndex].out_token_account_id}
                        disabled={true}
                      />
                      <Flex justifyContent={"space-between"}>
                        <InputCard
                          title="TOKEN TICKER"
                          required={false}
                          setData={() => {}}
                          value={userProjects[projectIndex].title}
                          disabled={true}
                        />
                        <InputCard
                          title="STARTING PRICE (USD)"
                          required={false}
                          setData={() => {}}
                          value={startPrice.toString()}
                          disabled={true}
                        />
                      </Flex>
                      <InputCard
                        title="E-MAIL"
                        placeholder="hello@johndoe.com"
                        required={true}
                        setData={setEmail}
                        value={email || userProjects[projectIndex].email}
                        error={errors.email}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="TELEGRAM CONTACT"
                        placeholder="cryptonear"
                        required={true}
                        setData={setTelegram}
                        value={telegram || userProjects[projectIndex].telegram}
                        error={errors.telegram}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="CHOOSE TOKEN TICKER TO RECEIVE"
                        required={false}
                        setData={() => {}}
                        value={userProjects[projectIndex].in_token_account_id}
                        disabled={true}
                      />
                      <InputCard
                        title="TOTAL DEPOSIT TOKEN AMOUNT(FOR LAUNCHPAD)"
                        required={false}
                        setData={() => {}}
                        value={convertToFloat(
                          userProjects[projectIndex].total_tokens,
                          5,
                          decimals
                        ).toString()}
                        disabled={true}
                      />
                      <InputCard
                        title="COINGECKO / COINMARKETCAP LINK (OPTIONAL)"
                        placeholder="https://www.coingecko.com/en/coins/bitcoin/"
                        required={false}
                        setData={setCoingecko}
                        value={
                          coingecko || userProjects[projectIndex].coingecko || ""
                        }
                        error={""}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="FACEBOOK (OPTIONAL)"
                        placeholder="https://www.facebook.com/projectname"
                        required={false}
                        setData={setFacebook}
                        value={
                          facebook || userProjects[projectIndex].facebook || ""
                        }
                        error={""}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="INSTAGRAM (OPTIONAL)"
                        placeholder="https://www.instagram.com/projectname"
                        required={false}
                        setData={setInstagram}
                        value={
                          instagram || userProjects[projectIndex].instagram || ""
                        }
                        error={""}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="TWITTER (OPTIONAL)"
                        placeholder="https://www.twitter.com/projectname"
                        required={false}
                        setData={setTwitter}
                        value={twitter || userProjects[projectIndex].twitter || ""}
                        error={""}
                        disabled={!submitOpen}
                      />
                      <InputCard
                        title="Total Deposit"
                        placeholder=""
                        required={false}
                        value={totalDeposit}
                        setData={() => {}}
                        error={""}
                        disabled={true}
                      />
                      <InputCard
                        title="Live Token Price"
                        placeholder=""
                        required={false}
                        setData={() => {}}
                        value={liveTokenPrice}
                        error={""}
                        disabled={true}
                      />
                      <InputCard
                        title="Softcap"
                        placeholder=""
                        setData={() => {}}
                        required={false}
                        value={softCap}
                        error={""}
                        disabled={true}
                      />
                    </Flex>
                  </Flex>
                  <Flex justifyContent="center" flexDirection="column">
                    <InputCard
                      title="BRIEF PROJECT DESCRIPTION"
                      placeholder="description of your project"
                      required={true}
                      setData={setDescription}
                      value={
                        description || userProjects[projectIndex].description || ""
                      }
                      error={errors.description}
                      disabled={!submitOpen}
                    />
                  </Flex>
                  <Box width="100%" paddingLeft="2" 
                          marginTop={10}>
                    <Text as="h3" fontSize="14px" textAlign="start">
                      {"PAYMENT (LISTING)"}
                    </Text>
                  </Box>
                  <Box
                    marginTop={4}
                    width={"100%"}
                    justifyContent="space-between"
                  >
                    {submitOpen ? (
                      <Flex gap={4}>
                        <Button
                          width={'100%'}
                          marginTop={4}
                          {...secondaryButtonStyle}
                          onClick={() =>
                            handleUpdateProject(
                              projectIndex,
                              userProjects[projectIndex].logo,
                              userProjects[projectIndex].in_token_account_id,
                              userProjects[projectIndex].out_token_account_id
                            )
                          }
                        >
                          SAVE
                        </Button>
                        <Button
                          width={'100%'}
                          marginTop={4}
                          {...secondaryButtonStyle}
                          onClick={() => setSubmitOpen(false)}
                        >
                          CANCEL
                        </Button>
                      </Flex>
                    ) : (
                      <Button
                        width={'100%'}
                        marginTop={4}
                        {...secondaryButtonStyle}
                        onClick={() => setSubmitOpen(true)}
                      >
                        EDIT DETAILS
                      </Button>
                    )}
                    <Flex justifyContent="end">
                      {/* <Button
                        width={40}
                        position="relative"
                        {...buttonStyle}
                        onClick={() => setSubmitOpen(true)}
                        isDisabled={userProjects[projectIndex].is_activated}
                      >
                        UPCOMING IDO
                      </Button> */}
                      {/* <Button
                        width={40}
                        position="relative"
                        {...secondaryButtonStyle}
                        onClick={() => setSubmitOpen(true)}
                        isDisabled={userProjects[projectIndex].is_activated}
                        marginLeft={"20px"}
                      >
                        PAID
                      </Button> */}
                      {userProjects[projectIndex].end_time / TimeDivision <
                      Date.now() ? (
                        <Flex
                          width={"100%"}
                          marginTop={4}
                          height={"40px"}
                          border="1px solid"
                          borderColor="grey"
                          bgColor="grey"
                          borderRadius="10px"
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          <Text color="white" marginBottom={0}>
                            ENDED
                          </Text>
                        </Flex>
                      ) : (
                        <>
                          {userProjects[projectIndex].is_activated &&
                            userProjects[projectIndex].is_published &&
                            userProjects[projectIndex].end_time / TimeDivision >
                              Date.now() &&
                            userProjects[projectIndex].start_time / TimeDivision <
                              Date.now() && (
                              <Flex
                                width={'100%'}
                                marginTop={4}
                                height={"40px"}
                                bgColor="green"
                                borderRadius="10px"
                                marginRight={5}
                                justifyContent={"center"}
                                alignItems={"center"}
                              >
                                <Text color="white" marginBottom={0}>
                                  LIVE
                                </Text>
                              </Flex>
                            )}
                          {userProjects[projectIndex].is_activated &&
                            userProjects[projectIndex].is_published &&
                            userProjects[projectIndex].start_time / TimeDivision >=
                              Date.now() && (
                              <Flex
                                width={"100%"}
                                marginTop={4}
                                height={"40px"}
                                bgColor="green"
                                borderRadius="10px"
                                justifyContent={"center"}
                                marginRight={5}
                                alignItems={"center"}
                              >
                                <Text color="white" marginBottom={0}>
                                  UPCOMING IDO
                                </Text>
                              </Flex>
                            )}
                          {userProjects[projectIndex].is_activated && (
                            <Flex
                              width={"100%"}
                              marginTop={4}
                              height={"40px"}
                              borderRadius="10px"
                              justifyContent={"center"}
                              alignItems={"center"}
                              marginRight={5}
                              bgColor="green"
                              >
                              <Text color={"white"} marginBottom={0}>
                                ACTIVATED
                              </Text>
                            </Flex>
                          )}
                          {userProjects[projectIndex].is_published && (
                            <Flex
                              width={"100%"}
                              marginTop={4}
                              height={"40px"}
                              borderRadius="10px"
                              justifyContent={"center"}
                              alignItems={"center"}
                              marginRight={5}
                              bgColor="green"
                              >
                              <Text color={"white"} marginBottom={0}>
                                PUBLISHED
                              </Text>
                            </Flex>
                          )}
                        </>
                      )}
                    </Flex>
                  </Box>
              </Flex>
            </Hide>
          </>
        </>
      );
    } else {
      return (
        <>
          <Flex justifyContent={"center"}>
            <TitleCard title={"You do not own any projects yet."} />
          </Flex>
          <Flex justifyContent={"center"} marginY={24}>
            <Button
              variant="ghost"
              colorScheme="purple"
              onClick={() => navigate("/create")}
            >
              Register Project
            </Button>
          </Flex>
        </>
      );
    }
  }
}
