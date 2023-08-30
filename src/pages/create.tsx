import { useState, useEffect, useRef } from "react";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import {
  Flex,
  Text,
  Input,
  Button,
  Image,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Tooltip,
  Spinner,
  Hide,
  Show,
  Box,
} from "@chakra-ui/react";
import {
  BiCrop as CropIcon,
  BiChevronLeft as ArrowLeftIcon,
  BiChevronRight as ArrowRightIcon,
} from "react-icons/bi";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import TitleCard from "../components/TitleCard";
import InputCard from "../components/InputCard";
import InputAreaCard from "../components/InputAreaCard";
import SelectCard from "../components/SelectCard";
import DateCard from "../components/DateCard";
import RuleCard from "../components/RuleCard";
import {
  useColor,
  useRegisterProject,
  useNearContext,
  useNearLogin,
  ProjectInput,
  useTxOutcome,
} from "../hooks";
import { FtContract } from "../hooks/Near/classWrappers";
import { NftImageType } from "../types";
import { Payment } from "../utils/const";
import USDT from "../assets/img/icons/usdt.svg";
import USDC from "../assets/img/icons/usdc.svg";
import wNEAR from "../assets/img/icons/wnear.svg";
import InfoIcon from "../assets/img/icons/info.svg";
import { primaryButtonStyle } from "../theme/ButtonStyles";
import axios from "axios";

const initData: ProjectInput = {
  title: "",
  subTitle: "",
  outTokenId: "",
  inTokenId: "",
  logo: "",
  startingPrice: 0,
  email: "",
  telegram: "",
  totalTokens: 0,
  coingecko: "",
  facebook: "",
  instagram: "",
  twitter: "",
  description: "",
  startTime: 0,
  endTime: 0,
  cliffPeriod: 0,
};

