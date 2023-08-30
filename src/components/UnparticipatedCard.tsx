import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Image, Text, Button, Show, Hide, Box } from "@chakra-ui/react";
import {
  depositButtonStyle,
  secondaryButtonStyle,
} from "../theme/ButtonStyles";
import { Project, useBalance, useNearContext, useNearLogin } from "../hooks";
import { FtContract } from "../hooks/Near/classWrappers";
import { TimeDivision, TokenDecimals } from "../utils/const";
import { useColor } from "../hooks";
import { usdt, usdc, wnear } from "../utils/tokens";
import { cutDecimal, convertToFloat, convertToAmount } from "../utils/convert";

export default function UnparticipatedCard(project: Project) {
  const now = Date.now();
  const navigate = useNavigate();
  const color = useColor();
  const { isLoggedInNear } = useNearLogin();
  const { config, initFtContract } = useNearContext();
  const { getBalance } = useBalance();

  const [userDepositedBalance, setUserDepositedBalance] = useState<number>(0);
  const [decimals, setDecimals] = useState<number>(6);

  const inToken =
    project.in_token_account_id === config.usdtContractId
      ? usdt
      : project.in_token_account_id === config.usdcContractId
      ? usdc
      : wnear;

  const inTokenDecimals =
    project.in_token_account_id == config.usdcContractId
      ? TokenDecimals.usdc
      : project.in_token_account_id == config.usdtContractId
      ? TokenDecimals.usdt
      : TokenDecimals.wnear;
  const startingPrice = convertToFloat(
    project.starting_price,
    5,
    inTokenDecimals
  );
  const softCap =
    convertToFloat(project.total_tokens, 5, decimals) * startingPrice;
  const estimatedTokenPurchased =
    softCap > convertToFloat(project.total_deposits, 5, inTokenDecimals)
      ? userDepositedBalance / inTokenDecimals / startingPrice
      : project.total_deposits === "0"
      ? 0
      : (convertToFloat(project.total_tokens, 5, decimals) *
          userDepositedBalance) /
        convertToFloat(project.total_deposits, 5, inTokenDecimals);
  const price =
    softCap > convertToFloat(project.total_deposits, 5, inTokenDecimals)
      ? startingPrice
      : convertToFloat(project.total_deposits, 5, inTokenDecimals) /
        convertToFloat(project.total_tokens, 5, decimals);
  const ended = project.end_time / TimeDivision < now ? true : false;

  const getDepositedBalance = async () => {
    const balance = await getBalance(project.project_id);
    setUserDepositedBalance(
      convertToFloat(balance, 5, project.in_token_decimals)
    );
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

  useEffect(() => {
    getDecimals(project.out_token_account_id);
  }, []);

  return (
    <> 
    <Show above='md'>
      <Flex
        width={"100%"}
        minHeight="14"
        paddingY="4"
        paddingX="4"
        border="1px solid"
        borderColor="rock.100"
        borderRadius="10px"
        // bgColor="rock.50"
        alignItems="center"
        marginY={2}
      >
        <Flex width={"40%"} justifyContent={"start"} flexDirection={"column"}>
          <Flex marginY={1}>
            <Text
              width={"50%"}
              as="h1"
              fontSize="14px"
              textAlign="start"
              color={color.cardTitle}
            >
              PRICE
            </Text>
            <Text
              width={"50%"}
              as="h2"
              fontSize="18px"
              textAlign="start"
              marginLeft="10px"
              color={color.cardBoxTitle}
            >
              $ {price} {inToken.symbol}
            </Text>
          </Flex>
          <Flex marginY={1}>
            <Text
              width={"50%"}
              as="h1"
              fontSize="14px"
              textAlign="start"
              color={color.cardTitle}
            >
              STATUS
            </Text>
            <Text
              width={"50%"}
              as="h2"
              fontSize="18px"
              textAlign="start"
              marginLeft="10px"
              color={ended ? "#E82127" : "#26A17B"}
            >
              {ended ? "SALE ENDED" : "SALE IS LIVE"}
            </Text>
          </Flex>
          <Flex marginY={1}>
            <Text
              width={"50%"}
              as="h1"
              fontSize="14px"
              textAlign="start"
              color={color.cardTitle}
            >
              TOKENS ON SALE
            </Text>
            <Text
              width={"50%"}
              as="h2"
              fontSize="18px"
              textAlign="start"
              marginLeft="10px"
              color={color.cardBoxTitle}
            >
              {convertToFloat(project.total_tokens, 5, decimals).toLocaleString()}
            </Text>
          </Flex>
        </Flex>
        <Flex width={"50%"} justifyContent={"center"}>
          <Button
            fontSize="10px"
            paddingX={4}
            {...(ended ? secondaryButtonStyle : depositButtonStyle)}
            onClick={() =>
              navigate(
                ended
                  ? `/detail/${project.project_id}`
                  : `/listing/${project.project_id}`
              )
            }
          >
            {ended ? "DETAILS" : "PARTICIPATE"}
          </Button>
        </Flex>
        <Flex width={"10%"} justifyContent={"end"} flexDirection={"column"}>
          <Flex alignItems="end" justifyContent="end">
            <Text
              as="h2"
              fontSize="10px"
              textAlign="end"
              color={color.cardTitle}
              textOverflow={"ellipsis"}
              overflow={"hidden"}
              maxWidth={"200px"}
              height={"10px"}
            >
              {project.title}
            </Text>
          </Flex>
          <Flex alignItems="center" justifyContent={"space-between"}>
            <Image src={"/logos/" + project.logo} boxSize="25px" />
            <Text
              as="h1"
              fontSize="14px"
              textAlign="end"
              color={color.cardBoxTitle}
              textOverflow={"ellipsis"}
              overflow={"hidden"}
              maxWidth={"200px"}
              height={"20px"}
            >
              {project.title}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Show>
    <Hide above='md'>
      <Box
        width={"100%"}
        minHeight="14"
        paddingY="4"
        paddingX="4"
        border="1px solid"
        borderColor="rock.100"
        borderRadius="10px"
        // bgColor="rock.50"
        alignItems="center"
        marginY={2}
      >
        <Flex width={"100%"} justifyContent={"center"} >
          <Flex width='40%'></Flex>
            <Flex width={'20%'} justifyContent={'center'} flexDirection={'column'}>
              <Flex alignItems="center" justifyContent={"space-between"}>
                <Image src={"/logos/" + project.logo} boxSize="25px" />
                <Box>
                  <Text
                    as="h2"
                    fontSize="10px"
                    textAlign="end"
                    color={color.cardTitle}
                    textOverflow={"ellipsis"}
                    overflow={"hidden"}
                    maxWidth={"200px"}
                    height={"10px"}
                  >
                    {project.title}
                  </Text>
                  
                  <Text
                    as="h1"
                    fontSize="14px"
                    textAlign="end"
                    color={color.cardBoxTitle}
                    textOverflow={"ellipsis"}
                    overflow={"hidden"}
                    maxWidth={"200px"}
                    height={"20px"}
                  >
                    {project.title}
                  </Text>
                </Box>
              </Flex>
            </Flex>

            <Flex width={'40%'}></Flex>
        </Flex>
        <Flex width={'100%'} marginTop={4} justifyContent={'start'} flexDirection={'column'}>
          <Flex marginY={1}>
            <Text
              width={"50%"}
              as="h1"
              fontSize="14px"
              textAlign="start"
              color={color.cardTitle}
            >
              PRICE
            </Text>
            <Text
              width={"50%"}
              as="h2"
              fontSize="18px"
              textAlign="start"
              marginLeft="10px"
              color={color.cardBoxTitle}
            >
              $ {price} {inToken.symbol}
            </Text>
          </Flex>
          <Flex marginY={1}>
            <Text
              width={"50%"}
              as="h1"
              fontSize="14px"
              textAlign="start"
              color={color.cardTitle}
            >
              STATUS
            </Text>
            <Text
              width={"50%"}
              as="h2"
              fontSize="18px"
              textAlign="start"
              marginLeft="10px"
              color={ended ? "#E82127" : "#26A17B"}
            >
              {ended ? "SALE ENDED" : "SALE IS LIVE"}
            </Text>
          </Flex>
          <Flex marginY={1}>
            <Text
              width={"50%"}
              as="h1"
              fontSize="14px"
              textAlign="start"
              color={color.cardTitle}
            >
              TOKENS ON SALE
            </Text>
            <Text
              width={"50%"}
              as="h2"
              fontSize="18px"
              textAlign="start"
              marginLeft="10px"
              color={color.cardBoxTitle}
            >
              {convertToFloat(project.total_tokens, 5, decimals).toLocaleString()}
            </Text>
          </Flex>
        </Flex>
        <Button
                  fontSize="10px"
                  paddingX={4}
                  {...(ended ? secondaryButtonStyle : depositButtonStyle)}
                  onClick={() =>
                    navigate(
                      ended
                        ? `/detail/${project.project_id}`
                        : `/listing/${project.project_id}`
                    )
                  }
                >
                  {ended ? "DETAILS" : "PARTICIPATE"}
              </Button>

      </Box>
    </Hide>
    </>
  );
}
