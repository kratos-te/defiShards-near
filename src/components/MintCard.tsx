import { useNavigate } from "react-router-dom";
import { BiDownArrowAlt as ArrowDownIcon } from "react-icons/bi";
import {
  Box,
  Flex,
  Text,
  Image,
  VStack,
  Progress,
  Button,
  Icon,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Input,
  IconButton,
  ButtonGroup,
  Card
} from "@chakra-ui/react";
import { PhoneIcon, AddIcon, CloseIcon } from '@chakra-ui/icons'
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNearContext } from "../hooks";
import { useColor, useRegisterProject } from "../hooks";
import SettingLightIcon from "../assets/img/icons/setting.svg";
import WalletIcon from "../assets/img/icons/wallet.svg";
import { usdt, usdc, wnear } from "../utils/tokens";
import { FtContract } from "../hooks/Near/classWrappers";
import { WalletSelector } from "@near-wallet-selector/core";
import {
  parseNearAmount,
  formatNearAmount,
} from "near-api-js/lib/utils/format";
import { useEffect, useState } from "react";
import { cutDecimal, convertToFloat, convertToAmount } from "../utils/convert";
import {
  GAS_FOR_NFT_TRANSFER,
  STORAGE_AMOUNT,
} from "../hooks/Near/constants";
import UsdtIcon from "../assets/img/icons/usdt.svg";
import UsdcIcon from "../assets/img/icons/usdc.svg";
import NearIcon from "../assets/img/icons/near.svg";
import { InputData } from "../utils/types";
interface Props {
  projectId: number;
  title: string;
  subtitle: string;
  startTime?: number;
  endTime?: number;
  progressValue?: number;
  isActivated?: boolean;
  totalTokens?: string;
  totalDeposits?: string;
  tokenTicker?: string;
  logo?: string;
  outTokenId?: string;
  inTokenId?: string;
}


