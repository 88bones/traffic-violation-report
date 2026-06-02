import { useRef, useState } from "react";
import { searchLocation } from "@/services/locationSearchService";
import MapView, { Region } from "react-native-maps";

export const NEPAL_REGION: Region = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 6.0,
  longitudeDelta: 6.0,
};

const NEPAL_BOUNDS = {
  minLat: 26.3,
  maxLat: 30.4,
  minLng: 80.0,
  maxLng: 88.2,
};

export function useLocation() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [pin, setPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [mapView, setMapView] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView>(null);

  const onRegionChangeComplete = (region: Region) => {
    const isOutside =
      region.latitude < NEPAL_BOUNDS.minLat ||
      region.latitude > NEPAL_BOUNDS.maxLat ||
      region.longitude < NEPAL_BOUNDS.minLng ||
      region.longitude > NEPAL_BOUNDS.maxLng;

    if (isOutside) {
      mapRef.current?.animateToRegion(NEPAL_REGION, 300);
    }
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchLocation(query);
        setResults(res);
      } catch (err: any) {
        if (err?.response?.status === 429) {
          console.log("Too many requests, slow down");
        }
      }
    }, 500);
  };

  const selectLocation = (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    setPin({ latitude: lat, longitude: lng });
    setLocationName(item.display_name);
    setSearch(item.display_name);
    setResults([]);
    setMapView(true);

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500,
    );
  };

  return {
    search,
    results,
    pin,
    locationName,
    mapView,
    mapRef,
    handleSearch,
    selectLocation,
    onRegionChangeComplete,
  };
}
