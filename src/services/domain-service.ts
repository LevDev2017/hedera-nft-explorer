import { Resolver, ICache } from '@pwoosam/hashgraph-name-resolution-sdk';

const domainResolver = new Resolver('hedera_main');
domainResolver.init();

export const getAccountIdFromDomain = async (domain: string): Promise<string | undefined> => {
  return await domainResolver.resolveSLD(domain);
}

export const getDomainsForAccount = async (accountIdOrDomain: string): Promise<string[]> => {
  await domainResolver.isCaughtUpPromise;
  return await domainResolver.getAllDomainsForAccount(accountIdOrDomain);
}

export const getDomainSuffixes = async () => {
  const cache = (domainResolver as any).cache as ICache;
  const tlds = await cache.getTlds();
  if (tlds) {
    return tlds.map(o => o.nameHash.domain);
  }

  return [];
}
