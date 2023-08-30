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
import near from "../assets/img/icons/near.svg"
import defaultTokenIcon from "../assets/img/icons/defaultToken.svg"
import { InputData } from "../utils/types";
import { convertToAmount } from "../utils/convert";


interface NFT {
  token_id: string;
  owner_id: string;
  metadata: string;
}

interface NFTWithSupply extends NFT {
  supply: number;
}


export default function Marketplace() {
  const { projects } = useProjects(null, null);
  const { config, initFtContract, role, wallet } = useNearContext();

  const [isOpenModal, setIsOpenModal] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isProcessing, setIsProcessing] = useState<boolean>(false);


  const [nftByOwner, setNftByOwner] = useState<any[]>([]);
  const [nftById, setNftById] = useState<any[]>([]);
  const [getNft, setGetNft] = useState<any[]>([]);
  const [unconfirmedNft, setUnconfirmedNft] = useState<any[]>([])
  const [confirmedNft, setConfirmedNft] = useState<any[]>([])
  const [tokenMetaData, setTokenMetaData] = useState<any[]>([])
  const [listedNft, setListedNft] = useState<any[]>([])


  const [tokenAddr, setTokenAddr] = useState("")
  const [addToken, setAddToken] = useState<any[]>([])

  const [contractId, setContractId] = useState("");

  const [defaultToken, setDefaultToken] = useState(false)
  const [tokenList, setTokenList] = useState<any[]>([])

  const { isLoggedInNear, accountIdNear, signInNear, signOutNear } = useNearLogin();
  const buttonStyle = useColorModeValue(
    connectButtonStyle,
    connectButtonStyleDark
  );

  useEffect(() => {
    const fetchListedNft = async () => {
      if (!wallet) return
      console.log("account", wallet.accountId)
      const getListedNft = await wallet.viewFunction("market.liquid-nft-3.testnet", "get_sales_by_nft_contract_id", {
        nft_contract_id: "liquid-nft-3.testnet", from_index: "0", limit: 100
      }, { parse: undefined, stringify: undefined, jsContract: undefined })
      // console.log("heres------------------", getNftByOwner)
      // getNftByOwner.forEach((key:any, index:any) => {
      //   nft_id.push(getNftByOwner[index].token_id)
      // })
      setListedNft(getListedNft);
      console.log("market place nfts", getListedNft)
      // setListedNft(getNftByOwner)
    }
    fetchListedNft()
  }, [wallet])

  useEffect(() => {
    const fetchNftByOwner = async () => {
      if (!wallet) return
      const getNftByOwner = await wallet.viewFunction("liquid-nft-3.testnet", "nft_tokens_for_owner", {
        account_id: "market.liquid-nft-3.testnet",
      }, { parse: undefined, stringify: undefined, jsContract: undefined })
      // console.log("heres------------------", getNftByOwner)
      // getNftByOwner.forEach((key:any, index:any) => {
      //   nft_id.push(getNftByOwner[index].token_id)
      // })
      console.log("getNftByOwner", getNftByOwner)

      setNftByOwner(getNftByOwner);

    }
    fetchNftByOwner()
  }, [wallet])

  useEffect(() => {
    const fetchNftByTokenId = async (tokenId: string, approveId: number) => {
      if (!tokenId) return;
      const nftContractId = "vault_" + tokenId + ".liquid-nft-3.testnet"
      console.log("nftContractId", nftContractId)

      const getNftByTokenId = await wallet.viewFunction(nftContractId, "get_info", {
        taccount_id: "market.liquid-nft-3.testnet"
      }, { parse: undefined, stringify: undefined, jsContract: undefined });

      console.log("getNftByTokenId", getNftByTokenId)
      return getNftByTokenId;
    };

    const fetchNfts = async () => {
      const nfts = await Promise.all(listedNft.map((nft) => fetchNftByTokenId(nft.token_id, nft.approval_id)));
      setNftById(nfts);
    };

    fetchNfts();
  }, [wallet, nftByOwner]);


  useEffect(() => {
    const result: any[] = []
    console.log("nftByOwner>>>>>>>>", nftByOwner)
    console.log("nftById>>>>>>>>", nftById)
    setIsProcessing(false)

    for (let i = 0; i < nftByOwner.length; i++) {
      for (let j = 0; j < listedNft.length; j++) {
        if (nftByOwner[i].token_id == listedNft[j].token_id) {
          console.log("ok!!!!!!!", nftById.length)
          result.push(Object.assign(nftByOwner[i], nftById[j], listedNft[j]))
        }
      }
    }

    setGetNft(result)
    setIsProcessing(true)
    console.log("result>>>>>>>>", result)
  }, [nftByOwner, nftById])

  useEffect(() => {
    const unconfirmed: any[] = []
    const confirmed: any[] = []
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

  const handlRemoveToken = (index: number) => {
    const removedItem = tokenList.splice(index, 1)[0];
    console.log("removedItem>>>>>", removedItem)
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


  const [overlay, setOverlay] = useState(<OverlayOne />)

  return (
    <>
      <Box>
        <Flex justifyContent={"space-between"}>
          <TitleCard title={"Market Place"} />
          {/* {isLoggedInNear && (
            <Button aria-label="Connect Wallet"
              {...buttonStyle} onClick={() => {
                setOverlay(<OverlayTwo />)
                onOpen()
              }}>
              <Text size="sm" sx={{ pr: 1 }} marginBottom={"0"} >Forge</Text>
            </Button>
          )} */}
        </Flex>
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
            title=""
            subtitle="SELECT YOUR ASSETS"
            nftData={getNft}
            loading={isProcessing}
          />
          {/* <NftList
            projectId={1}
            title="Confirmed NFTs"
            subtitle="SELECT YOUR ASSETS"
            nftData={confirmedNft}
          /> */}

        </Grid>

      </Box>
      <Modal isCentered isOpen={isOpen} onClose={onClose} scrollBehavior="inside" >
        {overlay}
        <ModalContent>
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
                  {/* {inputNearAmount ?
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
                    : ""} */}

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
            <Button colorScheme='blue' mr={3} >
              Previous Step
            </Button>
            <Button colorScheme='blue' mr={3} >
              Mint
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>

      </Modal>
    </>
  );
}
