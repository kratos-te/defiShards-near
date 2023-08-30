import { Flex, Text, Input, useColorModeValue, Select } from '@chakra-ui/react';
import TitleCard from '../components/TitleCard';

export default function Swap() {
  const InputColorChanger = useColorModeValue('rock.900', 'black');

  return (
    < >
      <TitleCard title='Beta Swap' />
      <Flex justifyContent='center' >
        <Flex
          marginY='4'
          padding='8'
          shadow='lg'
          border='1px solid'
          borderRadius='2xl'
          borderColor='rock.300'
          flexDirection='column'
        >
          <Flex marginBottom='20px'>
            <Text as='h1' fontSize='20px' textAlign='start'>CREATE</Text>
          </Flex>
          <Flex alignItems='center' flexDirection='column'>
            <Flex width='100%'>
              <Text as='h3' fontSize='14px' textAlign='start'>Listing Token Title</Text>
            </Flex>
            <Input
              width='100%'
              minHeight='10'
              paddingY='2'
              paddingX='5'
              borderRadius='2xl'
              bgColor='rock.50'
              marginTop='5px'
              alignItems='center'
              placeholder='$ NEW Token Name'
              _placeholder={{ color: 'rock.300' }}
              fontSize='18px'
              color={InputColorChanger}
            />
          </Flex>
          <Flex alignItems='center' flexDirection='column' marginTop='10px'>
            <Flex width='100%'>
              <Text as='h3' fontSize='14px' textAlign='start'>Input Token(a token you want to receive)</Text>
            </Flex>
            <Select
              width='100%'
              minHeight='10'
              borderRadius='2xl'
              bgColor='rock.50'
              marginTop='5px'
              alignItems='center'
              placeholder='Select an existing token or enter a new token account ID'
              _placeholder={{ color: 'red' }}
              fontSize='18px'
              color={InputColorChanger}
            >
              <option value='1'>Token 1</option>
              <option value='2'>Token 2</option>
              <option value='3'>Token 3</option>
            </Select>
          </Flex>
          <Flex alignItems='center' flexDirection='column' marginTop='10px'>
            <Flex width='100%'>
              <Text as='h3' fontSize='14px' textAlign='start'>Output Token(a token you want to offer)</Text>
            </Flex>
            <Select
              width='100%'
              minHeight='10'
              borderRadius='2xl'
              bgColor='rock.50'
              marginTop='5px'
              alignItems='center'
              placeholder='Select an existing token or enter a new token account ID'
              _placeholder={{ color: 'red' }}
              fontSize='18px'
              color={InputColorChanger}
            >
              <option value='1'>Token 1</option>
              <option value='2'>Token 2</option>
              <option value='3'>Token 3</option>
            </Select>
          </Flex>
          <Flex justifyContent='space-between'>
            <Flex alignItems='center' flexDirection='column' marginTop='10px' width='45%'>
              <Flex width='100%'>
                <Text as='h3' fontSize='14px' textAlign='start'>Start Time</Text>
              </Flex>
              <Input
                width='100%'
                minHeight='10'
                paddingY='2'
                paddingX='5'
                borderRadius='2xl'
                bgColor='rock.50'
                marginTop='5px'
                alignItems='center'
                placeholder='Select an existing token or enter a new token account ID'
                _placeholder={{ color: 'rock.300' }}
                fontSize='18px'
                color={InputColorChanger}
                type='date'
              />
            </Flex>
            <Flex justifyContent='start' alignItems='center' flexDirection='column' marginTop='10px' width='45%'>
              <Flex width='100%'>
                <Text as='h3' fontSize='14px' textAlign='start'>End Time</Text>
              </Flex>
              <Input
                width='100%'
                minHeight='10'
                paddingY='2'
                paddingX='5'
                borderRadius='2xl'
                bgColor='rock.50'
                marginTop='5px'
                alignItems='center'
                placeholder='Select an existing token or enter a new token account ID'
                _placeholder={{ color: 'rock.300' }}
                fontSize='18px'
                color={InputColorChanger}
                type='date'
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}