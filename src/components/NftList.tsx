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
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Spinner
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
import near from "../assets/img/icons/near.svg"
import defaultTokenIcon from "../assets/img/icons/defaultToken.svg"
import { InputData } from "../utils/types";
import { SelectorAccount } from "../hooks/Near/walletSelector";
interface Props {
  projectId: number;
  title: string;
  subtitle: string;
  nftData: any;
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
  loading: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  onBurnNFT: () => void;
  onListNFT: (nearAmount: number) => void;
  onUnlistNFT: () => void;
  onBuyNFT: () => void
  metaData: any;
  tokenData: any;
  wallet: SelectorAccount
}

export const MyModal = ({ isOpen, onClose, title, message, onConfirm, onBurnNFT, onListNFT, onUnlistNFT, onBuyNFT, metaData, tokenData, wallet }: ModalProps) => {
  const OverlayOne = () => (
    <ModalOverlay
      bg='blackAlpha.300'
      backdropFilter='blur(10px) hue-rotate(90deg)'
    />
  )

  const OverlayTwo = () => (
    <ModalOverlay
      bg='none'
      backdropFilter='auto'
      backdropInvert='80%'
      backdropBlur='2px'
    />
  )



  const [overlay, setOverlay] = useState(<OverlayOne />)
  const [listNearAmount, setListNearAmount] = useState<number>(0)

  const handleNearAmountListChange = (e: any) => {
    setListNearAmount(e.target.value);
  };


  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      {overlay}
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Card maxW='sm'>
            <CardBody>
              <Stack mt='1' spacing=''>
                <Image src={metaData.metadata.media} />
                <Divider />
              </Stack>
            </CardBody>
            <CardFooter>
              {/* <ButtonGroup spacing='2'>
                  <Button variant='solid' colorScheme='blue'>
                    Buy now
                  </Button>
                  <Button variant='ghost' colorScheme='blue'>
                    Add to cart
                  </Button>
                </ButtonGroup> */}
              <List>
                <ListItem>
                  <Flex display="flex" justifyContent="start">
                    <Text mr="12px">ID:</Text>
                    <Text mr="12px">#{metaData.token_id}</Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex display="flex" justifyContent="space-between">
                    <Text mr="12px">Description:</Text>
                    <Text mr="12px">{metaData.metadata.description}</Text>
                  </Flex>
                </ListItem>
                {!title && (
                  <>
                    <ListItem>
                      <Flex display="flex" justifyContent="start">
                        <Text paddingTop={2} mr="12px">Owner:</Text>
                        <Text paddingTop={2} mr="12px">{metaData.owner_id}</Text>
                      </Flex>
                    </ListItem>

                    <ListItem>
                      <Flex display="flex" justifyContent="start">
                        <Text paddingTop={2}>Price:</Text>
                        <List>
                          <ListItem>
                            <Flex display="flex" justifyContent="space-between">
                              <Image
                                boxSize="2rem"
                                borderRadius="full"
                                src={near}
                                alt="Fluffybuns the destroyer"
                                mr="12px"
                              />
                              <Text paddingTop={2} mr="12px">{convertToFloat(metaData.sale_conditions.near, 3, 24)}</Text>
                              <Text paddingTop={2} mr="12px">NEAR</Text>
                            </Flex>
                          </ListItem>
                        </List>
                      </Flex>
                    </ListItem>

                  </>
                )}
                <ListItem>
                  <Flex display="flex" justifyContent="start">
                    <Text paddingTop={2}>Assets:</Text>
                    <List>
                      {metaData.near_amount > 0 && (
                        <ListItem>
                          <Flex display="flex" justifyContent="space-between">
                            <Image
                              boxSize="2rem"
                              borderRadius="full"
                              src={near}
                              alt="Fluffybuns the destroyer"
                              mr="12px"
                            />
                            <Text paddingTop={2} mr="12px">{convertToFloat(metaData.near_amount, 3, 24)}</Text>
                            <Text paddingTop={2} mr="12px">NEAR</Text>
                          </Flex>
                        </ListItem>
                      )}

                      {tokenData.map((item: any, index: any) => (
                        <ListItem>
                          <Flex display="flex" justifyContent="space-between">
                            <Image
                              boxSize="2rem"
                              borderRadius="full"
                              src={tokenData[index].icon ? tokenData[index].icon : defaultTokenIcon}
                              alt="Fluffybuns the destroyer"
                              mr="12px"
                            />
                            <Text paddingTop={2} mr="12px">{convertToFloat(metaData.token_amounts[index], 3, tokenData[index].decimals)}</Text>
                            <Text paddingTop={2} mr="12px">{tokenData[index].symbol}</Text>
                          </Flex>
                        </ListItem>
                      ))}

                    </List>

                  </Flex>
                  {/* <Input placeholder='List Price' /> */}
                  {title == "Forged NFT" && <Input type='text' placeholder='List Price' value={listNearAmount} onChange={handleNearAmountListChange} />}
                  {/* <Input type='text' placeholder='List Price' value={listNearAmount} onChange={handleNearAmountListChange} /> */}

                  <Divider />
                  <Text>(2 NEAR is staked in NEAR protocol pool for vault creation)</Text>
                </ListItem>

              </List>

            </CardFooter>
          </Card>
        </ModalBody>
        <ModalFooter>
          {title == "Forged NFT" ? <> <Button colorScheme="blue" mr={3} onClick={onBurnNFT}>
            Burn
          </Button> <Button colorScheme="blue" mr={3} onClick={() => onListNFT(listNearAmount)}>
              List
            </Button>
          </> : (title == "" && metaData.owner_id == wallet.accountId) ? <Button colorScheme="blue" mr={3} onClick={onUnlistNFT}>
            DeList
          </Button> : (title == "" && metaData.owner_id !== wallet.accountId) ? <Button colorScheme="blue" mr={3} onClick={onBuyNFT}>
            BUY
          </Button> : <Button colorScheme="blue" mr={3} onClick={onConfirm}>
            WRAP
          </Button>}

          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export default function NftList({
  projectId,
  nftData,
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
  inTokenId,
  loading
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

  // const { isOpen, onOpen, onClose } = useDisclosure()


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

  const handleCallContract = async () => {
    if (!wallet) return;



    const attachedDeposit = parseNearAmount(inputAmount.toString());

    console.log("metadata>>>>", nftData)
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


  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [message, setMessage] = useState("");
  const [showMetaData, setShowMetaData] = useState<any>([]);
  const [tokenMetaData, setTokenMetaData] = useState<any[]>([])
  const [showTokenData, setShowTokenData] = useState<any[]>([])
  const [showAssets, setShowAssets] = useState<any[]>([])

  useEffect(() => {
    const assetsData: any[] = []
    const tempData: any[] = []

    const getMetadata = async (tokenContractId: string) => {
      if (!wallet) return;
      const metadata = await wallet.viewFunction(tokenContractId, "ft_metadata", { account_id: wallet.accountId }, { parse: undefined, stringify: undefined, jsContract: undefined });
      metadata.contract = tokenContractId;
      return metadata;
    };

    const fetchMetadata = async () => {
      for (let i = 0; i < nftData.length; i++) {
        if (!nftData[i].token_contract_ids) return
        const metadata = await Promise.all(nftData[i].token_contract_ids.map(getMetadata));
        tempData.push(metadata)
        // assetsData.push(metadata)
        console.log("tokenData!!!!>>", tempData)
        // tempData.push(Object.assign(nftData[i], tokenData))
      }
      setShowAssets(tempData);
      // console.log("token metadata!!!!>>", tempData)
      // const metadata = await Promise.all(contractIds.token_contract_ids.map(getMetadata));
      // setShowTokenData(metadata);
    };
    fetchMetadata();


  }, [nftData, wallet])


  const handleOpenModal = (modalTitle: string, message: string, metaData: any, tokenData: any) => {
    setModalTitle(modalTitle);
    setMessage(message);
    setIsOpen(true);
    setShowMetaData(metaData)
    // setShowTokenData(tokenData)
    console.log("metadata>>>>", metaData)
    setInputNearAmount(metaData.near_amount)

    const getMetadata = async (tokenContractId: string) => {
      if (!wallet) return;
      const metadata = await wallet.viewFunction(tokenContractId, "ft_metadata", { account_id: wallet.accountId }, { parse: undefined, stringify: undefined, jsContract: undefined });
      metadata.contract = tokenContractId;
      return metadata;
    };

    const fetchMetadata = async () => {
      if (!showMetaData) return;
      const metadata = await Promise.all(metaData.token_contract_ids.map(getMetadata));
      setShowTokenData(metadata);
      console.log("token metadata>>", metadata)
    };

    fetchMetadata();

  };


  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    let transactions: any = [];
    if (showMetaData.near_amount > 0 && !showMetaData.near_deposited) {
      const nearValue = convertToFloat(showMetaData.near_amount, 3, 24)
      const tempValue = nearValue + nearValue / 100
      const depositNear = convertToAmount(tempValue, 24)
      const nftContractId = "vault_" + showMetaData.token_id + ".liquid-nft-3.testnet"
      transactions.push({
        signerId: wallet.accountId,
        receiverId: nftContractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "deposit_near",
              args: {
              },
              gas: "30000000000000",
              deposit: depositNear
            }
          }
        ]
      })
    }

    for (let i = 0; i < showMetaData.token_amounts.length; i++) {
      if (showMetaData.token_amounts[i] > 0 && !showMetaData.token_deposited[i]) {
        const nftContractId = "vault_" + showMetaData.token_id + ".liquid-nft-3.testnet"
        const tokenValue = convertToFloat(showMetaData.token_amounts[i], 3, showTokenData[i].decimals)
        const tempValue = tokenValue + tokenValue / 100
        const depositValue = convertToAmount(
          tempValue, showTokenData[i].decimals
        )
        transactions.push({
          signerId: wallet.accountId,
          receiverId: showMetaData.token_contract_ids[i],
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: {
                  account_id: nftContractId,
                  registration_only: true
                },
                gas: "60000000000000",
                deposit: STORAGE_AMOUNT
              }
            }
          ]
        })
        transactions.push({
          signerId: wallet.accountId,
          receiverId: showMetaData.token_contract_ids[i],
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer_call",
                args: {
                  receiver_id: nftContractId,
                  amount: depositValue,
                  msg: "Deposit token"
                },
                gas: "60000000000000",
                deposit: "1"
              }
            }
          ]
        })
      }
    }
    console.log("transactions", transactions)
    const depsoitNft = await wallet.wallet?.signAndSendTransactions({ transactions })
  };

  const handleBurnNFT = async () => {
    // console.log("token_ id",selectNft)
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
                  token_id: showMetaData.token_id
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

  const handleListNFT = async (nearAmount: number) => {
    const nftContractId = "vault_" + showMetaData.token_id + ".liquid-nft-3.testnet"
    console.log("shit", convertToAmount(nearAmount, 24))
    const listNft = await wallet.functionCall(
      "liquid-nft-3.testnet", "nft_approve", {
      token_id: showMetaData.token_id,
      account_id: "market.liquid-nft-3.testnet",
      msg: JSON.stringify({
        sale_conditions: {
          near: convertToAmount(nearAmount, 24)
        },
        is_auction: false
      }),
    },
      "60000000000000",
      "390000000000000000000"
    )
  }

  const handleUnlistNFT = async () => {
    const unlistNft = await wallet.functionCall("market.liquid-nft-3.testnet", "remove_sale", {
      nft_contract_id: "liquid-nft-3.testnet", token_id: showMetaData.token_id,
    }, "60000000000000",
      "1")
  }

  const handleBuyNFT = async () => {
    console.log("buy,", showMetaData)
    let transactions: any = [];
    const nearValue = convertToFloat(showMetaData.sale_conditions.near, 3, 24)
    const tempValue = nearValue + nearValue / 100
    const depositNear = convertToAmount(tempValue, 24)
    const nftContractId = "vault_" + showMetaData.token_id + ".liquid-nft-3.testnet"
    transactions.push({
      signerId: wallet.accountId,
      receiverId: "market.liquid-nft-3.testnet",
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "offer",
            args: {
              nft_contract_id: "liquid-nft-3.testnet",
              token_id: showMetaData.token_id
            },
            gas: "60000000000000",
            deposit: depositNear
          }
        }
      ]
    })
    const buyNft = await wallet.wallet?.signAndSendTransactions({ transactions })
  }

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
        templateColumns="repeat(4, 1fr)"
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
      {!loading ? <Flex alignItems="center"><Spinner size='lg' /></Flex> : ""}
      <SimpleGrid templateColumns={{
        lg: "repeat(4, 1fr)",
        md: "repeat(3, 1fr)",
        sm: "repeat(2, 1fr)",
        base: "repeat(, 1fr)"
      }} minChildWidth='120px' spacing='40px' width={"100%"} column={3} >
        {nftData.map((item: any, index: any) => (
          <Box key={index}>
            <Card maxW='xl' onClick={() => handleOpenModal("Confirm", "Are you sure you want to proceed?", nftData[index], tokenMetaData)}>
              <CardBody>
                <Image
                  src={nftData[index].metadata.media}
                  borderRadius='lg'
                />
                <Stack mt='1' spacing='1'>
                  <Heading size='md' textAlign="start">#{nftData[index].token_id}</Heading>

                  <Grid templateColumns='repeat(5, 1fr)' gap={6}>
                    {!title && nftData[index].sale_conditions.near > 0 && (
                      <GridItem>
                        <Flex display="flex" justifyContent="start">
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={near}
                            alt="Fluffybuns the destroyer"
                            mr="5px"
                            width="15px"
                          />
                          <Text paddingTop={2} mr="12px" fontSize="12px">{convertToFloat(nftData[index].sale_conditions.near, 3, 24)}</Text>
                        </Flex>
                      </GridItem>
                    )}
                    {title && nftData[index].near_amount > 0 && (
                      <GridItem>
                        <Flex display="flex" justifyContent="start">
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={near}
                            alt="Fluffybuns the destroyer"
                            mr="5px"
                            width="15px"
                          />
                          <Text paddingTop={2} mr="12px" fontSize="12px">{convertToFloat(nftData[index].near_amount, 3, 24)}</Text>
                        </Flex>
                      </GridItem>
                    )}
                    {title && nftData[index].token_amounts && showAssets && showAssets.length === nftData.length && showAssets[index] && showAssets[index].map((item: any, key: any) => (
                      <GridItem>
                        <Flex display="flex" justifyContent="start">
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={showAssets[index][key].icon ? showAssets[index][key].icon : defaultTokenIcon}
                            alt="Fluffybuns the destroyer"
                            mr="5px"
                            width="15px"
                          />
                          <Text paddingTop={2} mr="12px" fontSize="12px">{convertToFloat(nftData[index].token_amounts[key], 3, showAssets[index][key].decimals)}</Text>
                        </Flex>
                      </GridItem>
                    ))}
                  </Grid>
                </Stack>
              </CardBody>
            </Card>
          </Box>
        ))}
      </SimpleGrid>
      {isOpen && (
        <MyModal isOpen={isOpen} onClose={handleCloseModal} title={title} message={message} metaData={showMetaData} tokenData={showTokenData} onConfirm={handleConfirm} onBurnNFT={handleBurnNFT} onUnlistNFT={handleUnlistNFT} onListNFT={(nearAmount) => handleListNFT(nearAmount)} onBuyNFT={handleBuyNFT} wallet={wallet} />
      )}
    </Flex>
  );
}
