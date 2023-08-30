import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  GridItem,
  Flex,
  Button,
  Grid,
  Box,
  HStack,
  Icon,
  Progress,
  VStack,
  Text,
  Image,
  Input,
  Editable,
} from "@chakra-ui/react";
import { BiChevronLeft as ArrowLeftIcon } from "react-icons/bi";
import { BiDownArrowAlt as ArrowDownIcon } from "react-icons/bi";
import TitleCard from "../components/TitleCard";
import Loading from "../components/Loading";
import {
  convertToFloat,
  useBalance,
  useColor,
  useNearContext,
  useProject,
} from "../hooks";
import { ShortMonthNames, TimeDivision, TokenDecimals } from "../utils/const";
import { NftImageType } from "../types";
import SettingDarkIcon from "../assets/img/icons/settingOff.svg";
import LiveListingStar from "../assets/img/icons/live-listing-star.svg";
import USDT from "../assets/img/icons/usdt.svg";
import ParticipatedCard from "../components/ParticipatedCard";
import InfoCard from "../components/InfoCard";
import { FtContract } from "../hooks/Near/classWrappers";
// import ListCard from "../components/UnconfirmList";

export default function SettingCard() {
  const navigate = useNavigate();
  const color = useColor();
  const { config, initFtContract } = useNearContext();
  const { projectId } = useParams();
  const { project } = useProject(Number(projectId));
  const { getBalance } = useBalance();
  const userBalance = getBalance(Number(projectId));
  const [editDetail, setEditDetail] = useState<boolean>(true);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUpload, setImageUpload] = useState<File | null>(new File([], ""));
  const [imageUploadUri, setImageUploadUri] = useState<string>();
  const [imageUploadBlob, setImageUploadBlob] = useState<Blob | null>(
    new Blob()
  );
  const [cropperInstance, setCropperInstance] = useState<Cropper>();
  const [isCropped, setIsCropped] = useState<boolean>(false);
  const [decimals, setDecimals] = useState<number>(6);
  const now = Date.now();
  const icon = SettingDarkIcon;

  const handleBack = () => {
    navigate(-1);
  };

  const handleDetail = () => {
    navigate(`./project/${projectId}`);
  };
  console.log("ID>>>", projectId);
  const getDecimals = async (contractId: string) => {
    const ftContract = new FtContract(initFtContract(contractId));
    const metadata = await ftContract!.getFtMetadata();
    setDecimals(metadata.decimals);
  };

  if (project.isLoading || project.isError) return <Loading />;
  else {
    getDecimals(project.value.out_token_account_id);
    const inTokenDecimals =
      project.value.in_token_account_id == config.usdcContractId
        ? TokenDecimals.usdc
        : project.value.in_token_account_id == config.usdtContractId
        ? TokenDecimals.usdt
        : TokenDecimals.wnear;

    const startTime = project.value.start_time / TimeDivision;
    const endTime = project.value.end_time / TimeDivision;
    const projectDuration =
      project.value.end_time / TimeDivision -
      project.value.start_time / TimeDivision;
    const expiredDuration = now - project.value.start_time / TimeDivision;
    const progressValue = (100 * expiredDuration) / projectDuration;
    const ended = project.value.end_time / TimeDivision < now ? true : false;
    const isActivated =
      project.value.end_time / TimeDivision < Date.now() ||
      !project.value.is_activated
        ? false
        : true;
    // const estimatedTokenPurchased = (project.value.total_tokens * userDepositedBalance / project.value.total_deposits) / decimals;

    return (
      <>
        <TitleCard title="Live Listings Panel" />
        <Flex gap={1} paddingY="4" flexDirection={"column"}>
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
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {/* <ListCard
              projectId={project.value.project_id}
              title={project.value.title}
              subtitle={project.value.sub_title}
              startTime={startTime}
              endTime={endTime}
              progressValue={progressValue}
              isActivated={isActivated}
              totalTokens={project.value.total_tokens}
              totalDeposits={project.value.total_deposits}
              tokenTicker={project.value.title}
              logo={"/logos/" + project.value.logo}
              outTokenId={project.value.out_token_account_id}
              inTokenId={project.value.in_token_account_id}
            /> */}
            <GridItem colSpan={2}>
              <Flex
                minHeight="14"
                minWidth="12"
                marginLeft="13px"
                border="1px solid"
                paddingTop="98px"
                paddingBottom="71px"
                borderColor={color.cardBorder}
                borderRadius="28px"
                flexDirection="row"
                bgColor={color.panelbg}
                position="relative"
              >
                {/* {editDetail ? (
                  <Button
                    aria-label="$"
                    bgGradient="linear-gradient(360deg, #111618 0%, #FFFFFF 122.97%)"
                    variant="solid"
                    position="absolute"
                    top="34"
                    right="42"
                    color={color.background}
                    fontFamily="DM Sans"
                    fontStyle="normal"
                    fontWeight="500"
                    fontSize="16px"
                    _hover={{ bg: "#a3a3a3" }}
                    onClick={() => setEditDetail(false)}
                  >
                    EDIT DETAILS
                  </Button>
                ) : (
                  <Flex
                    flexDirection="row"
                    position="absolute"
                    top="34"
                    right="42"
                  >
                    <Button
                      bgGradient="linear-gradient(360deg, #111618 0%, #FFFFFF 122.97%)"
                      variant="solid"
                      color={color.background}
                      fontFamily="DM Sans"
                      fontStyle="normal"
                      fontWeight="500"
                      fontSize="16px"
                      onClick={() => setEditDetail(true)}
                      _hover={{ bg: "#a3a3a3" }}
                    >
                      SAVE
                    </Button>
                    <Button
                      bgGradient="linear-gradient(360deg, #111618 0%, #FFFFFF 122.97%)"
                      variant="solid"
                      color={color.background}
                      fontFamily="DM Sans"
                      fontStyle="normal"
                      fontWeight="500"
                      fontSize="16px"
                      marginLeft="10px"
                      _hover={{ bg: "#a3a3a3" }}
                      onClick={() => setEditDetail(true)}
                    >
                      CANCEL
                    </Button>
                  </Flex>
                )} */}

                <Flex minHeight="14" maxWidth="50%" flexDirection="column">
                  <Box marginLeft="55px" marginRight="20px">
                    <Flex flexDirection="column" marginBottom="17px">
                      <Text
                        fontSize="12px"
                        paddingBottom="4px"
                        textAlign="left"
                        color={color.black}
                      >
                        PROJECT NAME*
                      </Text>
                      <Input
                        minWidth="100%"
                        maxHeight="30px"
                        borderRadius="12px"
                        placeholder={project.value.title}
                        bgColor={color.background}
                        shadow="lg"
                        fontSize="14px"
                        paddingY="8px"
                        alignItems="center"
                        contentEditable={editDetail}
                      ></Input>
                    </Flex>
                    <Flex flexDirection="column" marginBottom="13px">
                      <Text
                        fontSize="12px"
                        textAlign="left"
                        color={color.black}
                        paddingBottom="4px"
                      >
                        SUB TITLE*
                      </Text>
                      <Input
                        minWidth="100%"
                        maxHeight="30px"
                        borderRadius="12px"
                        placeholder={project.value.sub_title}
                        bgColor={color.background}
                        fontSize="14px"
                        contentEditable={editDetail}
                      ></Input>
                    </Flex>
                    {/* Group 1 */}
                    <Flex marginBottom="13px">
                      <Flex flexDirection="column" marginRight="12px">
                        <Text
                          fontSize="12px"
                          textAlign="left"
                          color={color.black}
                          paddingBottom="4px"
                        >
                          IDO RECEIVABLE*
                        </Text>
                        <Input
                          minWidth="100%"
                          maxHeight="30px"
                          borderRadius="12px"
                          placeholder="USDT.E"
                          bgColor={color.background}
                          fontSize="14px"
                          contentEditable={editDetail}
                          ></Input>
                      </Flex>
                      <Flex flexDirection="column" marginLeft="12px">
                        <Text
                          fontSize="12px"
                          textAlign="left"
                          color={color.black}
                          paddingBottom="4px"
                        >
                          TOKEN TICKER*
                        </Text>
                        <Input
                          minWidth="100%"
                          maxHeight="30px"
                          borderRadius="12px"
                          placeholder={project.value.title}
                          bgColor={color.background}
                          fontSize="14px"
                          contentEditable={editDetail}
                          ></Input>
                      </Flex>
                    </Flex>
                    {/* Group 2 */}
                    <Flex marginBottom="13px">
                      <Flex flexDirection="column" marginRight="12px">
                        <Text
                          fontSize="12px"
                          textAlign="left"
                          color={color.black}
                          paddingBottom="4px"
                        >
                          STATUS*
                        </Text>
                        <Input
                          minWidth="100%"
                          maxHeight="30px"
                          borderRadius="12px"
                          placeholder={
                            project.value.is_activated ? "PAID" : "UNPAID"
                          }
                          bgColor={color.background}
                          fontSize="14px"
                          contentEditable={editDetail}
                          ></Input>
                      </Flex>
                      <Flex flexDirection="column" marginLeft="12px">
                        <Text
                          fontSize="12px"
                          textAlign="left"
                          color={color.black}
                          paddingBottom="4px"
                        >
                          TOKEN PRICE*
                        </Text>
                        <Input
                          minWidth="100%"
                          maxHeight="30px"
                          borderRadius="12px"
                          placeholder={convertToFloat(
                            project.value.starting_price,
                            5,
                            inTokenDecimals
                          ).toString()}
                          bgColor={color.background}
                          fontSize="14px"
                          contentEditable={editDetail}
                          ></Input>
                      </Flex>
                    </Flex>
                    {/* Group 3 */}
                    <Flex marginBottom="13px">
                      <Flex flexDirection="column" marginRight="12px">
                        <Text
                          fontSize="12px"
                          textAlign="left"
                          color={color.black}
                          paddingBottom="4px"
                        >
                          START DATE & TIME*
                        </Text>
                        <Input
                          minWidth="100%"
                          maxHeight="30px"
                          borderRadius="12px"
                          placeholder={`${new Date(
                            startTime
                          ).toLocaleDateString()} ${new Date(
                            startTime
                          ).toLocaleTimeString()}`}
                          bgColor={color.background}
                          fontSize="14px"
                          contentEditable={editDetail}
                          ></Input>
                      </Flex>
                      <Flex flexDirection="column" marginLeft="12px">
                        <Text
                          fontSize="12px"
                          textAlign="left"
                          color={color.black}
                          paddingBottom="4px"
                        >
                          END DATE & TIME*
                        </Text>
                        <Input
                          minWidth="100%"
                          maxHeight="30px"
                          borderRadius="12px"
                          placeholder={`${new Date(
                            endTime
                          ).toLocaleDateString()} ${new Date(
                            endTime
                          ).toLocaleTimeString()}`}
                          bgColor={color.background}
                          fontSize="14px"
                          contentEditable={editDetail}
                          ></Input>
                      </Flex>
                    </Flex>
                  </Box>
                </Flex>
                {/* image here */}
                <Flex
                  minHeight="14"
                  maxWidth="50%"
                  borderRadius="12px"
                  //justifyContent='center'
                  alignItems="center"
                >
                  {editDetail ? (
                    <Box
                      width="90%"
                      bgColor={color.background}
                      position="relative"
                    >
                      <Image
                        src={"/logos/" + project.value.logo}
                        padding="28px"
                        width={"100%"}
                      ></Image>
                    </Box>
                  ) : (
                    <Box
                      maxWidth="90%"
                      bgColor={color.background}
                      position="relative"
                    >
                      <Image
                        src={LiveListingStar}
                        padding="28px"
                        opacity="10%"
                      ></Image>
                      <Flex
                        flexDirection="column"
                        position="absolute"
                        top="40%"
                        left="30%"
                        justifyContent="center"
                      >
                        <Input
                          fontFamily="DM Sans"
                          fontStyle="normal"
                          fontWeight="700"
                          fontSize="40px"
                          type="button"
                          //lineHeight='52px'
                          //textAlign='center'
                          variant="unstyled"
                          color={color.yellow}
                          value="LOGO"
                          cursor="pointer"
                          _hover={{ color: "#3200ff" }}
                          _active={{ color: "#ffffff" }}
                          onClick={() => {
                            fileUploadInputRef.current?.click();
                          }}
                          readOnly
                        ></Input>
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
                        <Text
                          fontFamily="DM Sans"
                          fontStyle="normal"
                          fontWeight="500"
                          fontSize="16px"
                          textAlign="center"
                          marginTop="1rem"
                          color={color.yellow}
                        >
                          DRAG & DROP LOGO
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Flex>
            </GridItem>
          </Grid>
        </Flex>
      </>
    );
  }
}
