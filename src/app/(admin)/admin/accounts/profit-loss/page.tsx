import { Navbar } from "@/components/shared/NavBar";
import { Main } from "@/components/ui/main";
import ProfitLossReport from "../components/ProfitLossReport";

const ProfitLossPage = () => {
  return (
    <>
      <Navbar fixed />
      <Main>
        <ProfitLossReport />
      </Main>
    </>
  );
};

export default ProfitLossPage;
