import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../../store";

const env = "mainnet";

export const hc = new HashConnect();
const getPairingData = () => {
  if (hc.hcData.pairingData.length > 0) {
    return hc.hcData.pairingData[hc.hcData.pairingData.length - 1];
  }
}

export const hcInitPromise = new Promise(async (resolve) => {
  const appMetadata: HashConnectTypes.AppMetadata = {
    name: "NFT Explorer",
    description: "A Hedera NFT Explorer by pwoosam",
    icon: window.location.origin + "/logo192.png",
    url: window.location.origin
  };
  const initResult = await hc.init(appMetadata, env, true);
  resolve(initResult);
});

export const getProvider = async () => {
  await hcInitPromise;
  const accId = getPairingData()?.accountIds[0];
  const topic = getPairingData()?.topic;
  if (!accId || !topic) {
    throw new Error("No paired account");
  }

  const provider = hc.getProvider(env, topic, accId);
  return provider;
}

export const getSigner = async () => {
  const provider = await getProvider();
  const signer = hc.getSigner(provider);
  return signer;
}

export const sendTransaction = async (trans: Uint8Array, return_trans: boolean = false, hideNfts: boolean = false) => {
  await hcInitPromise;

  const pairingData = getPairingData();
  if (!pairingData) {
    throw new Error("Pairing data is not set");
  }

  const transaction: MessageTypes.Transaction = {
    topic: pairingData.topic,
    byteArray: trans,

    metadata: {
      accountToSign: pairingData.accountIds[pairingData.accountIds.length - 1],
      returnTransaction: return_trans,
      hideNft: hideNfts
    }
  };

  const result = await hc.sendTransaction(pairingData.topic, transaction);
  return result;
}

export const HashConnectClient = () => {
  const dispatch = useDispatch();
  const syncWithHashConnect = useMemo(() => {
    return () => {
      const accId = getPairingData()?.accountIds[0];
      if (accId) {
        dispatch(actions.hashconnect.setAccountId(accId));
        dispatch(actions.hashconnect.setIsConnected(true));
      } else {
        dispatch(actions.hashconnect.setAccountId(''));
        dispatch(actions.hashconnect.setIsConnected(false));
      }
    };
  }, [dispatch]);

  syncWithHashConnect();
  hcInitPromise.then(() => {
    syncWithHashConnect();
  });
  hc.pairingEvent.on(() => {
    syncWithHashConnect();
  });
  hc.connectionStatusChangeEvent.on(() => {
    syncWithHashConnect();
  });
  return null;
};
