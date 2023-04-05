import { AccountBalanceQuery, AccountId, Client as HederaClient } from "@hashgraph/sdk";

export let hederaClient = HederaClient.forMainnet();

export const getAccountBalances = async (accountId: string | AccountId) => {
  const balances = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(hederaClient);
  return balances;
};