export default function MintCard({
  projectId,
  title,
  subtitle,
  endTime,
  progressValue,
  isActivated,
  totalTokens,
  totalDeposits,
  tokenTicker,
  logo,
  outTokenId,
  inTokenId
}: Props) {
  const now = Date.now();
  const { registerProject } = useRegisterProject()
  // const {acc} = useNearLogin()
  // registerProject(1, 23, 2)
  const [sliderUsdtValue, setSlideUsdtrValue] = useState(0);
  const [sliderUsdcValue, setSlideUsdcrValue] = useState(0);
  const [sliderNearValue, setSlideNearrValue] = useState(0);

  const [showUsdtTooltip, setShowUsdtTooltip] = useState(false);
  const [showUsdcTooltip, setShowUsdcTooltip] = useState(false);
  const [showNearTooltip, setShowNearTooltip] = useState(false);

  const { config, initFtContract, role, wallet } = useNearContext();
  const color = useColor();
  const navigate = useNavigate();

  const [inTokenDecimals, setInTokenDecimals] = useState<number>(6);
  const [outTokenDecimals, setOutTokenDecimals] = useState<number>(24);
  const [nftId, setNftId] = useState<any[]>([]);
  const [nftInfo, setNftInfo] = useState<any[]>([]);
  const [contractId, setContractId] = useState("");

  const [inputNearAmount, setInputNearAmount] = useState("0")
  const [inputPanel, setInputPanel] = useState<InputData[]>([
      {
        input: "",
        input_rank:1
      }
  ])
  const [inputAddress, setInputAddress] = useState<InputData[]>([
    {
      input: "",
      input_rank:1
    }
  ])
  const [inputAmount, setInputAmount] = useState<InputData[]>([
    {
      input: "",
      input_rank:1
    }
  ])


  const inTokenContract = new FtContract(initFtContract(inTokenId));
  const outTokenContract = new FtContract(initFtContract(outTokenId));

  // const remainDuration = endTime - now;
  // const ended = endTime < now ? true : false;
  // const remainTime = new Date(remainDuration);
  
  const nft_id: any[] = [];
  const nft_info: any[] = [];
  const icon = role === "admin" ? SettingLightIcon : WalletIcon;
  const inToken =
    inTokenId === config.usdtContractId
      ? usdt
      : inTokenId === config.usdcContractId
      ? usdc
      : wnear;

  const handleWalletClick = () => {
    role === "admin"
      ? navigate(`/setting/${projectId}`)
      : navigate(`/listing/${projectId}`);
  };

  const handleDetailClick = () => {
    navigate(`/listing/${projectId}`);
  };



  useEffect(() => {
    const getNfts = async () => {
      if(!wallet) return
      const getNftInfo = await wallet.viewFunction( "liquid-nft-3.testnet", "nft_tokens_for_owner", {
        account_id: wallet.accountId,
      }, {parse: undefined, stringify: undefined, jsContract: undefined})
      console.log("heres------------------", getNftInfo)
      getNftInfo.forEach((key:any, index:any) => {
        nft_id.push(getNftInfo[index].token_id)
      })
      setNftId(nft_id)
    }
    getNfts()
  }, [wallet])

  useEffect(() => {
    const getNft = async (token_id: String) => {
      const nftContractId = "vault_" + token_id + ".liquid-nft-3.testnet"
  
      console.log("contract id>>>>>>", nftContractId)

      setContractId(nftContractId)
      const getNftInfo = await wallet.viewFunction(nftContractId, "get_info", {
        account_id: wallet.accountId,
      }, { parse: undefined, stringify: undefined, jsContract: undefined })
      console.log("nft info", getNftInfo)
      nft_info.push(getNftInfo)
      setNftInfo(nft_info)
    }
    for (let i = 0; i < nftId.length; i++) {   
      getNft(nftId[i])
    }
  }, [wallet])


  const handleCallContract = async() => {
    if (!wallet) return;

    const address: any[] = [];
    const amount: any[] = [];
    inputPanel.forEach((key, index) => {
      if(inputAddress[index].input!="" && inputAmount[index].input!=""){
        address.push(inputAddress[index].input)
        amount.push(inputAmount[index].input)
      }
    })

    console.log("address", address)
    console.log("amount", amount)


    const attachedDeposit = parseNearAmount(inputAmount.toString());

      const outcome = await wallet.wallet?.signAndSendTransactions({
        transactions: [
          {
            signerId: wallet.accountId,
            receiverId: "liquid-nft-3.testnet",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "nft_mint",
                  args: {
                    token_owner_id: wallet.accountId,
                    token_contract_ids: address,
                    token_amounts:amount,
                    near_amount:inputNearAmount
                  },
                  gas: "300000000000000",
                  deposit: "2000000000000000000000000"
                }
              }
            ]
          },
        ]
      });
    //  else {
    //   const outcome = await wallet.wallet?.signAndSendTransactions({
    //     transactions: [
    //       {
    //         signerId: wallet.accountId,
    //         receiverId: "wrap.testnet",
    //         actions: [
    //           {
    //             type: "FunctionCall",
    //             params: {
    //               methodName: "near_withdraw",
    //               args: { amount: attachedDeposit! },
    //               gas: GAS_FOR_NFT_TRANSFER,
    //               deposit: "1"
    //             }
    //           }
    //         ]
    //       }
    //     ]
    //   });
    // }
  }

  const handleNearAmountInputChange = (e: any) => {
    setInputNearAmount(e.target.value);
  };

  const mainColor = isActivated ? "#34D399" : color.main;

  const getDecimals = async () => {
    const inTokenMetadata = await inTokenContract!.getFtMetadata();
    setInTokenDecimals(inTokenMetadata.decimals);
    const outTokenMetadata = await outTokenContract!.getFtMetadata();
    setOutTokenDecimals(outTokenMetadata.decimals);
  };

  useEffect(() => {
    getDecimals();
  }, [outTokenId]);

  const handlCreateInputPanel = () => {
    setInputPanel([
      ...inputPanel,
      {
        input: "",
        input_rank:inputPanel.length + 1
      }
    ]);
    setInputAddress([
      ...inputAddress,
      {
        input: "",
        input_rank: inputAddress.length + 1
      }
    ]);
    setInputAmount([
      ...inputAmount,
      {
        input: "",
        input_rank: inputAmount.length + 1
      }
    ]);
  }

  const handlRemoveInputPanel = (index:number) => {
    handleRemoveListItem(index, inputPanel, setInputPanel);
    handleRemoveListItem(index, inputAddress, setInputAddress)
    handleRemoveListItem(index, inputAmount, setInputAmount)
  }

  const handleRemoveListItem = (
    index: number,
    reactHookGetter: any,
    reactHookSetter: any
  ) => {
    const newRule = [...reactHookGetter];
    newRule.splice(index, 1);
    reactHookSetter(newRule)
  }

  const handleInputChange = (
    event: any,
    index: number,
    reactHookGetter: any,
    reactHookSetter: any
  ) => {
    const value = event.target.value;
    const newInputList = [...reactHookGetter];
    newInputList[index].input = value;
    newInputList[index].input_rank = index + 1;
    reactHookSetter(newInputList);
  };
  return (
    <Flex
      minHeight="14"
      minWidth="12"
      shadow="lg"
      paddingY="4"
      paddingX="8"
      alignItems="center"
      border="1px solid"
      borderColor={color.cardBorder}
      background={color.cardBg}
      borderRadius="20px"
      flexDirection="column"
      position="relative"
    >
      <Grid
        templateColumns="repeat(2, 1fr)"
        width={"100%"}
        marginY={"4px"}
        paddingX={"5px"}
      >
        <GridItem justifyItems={"start"} height={"80px"}>
          <Text
            as="h1"
            position={"absolute"}
            width="60%"
            fontSize="20px"
            textAlign="start"
            height={"26px"}
            color={color.cardTitle}
            overflow={"hidden"}
          >
            {title}
          </Text>
          {/* <Text
            marginTop={"36px"}
            as="h2"
            fontSize="14px"
            textAlign="start"
            color={color.cardSubtitle}
          >
            {subtitle}
          </Text> */}
        </GridItem>
        {/* <GridItem justifySelf={"right"}>
          <Button onClick={handleWalletClick} bg="transparent" padding={0}>
            <Image src={icon} />
          </Button>
        </GridItem> */}
      </Grid>
      <Accordion  allowToggle w="full">
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left" width="full">
                <Text fontSize="xl" color="tomato">
                  SELECT YOUR ASSETS
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <List spacing={10}>
              <ListItem>
                <Flex display="flex" justifyContent="space-between">
                  <Image
                    boxSize="2rem"
                    borderRadius="full"
                    src={UsdtIcon}
                    alt="Fluffybuns the destroyer"
                    mr="12px"
                  />
                  USDT
                  <Slider
                    id="slider"
                    defaultValue={5}
                    min={0}
                    max={100}
                    colorScheme="teal"
                    onChange={(v) => setSlideUsdtrValue(v)}
                    onMouseEnter={() => setShowUsdtTooltip(true)}
                    onMouseLeave={() => setShowUsdtTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="teal.500"
                      color="white"
                      placement="top"
                      isOpen={showUsdtTooltip}
                      label={`${sliderUsdtValue}%`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex display="flex" justifyContent="space-between">
                  <Image
                    boxSize="2rem"
                    borderRadius="full"
                    src={UsdcIcon}
                    alt="Fluffybuns the destroyer"
                    mr="12px"
                  />
                  USDC
                  <Slider
                    id="slider"
                    defaultValue={5}
                    min={0}
                    max={100}
                    colorScheme="teal"
                    onChange={(v) => setSlideUsdcrValue(v)}
                    onMouseEnter={() => setShowUsdcTooltip(true)}
                    onMouseLeave={() => setShowUsdcTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="teal.500"
                      color="white"
                      placement="top"
                      isOpen={showUsdcTooltip}
                      label={`${sliderUsdcValue}%`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </Flex>
              </ListItem>
              <ListItem>
                <Flex display="flex" justifyContent="space-between">
                  <Image
                    boxSize="2rem"
                    borderRadius="full"
                    src={NearIcon}
                    alt="Fluffybuns the destroyer"
                    mr="12px"
                  />
                  NEAR
                  <Slider
                    id="slider"
                    defaultValue={5}
                    min={0}
                    max={100}
                    colorScheme="teal"
                    onChange={(v) => setSlideNearrValue(v)}
                    onMouseEnter={() => setShowNearTooltip(true)}
                    onMouseLeave={() => setShowNearTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="teal.500"
                      color="white"
                      placement="top"
                      isOpen={showNearTooltip}
                      label={`${sliderNearValue}%`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </Flex>
              </ListItem>
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Card>
        <Input type="number" placeholder="Near Amount" value={inputNearAmount} onChange={handleNearAmountInputChange}></Input>
      </Card>
      <Card paddingBottom={4} marginY={5}  alignItems="center">
      {
        inputPanel.length > 0 ?
        inputPanel.map((input, index) => (
        <Flex gap={6} padding={4} >
          <Input type='text' placeholder='Address' value={inputAddress[index].input} onChange={(event) =>
                            handleInputChange(
                              event,
                              index,
                              inputAddress,
                              setInputAddress
                            )
                          }/>
          <Input type='text' placeholder='amount' value={inputAmount[index].input} onChange={(event) =>
                            handleInputChange(
                              event,
                              index,
                              inputAmount,
                              setInputAmount
                            )
                          }/>
          <IconButton aria-label='Add to friends' icon={<CloseIcon />} onClick={() => handlRemoveInputPanel(index)} />
        </Flex > 
          )) : ""
        }

          <ButtonGroup size='sm' isAttached variant='outline' onClick={handlCreateInputPanel}>
            <Button>ADD</Button>
            <IconButton aria-label='Add to friends' icon={<AddIcon />}  />
          </ButtonGroup>

        </Card>

      <VStack width="100%" spacing="24px">
        <Flex minWidth="100%" minHeight="14" justifyContent="center">
          <Button
            width="80%"
            height="100px"
            bgColor={isActivated ? color.depositBtnBg : color.detailsBtnBg}
            border={"1px solid"}
            color={isActivated ? color.depositBtnColor : color.detailsBtnColor}
            borderColor={
              isActivated ? color.depositBtnColor : color.detailsBtnColor
            }
            onClick={handleCallContract}
          >
            <Text fontSize="4xl">{isActivated ? "FORGE" : "FORGE"}</Text>
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
}
