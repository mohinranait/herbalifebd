import { Navbar } from "@/components/shared/NavBar";
import { Main } from "@/components/ui/main";
import ExpenseList from "../components/ExpenseList";

const ExpensesPage = () => {
  return (
    <>
      <Navbar fixed />
      <Main>
        <ExpenseList />
      </Main>
    </>
  );
};

export default ExpensesPage;
