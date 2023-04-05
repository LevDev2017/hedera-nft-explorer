import { Box, Button, Card, CardContent, Link, Chip, Popover, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getMetadataObj, getNftInfo, getTokenInfo } from "../../api-clients/hedera-mirror-node-api-helper";
import { decodeBase64, wellKnownAccounts } from "../../utils";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import '@google/model-viewer';
import { IpfsMedia } from "./ipfs-media";
import { Nft, TokenInfo } from "../../api-clients/hedera-mirror-node-api-client";

export const NftSquareDummy = (props: {
  onWidthChange: (width: number) => void,
}) => {
  const { onWidthChange } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (ref.current) {
      const measure = () => {
        if (ref.current) {
          setWidth(ref.current.clientWidth);
          onWidthChange(ref.current.clientWidth);
        }
      };

      measure();
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
      };
    }
  }, [onWidthChange]);

  return (
    <Card
      ref={ref}
      sx={{
        position: "relative",
        width: "100%",
        lineHeight: 0,
      }}
    >
      <Box
        width={width}
        height={width}
      >
      </Box>
      <CardContent
        sx={{
          lineHeight: 1,
        }}
      >
        <Typography
          variant="h6"
          noWrap
        >
          XXX
        </Typography>
        <Typography
          variant="subtitle1"
          lineHeight={1}
          pb={1}
        >
          XXX
        </Typography>
        <Typography
          variant="h6"
        >
          Owner
        </Typography>
        <Typography>
          XXX
        </Typography>
        <Typography
          variant="h6"
        >
          Token
        </Typography>
        <Typography>
          XXX
        </Typography>
      </CardContent>
    </Card>
  );
}

