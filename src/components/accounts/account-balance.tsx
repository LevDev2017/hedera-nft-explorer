import { HbarUnit } from "@hashgraph/sdk";
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react"
import { TokenInfo, TokenInfoType } from "../../api-clients/hedera-mirror-node-api-client";
import { getTokenInfo } from "../../api-clients/hedera-mirror-node-api-helper";
import { getAccountBalances } from "../../services/hedera-client";
// import { StakingRewardsButton } from "./account-staking-rewards";

interface TokenBalance {
  tokenInfo: TokenInfo | "HBAR",
  amount: number,
}

export const AccountBalance = (props: {
  accountId: string
}) => {
  const {
    accountId,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [fungibleTokens, setFungibleTokens] = useState<TokenBalance[]>([]);

  useEffect(() => {
    if (accountId) {
      setIsLoading(true);
      getAccountBalances(accountId).then(async balances => {
        const fungibleTokens: TokenBalance[] = [
          {
            tokenInfo: "HBAR",
            amount: Number.parseFloat(balances.hbars.toString(HbarUnit.Hbar)),
          }
        ];

        if (balances.tokens) {
          const tokenIds = Array.from(balances.tokens.keys());
          for (const tokenId of tokenIds) {
            const amount = balances.tokens.get(tokenId)!.toNumber();
            if (amount === 0) {
              continue;
            }

            const info = await getTokenInfo(tokenId.toString());
            if (info.type === TokenInfoType.FUNGIBLE_COMMON) {
              fungibleTokens.push({
                tokenInfo: info,
                amount: amount / Math.pow(10, Number.parseInt(info.decimals!)),
              });
            }
          }
          setFungibleTokens(fungibleTokens);
        }
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [accountId]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
      >
        <Typography
          variant="h2"
        >
          Token Balances
        </Typography>
        {/* <StakingRewardsButton
          accountId={accountId}
          sx={{
            marginLeft: "auto"
          }}
        /> */}
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {fungibleTokens.map(t => (t.tokenInfo === "HBAR" ? (
            <Chip key={`HBAR`} label={`HBAR: ${t.amount.toLocaleString()}`} />
          ) : (
            <Chip key={`${t.tokenInfo.token_id}`} label={`${t.tokenInfo.symbol}: ${t.amount.toLocaleString()}`} />
          )))}
        </Box>
      )}
    </>
  );
}