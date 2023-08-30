import { Flex, Textarea, Text } from '@chakra-ui/react';
import { useColor } from '../hooks';

interface Props {
  title: string
  placeholder?: string
  value: string | number
  error: string | number
  required: boolean
  setData: Function
}

export default function InputAreaCard({ title, placeholder = '', value, error, required, setData }: Props) {
  const color = useColor();
  return (
    <Flex justifyContent='start' alignItems='center' flexDirection='column' marginTop='4' width='full'>
      <Flex width='100%' paddingLeft='2'>
        <Text as='h3' fontSize='14px' textAlign='start'>
          {title}
          {required && <Text as='span' color={color.required}> *</Text>}
        </Text>
      </Flex>
      <Textarea
        width='100%'
        minHeight='112px'
        paddingY='2'
        paddingX='5'
        borderRadius='2xl'
        bgColor={color.inputbg}
        marginTop='5px'
        alignItems='center'
        placeholder={placeholder}
        _placeholder={{ color: color.placeholder }}
        fontSize='18px'
        color={color.input}
        onChange={e => setData(e.target.value)}
        value={value}
        borderColor={error ? 'red' : '#ACACAC'}
      />
    </Flex>
  )
}