import { Alert, Box, Checkbox, FormControlLabel, Grid, Pagination, Snackbar, Stack, TextField } from "@mui/material";
import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { listAllNftsWithMetadata, NftWithMetadata } from "../api-clients/hedera-mirror-node-api-helper";
import { CollectionHoldersButton } from "../components/collections/collection-holders";
import { NftFilter } from "../components/nfts/nft-filter";
import { NftSquare } from "../components/nfts/nft-square";
import { actions } from "../store";
import { wellKnownAccounts } from "../utils";

export const Collection = () => {
  const [properties, setProperties] = useState<Map<string, string[]>>(new Map());
  const [nfts, setNfts] = useState<NftWithMetadata[]>([]);
  const [paperhandsOnly, setPaperhandsOnly] = useState<boolean>(false);
  const [err, setErr] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState<Map<string, string[]>>(new Map());
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
    listAllNftsWithMetadata(id, Infinity, (_, allNfts) => {
      if (idRef.current === id) {
        setNfts(allNfts);
      }
    }).then((allNfts) => {
      if (allNfts.length === 0) {
        setErr(`Could not find NFTs for token id: ${id}`)
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
    const propMap = new Map<string, string[]>();
    for (const nft of nfts) {
      if (nft?.metadataObj?.attributes) {
        for (const attribute of nft.metadataObj.attributes) {
          if (propMap.has(attribute.trait_type)) {
            const propValues = propMap.get(attribute.trait_type)!;
            if (!propValues.includes(attribute.value)) {
              propValues.push(attribute.value);
            }
          } else {
            propMap.set(attribute.trait_type, [attribute.value]);
          }
        }
      }
    }
    setProperties(propMap);
  }, [nfts]);

  const nftsFiltered = useMemo(() => {
    const anyFiltersSelected = Array.from(selectedAttributes).some(o => o[1].length > 0);

    let nftsFiltered = nfts.filter((o) => {
      let shouldShowNft = true;
      if (anyFiltersSelected) {
        for (const selectedAttribute of Array.from(selectedAttributes)) {
          const attributeTraitType = selectedAttribute[0];
          const attributeTraitValues = selectedAttribute[1];
          if (attributeTraitValues.length === 0) {
            continue;
          }

          const hasAttr = o.metadataObj?.attributes.some((attr: {
            trait_type: string,
            value: string,
          }) => attr.trait_type === attributeTraitType && attributeTraitValues.includes(attr.value));

          if (!hasAttr) {
            shouldShowNft = false;
            break;
          }
        }
      }
      return shouldShowNft;
    });

    if (paperhandsOnly) {
      nftsFiltered = nftsFiltered.filter(o => o.spender === wellKnownAccounts["Zuse Secondary"]);
    }

    return nftsFiltered;
  }, [nfts, selectedAttributes, paperhandsOnly]);

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
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        gap="1rem"
      >
        <CollectionHoldersButton
          nfts={nfts}
          tokenId={id}
        />
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
      <NftFilter properties={properties} onChange={filters => setSelectedAttributes(filters)}></NftFilter>
      <Box>
        <Grid container spacing={1}>
          {nftsFiltered.slice(startIndex, endIndex).map((o) => {
            return (
              <Grid item  xs={12} sm={6} md={4} lg={2} key={`${o.token_id}:${o.serial_number}`}>
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