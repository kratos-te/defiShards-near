import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  ComponentWithAs,
  IconProps,
  useColorModeValue,
} from "@chakra-ui/react";
import MainLogo from "../assets/img/pgf2.png";
import logo from "../assets/img/logo.jpg"
import LightBtnSvg from "../assets/img/icons/button_invert_to_normal.png";
import DarkBtnSvg from "../assets/img/icons/button_normal_to_invert.png";

interface ColorHookResult {
  changeMode: ComponentWithAs<"svg", IconProps>;
  changeMode2: string;
  mainLogoMode: string;
  background: string;
  background2: string;
  required: string;
  input: string;
  inputbg: string;
  placeholder: string;
  border: string;
  currencySymbol: string;
  currencyValue: string;
  contact: string;
  cardBorder: string;
  cardBg: string;
  cardTitle: string;
  cardSubtitle: string;
  cardBoxTitle: string;
  fadeText: string;
  black: string;
  main: string;
  panelbg: string;
  progressStatus: string;
  yellow: string;
  green: string;
  blue: string;
  lightBlue: string;
  lightGreen: string;
  menuBg: string;
  menuColor: string;
  menuHoverBg: string;
  menuHoverColor: string;
  navLight: string;
  navDark: string;
  titleColor: string;
  depositBtnBg: string;
  submitBtnBg: string;
  detailsBtnBg: string;
  depositBtnColor: string;
  submitBtnColor: string;
  detailsBtnColor: string;
  liveSaleState: string;
  endedSaleState: string;
  progressBarBorder: string;
  progressBarBg: string;
  liveSalePeriod: string;
  endedSalePeriod: string;
  cliffPeriod: string;
  cliffPeriodArrow: string;
  onwardsRelease: string;
  socialBtn: string;
  spinBg: string;
  facebookBtnBg: string;
  metaIcon: string;
}

export const useColor = (): ColorHookResult => {
  const changeMode = useColorModeValue(MoonIcon, SunIcon);
  const changeMode2 = useColorModeValue(LightBtnSvg, DarkBtnSvg);
  const mainLogoMode = useColorModeValue(logo, logo);
  const background = useColorModeValue("black", "brand.900");
  const background2 = useColorModeValue("radial-gradient(328px at 2.9% 15%, rgb(191, 224, 251) 0%, rgb(232, 233, 251) 25.8%, rgb(252, 239, 250) 50.8%, rgb(234, 251, 251) 77.6%, rgb(240, 251, 244) 100.7%);", "#8F3BE2");
  const required = useColorModeValue("#F43F5E", "tomato");
  const input = useColorModeValue("rock.800", "white");
  const inputbg = useColorModeValue("rock.50", "#00000000");
  const placeholder = useColorModeValue("rock.300", "#b685f7");
  const border = useColorModeValue("rock.100", "white");
  const menuBg = useColorModeValue("white", "#d9d9d9");
  const menuColor = useColorModeValue("green", "rock.500");
  const menuHoverBg = useColorModeValue("LightGreen", "gray.500");
  const menuHoverColor = useColorModeValue("Black", "#a9a9a9");
  const currencySymbol = useColorModeValue("#F43F5E", "white");
  const currencyValue = useColorModeValue("#FDA4AF", "gray.50");
  const contact = useColorModeValue("#10B981", "#90B989");
  const cardBorder = useColorModeValue("#2AE4FF", "#D5B5FF");
  const cardBg = useColorModeValue(
    "white",
    "linear-gradient(#D5B5FF30, #3D1D55)"
  );
  const cardTitle = useColorModeValue("black", "white");
  const cardSubtitle = useColorModeValue("#9CA3AF", "#D5B5FF");
  const cardBoxTitle = useColorModeValue("black", "#ffffff");
  // const cardBorder = useColorModeValue('#2AE4FF', '#D5B5FF')
  const fadeText = useColorModeValue("rock.400", "white");
  const black = useColorModeValue("black", "white");
  const main = useColorModeValue("brand.500", "black");
  const panelbg = useColorModeValue("brand.100", "black");
  const progressStatus = useColorModeValue("rock.500", "gray.500");
  const yellow = useColorModeValue("#cda900", "#3286ff");
  const green = useColorModeValue("#26a17b", "#ffffff");
  const blue = useColorModeValue("#2079FF", "#ffffff");
  const lightBlue = useColorModeValue("#76deff", "#892100");
  const lightGreen = useColorModeValue("#34d399", "#cb2c00");
  const navLight = useColorModeValue("#374151", "#fffde2");
  const navDark = useColorModeValue("#9CA3AF", "#f0e2ff");
  const titleColor = useColorModeValue("#3763DA", "#ffffff");
  const depositBtnBg = useColorModeValue("#eeeeee", "#ffffff");
  const submitBtnBg = useColorModeValue("#eeeeee", "LightGreen");
  const detailsBtnBg = useColorModeValue("#eeeeee", "#ffffff00");
  const depositBtnColor = useColorModeValue("#10B981 ", "#6A3294 ");
  const submitBtnColor = useColorModeValue("#10B981 ", "#6A3294 ");
  const detailsBtnColor = useColorModeValue("#2079FF", "#76DEFF");
  const liveSaleState = useColorModeValue("#26A17B ", "#BDFF45 ");
  const endedSaleState = useColorModeValue("#ACACAC", "#FFFFFF ");
  const progressBarBorder = useColorModeValue("#F0F0F0", "#D5B5FF");
  const progressBarBg = useColorModeValue("#F0F0F0", "#D5B5FF00");
  const liveSalePeriod = useColorModeValue("#000000  ", "#76DEFF ");
  const endedSalePeriod = useColorModeValue("#000000  ", "#FFFFFF ");

  const cliffPeriod = useColorModeValue("#2079FF", "#76DEFF");
  const cliffPeriodArrow = useColorModeValue("#26A17B", "#F9EB50");
  const onwardsRelease = useColorModeValue("#26A17B ", "#AAFFAE");
  const socialBtn = useColorModeValue("#ACACAC  ", "#FFFFFF");
  const spinBg = useColorModeValue("#ffffff99  ", "#000000cc");
  const facebookBtnBg = useColorModeValue("#ACACAC  ", "#FFFFFF");
  const metaIcon = useColorModeValue("white", "#572783");

  return {
    changeMode,
    changeMode2,
    mainLogoMode,
    background,
    background2,
    required,
    input,
    inputbg,
    placeholder,
    border,
    currencySymbol,
    currencyValue,
    contact,
    cardBorder,
    cardBg,
    cardTitle,
    cardSubtitle,
    cardBoxTitle,
    fadeText,
    black,
    main,
    panelbg,
    progressStatus,
    yellow,
    green,
    blue,
    lightBlue,
    lightGreen,
    navLight,
    navDark,
    titleColor,
    depositBtnBg,
    submitBtnBg,
    detailsBtnBg,
    depositBtnColor,
    submitBtnColor,
    detailsBtnColor,
    liveSaleState,
    endedSaleState,
    progressBarBorder,
    progressBarBg,
    liveSalePeriod,
    endedSalePeriod,
    cliffPeriod,
    cliffPeriodArrow,
    onwardsRelease,
    socialBtn,
    spinBg,
    facebookBtnBg,
    metaIcon,
    menuBg,
    menuColor,
    menuHoverBg,
    menuHoverColor,
  };
};
