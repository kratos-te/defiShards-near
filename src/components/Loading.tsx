import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Flex justifyContent={'center'} alignItems={'center'} height={'600px'} >
      <Spinner size='xl' thickness='4px' speed='0.65s' />
    </Flex>
  )
}