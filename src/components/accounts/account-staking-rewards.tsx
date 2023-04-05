import { Box, Button, ButtonProps, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Transaction } from "../../api-clients/hedera-mirror-node-api-client";
import { getStakingRewardTransactions } from "../../api-clients/hedera-mirror-node-api-helper";

const StakingRewardsModal = (props: {
  accountId: string,
  open: boolean,
  onClose: () => any,
}) => {
  const {
    accountId,
  } = props;
  const [stakingRewardTransactions, setStakingRewardTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (accountId) {
      (async () => {
        const stakingRewardTransactions = await getStakingRewardTransactions(accountId, 30);
        setStakingRewardTransactions(stakingRewardTransactions);
      })();
    }

    return () => setStakingRewardTransactions([]);
  }, [accountId])

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
    >
      <Box
        sx={{
          overflow: "scroll",
          maxHeight: "90vh",
          maxWidth: "90vw",
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography
          variant="h6"
          textAlign="center"
        >
          Staking Rewards in the past 30 days
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: "80vw" }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Time</TableCell>
                <TableCell align="right">Amount (ℏ)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stakingRewardTransactions.map(row => {
                const date = new Date(Number.parseFloat(row.valid_start_timestamp!) * 1000);
                return (
                  <TableRow
                    key={row.transaction_id!.toString()}
                  >
                    <TableCell align="right">{date.toLocaleDateString()}</TableCell>
                    <TableCell align="right">{date.toLocaleTimeString()}</TableCell>
                    <TableCell align="right">{row.transfers!.find(o => o.account === "0.0.800")!.amount * -1 / 100_000_000}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  )
}

export const StakingRewardsButton = (props: ButtonProps & {
  accountId: string,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        color="success"
        variant="contained"
        onClick={() => {
          setIsModalOpen(!isModalOpen);
        }}
        sx={props.sx}
      >
        Staking Rewards
      </Button>

      <StakingRewardsModal
        accountId={props.accountId}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </>
  )
}
