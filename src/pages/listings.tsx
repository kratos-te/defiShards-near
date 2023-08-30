import { useState, useEffect } from "react"
import { Button, Box, Flex, Grid, Text, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader, ModalFooter, useDisclosure, Card, CardBody, Image, Stack, Heading, List, ListItem, Input, Divider, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, ButtonGroup, IconButton, Menu, MenuButton, MenuList, MenuItem, CardFooter } from "@chakra-ui/react";
import { ChevronDownIcon, AddIcon, CloseIcon } from '@chakra-ui/icons'
import NftList from "../components/NftList";
import TitleCard from "../components/TitleCard";
import Loading from "../components/Loading";
import { useProjects, useNearLogin, useNearContext, convertToFloat } from "../hooks";
import { TimeDivision } from "../utils/const";
import { connect, Contract, keyStores, Near } from "near-api-js";
import {
  connectButtonStyle,
  connectButtonStyleDark,
} from "../theme/ButtonStyles";
import { tokenAddresses } from "../utils/tokens"
import wNEAR from "../assets/img/icons/wnear.svg"
import near from "../assets/img/icons/near.svg"
import defaultTokenIcon from "../assets/img/icons/defaultToken.svg"
import { InputData } from "../utils/types";
import { convertToAmount } from "../utils/convert";




