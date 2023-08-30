import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button
  } from '@chakra-ui/react'

interface Props{
    title: string,
}
export default function Confirm({ title } : Props){
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
      <>
        <Button onClick={onOpen}>Open Modal</Button>
  
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>REMOVE {title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                You are about to remove the project () from the directory. Please confirm your selection.
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='blue' mr={3}>
                Continue
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}