import { Flex, Input, Text } from "@chakra-ui/react";
import { useColor } from "../hooks";
import { directionProp } from "../utils/style";

interface Props {
  title: string;
  value: string;
  editable?: boolean;
  direction?: directionProp;
}

export default function LabelCard({
  title,
  value,
  editable,
  direction = directionProp.column,
}: Props) {
  const color = useColor();
  return (
    <Flex
      justifyContent="start"
      alignItems="center"
      flexDirection={direction}
      marginTop="4"
    >
      <Flex width="100%" paddingLeft="2">
        <Text as="h3" fontSize="14px" textAlign="start">
          {title}
        </Text>
      </Flex>
      <Text
        width="100%"
        minHeight="10"
        paddingY="2"
        paddingX="5"
        borderRadius="2xl"
        border="1px solid "
        borderColor={color.border}
        bgColor={color.cardBg}
        marginTop="5px"
        textAlign="start"
        fontSize="18px"
        color={color.cardBoxTitle}
      >
        {value}
      </Text>
    </Flex>
  );
}
