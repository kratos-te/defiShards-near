import { Flex, Text } from "@chakra-ui/react";
import { useColor } from "../hooks";

export default function RuleCard() {
  const color = useColor();
  return (
    <Flex flexDirection={"column"}>
      <Text
        as="h1"
        fontSize="16px"
        textAlign="justify"
        fontWeight="bold"
        marginY={2}
        color={color.cardTitle}
      >
        TERMS & CONDITIONS
      </Text>
      <Text
        as="h1"
        fontSize="14px"
        lineHeight={"18px"}
        textAlign="justify"
        fontWeight="bold"
        marginY={2}
        color={color.cardSubtitle}
      >
        By accessing and using this website, you agree to comply with DefiShards's terms and conditions. As part of your usage, if you upload or post any content on the website, you grant DefiShards a non-exclusive, perpetual, irrevocable, worldwide, royalty-free license to use, copy, modify, and display that content in any manner deemed appropriate.

        You acknowledge and agree that you will not engage in any unlawful activities while using our website, including but not limited to hacking, spamming, or posting offensive material. This includes actions that may damage, disable, or impair the website or interfere with the use of the website by other users.

        DefiShards shall not be held liable for any damages or losses arising from your use of the website or any errors or omissions in the content provided on the website. It is important to note that DefiShards reserves the right to terminate your access to the website without prior notice, if you violate these terms and conditions.

        Please be aware that DefiShards retains the right to modify these terms and conditions at any time, without prior notice. Any changes made will be immediately posted on this website.

        By continuing to use the website after any modifications to the terms and conditions, you indicate your acceptance of the revised terms and conditions. It is your responsibility to review these terms periodically to stay informed about any updates or changes.      </Text>
    </Flex>
  );
}
