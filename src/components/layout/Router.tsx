import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Account } from "../../pages/Account";
import { Collection } from "../../pages/Collection";
import { Home } from "../../pages/Home";
// import { Accounts } from "../../pages/Accounts";
// import { Tokens } from "../../pages/Tokens";
// import { Transactions } from "../../pages/Transactions";
import { Layout } from "./Layout";
import { Navbar } from "./Navbar";

export const Router = () => {
  return (
    <BrowserRouter>
      <Navbar />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path=":id" element={<Collection />} />
              <Route path="collection/:id" element={<Collection />} />
              <Route path="account/:id" element={<Account />} />
              {/* <Route path="tokens" element={<Tokens />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="accounts" element={<Accounts />} /> */}
            </Route>
          </Routes>
    </BrowserRouter>
  );
}