import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/hooks";
import { getReports } from "@/services/reportService";
import { useMemo } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const violationColor = (violation: string) => {
  switch (violation) {
    case "drunk_driving":
      return "#b91c1c";
    case "reckless_driving":
      return "#ea580c";
    case "running_red_light":
      return "#ca8a04";
    default:
      return "#2563eb";
  }
};

const Hotspot = () => {
  const { token } = useAppSelector((state) => state.auth);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => getReports(token!),
    enabled: !!token,
    staleTime: 1000 * 6 * 5,
  });

  // const validReports = useMemo(() => {
  //   return (reports ?? []).filter(
  //     (r) => r.location?.latitude && r.location?.longitude,
  //   );
  // }, [reports]);
  const validReports = (reports ?? []).filter(
    (r) => r.location?.latitude && r.location?.longitude,
  );

  if (isLoading) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Violation Hotspots</h1>
      <p className="text-muted-foreground">
        Map showing all reported violations across Nepal.
      </p>

      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Drunk Driving", color: "#b91c1c" },
          { label: "Reckless Driving", color: "#ea580c" },
          { label: "Running Red Light", color: "#ca8a04" },
          { label: "Speeding", color: "#2563eb" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full h-150 rounded-xl overflow-hidden border">
        <MapContainer
          center={[28.3949, 84.124]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {validReports.map((report) => (
            <div key={report._id}>
              <Circle
                center={[report.location.latitude, report.location.longitude]}
                radius={500}
                pathOptions={{
                  color: violationColor(report.violation),
                  fillColor: violationColor(report.violation),
                  fillOpacity: 0.4,
                }}
              />
              <Marker
                position={[report.location.latitude, report.location.longitude]}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-bold uppercase">{report.number_plate}</p>
                    <p className="capitalize text-sm">
                      {report.violation.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.location?.name}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          report.status === "approved"
                            ? "#e6f4ea"
                            : report.status === "rejected"
                              ? "#fce8e8"
                              : "#fef3c7",
                        color:
                          report.status === "approved"
                            ? "#2d6a4f"
                            : report.status === "rejected"
                              ? "#b91c1c"
                              : "#92400e",
                      }}
                    >
                      {report.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {validReports.length} reports
      </p>
    </div>
  );
};

export default Hotspot;
