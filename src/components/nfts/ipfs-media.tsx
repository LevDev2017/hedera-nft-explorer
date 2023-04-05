import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { fromIpfsIdToUrl, fromIpfsProtocolToUrl } from "../../api-clients/hedera-mirror-node-api-helper";

const isVideoMetadata = (metadataObj?: { type?: string }) => {
  if (metadataObj?.type && typeof metadataObj.type === 'string') {
    return metadataObj.type.startsWith('video');
  }
  return false;
}

const getUrlFromImageMetadata = (metadataObj?: {
  image?: string | { type: string, description: string },
  type?: string,
  CID?: string,
}): string => {
  if (!metadataObj) {
    return '';
  }

  if (!metadataObj.image && !metadataObj.CID) {
    return '';
  }

  if (typeof metadataObj.image === 'object') {
    return getUrlFromImageMetadata({
      ...metadataObj,
      image: metadataObj.image.description,
    });
  }

  const isVideo = isVideoMetadata(metadataObj);

  let srcUrl = '';
  if (metadataObj.image) {
    if (metadataObj.image.startsWith("ipfs://")) {
      srcUrl = fromIpfsProtocolToUrl(metadataObj.image);
    } else if (metadataObj.image.startsWith("http")) {
      const url = new URL(metadataObj.image);
      let cid = '';
      if (url.pathname.startsWith('/ipfs')) {
        cid = url.pathname.replace('/ipfs/', '');
      } else {
        cid = url.hostname.split('.')[0];
      }
      srcUrl = fromIpfsIdToUrl(cid);
    } else if (metadataObj.image) {
      srcUrl = fromIpfsIdToUrl(metadataObj.image);
    }
  } else if (metadataObj.CID) {
    // This case handles early Hash Boos
    const cid = metadataObj.CID.replace('https://', '').split('.')[0];
    srcUrl = fromIpfsIdToUrl(cid);
  } else if (metadataObj.CID) {
    srcUrl = fromIpfsIdToUrl(metadataObj.CID);
  }

  if (!isVideo) {
    srcUrl += '?class=thumbnail';
  }

  return srcUrl;
}

export const IpfsMedia = (props: {
  metadataObj: any,
  size: number,
  onError: (err: string) => void,
}) => {
  const {
    metadataObj,
    size,
    onError,
  } = props;
  const isVideo = useMemo(() => isVideoMetadata(metadataObj), [metadataObj]);
  const srcUrl = useMemo(() => getUrlFromImageMetadata(metadataObj), [metadataObj]);

  return (
    <>
      {isVideo ? (
        <video
          width={size}
          height={size}
          src={srcUrl}
          autoPlay
          playsInline
          loop
          muted
          className="img-contain"
          onError={() => {
            onError('Video failed to load');
          }}
        ></video>
      ) : (
        srcUrl.includes('.glb') ? (
          <Box
            width={size}
            height={size}
            px={2}
            sx={{
              marginTop: "auto",
              marginBottom: "auto",
              justifyContent: "center",
            }}
            display="flex"
            alignItems="center"
          >
            <Typography
              variant="h5"
            >
              .gbl not supported
            </Typography>
          </Box>
          // <model-viewer
          //   width={size}
          //   height={size}
          //   alt={`NFT Thumbnail`}
          //   src={srcUrl}
          //   className="img-contain"
          //   autoplay
          // ></model-viewer>
        ) : (
          <img
            width={size}
            height={size}
            alt={`NFT Thumbnail`}
            src={srcUrl}
            className="img-contain"
            loading="lazy"
            onError={() => {
              onError('Image failed to load');
            }}
          ></img>
        )
      )}
    </>
  )
}