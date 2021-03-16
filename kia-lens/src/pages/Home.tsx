import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Camera, CameraOptions  } from '@ionic-native/camera';
import './Home.css';
import React from 'react';

const Home: React.FC = () => {
  const cameraOpts : CameraOptions = {
    quality: 100,
    destinationType: Camera.DestinationType.FILE_URI,
    encodingType: Camera.EncodingType.JPEG,
    mediaType: Camera.MediaType.PICTURE
  }
  const openCamera = async () => {
    const data = await Camera.getPicture(cameraOpts);
    console.log(`Camera Results: ${data.text}`);
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Kia Lens</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonButton onClick={openCamera}>Open Camera</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
