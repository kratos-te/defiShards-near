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
  Card,
  CardBody,
  CardFooter,
  Stack,
  Heading,
  Divider,
  SimpleGrid
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


export default function ConfirmList({
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
  const [nftByOwner, setNftByOwner] = useState<any[]>([]);
  const [nftById, setNftById] = useState<any[]>([]);
  const [getNft, setGetNft] = useState<any[]>([]);
  const [contractId, setContractId] = useState("");

  const [inputNearAmount, setInputNearAmount] = useState("0")
  const [inputPanel, setInputPanel] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  const [inputAddress, setInputAddress] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  const [inputAmount, setInputAmount] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
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

  const [force, setForce] = useState(false);



  useEffect(() => {
    const fetchNftByOwner = async () => {
      if (!wallet) return
      const getNftByOwner = await wallet.viewFunction("liquid-nft-3.testnet", "nft_tokens_for_owner", {
        account_id: wallet.accountId,
      }, { parse: undefined, stringify: undefined, jsContract: undefined })
      // console.log("heres------------------", getNftByOwner)
      // getNftByOwner.forEach((key:any, index:any) => {
      //   nft_id.push(getNftByOwner[index].token_id)
      // })
      setNftByOwner(getNftByOwner);
      setForce(!force);
    }
    fetchNftByOwner()
  }, [wallet])

  useEffect(() => {
    console.log("nftId-------------------", nftByOwner)
    const fetchNftByTokenId = async (tokenId: string) => {
      if (!tokenId) return;
      console.log("token -------", tokenId)
      const nftContractId = "vault_" + tokenId + ".liquid-nft-3.testnet"

      console.log("contract id>>>>>>", nftContractId)

      setContractId(nftContractId)
      const getNftByTokenId = await wallet.viewFunction(nftContractId, "get_info", {
        account_id: wallet.accountId,
      }, { parse: undefined, stringify: undefined, jsContract: undefined })
      console.log("nft info++", getNftByTokenId)
      setNftById((prev) => getNftByTokenId)
      setForce(!force);
    }

    for (let i = 0; i < nftByOwner.length; i++) {
      console.log(" Get token -------", nftByOwner)
      fetchNftByTokenId(nftByOwner[i].token_id)
    }

    console.log("setNftInfo>>>>>>", nftById)
    console.log("nft>>>>>>>>>>>", getNft)

  }, [nftByOwner])

  useEffect(() => {
    const result = Object.assign(nftByOwner, nftById)
    setGetNft(result)
    console.log("result>>>>>>>>", result)
  })



  const handleCallContract = async () => {
    if (!wallet) return;

    const address: any[] = [];
    const amount: any[] = [];
    inputPanel.forEach((key, index) => {
      if (inputAddress[index].input != "" && inputAmount[index].input != "") {
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
                  token_amounts: amount,
                  near_amount: inputNearAmount
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

  // useEffect(() => {
  //   console.log("===============NFT==============")
  //   console.log(nftById)
  // }, [wallet]);

  const handlCreateInputPanel = () => {
    setInputPanel([
      ...inputPanel,
      {
        input: "",
        input_rank: inputPanel.length + 1
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

  const handlRemoveInputPanel = (index: number) => {
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
        </GridItem>
      </Grid>
      <SimpleGrid minChildWidth='120px' spacing='40px'>
        {getNft.map((item: any, index: any) => (
          <Box key={index}>
            <Card maxW='sm'>
              <CardBody>
                <Image
                  src={getNft[index].metadata.media}
                  borderRadius='lg'
                />
                <Stack mt='6' spacing='3'>
                  <Heading size='md'>{getNft[index].metadata.title}</Heading>
                  <Text>
                    {getNft[index].metadata.description}
                  </Text>
                </Stack>
              </CardBody>
              {/* <Divider />
              <CardFooter>
                <ButtonGroup spacing='2'>
                  <Button variant='solid' colorScheme='blue'>
                    Buy now
                  </Button>
                  <Button variant='ghost' colorScheme='blue'>
                    Add to cart
                  </Button>
                </ButtonGroup>
              </CardFooter> */}
            </Card>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
