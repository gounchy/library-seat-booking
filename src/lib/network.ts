import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { create } from 'zustand';

import { setSimulation } from '@/api/client';

type NetworkState = {
  /** Trạng thái mạng thật của thiết bị, theo NetInfo. */
  deviceOnline: boolean;
  /** Công tắc dev để giả lập mất mạng khi test và demo. */
  forcedOffline: boolean;
  setDeviceOnline: (online: boolean) => void;
  setForcedOffline: (forced: boolean) => void;
};

export const useNetworkStore = create<NetworkState>()((set) => ({
  deviceOnline: true,
  forcedOffline: false,
  setDeviceOnline: (deviceOnline) => set({ deviceOnline }),
  setForcedOffline: (forcedOffline) => set({ forcedOffline }),
}));

/** Selector: đang online khi thiết bị có mạng VÀ không bị ép offline. */
export const selectIsOnline = (state: NetworkState): boolean =>
  state.deviceOnline && !state.forcedOffline;

function applyOnlineState(online: boolean): void {
  onlineManager.setOnline(online);
  setSimulation({ offline: !online });
}

/** Gọi một lần khi app khởi động. Trả về hàm dừng theo dõi. */
export function startNetworkMonitoring(): () => void {
  applyOnlineState(selectIsOnline(useNetworkStore.getState()));

  const stopStore = useNetworkStore.subscribe((state) => {
    applyOnlineState(selectIsOnline(state));
  });

  const stopNetInfo = NetInfo.addEventListener((netState) => {
    // isConnected có thể là null (chưa biết): coi là online để không báo offline oan.
    useNetworkStore.getState().setDeviceOnline(netState.isConnected !== false);
  });

  return () => {
    stopNetInfo();
    stopStore();
  };
}