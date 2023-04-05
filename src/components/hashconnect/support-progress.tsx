import { Box, LinearProgress, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { getThisMonthsIncome } from "../../api-clients/hedera-mirror-node-api-helper";
import { getAccountIdFromDomain } from "../../services/domain-service";

let p = -1;
const goal = 3000;

export const SupportProgress = (props: {
  showAmount?: boolean
}) => {
  const [amount, setAmount] = useState(p);
  const progress = useMemo(() => {
    const percentOfGoal = amount / goal * 100;
    const percentFormatted = Number.parseFloat(percentOfGoal.toFixed(0));
    return percentFormatted;
  }, [amount]);

  const updateAmount = useMemo(() => {
    return async () => {
      const accId = await getAccountIdFromDomain('dev.hbar');
      if (accId) {
        const transactions = await getThisMonthsIncome(accId);
        const incomeAmounts = transactions.flatMap(t => t.transfers?.filter(ts => ts.account === accId && ts.amount > 0).map(o => o.amount));
        let accumulatorInTinybars = 0;
        for (const incomeAmount of incomeAmounts) {
          if (incomeAmount !== undefined) {
            accumulatorInTinybars += incomeAmount;
          }
        }
        
        const hbarsNum = accumulatorInTinybars / 100_000_000;
        setAmount(hbarsNum);
        p = hbarsNum;
      }
    };
  }, []);

  useEffect(() => {
    updateAmount();
  }, [updateAmount]);

  useEffect(() => {
    const handle = setInterval(() => {
      updateAmount();
    }, 120 * 1000);
    return () => clearInterval(handle);
  }, [updateAmount]);

  const color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit' = useMemo(() => {
    if (progress < 40) {
      return 'error';
    } else if (progress < 90) {
      return 'warning';
    } else {
      return 'success';
    }
  }, [progress]);

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Typography
        variant="subtitle2"
        color={color}
        lineHeight={1}
        mx="auto"
      >
        {props.showAmount ? (
          `${amount.toLocaleString()}ℏ / ${goal}ℏ`
        ) : (
          `${progress}% ☕`
        )}
      </Typography>
      <LinearProgress
        variant="determinate"
        color={color}
        value={progress > 100 ? 100 : progress}
      />
    </Box>
  )
};