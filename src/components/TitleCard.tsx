import { Flex, Heading } from "@chakra-ui/react";
import { useColor } from "../hooks"

interface Props {
  title?: string
}

export default function TitleCard({ title }: Props) {
  const color = useColor()
  return (
    <Flex paddingY="8" justifyContent='center'>
      <Heading fontSize="5xl" as='h1' bgClip='text' color={color.titleColor} textShadow='0px 2px 8px #3A3A3A4a' fontFamily='DM Sans'>{title}</Heading>
    </Flex>
  )
}