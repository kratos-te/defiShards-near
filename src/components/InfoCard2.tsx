import { Flex, Box, Text, Image } from "@chakra-ui/react";
import { useColor } from "../hooks";

interface Props {
    title: string;
    value: string;
    tokenTitle: string;
    tokenLogo: string;
    tokenTicker: string;
}

export default function InfoCard2(props: Props) {
    const color = useColor();
    return (
        <Flex
            width={"100%"}
            minHeight="14"
            paddingY="2"
            paddingX="8"
            alignItems="center"
            border="1px solid"
            borderColor={color.cardSubtitle}
            borderRadius="10px"
            bgColor={color.cardBg}
        >
            <Flex width="60%" flexDirection="column">
                <Text as="h1" fontSize="14px" textAlign="start" color={color.cardTitle}>
                    {props.title}
                </Text>
                <Text
                    as="h2"
                    fontSize="18px"
                    textAlign="start"
                    marginTop="10px"
                    color={color.cardSubtitle}
                >
                    {props.value}
                </Text>
            </Flex>
            <Flex width="40%" justifyContent="end" flexDirection="column">
                <Flex margin="5px" justifyContent="end">
                    <Text
                        fontSize="0.7vw"
                        textAlign="end"
                        marginTop="10px"
                        width="max-content"
                        color={color.cardSubtitle}
                    >
                        {props.tokenTitle}
                    </Text>
                </Flex>
                <Flex justifyContent="end" margin="5px">
                    <Image src={props.tokenLogo} boxSize="25px" />
                    <Text
                        as="h1"
                        fontSize="16px"
                        textAlign="end"
                        marginLeft="15px"
                        color={color.cardTitle}
                    >
                        {props.tokenTicker}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
}
