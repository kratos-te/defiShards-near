import { Flex, Image, Input, Text, Tooltip } from "@chakra-ui/react";
import { useColor } from "../hooks";
import { directionProp } from "../utils/style";

import InfoIcon from "../assets/img/icons/info.svg";

interface Props {
  infoBtn?: boolean;
  title: string;
  placeholder?: string;
  value: string | number;
  error?: string | number;
  required: boolean;
  setData: Function;
  direction?: directionProp;
  type?: string;
  disabled?: boolean;
}

export default function InputCard({
  infoBtn,
  title,
  placeholder = "",
  value,
  error,
  required,
  setData,
  direction = directionProp.column,
  type = "text",
  disabled = false,
  ...style
}: Props) {
  const color = useColor();
  return (
    <Flex
      justifyContent="start"
      alignItems="center"
      flexDirection={direction}
      marginTop="4"
      {...style}
    >
      <Flex width="100%" paddingLeft="2">
        <Text as="h3" fontSize="14px" textAlign="start">
          {title}
          {required && (
            <Text as="span" color={color.required}>
              {" "}
              *
            </Text>
          )}
        </Text>
        {/* {infoBtn &&
          <Tooltip
            hasArrow
            placement="auto-start"
            padding={3}
            width={"60%"}
            label="This is a one time listing fee payable to DefiShards. Please read disclaimer and terms & conditions"
            aria-label="A tooltip"
            bg={"#10B981"}
            fontSize={"12px"}
            closeOnClick={false}
          >
            <Image src={InfoIcon} width={"4"} marginX={2} />
          </Tooltip>} */}
        {title == "TOKEN ADDRESS" ? (
          <Tooltip
            hasArrow
            placement="auto-start"
            padding={3}
            width={"60%"}
            label="This is the token contract address for your project.
          
          E.g. https://explorer.near.org/accounts/abc.tokenabc.near
          
          abc.tokenabc.near
          is your token contract address"
            aria-label="A tooltip"
            bg={"#10B981"}
            fontSize={"12px"}
            closeOnClick={false}
          >
            <Image src={InfoIcon} width={"4"} marginX={2} />
          </Tooltip>
        ) : (
          <></>
        )}
      </Flex>
      <Input
        width="100%"
        minHeight="10"
        paddingY="2"
        paddingX="5"
        borderRadius="2xl"
        bgColor={color.inputbg}
        marginTop="5px"
        alignItems="center"
        placeholder={placeholder}
        _placeholder={{ color: color.placeholder }}
        _disabled={{ color: color.cardBoxTitle }}
        fontSize="18px"
        color={color.input}
        onChange={(e) => setData(e.target.value)}
        type={type}
        value={value}
        borderColor={error ? "red" : "#ACACAC"}
        disabled={disabled}
      />
    </Flex>
  );
}
