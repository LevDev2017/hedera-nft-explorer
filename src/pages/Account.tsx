import { Alert, Box, Checkbox, Chip, CircularProgress, FormControlLabel, Grid, Pagination, Snackbar, Stack, TextField, Typography } from "@mui/material";
import _ from "lodash";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Nft } from "../api-clients/hedera-mirror-node-api-client";
import { listAllNftsForAccount } from "../api-clients/hedera-mirror-node-api-helper";
import { AccountBalance } from "../components/accounts/account-balance";
import { NftSquare } from "../components/nfts/nft-square";
import { getDomainsForAccount } from "../services/domain-service";
import { actions } from "../store";
import { wellKnownAccounts } from "../utils";

interface AccountDomainInfo {
  tld: string,
  domains: string[]
}

export const Account = () => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [accountDomains, setAccountDomains] = useState<AccountDomainInfo[]>([]);
  const [paperhandsOnly, setPaperhandsOnly] = useState<boolean>(false);
  const [loadingDomains, setLoadingDomains] = useState<boolean>(false);
  const [err, setErr] = useState('');
  const dispatch = useDispatch();

  const params = useParams<{ id?: string }>();
  const id = params.id ? params.id : "0.0.994239";
  const idRef = useRef(id);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  useEffect(() => {
    setNfts([]);
    dispatch(actions.page.setIsLoading(true));
    listAllNftsForAccount(id, Infinity).then((allNfts) => {
      if (allNfts.length === 0) {
        setErr(`Could not find NFTs for account id: ${id}`)
        setNfts([]);
      } else {
        setNfts(allNfts);
      }
    }).catch(err => {
      if (idRef.current === id) {
        setErr(typeof err === 'string' ? err : JSON.stringify(err));
      }
    }).finally(() => {
      if (idRef.current === id) {
        dispatch(actions.page.setIsLoading(false));
      }
    });
  }, [id, idRef, dispatch]);

  useEffect(() => {
    setLoadingDomains(true);
    getDomainsForAccount(id).then(domains => {
      const domainsWithTld = domains.sort().map(d => ({
        domain: d,
        tld: d.split('.').reverse()[0]
      }));
      const accountDomainsTemp: AccountDomainInfo[] = [];
      for (const domainWithTld of domainsWithTld) {
        const index = accountDomainsTemp.findIndex(o => o.tld === domainWithTld.tld);
        if (index === -1) {
          accountDomainsTemp.push({
            tld: domainWithTld.tld,
            domains: [domainWithTld.domain]
          });
        } else {
          accountDomainsTemp[index].domains.push(domainWithTld.domain);
        }
      }
      setAccountDomains(accountDomainsTemp.sort((a, b) => a.tld.localeCompare(b.tld)));
    }).finally(() => {
      setLoadingDomains(false);
    });
  }, [id]);

  const nftsFiltered: Nft[] = useMemo(() => {
    let nftsFiltered_ = [...nfts];
    if (paperhandsOnly) {
      nftsFiltered_ = nftsFiltered_.filter(o => o.spender === wellKnownAccounts["Zuse Secondary"]);
    }

    return nftsFiltered_;
  }, [nfts, paperhandsOnly]);

  const itemsPerPage = 12;
  const pages = Math.ceil(nftsFiltered.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageInput, setCurrentPageInput] = useState('1');

  const setCurrentPageDebounced = useMemo(() => {
    return _.debounce(
      (pageNum: number) => setCurrentPage(pageNum),
      250,
      {
        leading: false,
        trailing: true,
      }
    );
  }, [setCurrentPage]);

  useEffect(() => {
    const num = Number.parseInt(currentPageInput);
    if (Number.isNaN(num)) {
      return;
    }

    if (num > pages) {
      setCurrentPageDebounced(pages);
    } else if (num < 1) {
      setCurrentPageDebounced(1);
    } else if (!num) {
      setCurrentPageDebounced(1);
    } else {
      setCurrentPageDebounced(num);
    }
  }, [pages, currentPageInput, setCurrentPageDebounced]);

  const startIndex = itemsPerPage * (currentPage - 1);
  const endIndex = startIndex + itemsPerPage;

  return (
    <Stack spacing={1}>
      <Snackbar
        open={err !== ''}
        onClose={() => setErr('')}
      >
        <Alert
          severity="error"
          onClose={() => setErr('')}
        >
          {err}
        </Alert>
      </Snackbar>
      <AccountBalance accountId={id} />
      <Box>
        <Typography
          variant="h2"
        >
          Domains
        </Typography>
        {loadingDomains && <CircularProgress color="primary" />}
        {(!loadingDomains && accountDomains.length > 0) && (
          accountDomains.map(domainsPerTld => {
            return (
              <Fragment key={domainsPerTld.tld}>
                <Typography
                  variant="h6"
                >
                  .{domainsPerTld.tld}
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {domainsPerTld.domains.map(domain => {
                    return (
                      <Chip
                        key={domain}
                        title={domain}
                        label={domain}
                      />
                    );
                  })}
                </Box>
              </Fragment>
            );
          })
        )}
        {(!loadingDomains && accountDomains.length === 0) && (
          <Box>
            None
          </Box>
        )}
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        gap="1rem"
      >
        <Typography
          variant="h2"
        >
          NFTs
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={paperhandsOnly}
              onChange={e => {
                setPaperhandsOnly(e.target.checked);
              }}
            />
          }
          label="Paperhands Only"
        />
      </Box>
      <Box>
        <Grid container spacing={1}>
          {nftsFiltered.slice(startIndex, endIndex).map((o) => {
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={`${o.token_id}:${o.serial_number}`}>
                <NftSquare
                  tokenId={o.token_id!}
                  serialNumber={o.serial_number!}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
      >
        <Pagination
          count={pages}
          page={currentPage}
          color="primary"
          onChange={(_, page) => {
            setCurrentPage(page);
            setCurrentPageInput(`${page}`);
          }}
        />
        <TextField
          type="number"
          value={currentPageInput}
          onChange={e => {
            setCurrentPageInput(e.target.value);
          }}
          inputProps={{
            sx: {
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
            },
          }}
          sx={{
            width: '5rem',
          }}
        />
      </Box>
    </Stack>
  );
}