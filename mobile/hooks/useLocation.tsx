import { useRef, useState } from "react";
import { searchLocation } from "@/services/locationSearchService";
import type { MapRegion } from "@/components/OpenStreetMap";

export const NEPAL_REGION: MapRegion = {
  latitude: 28.3949,
  longitude: 84.124,
  latitudeDelta: 6.0,
  longitudeDelta: 6.0,
};

export const NEPAL_BOUNDS = {
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
  const [region, setRegion] = useState(NEPAL_REGION);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRegionChangeComplete = (region: MapRegion) => {
    const isOutside =
      region.latitude < NEPAL_BOUNDS.minLat ||
      region.latitude > NEPAL_BOUNDS.maxLat ||
      region.longitude < NEPAL_BOUNDS.minLng ||
      region.longitude > NEPAL_BOUNDS.maxLng;

    if (isOutside) {
      setRegion(NEPAL_REGION);
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
    const lat = Number(item.lat ?? item.latitude ?? item.latString);
    const lng = Number(item.lon ?? item.longitude ?? item.lngString);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn("selectLocation: invalid coordinates", item);
      return;
    }

    setPin({ latitude: lat, longitude: lng });
    setLocationName(item.display_name ?? item.name ?? "");
    setSearch(item.display_name ?? "");
    setResults([]);
    setMapView(true);
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  return {
    search,
    results,
    pin,
    locationName,
    mapView,
    region,
    handleSearch,
    selectLocation,
    onRegionChangeComplete,
  };
}
