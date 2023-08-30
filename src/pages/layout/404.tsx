import { Flex, Grid, Heading } from "@chakra-ui/react";

export default function NoPage() {

  return (
    <Grid
      as="main"
      padding={{ base: "4", md: "8" }}
      marginX="auto"
      gap="6"
    >
      <Flex padding="4" maxHeight={'xl'} justifyContent={'center'} alignItems='center'>
        <Heading as="figcaption" >{404} Not Found Page</Heading>
      </Flex>
    </Grid>
  )
}
