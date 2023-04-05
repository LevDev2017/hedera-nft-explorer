import { client } from "../api-clients/hedera-mirror-node-api-helper";

export const getNftsByAccountId = async (accountId: string) => {
  const result = await client.listNftByAccountId(accountId, undefined, undefined, undefined, 100, undefined);
  if (result.result.nfts) {
    return result.result.nfts;
  }
  return [];
}