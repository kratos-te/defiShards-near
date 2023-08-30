import { Theme as ThemeBase, extendTheme, theme as themeBase, ColorHues } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  fonts: {
    heading: '"DM Sans", cursive',
    body: '"Nunito Sans", sans-serif'
  },
  config: {
    initialColorMode: "dark"
  },
  colors: {
    brand: {
      50: "#F9FAFB",
      100: "#E5E7EB",
      200: "#f8c676",
      300: "#f7bd5f",
      400: "#f3a01b",
      500: "#ad25cb",
      600: "#c28016",
      700: "#aa7013",
      800: "#926010",
      900: "#391b56"
    },
    rock: {
      50: "#F9FAFB",
      100: "#E5E7EB",
      200: "#9CA3AF",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#993FF4",
      600: "#c28016",
      700: "#aa7013",
      800: "#4B5563",
      900: "#374151"
    }
  },
  styles: {
    global: (props: any) => ({
      body: {
        background: mode(
          "linear-gradient(89.9deg, rgba(178, 253, 238, 0.96) -8.1%, rgb(207, 244, 254) 26.3%, rgba(207, 244, 254, 0.48) 47.5%, rgba(254, 219, 243, 0.63) 61.5%, rgb(254, 219, 243) 78.7%, rgb(254, 207, 210) 109.2%)",
          "brand.900"
        )(props),
        backgroundColor: mode("white", "brand.900")(props),
        color: mode("brand.500", "black")(props)
      },
      heading: {
        color: mode("brand.500", "white")(props)
      },
      h1: {
        color: mode("rock.900", "gray.500")(props)
      },
      h2: {
        color: mode("rock.300", "black")(props)
      },
      h3: {
        color: mode("rock.800", "white")(props)
      },
      h5: {
        color: mode("rock.900", "white")(props)
      },
      menu1: {
        color: mode("rock.300", "white")(props)
      }
    })
  }
}) as ThemeBase & {
  colors: typeof themeBase.colors & {
    brand: ColorHues;
    rock: ColorHues;
  };
};

export default theme;
