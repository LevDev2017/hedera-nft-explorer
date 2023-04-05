import { TokenInfoType } from "../api-clients/hedera-mirror-node-api-client";
import { client } from "../api-clients/hedera-mirror-node-api-helper"
import { getDomainSuffixes } from "./domain-service";

export enum IdType {
  ACCOUNT = 'account',
  TOPIC = 'topic',
  NFT = 'nft',
  NFT_SN = 'nft_sn',
  FT = 'ft',
  DOMAIN = 'domain',
  UNKNOWN = 'unknown'
}

export const getIdType = async (id: string): Promise<IdType> => {
  let sn = -1;
  if (id.includes('/')) {
    const idParts = id.split('/');
    console.log(idParts);
    id = idParts[0];
    sn = Number.parseInt(idParts[1]);
  }

  const domainSuffixes = await getDomainSuffixes();
  if (domainSuffixes.some(suffix => id.endsWith(suffix))) {
    return IdType.DOMAIN;
  }

  try {
    const account = await client.getAccountByIdOrAliasOrEvmAddress(id, undefined);
    if (account.result.account) {
      return IdType.ACCOUNT;
    }
  } catch {}

  try {
    const token = await client.getTokenById(id, undefined);
    if (token.result.type === TokenInfoType.FUNGIBLE_COMMON) {
      return IdType.FT;
    } else if (token.result.type === TokenInfoType.NON_FUNGIBLE_UNIQUE) {
      if (sn === -1) {
        return IdType.NFT;
      } else {
        return IdType.NFT_SN;
      }
    }
  } catch {}

  return IdType.UNKNOWN;
}