export default function Create() {
  const { config, initFtContract, neargenesisContract } = useNearContext();
  const { isLoggedInNear, accountIdNear } = useNearLogin();
  const { registerProject } = useRegisterProject();
  const color = useColor();
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [listingFee, setListingFee] = useState<number>(0);
  const [isCropped, setIsCropped] = useState<boolean>(false);
  const [cropperInstance, setCropperInstance] = useState<Cropper>();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [paymentTokenBalance, setPaymentTokenBalance] = useState<number>(0);
  const [errors, setErrors] = useState<ProjectInput>(initData);
  const [title, setTitle] = useState<string>("");
  const [subTitle, setSubTitle] = useState<string>("");
  const [outTokenId, setOutTokenId] = useState<string>("");
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [telegram, setTelegram] = useState<string>("");
  const [inTokenId, setInTokenId] = useState<number>(1);
  const [paymentTokenId, setPaymentTokenId] = useState<number>(1);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [coingecko, setCoingecko] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();
  const [cliffPeriod, setCliffPeriod] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [imageUpload, setImageUpload] = useState<File | null>(new File([], ""));
  const [imageUploadUri, setImageUploadUri] = useState<string>();
  const [imageUploadBlob, setImageUploadBlob] = useState<Blob | null>(null);
  const [submitOpen, setSubmitOpen] = useState<boolean>(false);
  const [spin, setSpin] = useState<boolean>(false);

  const inTokenContract = new FtContract(
    initFtContract(
      inTokenId === 1
        ? config.usdtContractId
        : inTokenId === 2
          ? config.usdcContractId
          : config.wnearContractId
    )
  );

  const paymentTokenContract = new FtContract(
    initFtContract(
      paymentTokenId === 1 ? config.usdtContractId : config.usdcContractId
    )
  );

  // const blobToBase64 = async (blob: Blob) => {
  //   // check max. file size is not exceeded
  //   let base64: string | ArrayBuffer = "";
  //   const reader = new FileReader();
  //   reader.onloadend = () => console.log(reader.result);
  //   reader.readAsDataURL(blob);

  //   reader.onload = () => {
  //     // console.log(reader.result); //base64encoded string
  //     base64 = reader.result ?? "";
  //   };
  //   reader.onerror = (error) => {
  //     console.log("Error: ", error);
  //   };

  //   return base64;
  // };

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  const handleRegisterProject = async () => {
    // if (startTime) {
    //   const dateStartTime = startTime;
    //   const isoStartTime = dateStartTime.toISOString();
    //   setStartTime(isoStartTime)
    // }

    // if (endTime) {
    //   const dateEndTime = endTime;
    //   const isoEndTime = dateEndTime.toISOString();
    //   setEndTime(isoEndTime)
    // }

    let error = false;
    if (!title) {
      errors.title = "Empty title";
      error = true;
    }
    if (!subTitle) {
      errors.subTitle = "Empty subtitle";
      error = true;
    }
    if (!outTokenId) {
      errors.outTokenId = "Empty outTokenId";
      error = true;
    } else if (!outTokenId.endsWith(".testnet")) {
      errors.outTokenId = "Not valid token address";
      error = true;
    }
    if (!startingPrice) {
      errors.startingPrice = 9;
      error = true;
    }
    if (!email) {
      errors.email = "Empty email";
      error = true;
    }
    if (!telegram) {
      errors.telegram = "Empty telegram";
      error = true;
    } else if (telegram.includes("https://") || telegram.includes("t.me")) {
      errors.telegram = "Please only insert ID";
      error = true;
    }
    if (!inTokenId) {
      errors.inTokenId = "Empty inTokenId";
      error = true;
    }
    if (!totalTokens) {
      errors.totalTokens = 9;
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
    if (!imageUploadBlob) {
      errors.logo = "Empty Logo";
      error = true;
    }
    if (error) {
      setSubmitOpen(false);
      return;
    }

    // const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxOWRlMTFhMS02MWFhLTQ3MTEtYWNiMy1lOGMwNzY0MTY3ZTkiLCJlbWFpbCI6Inh1Z3Vhbmd4aWE3MjVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjU1M2MxODBmMTJiMDI5MzA0YWEwIiwic2NvcGVkS2V5U2VjcmV0IjoiYzY0NzVlMTkzNTI0MTczZmUxNDM1Yjc4MWQ1MzFkZmMyYzJiNjZjZjBiMGYyNjY2MTk4NTI5ZTIyMzFiNWEzYiIsImlhdCI6MTY4MDQ5OTIyMH0.LbA5s3wBVpTWfCLWWxHapXNl-0-pJGGFGMMpop22WTE`

    // const formData = new FormData();

    // formData.append('file', imageUploadBlob)

    // const metadata = JSON.stringify({
    //   name: 'File name',
    // });
    // formData.append('pinataMetadata', metadata);

    // const options = JSON.stringify({
    //   cidVersion: 0,
    // })
    // formData.append('pinataOptions', options);

    // try {
    //   const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    //     // maxBodyLength: "Infinity",
    //     headers: {
    //       'Content-Type': `multipart/form-data;`,
    //       Authorization: JWT
    //     }
    //   });
    //   console.log(res.data);
    // } catch (error) {
    //   console.log(error);
    // }

    // const logo = blobToBase64(imageUploadBlob);
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
    const logo: string = await handleUpload();

    const res = await registerProject({
      accountId: accountIdNear,
      inTokenContract: inTokenContract,
      outTokenContract: new FtContract(
        initFtContract(outTokenId.toLowerCase())
      ),
      paymentTokenContract: paymentTokenContract,
      title,
      subTitle,
      logo: logo ? logo : "",
      startingPrice,
      email,
      telegram: "https://t.me/" + telegram,
      inTokenId: inTokenContract.contractId,
      outTokenId: outTokenId.toLowerCase(),
      totalTokens,
      coingecko,
      facebook,
      instagram,
      twitter,
      description,
      startTime: startTimeStamp,
      endTime: endTimeStamp,
      cliffPeriod: wrappedCliffPeriod,
    });
    console.log("Result is --> ", res);
  };

  const getUserBalance = async () => {
    const balance = await inTokenContract.getFtBalanceOfOwnerFormatted(
      accountIdNear
    );
    setUserBalance(balance);
  };

  const getPaymentTokenBalance = async () => {
    const balance = await paymentTokenContract.getFtBalanceOfOwnerFormatted(
      accountIdNear
    );
    setPaymentTokenBalance(balance);
  };

  const getListingFee = async () => {
    setListingFee(await neargenesisContract.getListingFee());
  };

  useEffect(() => {
    if (isLoggedInNear) getUserBalance();
  }, [isLoggedInNear, inTokenContract]);

  useEffect(() => {
    if (isLoggedInNear) getPaymentTokenBalance();
  }, [isLoggedInNear, paymentTokenContract]);

  useTxOutcome((outcome) => {
    console.log(outcome);
    if (
      outcome.success &&
      outcome.originalFunctionCall?.methodName === "ft_transfer_call"
    ) {
      alert("Succeed");
    } else if (!outcome.success) {
      alert("Failed");
    }
  });

  useEffect(() => {
    getListingFee();
  }, []);

  useEffect(() => {
    setErrors(initData);
    if (title) setErrors({ ...errors, title: "" });
    if (subTitle) setErrors({ ...errors, subTitle: "" });
    if (outTokenId) setErrors({ ...errors, outTokenId: "" });
    if (startingPrice) setErrors({ ...errors, startingPrice: 0 });
    if (email) setErrors({ ...errors, email: "" });
    if (imageUploadBlob) setErrors({ ...errors, logo: "" });
    if (telegram) setErrors({ ...errors, telegram: "" });
    if (inTokenId) setErrors({ ...errors, inTokenId: "" });
    if (totalTokens) setErrors({ ...errors, totalTokens: 0 });
    if (description) setErrors({ ...errors, description: "" });
    if (startTime) setErrors({ ...errors, startTime: 0 });
    if (endTime) setErrors({ ...errors, endTime: 0 });
    if (cliffPeriod) setErrors({ ...errors, cliffPeriod: 0 });
  }, [
    title,
    subTitle,
    outTokenId,
    startingPrice,
    email,
    telegram,
    inTokenId,
    totalTokens,
    description,
    startTime,
    endTime,
    cliffPeriod,
    imageUploadBlob,
  ]);

  // const formData = new FormData();

  // formData.append('file', imageUploadBlob)

  // const metadata = JSON.stringify({
  //   name: 'File name',
  // });
  // formData.append('pinataMetadata', metadata);

  // const options = JSON.stringify({
  //   cidVersion: 0,
  // })
  // formData.append('pinataOptions', options);

  // try {
  //   const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
  //     // maxBodyLength: "Infinity",
  //     headers: {
  //       'Content-Type': `multipart/form-data;`,
  //       Authorization: JWT
  //     }
  //   });
  //   console.log(res.data);
  // } catch (error) {
  //   console.log(error);
  // }

  const handleUpload = async () => {
    let logo = "";

    if (imageUploadBlob) {
      const formData = new FormData();
      const base64Code = await blobToBase64(imageUploadBlob);
      console.log("base64Code>>>>>>>>>>>>>>>>>", base64Code);
      // console.log('imageUploadBlob>>>>>>>>>>>>>>>>>>', imageUploadBlob);

      formData.append("base64Code", base64Code);
      // formData.append('imageUploadBlob', 'imageUploadBlob')

      console.log("formData>>>>>>>>>", formData);

      try {
        const res = await axios.post(
          "https://api.testnet.neargenesis.com/upload",
          formData,
          {
            // maxBodyLength: "Infinity",
            headers: {
              "Content-Type": `multipart/form-data`,
            },
          }
        );
        const newName = res.data.newName;
        logo = newName;
        console.log(logo);
      } catch (error) {
        console.log(error);
      }
    }

    return logo;
  };

  const handleStartTimeChange = (newStartTime: any) => {
    // alert('This is starttime value>>>>>>>>>>>' + newStartTime);
    setStartTime(newStartTime);
  };

  const handleEndTimeChange = (newEndTime: any) => {
    // alert('This is Endtime value>>>>>>>>>>>' + newEndTime);
    setEndTime(newEndTime);
  };

  useEffect(() => {
    console.log(inTokenId);
  }, [inTokenId]);
  return (
    <>
      {spin && (
        <Flex
          width={"100%"}
          height={"100vh"}
          position={"fixed"}
          left={0}
          top={0}
          zIndex={10000}
          bgColor={color.spinBg}
          justify={"center"}
          alignItems={"center"}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      )}
      <TitleCard
        title={submitOpen ? "Listing Confirmation" : "Create Listing"}
      />

      {/* <Button onClick={() => handleUpload()}></Button> */}
      {submitOpen ? (
        <>
          <Flex maxWidth="lg" flexDirection="column" marginX="auto">
            <Flex>
              <Button
                variant="ghost"
                colorScheme="purple"
                leftIcon={<ArrowLeftIcon />}
                onClick={() => setSubmitOpen(false)}
              >
                Back
              </Button>
            </Flex>
            <Flex
              marginY="4"
              padding="8"
              shadow="lg"
              border="1px solid"
              borderRadius="2xl"
              borderColor={color.cardBorder}
              flexDirection="column"
              bgColor={color.cardBg}
            >
              <Flex marginBottom="20px" justifyContent="center">
                <Text
                  as="h1"
                  fontSize="20px"
                  textAlign="center"
                  color={color.cardTitle}
                >
                  Payment
                </Text>
              </Flex>
              <Flex
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                marginY={4}
              >
                <Text
                  as="h2"
                  fontSize="14px"
                  textAlign="start"
                  color={color.cardSubtitle}
                  marginBottom={4}
                >
                  You are about to submit $500 {Payment[paymentTokenId]} to Near
                  Genesis for project registry and listing. Please read our
                  disclaimer, Terms & Conditions, and verify the deduction
                  amount before continuing
                </Text>
                <Text
                  as="h2"
                  fontSize="64px"
                  textAlign="center"
                  fontWeight="bold"
                  marginY={2}
                  color={color.cardTitle}
                >
                  $500
                </Text>
                <Text
                  as="h2"
                  fontSize="16px"
                  textAlign="center"
                  color={color.cardTitle}
                >
                  - USD -
                </Text>
              </Flex>
              <Flex alignItems="center" flexDirection="column" marginY={8}>
                <Flex
                  width="100%"
                  minHeight="20"
                  paddingY="2"
                  paddingX="8"
                  marginY={3}
                  borderRadius="2xl"
                  bgColor={color.inputbg}
                  alignItems="center"
                  fontSize="18px"
                  border="1px solid"
                  borderColor={color.cardSubtitle}
                  onChange={(e) => console.log(e)}
                  justifyContent={"space-between"}
                >
                  <Flex>
                    <Text
                      as="h3"
                      fontSize="14px"
                      fontWeight={500}
                      textAlign="start"
                    >
                      {"SELECT ASSET"}
                    </Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Flex justifyContent="end" flexDirection="column">
                      <Flex margin="5px" justifyContent="end">
                        <Text
                          as="h2"
                          fontSize="1vw"
                          textAlign="end"
                          marginTop="10px"
                          width="max-content"
                          color={color.cardSubtitle}
                        >
                          {"USD"}
                        </Text>
                      </Flex>
                      <Flex justifyContent="end" margin="5px">
                        <Image src={paymentTokenId === 1 ? USDT : USDC} />
                        <Text
                          as="h1"
                          fontSize="16px"
                          textAlign="end"
                          marginLeft="15px"
                          color={color.cardTitle}
                        >
                          {Payment[paymentTokenId]}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<ArrowRightIcon />}
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuOptionGroup
                            defaultValue={paymentTokenId.toString()}
                            title="Select assets"
                            type="radio"
                            onChange={(e) =>
                              setPaymentTokenId(
                                e === config.usdtContractId ? 1 : 2
                              )
                            }
                          >
                            <MenuItemOption value={config.usdtContractId}>
                              USDT
                            </MenuItemOption>
                            <MenuItemOption value={config.usdcContractId}>
                              USDC
                            </MenuItemOption>
                          </MenuOptionGroup>
                        </MenuList>
                      </Menu>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex
                  width="100%"
                  minHeight="20"
                  paddingY="2"
                  paddingX="8"
                  marginY={3}
                  bgColor={color.inputbg}
                  fontSize="18px"
                  border="1px solid"
                  borderColor={color.border}
                  borderRadius="2xl"
                  justifyContent={"space-between"}
                  alignItems="center"
                  onChange={(e) => console.log(e)}
                >
                  <Text
                    as="h3"
                    fontSize="14px"
                    fontWeight={500}
                    textAlign="start"
                  >
                    {"AVAILABLE TO SEND"}
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="end"
                    color={color.cardSubtitle}
                  >
                    {`${paymentTokenBalance}`}
                  </Text>
                </Flex>
                <Flex
                  width="100%"
                  minHeight="20"
                  paddingY="2"
                  paddingX="8"
                  marginY={3}
                  bgColor={color.inputbg}
                  fontSize="18px"
                  border="1px solid"
                  borderColor={color.border}
                  borderRadius="2xl"
                  justifyContent={"space-between"}
                  alignItems="center"
                  onChange={(e) => console.log(e)}
                >
                  <Text
                    as="h3"
                    fontSize="14px"
                    fontWeight={500}
                    textAlign="start"
                  >
                    {"FEES"}
                  </Text>
                  <Text as="h2" fontSize="18px" textAlign="end" color="#9d9d9d">
                    {`-${listingFee}`}
                  </Text>
                </Flex>
                <Flex
                  width="100%"
                  minHeight="20"
                  paddingY="2"
                  paddingX="8"
                  marginY={3}
                  bgColor={color.inputbg}
                  fontSize="18px"
                  border="1px solid"
                  borderColor={color.border}
                  borderRadius="2xl"
                  justifyContent={"space-between"}
                  alignItems="center"
                  onChange={(e) => console.log(e)}
                >
                  <Text
                    as="h3"
                    fontSize="14px"
                    fontWeight={500}
                    textAlign="start"
                  >
                    {"BALANCE TO UPDATE"}
                  </Text>
                  <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="end"
                    color={"LightGreen"}
                  >
                    {`${Number(paymentTokenBalance) - listingFee}`}
                  </Text>
                </Flex>
              </Flex>
              <Flex>
                <Button
                  width={"100%"}
                  bgColor={color.submitBtnBg}
                  border={"1px solid"}
                  color={color.submitBtnColor}
                  borderColor={color.submitBtnColor}
                  onClick={handleRegisterProject}
                >
                  SUBMIT
                </Button>
              </Flex>
            </Flex>
          </Flex>
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
                By clicking the SUBMIT button, you acknowledge and agree to the terms and conditions outlined by DefiShards's website. Upon clicking the SUBMIT button, you will be redirected to a confirmation page where you can verify your submission and proceed to make the necessary payment of $500 for listing and administrative fees registration. It is important to note that this payment is non-refundable and must be completed prior to the commencement of the listing review process. We emphasize the importance of carefully reviewing all information provided before clicking the SUBMIT button.

                The acceptance of your submission is contingent upon the nature of your project, the validity of your token contract, and the provision of adequate proof to establish the legitimacy of your project, all of which must comply with DefiShards's terms and conditions. By submitting the payment, you indicate your agreement to these terms and acknowledge that the payment is non-refundable, regardless of the outcome of the listing review process.

                Please be aware that DefiShards assumes no responsibility for any lost, misused, or stolen funds that you may deposit. It is your sole responsibility to manage and ensure the security of your funds. We advise exercising caution and implementing appropriate security measures to safeguard your assets.

                By proceeding with the submission and payment, you demonstrate your understanding of the above conditions and your commitment to complying with the applicable legal and regulatory requirements associated with DefiShards.              </Text>
            </Flex>
            <RuleCard />
          </Flex>
        </>
      ) : (
        <>
          <Show above="md">
            <Flex
              width="100%"
              marginY="4"
              padding="8"
              shadow="lg"
              border="1px solid"
              borderRadius="2xl"
              borderColor={color.cardBorder}
              flexDirection="column"
              bgColor={color.cardBg}
            >
              <Flex justifyContent="space-between">
                <Flex flexDirection="column" width="65%">
                  <Flex marginBottom="2">
                    <Text
                      as="h1"
                      fontSize="20px"
                      fontWeight="700"
                      textAlign="start"
                      color={color.required}
                    >
                      * All Fields Mandatory
                    </Text>
                  </Flex>
                  <InputCard
                    title="PROJECT / TOKEN NAME"
                    placeholder="E.G. PROJECT ATLAS"
                    required={true}
                    setData={setTitle}
                    value={title}
                    error={errors.title}
                  />
                  <InputCard
                    title="SUB TITLE"
                    placeholder="E.G. 2% LAUNCH SALE"
                    required={true}
                    setData={setSubTitle}
                    value={subTitle}
                    error={errors.subTitle}
                  />
                  <Flex justifyContent={"space-between"}>
                    <InputCard
                      title="TOKEN ADDRESS"
                      placeholder="token.testnet"
                      required={true}
                      setData={setOutTokenId}
                      value={outTokenId}
                      error={errors.outTokenId}
                    />
                    <InputCard
                      title={
                        "STARTING PRICE (" +
                        (inTokenId == 1
                          ? "USDT"
                          : inTokenId == 2
                            ? "USDC"
                            : "wNEAR") +
                        ")"
                      }
                      placeholder="0.1"
                      required={true}
                      setData={setStartingPrice}
                      value={startingPrice}
                      error={errors.startingPrice}
                    />
                  </Flex>
                  <InputCard
                    title="E-MAIL"
                    placeholder="hello@johndoe.com"
                    required={true}
                    setData={setEmail}
                    value={email}
                    error={errors.email}
                  />
                  <InputCard
                    title="TELEGRAM CONTACT (Please input @‌username only)"
                    placeholder="cryptonear"
                    required={true}
                    setData={setTelegram}
                    value={telegram}
                    error={errors.telegram}
                  />
                  <SelectCard
                    title="TOKEN RECEIVABLE FOR IDO"
                    placeholder="PLEASE SELECT"
                    options={["USDT", "USDC", "wNEAR"]}
                    required={true}
                    setData={setInTokenId}
                    value={inTokenId}
                    error={errors.inTokenId}
                  />
                  <InputCard
                    title="TOTAL IDO TOKENS FOR SALE"
                    placeholder="0"
                    required={true}
                    setData={setTotalTokens}
                    type="number"
                    value={totalTokens}
                    error={errors.totalTokens}
                  />
                  <InputCard
                    title="COINGECKO / COINMARKETCAP LINK (OPTIONAL)"
                    placeholder="https://www.coingecko.com/en/coins/bitcoin/"
                    required={false}
                    setData={setCoingecko}
                    value={coingecko}
                    error={errors.coingecko}
                  />
                  <InputCard
                    title="FACEBOOK (OPTIONAL)"
                    placeholder="https://www.facebook.com/projectname"
                    required={false}
                    setData={setFacebook}
                    value={facebook}
                    error={errors.facebook}
                  />
                  <InputCard
                    title="INSTAGRAM (OPTIONAL)"
                    placeholder="https://www.instagram.com/projectname"
                    required={false}
                    setData={setInstagram}
                    value={instagram}
                    error={errors.instagram}
                  />
                  <InputCard
                    title="TWITTER (OPTIONAL)"
                    placeholder="https://www.twitter.com/projectname"
                    required={false}
                    setData={setTwitter}
                    value={twitter}
                    error={errors.twitter}
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
                    {imageUpload?.name !== "" && !isCropped ? (
                      <Flex flexDirection="column" width="100%">
                        <Cropper
                          src={imageUploadUri}
                          aspectRatio={1}
                          guides
                          style={{ width: "100%" }}
                          crop={(e) => {
                            setCropperInstance(e.currentTarget.cropper);
                          }}
                          accept={NftImageType}
                          alt="Image cropper"
                        // maxLength={250}
                        />
                        <Button
                          colorScheme="brand"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          marginLeft="auto"
                          marginTop="4"
                          rightIcon={<CropIcon size="20" />}
                          onClick={() => {
                            const croppedImgUrl = cropperInstance
                              ?.getCroppedCanvas()
                              .toDataURL();
                            setImageUploadUri(croppedImgUrl);

                            cropperInstance
                              ?.getCroppedCanvas()
                              .toBlob((croppedImgBlob) => {
                                setImageUploadBlob(croppedImgBlob);
                              });
                            setIsCropped(true);
                          }}
                        >
                          Done
                        </Button>
                      </Flex>
                    ) : (
                      <Flex flexDirection="column" width="full">
                        {imageUploadUri !== "" && (
                          <Image
                            src={imageUploadUri}
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
                                  <Text as="span" color={color.required}>
                                    *
                                  </Text>
                                </Text>
                              </Flex>
                            }
                            border="1px solid"
                            borderRadius="2xl"
                          />
                        )}
                        <Input
                          cursor="pointer"
                          color={errors.logo ? color.required : color.black}
                          onClick={() => {
                            fileUploadInputRef.current?.click();
                          }}
                          placeholder="Upload"
                          value={imageUpload?.name || "No file selected"}
                          readOnly
                          variant={isCropped ? "filled" : "outline"}
                        />
                        <input
                          type="file"
                          name="image"
                          onChange={(e) => {
                            if (!e.target.files) return;
                            setImageUpload(e.target.files.item(0));

                            const reader = new FileReader();
                            reader.onload = () => {
                              if (!reader.result) return;

                              setImageUploadUri(reader.result.toString());
                              setIsCropped(false);
                            };
                            reader.readAsDataURL(
                              e.target.files?.item(0) as Blob
                            );
                            setImageUploadBlob(e.target.files?.item(0) as Blob);
                          }}
                          accept={NftImageType}
                          style={{ display: "none" }}
                          ref={fileUploadInputRef}
                        />
                      </Flex>
                    )}
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
                    <Datetime
                      onChange={handleStartTimeChange}
                      value={startTime}
                      input={false}
                    />
                  </Box>
                  {/* <DateCard
                    title="IDO START DATE & TIME (Must be several minutes later than registration time cause of BlockTime Difference)"
                    placeholder="PLEASE SELECT (Must be later than registration time)"
                    required={true}
                    setData={setStartTime}
                    value={startTime}
                    error={errors.startTime}
                  /> */}
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
                    <Datetime
                      onChange={handleEndTimeChange}
                      value={endTime}
                      input={false}
                    />
                  </Box>
                  {/* <DateCard
                    title="IDO END DATE & TIME"
                    placeholder="PLEASE SELECT"
                    required={true}
                    setData={setEndTime}
                    value={endTime}
                    error={errors.endTime}
                  /> */}

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
                </Flex>
              </Flex>
              <Flex justifyContent="center" flexDirection="column">
                <InputAreaCard
                  title="BRIEF DESCRIPTION OF YOUR PROJECT"
                  required={true}
                  setData={setDescription}
                  value={description}
                  error={errors.description}
                />
                <Flex justifyContent="start" alignItems="start" marginTop="4">
                  <Text as="h3" fontSize="14px" textAlign="start">
                    {"PAYMENT"}
                  </Text>
                  <Tooltip
                    hasArrow
                    placement="auto-start"
                    padding={3}
                    width={"60%"}
                    label="This is a one time listing fee payable to DefiShards. Please read disclaimer and terms & conditions"
                    aria-label="A tooltip"
                    bg={"#10B981"}
                    fontSize={"12px"}
                    closeOnClick={false}
                  >
                    <Image src={InfoIcon} width={"4"} marginX={2} />
                  </Tooltip>
                  <Text
                    lineHeight={1}
                    marginX={4}
                    minHeight="10"
                    fontSize="40px"
                    fontWeight={700}
                    color={color.input}
                  >
                    $500.00
                  </Text>
                </Flex>
              </Flex>
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
                    By clicking the SUBMIT button, you acknowledge and agree to the terms and conditions outlined by DefiShards's website. Upon clicking the SUBMIT button, you will be redirected to a confirmation page where you can verify your submission and proceed to make the necessary payment of $500 for listing and administrative fees registration. It is important to note that this payment is non-refundable and must be completed prior to the commencement of the listing review process. We emphasize the importance of carefully reviewing all information provided before clicking the SUBMIT button.

                    The acceptance of your submission is contingent upon the nature of your project, the validity of your token contract, and the provision of adequate proof to establish the legitimacy of your project, all of which must comply with DefiShards's terms and conditions. By submitting the payment, you indicate your agreement to these terms and acknowledge that the payment is non-refundable, regardless of the outcome of the listing review process.

                    Please be aware that DefiShards assumes no responsibility for any lost, misused, or stolen funds that you may deposit. It is your sole responsibility to manage and ensure the security of your funds. We advise exercising caution and implementing appropriate security measures to safeguard your assets.

                    By proceeding with the submission and payment, you demonstrate your understanding of the above conditions and your commitment to complying with the applicable legal and regulatory requirements associated with DefiShards.                  </Text>
                </Flex>
                <RuleCard />
              </Flex>
              <Flex justifyContent="end" marginTop="8">
                <Button
                  width={40}
                  position="relative"
                  bgColor={color.submitBtnBg}
                  border={"1px solid"}
                  color={color.submitBtnColor}
                  borderColor={color.submitBtnColor}
                  onClick={() => setSubmitOpen(true)}
                  isDisabled={!isLoggedInNear}
                >
                  SUBMIT
                </Button>
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
              flexDirection="column"
              bgColor={color.cardBg}
            >
              <Flex justifyContent="space-between">
                <Flex flexDirection="column" width="100%">
                  <Flex marginBottom="2">
                    <Text
                      as="h1"
                      fontSize="20px"
                      fontWeight="700"
                      textAlign="start"
                      color={color.required}
                    >
                      * All Fields Mandatory
                    </Text>
                    <Text
                      as="h1"
                      fontSize="20px"
                      fontWeight="700"
                      textAlign="end"
                      color={color.cardTitle}
                      marginLeft={"auto"}
                    >
                      PROJECT PARTICULARS
                    </Text>
                  </Flex>

                  <Flex
                    width={"60%"}
                    height={"auto"}
                    marginLeft={"auto"}
                    marginRight={"auto"}
                  >
                    {imageUpload?.name !== "" && !isCropped ? (
                      <Flex flexDirection="column" width="100%">
                        <Cropper
                          src={imageUploadUri}
                          aspectRatio={1}
                          guides
                          style={{ width: "100%" }}
                          crop={(e) => {
                            setCropperInstance(e.currentTarget.cropper);
                          }}
                          accept={NftImageType}
                          alt="Image cropper"
                        // maxLength={250}
                        />
                        <Button
                          colorScheme="brand"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          marginLeft="auto"
                          marginTop="4"
                          rightIcon={<CropIcon size="20" />}
                          onClick={() => {
                            const croppedImgUrl = cropperInstance
                              ?.getCroppedCanvas()
                              .toDataURL();
                            setImageUploadUri(croppedImgUrl);

                            cropperInstance
                              ?.getCroppedCanvas()
                              .toBlob((croppedImgBlob) => {
                                setImageUploadBlob(croppedImgBlob);
                              });
                            setIsCropped(true);
                          }}
                        >
                          Done
                        </Button>
                      </Flex>
                    ) : (
                      <Flex flexDirection="column" width="full">
                        {imageUploadUri !== "" && (
                          <Image
                            src={imageUploadUri}
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
                                  <Text as="span" color={color.required}>
                                    *
                                  </Text>
                                </Text>
                              </Flex>
                            }
                            border="1px solid"
                            borderRadius="2xl"
                          />
                        )}
                        <Input
                          cursor="pointer"
                          onClick={() => {
                            fileUploadInputRef.current?.click();
                          }}
                          placeholder="Upload"
                          value={imageUpload?.name || "No file selected"}
                          readOnly
                          variant={isCropped ? "filled" : "outline"}
                        />
                        <input
                          type="file"
                          name="image"
                          onChange={(e) => {
                            if (!e.target.files) return;
                            setImageUpload(e.target.files.item(0));

                            const reader = new FileReader();
                            reader.onload = () => {
                              if (!reader.result) return;

                              setImageUploadUri(reader.result.toString());
                              setIsCropped(false);
                            };
                            reader.readAsDataURL(
                              e.target.files?.item(0) as Blob
                            );
                            setImageUploadBlob(e.target.files?.item(0) as Blob);
                          }}
                          accept={NftImageType}
                          style={{ display: "none" }}
                          ref={fileUploadInputRef}
                        />
                      </Flex>
                    )}
                  </Flex>
                  <InputCard
                    title="PROJECT / TOKEN NAME"
                    placeholder="E.G. PROJECT ATLAS"
                    required={true}
                    setData={setTitle}
                    value={title}
                    error={errors.title}
                  />
                  <InputCard
                    title="SUB TITLE"
                    placeholder="E.G. 2% LAUNCH SALE"
                    required={true}
                    setData={setSubTitle}
                    value={subTitle}
                    error={errors.subTitle}
                  />
                  <InputCard
                    title="TOKEN ADDRESS"
                    placeholder="token.testnet"
                    required={true}
                    setData={setOutTokenId}
                    value={outTokenId}
                    error={errors.outTokenId}
                    infoBtn={true}
                  />
                  <InputCard
                    title={
                      "STARTING PRICE (" +
                      (inTokenId == 1
                        ? "USDT"
                        : inTokenId == 2
                          ? "USDC"
                          : "wNEAR") +
                      ")"
                    }
                    placeholder="0.1"
                    required={true}
                    setData={setStartingPrice}
                    value={startingPrice}
                    error={errors.startingPrice}
                  />
                  <InputCard
                    title="E-MAIL"
                    placeholder="hello@johndoe.com"
                    required={true}
                    setData={setEmail}
                    value={email}
                    error={errors.email}
                  />
                  <InputCard
                    title="TELEGRAM CONTACT (Please input @‌username only)"
                    placeholder="cryptonear"
                    required={true}
                    setData={setTelegram}
                    value={telegram}
                    error={errors.telegram}
                  />
                  <SelectCard
                    title="TOKEN RECEIVABLE FOR IDO"
                    placeholder="PLEASE SELECT"
                    options={["USDT", "USDC", "wNEAR"]}
                    required={true}
                    setData={setInTokenId}
                    value={inTokenId}
                    error={errors.inTokenId}
                  />
                  <InputCard
                    title="TOTAL IDO TOKENS FOR SALE"
                    placeholder="0"
                    required={true}
                    setData={setTotalTokens}
                    type="number"
                    value={totalTokens}
                    error={errors.totalTokens}
                  />
                  <InputCard
                    title="COINGECKO / COINMARKETCAP LINK (OPTIONAL)"
                    placeholder="https://www.coingecko.com/en/coins/bitcoin/"
                    required={false}
                    setData={setCoingecko}
                    value={coingecko}
                    error={errors.coingecko}
                  />
                  <InputCard
                    title="FACEBOOK (OPTIONAL)"
                    placeholder="https://www.facebook.com/projectname"
                    required={false}
                    setData={setFacebook}
                    value={facebook}
                    error={errors.facebook}
                  />
                  <InputCard
                    title="INSTAGRAM (OPTIONAL)"
                    placeholder="https://www.instagram.com/projectname"
                    required={false}
                    setData={setInstagram}
                    value={instagram}
                    error={errors.instagram}
                  />
                  <InputCard
                    title="TWITTER (OPTIONAL)"
                    placeholder="https://www.twitter.com/projectname"
                    required={false}
                    setData={setTwitter}
                    value={twitter}
                    error={errors.twitter}
                  />
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
                    <Datetime
                      onChange={handleStartTimeChange}
                      value={startTime}
                      input={false}
                    />
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
                    <Datetime
                      onChange={handleEndTimeChange}
                      value={endTime}
                      input={false}
                    />
                  </Box>
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
                </Flex>
              </Flex>
              <Flex justifyContent="center" flexDirection="column">
                <InputAreaCard
                  title="BRIEF DESCRIPTION OF YOUR PROJECT"
                  required={true}
                  setData={setDescription}
                  value={description}
                  error={errors.description}
                />
                <Flex justifyContent="start" alignItems="start" marginTop="4">
                  <Text as="h3" fontSize="14px" textAlign="start">
                    {"PAYMENT"}
                  </Text>
                  <Tooltip
                    hasArrow
                    placement="auto-start"
                    padding={3}
                    width={"60%"}
                    label="This is a one time listing fee payable to DefiShards. Please read disclaimer and terms & conditions"
                    aria-label="A tooltip"
                    bg={"#10B981"}
                    fontSize={"12px"}
                    closeOnClick={false}
                  >
                    <Image src={InfoIcon} width={"4"} marginX={2} />
                  </Tooltip>
                  <Text
                    lineHeight={1}
                    marginX={4}
                    minHeight="10"
                    fontSize="40px"
                    fontWeight={700}
                    color={color.input}
                  >
                    $500.00
                  </Text>
                </Flex>
              </Flex>
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
                    By clicking the SUBMIT button, you acknowledge and agree to the terms and conditions outlined by DefiShards's website. Upon clicking the SUBMIT button, you will be redirected to a confirmation page where you can verify your submission and proceed to make the necessary payment of $500 for listing and administrative fees registration. It is important to note that this payment is non-refundable and must be completed prior to the commencement of the listing review process. We emphasize the importance of carefully reviewing all information provided before clicking the SUBMIT button.

                    The acceptance of your submission is contingent upon the nature of your project, the validity of your token contract, and the provision of adequate proof to establish the legitimacy of your project, all of which must comply with DefiShards's terms and conditions. By submitting the payment, you indicate your agreement to these terms and acknowledge that the payment is non-refundable, regardless of the outcome of the listing review process.

                    Please be aware that DefiShards assumes no responsibility for any lost, misused, or stolen funds that you may deposit. It is your sole responsibility to manage and ensure the security of your funds. We advise exercising caution and implementing appropriate security measures to safeguard your assets.

                    By proceeding with the submission and payment, you demonstrate your understanding of the above conditions and your commitment to complying with the applicable legal and regulatory requirements associated with DefiShards.                  </Text>
                </Flex>
                <RuleCard />
              </Flex>
              <Flex justifyContent="end" marginTop="8">
                <Button
                  width={40}
                  position="relative"
                  bgColor={color.submitBtnBg}
                  border={"1px solid"}
                  color={color.submitBtnColor}
                  borderColor={color.submitBtnColor}
                  onClick={() => setSubmitOpen(true)}
                  isDisabled={!isLoggedInNear}
                >
                  SUBMIT
                </Button>
              </Flex>
            </Flex>
          </Hide>
        </>
      )}
    </>
  );
}
