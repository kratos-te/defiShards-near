import { Routes, Route, HashRouter } from "react-router-dom";
import { Flex, useColorMode } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useNearContext } from "./hooks";
import Header from "./pages/layout/header";
import Footer from "./pages/layout/footer";
import Listings from "./pages/listings";
import Listing from "./pages/listing";
import Account from "./pages/account";
import Create from "./pages/create";
import Swap from "./pages/swap";
import Project from "./pages/project";
import Setting from "./pages/setting";
import Detail from "./pages/detail";
import NoPage from "./pages/layout/404";
import Payment from "./pages/payment";
import Dashboard from "./pages/adminProject";
import "./App.css";
// import "./AnimatedBg.css";
import "./CustomStyle.css";
import LightBg from "./components/LightBg";
import DarkBg from "./components/DarkBg";
import Marketplace from "./pages/marketplace";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 10 * 60 * 1000, // 10 mins
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { role } = useNearContext();
  const { colorMode } = useColorMode();

  return (
    <div className="App">
      <HashRouter>
        <QueryClientProvider client={queryClient}>
          <Header/>
          {colorMode == "light" ? <LightBg /> : <DarkBg />}
          <Flex
            as="main"
            padding={{ base: "4", md: "8" }}
            maxWidth="7xl"
            marginX="auto"
            flexDirection="column"
            // justifyContent='center'
            // height="calc(100vh - 80px)"
          >
            <Routes>
              <Route path="/" element={<Listings />} />
              <Route path="/markerplace" element={<Marketplace />} />
              <Route path="/create" element={<Create />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/account" element={<Account />} />
              <Route path="/project" element={<Project />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/listing/:projectId" element={<Listing />} />
              <Route path="/setting/:projectId" element={<Setting />} />
              <Route path="/detail/:projectId" element={<Detail />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </Flex>
        </QueryClientProvider>
        <Footer />
      </HashRouter>
    </div>
  );
}

export default App;
