// import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import React, { useRef, useState } from 'react';
import Measure from 'react-measure';
import { useUserMedia } from '../hooks/UserMedia';
import { useCardRatio } from '../hooks/useCardRatio';
import { useOffsets } from '../hooks/useOffsets';
import {
  Video,
  Canvas,
  Wrapper,
  Container,
  Flash,
  Overlay,
  Button
} from "./Styles";
import axios from 'axios';
import { IonLoading, IonToast } from '@ionic/react';


const CAPTURE_OPTIONS = {
  audio: false,
  video: { facingMode: "environment" }
};

const Scan: React.FC = () => {

  const [listData, setListData] = useState<[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  // Capacitor Camera 
  // const cameraOpts: CameraOptions = {
  //   quality: 100,
  //   destinationType: Camera.DestinationType.FILE_URI,
  //   encodingType: Camera.EncodingType.JPEG,
  //   mediaType: Camera.MediaType.PICTURE
  // }
  // const openCamera = async () => {
  //   const data = await Camera.getPicture(cameraOpts);
  //   console.log(`Camera Results: ${data.text}`);
  // };

  // const videoRef = useRef(null);
  // const photoRef = useRef(null);

  // useEffect(() => {
  //   getVideo();
  // }, [videoRef]);

  // const getVideo = async () => {
  //   await navigator.mediaDevices
  //     .getUserMedia({ audio: false, video: { width: 320} })
  //     .then((stream) => {
  //       let video: any = videoRef.current;
  //       video.srcObject = stream;
  //       video.play();
  //     })
  //     .catch(err => {
  //       console.error("error occurred in getting live stream:", err);
  //     });
  // };

  // const paintToCanvas = () => {
  //   let video = videoRef.current;
  //   let photo: any = photoRef.current;
  //   let ctx = photo.getContext("2d");

  //   const width = 320;
  //   const height = 240;
  //   photo.width = width;
  //   photo.height = height;

  //   return setInterval(() => {
  //     ctx.drawImage(video, 0, 0, width, height);
  //   }, 200);
  // };

  // const stopVideo = () => {
  //   let video: any = videoRef.current;
  //   const stream = video.srcObject;
  //   const tracks = stream.getTracks();

  //   for (let i = 0; i < tracks.length; i++) {
  //     let track = tracks[i];
  //     track.stop();
  //   }

  //   video.srcObject = null;
  // }

  // const capturePhoto = () => {
  //   let photo = videoRef.current as any;
  //   const data = photo.toDataURL("image/jpeg");

  //   // Download image
  //   const link = document.createElement("a");
  //   link.href = data;
  //   link.setAttribute("download", "KiaLensPhoto");
  //   link.innerHTML = `<img src='${data}' alt='thumbnail'/>`;
  // };

  // const scanPhoto = () => {}

  const canvasRef: any = useRef();
  const videoRef: any = useRef();
  let imgUrl: string;

  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const [aspectRatio, calculateRatio] = useCardRatio(1.586);
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  function handleResize(contentRect: any) {
    setContainer({
      width: contentRect.bounds.width,
      height: Math.round(contentRect.bounds.width / aspectRatio)
    });
  }

  function handleCanPlay() {
    calculateRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    setIsVideoPlaying(true);
    videoRef.current.play();
  }

  function handleCapture() {
    const context = canvasRef.current.getContext("2d");

    context.drawImage(
      videoRef.current,
      offsets.x,
      offsets.y,
      container.width,
      container.height,
      0,
      0,
      container.width,
      container.height
    );

    canvasRef.current.toBlob((blob: any) => {
      let newImg = document.createElement('img');
      let imgUrl = URL.createObjectURL(blob);
      newImg.onload = () => {
        // no longer need to read the blob so it's revoked
        URL.revokeObjectURL(imgUrl);
      };
      newImg.src = imgUrl;
      document.body.appendChild(newImg);
    }, "image/jpeg", 1);
    setIsCanvasEmpty(false);
    setIsFlashing(true);
  }

  function handleClear() {
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
  }

  // Download image
  function downloadCapturedImage() {
    let photo = canvasRef.current as any;
    const data = photo.toDataURL("image/jpeg");
    const anchorLink = document.createElement("a");
    anchorLink.href = data;
    anchorLink.setAttribute("download", "KiaLensPhoto.jpg");
    anchorLink.click();
  }

  if (!mediaStream) {
    return null;
  }

  if (showLoading) {
    return (
      <React.Fragment>
        <IonLoading
          isOpen={showLoading}
          spinner='bubbles'
          showBackdrop={true}
          message={'Hang tight! Scanning your picture...'}
          cssClass='ion-loader-design' />
      </React.Fragment>
    );
  }

  async function scanPicture() {
    setShowLoading(true);
    canvasRef.current.toBlob(async (blob: any) => {
      let imgUrl = URL.createObjectURL(blob);
      let endpoint = 'https://jsonplaceholder.typicode.com/users/' + imgUrl;
      try {
        const result = await axios({
          method: 'GET',
          url: endpoint,
        });
        console.log(result);
        if (result && result.data && result.data.length > 0) {
          //setListData([result]);
          setShowLoading(false);
        }
      } catch (err) {
        setShowLoading(false);
        setShowToast(true);
      }
    }, "image/jpeg", 1);
   
  }


  // return (
  //   <IonPage>
  //     <IonHeader>
  //       <IonToolbar>
  //         <IonTitle>Kia Lens</IonTitle>
  //       </IonToolbar>
  //     </IonHeader>
  //     <IonContent>
  //       <IonGrid>
  //         <IonRow>
  //           <IonCol>
  //             <video
  //               onCanPlay={() => paintToCanvas()}
  //               ref={videoRef}
  //             />
  //           </IonCol>
  //         </IonRow>
  //         <IonRow>
  //           <IonCol className="ion-text-left">
  //             <IonButton onClick={() => capturePhoto()}>Take a Picture</IonButton>
  //           </IonCol>
  //         </IonRow>
  //         <IonRow>
  //           <IonCol>
  //             <canvas ref={photoRef} />
  //           </IonCol>
  //         </IonRow>
  //         <IonRow>
  //           <IonCol className="ion-text-left">
  //             <IonButton onClick={() => scanPhoto()}>Scan Photo</IonButton>
  //           </IonCol>
  //         </IonRow>
  //       </IonGrid>

  //     </IonContent>
  //   </IonPage>
  // );

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <Wrapper>
          <Container
            ref={measureRef}
            maxHeight={videoRef.current && videoRef.current.videoHeight}
            maxWidth={videoRef.current && videoRef.current.videoWidth}
            style={{
              height: `${container.height}px`
            }}>
            <Video
              ref={videoRef}
              hidden={!isVideoPlaying}
              onCanPlay={handleCanPlay}
              autoPlay
              playsInline
              muted
              style={{
                top: `-${offsets.y}px`,
                left: `-${offsets.x}px`
              }}
            />

            <Overlay hidden={!isVideoPlaying} />

            <Canvas
              ref={canvasRef}
              width={container.width}
              height={container.height}
            />

            <Flash
              flash={isFlashing}
              onAnimationEnd={() => setIsFlashing(false)}
            />
          </Container>

          {isVideoPlaying && (
            <Button onClick={isCanvasEmpty ? handleCapture : handleClear}>
              {isCanvasEmpty ? "Take a picture" : "Clear"}
            </Button>
          )}
          <Button onClick={scanPicture}>
            {"Scan the picture"}
          </Button>
          <Button onClick={downloadCapturedImage}>
            {"Download the picture"}
          </Button>
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message="There is some error fetching data from APIs!"
            duration={3000}
            position="top"
            color='primary'
          />
        </Wrapper>
      )}
    </Measure>
  );
};

export default Scan;