export const NftSquare = (props: {
  tokenId: string,
  serialNumber: number,
}) => {
  const serialNumberBadgeElm = useRef(null);
  const [showAttributes, setShowAttributes] = useState(false);

  const metadataBadgeElm = useRef(null);
  const [showMetadata, setShowMetadata] = useState(false);

  const [showMoreDescription, setShowMoreDescription] = useState(false);

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [nftInfo, setNftInfo] = useState<Nft | null>(null);
  const [metadataObj, setMetadataObj] = useState<any | null>(null);
  const [metadataErrObj, setMetadataErrObj] = useState<Error | null>(null);
  const [ipfsMediaErr, setIpfsMediaErr] = useState('');

  useEffect(() => {
    if (props.tokenId) {
      getTokenInfo(props.tokenId).then(info => {
        setTokenInfo(info);
      });
    }
  }, [props.tokenId]);

  useEffect(() => {
    if (props.tokenId && props.serialNumber >= 0) {
      getNftInfo(props.tokenId, props.serialNumber).then(info => {
        setNftInfo(info);
      });
    }
  }, [props.tokenId, props.serialNumber]);

  useEffect(() => {
    if (nftInfo) {
      if (nftInfo.metadata) {
        setMetadataErrObj(null);
        getMetadataObj(nftInfo.metadata).then(o => {
          setMetadataObj(o);
        }).catch(err => {
          setMetadataErrObj(err);
        });
      } else {
        setMetadataErrObj(new Error('No metadata'));
      }
    }
  }, [nftInfo]);

  const metadataLoadingErrMessage: string | undefined = useMemo(() => {
    if (metadataErrObj) {
      if (typeof metadataErrObj.message === 'string') {
        return metadataErrObj.message;
      } else {
        return JSON.stringify(metadataErrObj, null, 2)
      }
    }
  }, [metadataErrObj]);

  const hasAnyKeys = useMemo(() => tokenInfo && (!!tokenInfo.admin_key ||
    !!tokenInfo.freeze_key ||
    !!tokenInfo.supply_key ||
    !!tokenInfo.pause_key ||
    !!tokenInfo.fee_schedule_key ||
    !!tokenInfo.kyc_key ||
    !!tokenInfo.wipe_key),
    [tokenInfo]);

  const shortDescriptionLength = 120;
  const [description, isDescriptionLong] = useMemo(() => {
    let description = '';
    if (metadataObj && metadataObj.description) {
      const metadataDesc = metadataObj.description;
      if (typeof metadataDesc === "string") {
        description = metadataDesc;
      } else if (metadataDesc.description) {
        description = metadataDesc.description;
      } else if (metadataDesc) {
        description = JSON.stringify(metadataDesc, null, 2);
      }
    }
    const isDescriptionLong = description.length > shortDescriptionLength;

    return [description, isDescriptionLong];
  }, [metadataObj]);

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (ref.current) {
      const measure = () => {
        if (ref.current) {
          setWidth(ref.current.clientWidth);
        }
      };

      measure();
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
      };
    }
  }, [ref, tokenInfo, nftInfo, metadataObj]);

  if (!tokenInfo || !nftInfo || !(metadataObj || metadataLoadingErrMessage)) {
    return (
      <NftSquareDummy
        onWidthChange={width => {
          setWidth(width);
        }}
      />
    );
  }

  const cannotLoadImg = tokenInfo.total_supply === "0" || !!ipfsMediaErr;

  return (
    <Card
      ref={ref}
      sx={{
        position: "relative",
        width: "100%",
        lineHeight: 0,
      }}
    >
      {(metadataLoadingErrMessage || cannotLoadImg) ? (
        <Box
          width={width}
          height={width}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <QuestionMarkIcon color="primary" fontSize="large" />
        </Box>
      ) : (
        <IpfsMedia
          size={width}
          metadataObj={metadataObj}
          onError={err => {
            setIpfsMediaErr(err);
          }}
        />
      )}
      <CardContent
        sx={{
          lineHeight: 1,
        }}
      >
        <Typography
          variant="h6"
          title={tokenInfo.name}
          noWrap
        >
          {tokenInfo.name}
        </Typography>
        <Typography
          variant="subtitle1"
          lineHeight={1}
          pb={1}
        >
          {`${props.serialNumber}/${tokenInfo.total_supply}`}
        </Typography>
        {nftInfo.spender === wellKnownAccounts["Zuse Secondary"] && (
          <Link
            href={`https://zuse.market/collection/${tokenInfo.token_id!}`}
            target="_blank"
            referrerPolicy="no-referrer"
            sx={{
              "*": {
                cursor: "pointer",
              }
            }}
          >
            <Chip
              label="Paperhanding on Zuse"
              color="success"
            />
          </Link>
        )}
        <Typography
          variant="h6"
        >
          Owner
        </Typography>
        <Typography>
          <Link
            to={`/account/${nftInfo.account_id}`}
            component={RouterLink}
          >
            {nftInfo.account_id}
          </Link>
        </Typography>
        <Typography
          variant="h6"
        >
          Token
        </Typography>
        <Typography>
          <Link
            to={`/collection/${nftInfo.token_id}`}
            component={RouterLink}
          >
            {nftInfo.token_id}
          </Link>
        </Typography>
        {description && (
          <>
            <Typography
              variant="h6"
            >
              Description
            </Typography>
            <Typography
              variant="body2"
            >
              {showMoreDescription || !isDescriptionLong ? description : description.substring(0, shortDescriptionLength) + '...'}
            </Typography>

            {isDescriptionLong && (
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  setShowMoreDescription(!showMoreDescription);
                }}
              >
                {showMoreDescription ? "Show less" : "Show more"}
              </Button>
            )}
          </>
        )}
        {hasAnyKeys && (
          <>
            <Typography
              variant="h6"
            >
              Keys
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {tokenInfo.supply_key && <Chip title={`${tokenInfo.supply_key.key}`} label="Supply" color="success" />}
              {tokenInfo.wipe_key && <Chip title={`${tokenInfo.wipe_key.key}`} label="Wipe" color="error" />}
              {tokenInfo.admin_key && <Chip title={`${tokenInfo.admin_key.key}`} label="Admin" color="warning" />}
              {tokenInfo.freeze_key && <Chip title={`${tokenInfo.freeze_key.key}`} label="Freeze" color="warning" />}
              {tokenInfo.pause_key && <Chip title={`${tokenInfo.pause_key.key}`} label="Pause" color="warning" />}
              {tokenInfo.fee_schedule_key && <Chip title={`${tokenInfo.fee_schedule_key.key}`} label="Fee Schedule" color="warning" />}
              {tokenInfo.kyc_key && <Chip title={`${tokenInfo.kyc_key.key}`} label="KYC" color="warning" />}
            </Box>
          </>
        )}

        <Typography
          variant="h6"
        >
          Actions
        </Typography>
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {metadataObj && metadataObj.attributes && (
            <>
              <Chip
                label="Show Attributes"
                ref={serialNumberBadgeElm}
                onClick={() => {
                  setShowAttributes(!showAttributes)
                }}
                color="primary"
              />
              <Popover
                anchorEl={serialNumberBadgeElm.current}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                open={showAttributes}
                onClose={() => {
                  setShowAttributes(false);
                }}
              >
                {metadataLoadingErrMessage ? (
                  <Box p={1}>
                    {metadataLoadingErrMessage}
                  </Box>
                ) : (
                  <Box display="grid" gridTemplateColumns="1fr 2fr" gap={1} p={1}>
                    {metadataObj && metadataObj.attributes?.map?.((attr: {
                      trait_type: string,
                      value: string,
                    }) => (
                      <Fragment key={attr.trait_type}>
                        <Box>{attr.trait_type}</Box>
                        <Box>{attr.value}</Box>
                      </Fragment>
                    ))}
                  </Box>
                )}
              </Popover>
            </>
          )}

          <Chip
            label="Show Raw Metadata"
            ref={metadataBadgeElm}
            onClick={() => {
              setShowMetadata(!showMetadata)
            }}
            color="primary"
          />
          <Popover
            anchorEl={metadataBadgeElm.current}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={showMetadata}
            onClose={() => {
              setShowMetadata(false);
            }}
          >
            <Box
              px={1}
              maxWidth="70vw"
            >
              <pre className="pre-wrap">
                {nftInfo?.metadata ? (
                  <>
                    {nftInfo?.metadata}
                    <br />
                    <br />
                    {decodeBase64(nftInfo?.metadata)}
                    <br />
                    <br />
                  </>
                ) : null}
                {metadataLoadingErrMessage ? (
                  metadataLoadingErrMessage
                ) : (
                  JSON.stringify(metadataObj, null, 2)
                )}
              </pre>
            </Box>
          </Popover>
        </Box>
      </CardContent>
    </Card>
  );
}
