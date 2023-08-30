import { Flex, Text, Image, Show, Hide, Grid, GridItem, VStack, Spacer, Box } from "@chakra-ui/react";
import { FtTokenDetail } from "../types/listing";
interface Props {
  token: FtTokenDetail
}

export default function TokenCard({ token }: Props) {
  return (
    <>
      <Show above="sm">
        <Grid
          minHeight="14"
          paddingY="4"
          paddingX="4"
          border='1px solid'
          borderColor='rock.100'
          borderRadius='10px'
          bgColor='rock.50'
          marginBottom='15px'
          alignItems='center'
          templateColumns={'repeat(2, 1fr)'}
          justifyContent='space-between'
        >
          <GridItem justifySelf={'left'} justifyContent='start'>
            <Flex alignItems='center' justifyContent='space-between'>
              <Text as='h1' fontSize='14px' textAlign='start'>PER NATIVE TOKEN</Text>
              <Text as='h2' fontSize='18px' textAlign='start' marginLeft='10px'>{token.price}</Text>
            </Flex>
            <Flex alignItems='center' justifyContent='space-between'>
              <Text as='h1' fontSize='14px' textAlign='start'>TOTAL</Text>
              <Text as='h2' fontSize='18px' textAlign='start' marginLeft='10px'>{token.supply}</Text>
            </Flex>
          </GridItem>
          <GridItem justifySelf={'right'} justifyContent='end'>
            <Show above="md">
              <Flex alignItems='center' justifyContent='end'>
                <Text as='h2' fontSize='10px' textAlign='end'>{token.name}</Text>
              </Flex>
              <Flex alignItems='center' width={'80px'} justifyContent={'end'} >
                <Image src={token.icon} boxSize="25px" />
                <Spacer />
                <Text as='h1' fontSize='14px' textAlign='end' >{token.symbol}</Text>

              </Flex>
            </Show>
            <Hide above="md" >
              <Flex alignItems='end' flexDirection={'column'} justifyContent={'center'}>
                <Text as='h2' fontSize='10px' textAlign='end'>{token.name}</Text>
                <Image src={token.icon} boxSize="25px" />
                <Text as='h1' fontSize='14px' textAlign='end' >{token.symbol}</Text>
              </Flex>
            </Hide>
          </GridItem>
        </Grid>
      </Show>
      <Hide above="sm">
        <Flex
          minHeight="14"
          paddingY="4"
          paddingX="4"
          border='1px solid'
          borderColor='rock.100'
          borderRadius='10px'
          bgColor='rock.50'
          margin='10 0px'
          flexDirection={'column'}
        >
          <Flex alignItems='center' justifyContent='space-between'>
            <Text as='h1' fontSize='14px' textAlign='start'>PER NATIVE TOKEN</Text>
            <Text as='h2' fontSize='18px' textAlign='start' marginLeft='10px'>{token.price}</Text>
          </Flex>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text as='h1' fontSize='14px' textAlign='start'>TOTAL</Text>
            <Text as='h2' fontSize='18px' textAlign='start' marginLeft='10px'>{token.supply}</Text>
          </Flex>
          <Flex marginTop={'3px'}   >
            <Flex alignItems='center' justifyContent='start'>
              <Text as='h2' fontSize='10px' textAlign='start'>{token.name}</Text>
            </Flex>
            <Spacer />
            <Flex alignItems='center' width={'60px'} justifyContent={'end'}>
              <Image src={token.icon} boxSize="25px" />
              <Spacer />
              <Text as='h1' fontSize='14px' textAlign='end' >{token.symbol}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Hide>
    </>


  )
}