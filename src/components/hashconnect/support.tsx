import { CopyAll, GitHub, Send } from "@mui/icons-material";
import { Box, Button, ButtonProps, IconButton, InputAdornment, List, ListItem, ListItemText, Modal, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getSigner, hc } from "./hashconnect-client";
import { AppStore } from "../../store";
import { Hbar, HbarUnit, TransferTransaction } from "@hashgraph/sdk";
import { getAccountIdFromDomain } from "../../services/domain-service";
import CoffeeIcon from '@mui/icons-material/Coffee';
import { SupportProgress } from "./support-progress";

const devDomain = 'dev.hbar';

const SupportModal = (props: {
  open: boolean,
  onClose: () => any,
}) => {
  const [amount, setAmount] = useState(100);

  const isWalletConnected = useSelector((state: AppStore) => state.hashconnect.isConnected);
  const pairedAccId = useSelector((state: AppStore) => state.hashconnect.accountId);

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
    >
      <Box
        sx={{
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
        <SupportProgress showAmount />
        <br />
        <Typography
          variant="h6"
        >
          How to support NFT Explorer:
        </Typography>
        <List disablePadding>
          <ListItem disableGutters disablePadding>
            <ListItemText>
              1. Send HBAR to <code>{devDomain}</code>
            </ListItemText>
          </ListItem>
          <ListItem disableGutters disablePadding>
            <ListItemText>
              2. Send HBAR with HashPack
            </ListItemText>
          </ListItem>
          <ListItem
            disableGutters
            disablePadding
          >
            <Stack
              width="100%"
            >
              {isWalletConnected ? (
                <>
                  <Box>
                    <TextField
                      fullWidth
                      type="number"
                      value={amount}
                      onChange={e => {
                        setAmount(Number.parseFloat(e.target.value));
                      }}
                      sx={{
                        marginBottom: 2,
                        textAlign: 'end',
                      }}
                      inputProps={{
                        sx: {
                          textAlign: 'end',
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <>
                            <InputAdornment position="end">
                              ℏ
                            </InputAdornment>
                            <InputAdornment position="end">
                              <IconButton
                                onClick={async () => {
                                  const devAccId = await getAccountIdFromDomain(devDomain).catch(() => { });
                                  if (devAccId) {
                                    const signer = await getSigner();
                                    const trans = await new TransferTransaction()
                                      .addHbarTransfer(pairedAccId, Hbar.from(-amount, HbarUnit.Hbar))
                                      .addHbarTransfer(devAccId, Hbar.from(amount, HbarUnit.Hbar))
                                      .setTransactionMemo('NFT Explorer support')
                                      .freezeWithSigner(signer);
                                    await trans.executeWithSigner(signer);
                                  }
                                }}
                              >
                                <Send
                                  color="primary"
                                />
                              </IconButton>
                            </InputAdornment>
                          </>
                        ),
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => {
                      hc.disconnect(hc.hcData.topic);
                    }}
                    color="error"
                  >
                    Disconnect ({pairedAccId})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={() => {
                      hc.connectToLocalWallet();
                    }}
                    sx={{
                      marginBottom: 2
                    }}
                  >
                    Connect
                  </Button>
                  <TextField
                    fullWidth
                    label="Pairing String"
                    variant="outlined"
                    value={hc.hcData.pairingString}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Copy Pairing String"
                            onClick={() => {
                              navigator.clipboard.writeText(hc.hcData.pairingString);
                            }}
                            edge="end"
                          >
                            <CopyAll />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
            </Stack>
          </ListItem>
        </List>

        <Typography>
          3. Contribute on GitHub
        </Typography>
        <IconButton
          aria-label="Open GitHub"
          edge="end"
          href="https://github.com/pwoosam/hedera-nft-explorer"
          rel="noreferrer noopener"
          target="_blank"
        >
          <GitHub />
        </IconButton>
      </Box>
    </Modal>
  )
}

export const SupportButton = (props: ButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        color="success"
        variant="contained"
        onClick={() => {
          setIsModalOpen(!isModalOpen);
        }}
        {...props}
      >
        <CoffeeIcon />
      </Button>

      <SupportModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </>
  )
}