export default function Listings() {
  const { projects } = useProjects(null, null);
  const { config, initFtContract, role, wallet } = useNearContext();

  const [isOpenModal, setIsOpenModal] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isOpenNext, setIsOpenNext] = useState(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [nftByOwner, setNftByOwner] = useState<any[]>([]);
  const [nftById, setNftById] = useState<any[]>([]);
  const [getNft, setGetNft] = useState<any[]>([]);
  const [unconfirmedNft, setUnconfirmedNft] = useState<any[]>([])
  const [confirmedNft, setConfirmedNft] = useState<any[]>([])
  const [tokenMetaData, setTokenMetaData] = useState<any[]>([])

  const [tokenAddr, setTokenAddr] = useState("")
  const [addToken, setAddToken] = useState<any[]>([])

  const [defaultToken, setDefaultToken] = useState(false)
  const [tokenList, setTokenList] = useState<any[]>([])


  const [inputNearAmount, setInputNearAmount] = useState<number>(0)
  const [inputPanel, setInputPanel] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  const [inputTokenAmount, setInputTokenAmount] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  const [inputTokenAddress, setInputTokenAddress] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  const [inputAddedTokenAmount, setInputAddedTokenAmount] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  const [inputAddedTokenAddress, setInputAddedTokenAddress] = useState<InputData[]>([
    {
      input: "",
      input_rank: 1
    }
  ])
  // if (!projects.isError && !projects.isLoading)
  //   console.log("project is", projects.value);

  const { isLoggedInNear, accountIdNear, signInNear, signOutNear } = useNearLogin();
  const buttonStyle = useColorModeValue(
    connectButtonStyle,
    connectButtonStyleDark
  );


  const handlRemoveAddedToken = (index: number) => {
    handleRemoveListItem(index, addToken, setAddToken);
    handleRemoveListItem(index, inputAddedTokenAmount, setInputAddedTokenAmount)
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

  const handleTokenChange = (
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
    handleAddressChange(tokenList[index].contract,
      index,
      inputTokenAddress,
      setInputTokenAddress)
  };

  const handleAddressChange = (
    contract: string,
    index: number,
    reactHookGetter: any,
    reactHookSetter: any
  ) => {
    const value = contract;
    const newInputList = [...reactHookGetter];
    newInputList[index].input = value;
    newInputList[index].input_rank = index + 1;
    reactHookSetter(newInputList);
  };

  const handleAddedTokenChange = (
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
    handleAddedAddressChange(addToken[index].contract,
      index,
      inputAddedTokenAddress,
      setInputAddedTokenAddress)
  };

  const handleAddedAddressChange = (
    contract: string,
    index: number,
    reactHookGetter: any,
    reactHookSetter: any
  ) => {
    const value = contract;
    const newInputList = [...reactHookGetter];
    newInputList[index].input = value;
    newInputList[index].input_rank = index + 1;
    reactHookSetter(newInputList);
  };

  const nft_Id: any[] = [];
  const metadata_Id: any[] = [];



  useEffect(() => {
    const fetchNftByOwner = async () => {
      if (!wallet) return
      const getNftByOwner = await wallet.viewFunction("liquid-nft-3.testnet", "nft_tokens_for_owner", {
        account_id: wallet.accountId,
      }, { parse: undefined, stringify: undefined, jsContract: undefined })
      setNftByOwner(getNftByOwner);

    }
    fetchNftByOwner()
  }, [wallet])

  useEffect(() => {
    const fetchNftByTokenId = async (tokenId: string) => {
      if (!tokenId) return;
      const nftContractId = "vault_" + tokenId + ".liquid-nft-3.testnet"

      const getNftByTokenId = await wallet.viewFunction(nftContractId, "get_info", {
        account_id: wallet.accountId,
      }, { parse: undefined, stringify: undefined, jsContract: undefined });

      return getNftByTokenId;
    };

    const fetchNfts = async () => {
      const nfts = await Promise.all(nftByOwner.map((nft) => fetchNftByTokenId(nft.token_id)));
      setNftById(nfts);
    };

    fetchNfts();
  }, [wallet, nftByOwner]);

  useEffect(() => {
    const result: any[] = []
    for (let i = 0; i < nftByOwner.length; i++) {
      for (let j = 0; j < nftById.length; j++) {
        if (nftByOwner[i].token_id == nftById[j].token_id) {
          result.push(Object.assign(nftByOwner[i], nftById[j]))
        }
      }
    }
    console.log("result", result)
    setGetNft(result)
  }, [nftByOwner, nftById])

  useEffect(() => {
    const unconfirmed: any[] = []
    const confirmed: any[] = []
    setIsProcessing(false)
    for (let i = 0; i < getNft.length; i++) {
      let bullconfirmed = false;
      if (getNft[i].near_amount !== "0" && getNft[i].near_deposited == false) {
        unconfirmed.push(getNft[i]);
        bullconfirmed = true;
        continue;
      }
      if (getNft[i].token_deposited) {
        for (let j = 0; j < (getNft[i].token_deposited).length; j++) {
          if (getNft[i].token_deposited[j] == false) {
            unconfirmed.push(getNft[i]);
            bullconfirmed = true;
            break;
          }
        }
      }
      if (!bullconfirmed) {
        confirmed.push(getNft[i]);
      }
    }
    setUnconfirmedNft(unconfirmed)
    setConfirmedNft(confirmed)
    setIsProcessing(true)
  }, [getNft])

  useEffect(() => {
    const getMetadata = async (tokenContractId: string) => {
      if (!wallet) return;
      const metadata = await wallet.viewFunction(tokenContractId, "ft_metadata", { account_id: wallet.accountId }, { parse: undefined, stringify: undefined, jsContract: undefined });
      metadata.contract = tokenContractId;
      return metadata;
    };

    const fetchMetadata = async () => {
      const metadata = await Promise.all(tokenAddresses.map(getMetadata));
      setTokenMetaData(metadata);
    };

    fetchMetadata();
  }, [wallet]);

  const getTokenMeta = async (token_Address: string) => {
    if (!wallet) return;
    const metadata = await wallet.viewFunction(token_Address, "ft_metadata", { account_id: wallet.accountId }, { parse: undefined, stringify: undefined, jsContract: undefined });
    metadata.contract = token_Address;
    metadata_Id.push(metadata)
    setAddToken(prevAddToken => [...prevAddToken, metadata])
    setTokenAddr("")
    setInputAddedTokenAmount([
      ...inputAddedTokenAmount,
      {
        input: "",
        input_rank: inputAddedTokenAmount.length + 1
      }
    ]);
    setInputAddedTokenAddress([
      ...inputAddedTokenAddress,
      {
        input: "",
        input_rank: inputAddedTokenAddress.length + 1
      }
    ]);
  }

  const handleNearAmountInputChange = (e: any) => {
    setInputNearAmount(e.target.value);
  };

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

  const handleTokenInputChange = (e: any) => {
    setTokenAddr(e.target.value)
  }

  const handleSelectToken = (index: number) => {
    const nft_list: any[] = []
    const removedItem = tokenMetaData.splice(index, 1)[0];
    setTokenList(prevTokenList => [...prevTokenList, removedItem])
    setInputTokenAmount([
      ...inputTokenAmount,
      {
        input: "",
        input_rank: inputTokenAmount.length + 1
      }
    ]);
    setInputTokenAddress([
      ...inputTokenAddress,
      {
        input: "",
        input_rank: inputTokenAddress.length + 1
      }
    ]);
  }

  const handlRemoveToken = (index: number) => {
    const removedItem = tokenList.splice(index, 1)[0];
    setTokenMetaData(prevTokenMetaData => [...prevTokenMetaData, removedItem])
  }

  // const handlRemoveAddedToken = (index: number) => {
  //   const removedItem = addToken.splice(index, 1)[0];
  //   console.log("removedItem>>>>>", removedItem)
  // }

  const handleSelectNear = () => {
    setDefaultToken(true)
  }

  const handlRemoveDefaultToken = () => {
    setDefaultToken(false)
  }

  const [tokenArray, setTokenArray] = useState<any[]>([]);
  const [addedTokenArray, setAddedTokenArray] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState<any[]>([]);
  const [depositAddress, setDepositAddress] = useState<any[]>([]);

  const openNextStep = () => {
    setIsOpenNext(!isOpenNext)
    const token_address: any[] = [];
    const addedtoken_address: any[] = [];
    const tokenAmount: any[] = [];
    const addedTokenAmount: any[] = [];
    const amount: any[] = []
    const address: any[] = []

    tokenList.forEach((key, index) => {
      if (inputTokenAmount[index].input != "") {
        const covertedAmount = convertToAmount(inputTokenAmount[index].input, tokenList[index].decimals)
        tokenAmount.push(inputTokenAmount[index].input)
        amount.push(covertedAmount)
        token_address.push(inputTokenAddress[index].input)
        address.push(inputTokenAddress[index].input)
      }
    })
    addToken.forEach((key, index) => {
      if (inputAddedTokenAmount[index].input != "") {
        const covertedAddedAmount = convertToAmount(inputAddedTokenAmount[index].input, addToken[index].decimals)

        addedTokenAmount.push(inputAddedTokenAmount[index].input)
        amount.push(covertedAddedAmount)
        addedtoken_address.push(inputAddedTokenAddress[index].input);
        address.push(inputAddedTokenAddress[index].input);
      }
    })
    setTokenArray(tokenAmount)
    setAddedTokenArray(addedTokenAmount)
    setDepositAmount(amount)
    setDepositAddress(address)

  }

  const handleCallContract = async () => {
    if (!wallet) return;
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
                  token_contract_ids: depositAddress,
                  token_amounts: depositAmount,
                  near_amount: convertToAmount(inputNearAmount, 24)
                },
                gas: "300000000000000",
                deposit: "2000000000000000000000000"
              }
            }
          ]
        },
      ]
    });

  }



  const [overlay, setOverlay] = useState(<OverlayOne />)

  return (
    <>
      <Box>
        <Flex justifyContent={"space-between"}>
          <TitleCard title={"My NFT"} />
          {isLoggedInNear && (
            <Button aria-label="Connect Wallet" marginTop={10}
              {...buttonStyle} width="150px" onClick={() => {
                setOverlay(<OverlayTwo />)
                onOpen()
              }}>
              <Text size="sm" sx={{ pr: 1 }} marginBottom={"0"} >Forge</Text>
            </Button>
          )}
        </Flex>
        {projects.isLoading ? (
          <Loading />
        ) : projects.isError ? (
          <Flex justifyContent={"center"}>
            <Text>Contract not initialized.</Text>
          </Flex>
        ) : projects.value.filter(
          (project) =>
            !(
              project.end_time / TimeDivision < Date.now() ||
              !project.is_activated ||
              !project.is_published
            )
        ).length <= 0 || !projects ? (
          <Flex justifyContent={"center"}>
            <Text>There are no active IDO Listings at the moment.</Text>
          </Flex>
        ) : (
          <Grid
            templateColumns={{
                    lg: "repeat(1, 1fr)",
                    md: "repeat(1, 1fr)",
              base: "repeat(, 1fr)"
            }}
            gap={10}
            paddingY="4"
          >
                  <NftList
                    projectId={1}
                    title="Empty NFT"
                    subtitle="SELECT YOUR ASSETS"
                    nftData={unconfirmedNft}
                    loading={isProcessing}
                  />
                  <NftList
                    projectId={1}
                    title="Forged NFT"
                    subtitle="SELECT YOUR ASSETS"
                    nftData={confirmedNft}
                    loading={isProcessing}
                  />
                  {/* <MintCard
              projectId={1}
              title="NOW"
                    subtitle="SELECT YOUR ASSETS"
                  />
                  <LiquiydateCard
                    projectId={2}
                    title="Liquid"
                    subtitle="SELECT YOUR ASSETS" />

            <LaterCard
              projectId={3}
              title="LATER"
                    subtitle="LOOKING FOR YOUR TOKENS???"
            /> */}
          </Grid>
        )}
      </Box>
      <Modal isCentered isOpen={isOpen} onClose={onClose} scrollBehavior="inside" >
        {overlay}
        {!isOpenNext ? (<ModalContent>
          <ModalHeader>Select Assets</ModalHeader>
          <ModalCloseButton />
          <ModalBody height="700px">
            <Card maxW='sm'>
              <CardBody>
                <Stack mt='6' spacing='3'>
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      Select Token
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={handleSelectNear} width={340}>
                        <Flex display="flex" justifyContent="space-between" paddingTop={2}>
                          { }
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={near}
                            alt="Fluffybuns the destroyer"
                            mr="12px"
                          />
                          <Text paddingTop={2}>Near</Text>
                        </Flex></MenuItem>
                      {tokenMetaData.map((item: any, index: any) => (
                        <MenuItem onClick={() => handleSelectToken(index)}>
                          <Flex display="flex" justifyContent="space-between" paddingTop={2}>
                            { }
                            <Image
                              boxSize="2rem"
                              borderRadius="full"
                              src={tokenMetaData[index].icon ? tokenMetaData[index].icon : defaultTokenIcon}
                              alt="Fluffybuns the destroyer"
                              mr="12px"
                            />
                            <Text paddingTop={2}>{tokenMetaData[index].symbol}</Text>
                          </Flex></MenuItem>
                      ))}

                    </MenuList>
                  </Menu>
                  <Divider />
                  <Box border={2}>

                  </Box>
                  <Divider />
                  <List spacing={10}>
                    {defaultToken && (

                      <ListItem>
                        <Flex display="flex" justifyContent="space-between">
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={near}
                            alt="Fluffybuns the destroyer"
                            mr="12px"
                          />
                          <Input type='text' placeholder='Near' value={inputNearAmount} onChange={handleNearAmountInputChange} />
                          <IconButton aria-label='Add to friends' icon={<CloseIcon />} onClick={() => handlRemoveDefaultToken()} />
                        </Flex>
                      </ListItem>
                    )}
                    {tokenList.map((item: any, index: any) => (
                      <ListItem>
                        <Flex display="flex" justifyContent="space-between">
                          { }
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={tokenList[index].icon ? tokenList[index].icon : defaultTokenIcon}
                            alt="Fluffybuns the destroyer"
                            mr="12px"
                          />
                          <Input type='hidden' placeholder={tokenList[index].symbol} value={tokenList[index].contract} onChange={(event) =>
                            handleAddressChange(
                              tokenList[index].contract,
                              index,
                              inputTokenAddress,
                              setInputTokenAddress
                            )
                          } />
                          <Input type='text' placeholder={tokenList[index].symbol} value={inputTokenAmount[index].input} onChange={(event) =>
                            handleTokenChange(
                              event,
                              index,
                              inputTokenAmount,
                              setInputTokenAmount
                            )
                          } />
                          <IconButton aria-label='Add to friends' icon={<CloseIcon />} onClick={() => handlRemoveToken(index)} />
                        </Flex>
                      </ListItem>
                    ))}
                    {addToken.map((item: any, index: any) => (
                      <ListItem>
                        <Flex display="flex" justifyContent="space-between">
                          { }
                          <Image
                            boxSize="2rem"
                            borderRadius="full"
                            src={addToken[index].icon ? addToken[index].icon : defaultTokenIcon}
                            alt="Fluffybuns the destroyer"
                            mr="12px"
                          />
                          <Input type='hidden' placeholder={addToken[index].symbol} value={addToken[index].contract}
                            onChange={() =>
                              handleAddedAddressChange(
                                addToken[index].contract,
                                index,
                                inputAddedTokenAddress,
                                setInputAddedTokenAddress
                              )
                            }
                          />
                          <Input type='text' placeholder={addToken[index].symbol} value={inputAddedTokenAmount[index].input}
                            onChange={(event) =>
                              handleAddedTokenChange(
                                event,
                                index,
                                inputAddedTokenAmount,
                                setInputAddedTokenAmount
                              )
                            }
                          />
                          <IconButton aria-label='Add to friends' icon={<CloseIcon />} onClick={() => handlRemoveAddedToken(index)} />
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
                <Divider />
                <Box>
                  <Accordion allowToggle w="full">
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box as="span" flex="1" textAlign="left" width="full">
                            <Text fontSize="xl" color="tomato">
                              ADVANCED
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <List spacing={10}>
                          <ListItem>
                            <Flex display="flex" justifyContent="space-between">

                              <Input type='text' placeholder="Token Address" value={tokenAddr} onChange={handleTokenInputChange} />
                              <ButtonGroup size='md' isAttached variant='outline' onClick={() => getTokenMeta(tokenAddr)}>

                                <IconButton aria-label='Add to friends' icon={<AddIcon />} />
                              </ButtonGroup>
                            </Flex>
                          </ListItem>
                        </List>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Box>
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
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={openNextStep}>
              Next Step
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>) : (<ModalContent>
          <ModalHeader>Mint NFT</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Card maxW='sm'>
              <CardBody>
                <Stack mt='6' spacing='3'>
                  <Image src="https://cdn.discordapp.com/attachments/1063532776646774845/1141379850570055740/naomiii_shard_thin_stone_sharp_edges_gold_color_30dc172d-2b5d-4ab7-b00f-bfecf100bd06.png" />
                  <Divider />
                </Stack>
                <Divider />
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
                <List spacing={2}>
                  {inputNearAmount ?
                    <ListItem>

                      <Flex display="flex" justifyContent="space-between">
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={near}
                          alt="Fluffybuns the destroyer"
                          mr="12px"
                        />
                        <Text paddingTop={2}>{inputNearAmount}</Text>
                      </Flex>
                    </ListItem>
                    : ""}

                  {tokenArray.map((item, index) => (
                    <ListItem>
                      <Flex display="flex" justifyContent="space-between">
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={tokenList[index].icon ? tokenList[index].icon : defaultTokenIcon}
                          alt="Fluffybuns the destroyer"
                          mr="12px"
                        />
                        <Text paddingTop={2}>{tokenArray[index]}</Text>
                      </Flex>
                    </ListItem>
                  ))}

                  {addedTokenArray.map((item, index) => (
                    <ListItem>
                      <Flex display="flex" justifyContent="space-between">
                        <Image
                          boxSize="2rem"
                          borderRadius="full"
                          src={addToken[index].icon ? addToken[index].icon : defaultTokenIcon}
                          alt="Fluffybuns the destroyer"
                          mr="12px"
                        />
                        <Text paddingTop={2}>{addedTokenArray[index]}</Text>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              </CardFooter>
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={openNextStep}>
              Previous Step
            </Button>
            <Button colorScheme='blue' mr={3} onClick={handleCallContract}>
              Mint
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>)}

      </Modal>
    </>
  );
}
