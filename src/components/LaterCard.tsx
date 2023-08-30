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
  Select,
  Card,
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
  Tooltip
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNearContext } from "../hooks";
import { useColor } from "../hooks";
import SettingLightIcon from "../assets/img/icons/setting.svg";
import WalletIcon from "../assets/img/icons/wallet.svg";
import { usdt, usdc, wnear } from "../utils/tokens";
import { FtContract } from "../hooks/Near/classWrappers";
import { useEffect, useState } from "react";
import { cutDecimal, convertToFloat, convertToAmount } from "../utils/convert";
import UsdtIcon from "../assets/img/icons/usdt.svg";
import UsdcIcon from "../assets/img/icons/usdc.svg";
import NearIcon from "../assets/img/icons/near.svg";
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

export default function LatetCard({
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
  const [sliderUsdtValue, setSlideUsdtrValue] = useState(0);
  const [sliderUsdcValue, setSlideUsdcrValue] = useState(0);
  const [sliderNearValue, setSlideNearrValue] = useState(0);

  const [showUsdtTooltip, setShowUsdtTooltip] = useState(false);
  const [showUsdcTooltip, setShowUsdcTooltip] = useState(false);
  const [showNearTooltip, setShowNearTooltip] = useState(false);

  const [nftId, setNftId] = useState<any[]>([])
  const [selectNft, setSelectNft] = useState("")

  const { config, initFtContract, role, wallet } = useNearContext();
  const color = useColor();
  const navigate = useNavigate();

  const [inTokenDecimals, setInTokenDecimals] = useState<number>(6);
  const [outTokenDecimals, setOutTokenDecimals] = useState<number>(24);

  const inTokenContract = new FtContract(initFtContract(inTokenId));
  const outTokenContract = new FtContract(initFtContract(outTokenId));

  const nft_id: any[] = [];

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
  // const remainDuration = endTime - now;
  // const ended = endTime < now ? true : false;
  // const remainTime = new Date(remainDuration);

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

  const handleBurnNFT = async() => {
    console.log("token_ id",selectNft)
    const burnNFT = await wallet.wallet?.signAndSendTransactions({
      transactions: [
        {
          signerId: wallet.accountId,
          receiverId: "liquid-nft-3.testnet",
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "nft_burn",
                args: {
                  token_id:selectNft
                },
                gas: "300000000000000",
                deposit: ""
              }
            }
          ]
        }
      ]
    })

  };

  const handleSelectNft = (e: any) => {
    setSelectNft(e.target.value)
  }

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
      <Text fontSize="50px" color="tomato">
        {subtitle}
      </Text>
      <Card marginY={5}>
        <Select placeholder='Select Your Nft' onChange={handleSelectNft}>
          {nftId.map((key, index) => (
            <option key={nftId[index]} value={nftId[index]}>{nftId[index]}</option>
          ))}
        </Select>
      </Card>
      <VStack width="100%" spacing="24px">
        <Flex minWidth="100%" minHeight="14" justifyContent="center">
          <Button
            width="80%"
            height="150px"
            bgColor={isActivated ? color.depositBtnBg : color.detailsBtnBg}
            border={"1px solid"}
            color={isActivated ? color.depositBtnColor : color.detailsBtnColor}
            borderColor={
              isActivated ? color.depositBtnColor : color.detailsBtnColor
            }
            onClick={handleBurnNFT}
          >
            <Text fontSize="4xl">{isActivated ? "FORGE" : "BURN NOW"}</Text>
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
}
