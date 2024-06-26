import { useRef, useState, useCallback } from "react";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 40.748817,
  lng: -73.985428,
};

const pointA = { lat: 40.748817, lng: -73.985428 };
const pointB = { lat: 40.712776, lng: -74.005974 };

function MapComponent() {
  const [response, setResponse] = useState<any>(null);
  const bikeMarker = useRef<any>(null);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
  });

  const onLoadMap = useCallback(function callback(map: any) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmountMap = useCallback(function callback() {
    setMap(null);
  }, []);

  const directionsCallback = (res: any) => {
    if (res !== null && res.status === "OK") {
      setResponse(res);
    }
  };

  const onLoadBikeMarker = (marker: any) => {
    bikeMarker.current = marker;
  };

  const handlePlayClick = () => {
    if (!response) return;

    const steps = response.routes[0].legs[0].steps;
    let stepIndex = 0;
    const animateBike = () => {
      if (stepIndex >= steps.length) return;

      const nextStep = steps[stepIndex];
      bikeMarker.current.setPosition(nextStep.start_location);

      stepIndex++;
      setTimeout(animateBike, 1000); // Adjust the timeout for different speeds
    };

    animateBike();
  };

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoadMap}
        onUnmount={onUnmountMap}
      >
        {response && <DirectionsRenderer directions={response} />}
        <DirectionsService
          options={{
            destination: pointB,
            origin: pointA,
            travelMode: google.maps.TravelMode.BICYCLING,
          }}
          key={import.meta.env.VITE_GOOGLE_MAP_KEY}
          callback={directionsCallback}
        />
        <MarkerF
          onLoad={onLoadBikeMarker}
          position={pointA}
          icon={{
            url: "src/assets/bike.png",
            scaledSize: new window.google.maps.Size(50, 50),
          }}
        />
      </GoogleMap>
      <button onClick={handlePlayClick}>Play</button>
    </>
  ) : (
    "Loading"
  );
}

export default MapComponent;
