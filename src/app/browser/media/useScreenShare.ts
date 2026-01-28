import { onUnmounted, ref } from "vue";

export interface ScreenShareState {
  isSharing: boolean;
  stream: MediaStream | null;
  error: Error | null;
}

export function useScreenShare() {
  const isSharing = ref(false);
  const stream = ref<MediaStream | null>(null);
  const error = ref<Error | null>(null);

  const startShare = async (options?: DisplayMediaStreamOptions) => {
    try {
      stream.value = await navigator.mediaDevices.getDisplayMedia(options);
      isSharing.value = true;
      error.value = null;

      const videoTrack = stream.value.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", () => {
          stopShare();
        });
      }
    } catch (err) {
      error.value = err as Error;
      isSharing.value = false;
    }
  };

  const stopShare = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop());
      stream.value = null;
    }
    isSharing.value = false;
  };

  onUnmounted(() => {
    stopShare();
  });

  return {
    isSharing,
    stream,
    error,
    startShare,
    stopShare,
  };
}
