import { useState, useEffect } from "react";

export function useUserMedia(requestedMedia: any) {
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const stream: any = await navigator.mediaDevices.getUserMedia(requestedMedia);
        setMediaStream(stream);
      } catch (err) {
        console.error(`Issue in getting pictures due to ${err}`);
      }
    }

    if (!mediaStream) {
      enableStream();
    } else {
      return function cleanup() {
        (mediaStream as any).getTracks().forEach((track: any) => {
          track.stop();
        });
      }
    }
  }, [mediaStream, requestedMedia]);

  return mediaStream;
}