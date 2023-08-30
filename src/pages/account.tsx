import { useEffect, useState } from "react";
import {
  Flex,
  Image,
  Text,
  Button,
  useBoolean,
  Grid,
  GridItem,
  Show,
  Hide,
  Spacer,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import SEAT from "../assets/img/icons/seat.svg";
import kung from "../assets/img/icons/kung.svg";
import divis from "../assets/img/icons/divis.svg";
import { usdt, usdc, wnear } from "../utils/tokens";
import TitleCard from "../components/TitleCard";
import {
  useNearLogin,
  useBalance,
  useColor,
  useNearContext,
  useProjects,
  convertToFloat,
} from "../hooks";
import Loading from "../components/Loading";
import { FtContract } from "../hooks/Near/classWrappers";
import { Project } from "../hooks";
import { TokenDecimals } from "../utils/const";
import ParticipatedCard from "../components/ParticipatedCard";
import UnparticipatedCard from "../components/UnparticipatedCard";

import {
  connectButtonStyle,
  connectButtonStyleDark,
} from "../theme/ButtonStyles";

interface SplitProjects {
  even: Project[];
  odd: Project[];
}

export default function Account() {
  const listing1 = {
    fromToken: usdt,
    toToken: usdc,
    startTime: 1676419200000,
    endTime: 1677024000000,
    progress: 70,
  };
  const { accountIdNear, isLoggedInNear, signInNear } = useNearLogin();
  const color = useColor();
  const { projects } = useProjects(null, null);
  const { config, initFtContract } = useNearContext();
  const { getBalance } = useBalance();
  const [participatedProjects, setParticipatedProjects] = useState<Project[]>(
    []
  );
  const [notParticipatedProjects, setNotParticipatedProjects] = useState<
    Project[]
  >([]);

  const getSplitProjects = async (projects: Project[]) => {
    if (projects.length == 0) return;
    const { even, odd }: SplitProjects = await projects.reduce(
      async (accumulator: Promise<SplitProjects>, project: Project) => {
        const splitProjects = await accumulator;
        const inTokenDecimals =
          project.in_token_account_id === config.usdcContractId
            ? TokenDecimals.usdc
            : project.in_token_account_id === config.usdtContractId
            ? TokenDecimals.usdt
            : TokenDecimals.wnear;
        const userDepositedBalance = convertToFloat(
          await getBalance(project.project_id),
          5,
          inTokenDecimals
        );
        if (userDepositedBalance > 0) {
          splitProjects.even.push(project);
        } else {
          splitProjects.odd.push(project);
        }
        return splitProjects;
      },
      Promise.resolve({ even: [], odd: [] })
    );

    setParticipatedProjects(even);
    setNotParticipatedProjects(odd);
  };

  const handleConnectNear = () => {
    signInNear();
  };

  const buttonStyle = useColorModeValue(
    connectButtonStyle,
    connectButtonStyleDark
  );

  const connectWallet = (
    <Button
      aria-label="Connect Wallet"
      {...buttonStyle}
      onClick={handleConnectNear}
    >
      <Text size="sm" sx={{ pr: 1 }} marginBottom={"0"}>
        Connect Wallet
      </Text>
    </Button>
  );

  if (isLoggedInNear === false)
    return (
      <>
        <Flex justifyContent={"center"}>
          <TitleCard title={"Please Connect a Wallet."} />
        </Flex>
        <Flex justifyContent={"center"}>
          {connectWallet}
        </Flex>
      </>
    );

  if (projects.isLoading) return <Loading />;
  else if (projects.isError)
    return (
      <Flex justifyContent={"center"}>
        <Text>Contract not initialized.</Text>
      </Flex>
    );
  else if (
    !projects ||
    projects.value.filter(
      (project) => project.is_activated && project.is_published
    ).length <= 0
  )
    return (
      <Flex justifyContent={"center"}>
        <Text>There are no active IDO Listings at the moment.</Text>
      </Flex>
    );
  else {
    getSplitProjects(
      projects.value.filter(
        (project) => project.is_activated && project.is_published
      )
    );

    return (
      <>
        <TitleCard title="USER DASHBOARD" />
        <Flex
          marginY="4"
          padding="8"
          shadow="lg"
          border="1px solid"
          borderRadius="2xl"
          borderColor={color.cardBorder}
          background={color.cardBg}
          flexDirection="column"
        >
          {/* Participated Tokens */}

          <Flex flexDirection="column">
            {participatedProjects.length ? (
              <Flex marginBottom="20px">
                <Text
                  as="h1"
                  fontSize="20px"
                  textAlign="start"
                  color={color.green}
                >
                  PARTICIPATED LAUNCHPAD TOKENS
                </Text>
              </Flex>
            ) : (
              <></>
            )}
            <Flex flexDirection={"column"}>
              {participatedProjects.map((project) => (
                <ParticipatedCard key={project.project_id} {...project} />
              ))}
            </Flex>
          </Flex>

          {/* OTHER LAUNCHPAD TOKENS */}
          <Flex flexDirection="column" marginY={8}>
            {notParticipatedProjects.length ? (
              <Flex marginBottom="20px">
                <Text
                  as="h1"
                  fontSize="20px"
                  textAlign="start"
                  color={color.blue}
                >
                  OTHER LAUNCHPAD TOKENS
                </Text>
              </Flex>
            ) : (
              <></>
            )}
            <Flex flexDirection={"column"}>
              {notParticipatedProjects.map((project) => (
                <UnparticipatedCard key={project.project_id} {...project} />
              ))}
            </Flex>
          </Flex>
        </Flex>
      </>
    );
  }
}
