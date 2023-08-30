import { Box, Flex, Text, Image, VStack, Progress, Button, Divider } from "@chakra-ui/react";
import Arrow from "../assets/img/icons/arrow-down.svg"
import { ListingDetail } from "../types/listing";
import { ShortMonthNames } from "../utils/const";

interface Props {
  listing: ListingDetail,
  tokenName: string
}

export default function CreationCard({ listing, tokenName }: Props) {
  const startTime = new Date(listing.startTime);
  const endTime = new Date(listing.endTime);
  return (
    <Flex
      minHeight="14"
      shadow="lg"
      paddingY="4"
      paddingX="8"
      alignItems="center"
      border='1px solid'
      borderColor='rock.300'
      borderRadius='20px'
      flexDirection='column'
      minWidth='440px'
    >
      <Box width='100%' margin='10px'>
        <Text fontSize='20px' textAlign='start'>{tokenName}</Text>
        <Divider orientation='horizontal' marginTop='10px' marginBottom='10px' />
      </Box>
      <VStack width="100%" spacing='24px'>
        <Flex
          minWidth='100%'
          minHeight="14"
          paddingY="4"
          paddingX="4"
          alignItems='center'
          border='1px solid'
          borderColor='rock.100'
          borderRadius='10px'
          bgColor='rock.50'
          margin='10 0px'
        >
          <Box width='100%' margin='5px'>
            <Text as='h1' fontSize='14px' textAlign='start'>From</Text>
            <Text as='h2' fontSize='18px' textAlign='start' marginTop='10px'>{listing.fromToken.supply}</Text>
          </Box>
          <Flex width='100%' justifyContent='end' flexDirection='column'>
            <Flex margin='5px' justifyContent='end'>
              <Text as='h2' fontSize='18px' textAlign='end' marginTop='10px' width='max-content'>{listing.fromToken.name}</Text>
            </Flex >
            <Flex justifyContent='end' margin='5px'>
              <Image src={listing.fromToken.icon} boxSize="25px" />
              <Text as='h1' fontSize='16px' textAlign='end' marginLeft='15px'>{listing.fromToken.symbol}</Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex>
          <Image src={Arrow} />
        </Flex>
        <Flex
          minWidth='100%'
          minHeight="14"
          paddingY="4"
          paddingX="4"
          alignItems='center'
          border='1px solid'
          borderColor='rock.100'
          borderRadius='10px'
          bgColor='rock.50'
          margin='10 0px'
        >
          <Box width='100%' margin='5px'>
            <Text as='h1' fontSize='14px' textAlign='start'>To</Text>
            <Text as='h2' fontSize='18px' textAlign='start' marginTop='10px'>{listing.toToken.supply}</Text>
          </Box>
          <Flex width='100%' justifyContent='end' flexDirection='column'>
            <Flex margin='5px' justifyContent='end'>
              <Text as='h2' fontSize='18px' textAlign='end' marginTop='10px' width='max-content'>{listing.toToken.name}</Text>
            </Flex >
            <Flex justifyContent='end' margin='5px' >
              <Image src={listing.toToken.icon} boxSize="25px" />
              <Text as='h1' fontSize='16px' textAlign='end' marginLeft='15px'>{listing.toToken.symbol}</Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          minWidth='100%'
          minHeight="14"
          flexDirection='column'
        >
          <Flex minWidth='100%'>
            <Text as='h5' fontSize='10px' textAlign='start' width='50%'>
              {ShortMonthNames[startTime.getMonth()]} {startTime.getDate()}, {startTime.getFullYear()}
            </Text>
            <Text as='h5' fontSize='10px' textAlign='end' width='50%'>
              {ShortMonthNames[endTime.getMonth()]} {endTime.getDate()}, {endTime.getFullYear()}
            </Text>
          </Flex>
          <Progress hasStripe value={listing.progress} minWidth='100%' />
        </Flex>
        <Flex
          minWidth='100%'
          minHeight="14"
          justifyContent='center'
        >
          <Button width='100%'>Details</Button>
        </Flex>
      </VStack>
    </Flex>
  )
}