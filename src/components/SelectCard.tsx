import { Flex, Select, Text } from "@chakra-ui/react";
import { useColor } from "../hooks";

interface Props {
  title: string;
  placeholder: string;
  value: string | number;
  error: string | number;
  options: string[];
  required: boolean;
  setData: Function;
}

export default function SelectCard({
  title,
  placeholder,
  value,
  error,
  options,
  required,
  setData,
}: Props) {
  const color = useColor();
  return (
    <Flex
      justifyContent="start"
      alignItems="center"
      flexDirection="column"
      marginTop="4"
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
      </Flex>
      <Select
        width="100%"
        minHeight="10"
        borderRadius="2xl"
        bgColor={color.inputbg}
        marginTop="5px"
        alignItems="center"
        placeholder={placeholder}
        _placeholderShown={{ color: color.placeholder }}
        fontSize="18px"
        color={color.input}
        value={value}
        borderColor={error ? "red" : "#ACACAC"}
        onChange={(e) => setData(e.target.value)}
      >
        {options.map((option, idx) => (
          <option key={idx} value={idx + 1}>
            {option}
          </option>
        ))}
      </Select>
    </Flex>
  );
}
