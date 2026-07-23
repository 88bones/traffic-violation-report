import { useAppSelector } from "@/redux/hooks";
import { getFlaggedPlates } from "@/services/reportService";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

export default function FlaggedPlates() {
  const { token } = useAppSelector((state) => state.auth);

  const { data: flagged, isLoading } = useQuery({
    queryKey: ["flagged"],
    queryFn: () => getFlaggedPlates(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  console.log(flagged);

  if (isLoading) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-red-500" />
        <h1 className="text-2xl font-bold">Flagged Plates</h1>
      </div>
      <p className="text-muted-foreground">
        Vehicles reported 3 or more times.
      </p>

      <div className="grid gap-4">
        {flagged?.map((item: any) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 bg-red-50 border-red-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-lg tracking-widest">
                  {item._id}
                </span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                  {item.count} reports
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {item.violations.map((v: string) => (
                  <span
                    key={v}
                    className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs capitalize"
                  >
                    {v.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Latest report info */}
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Latest Location: </span>
                {item.latestReport?.location?.name ?? "Unknown"}
              </div>
              <div>
                <span className="font-medium">Latest Report: </span>
                {new Date(item.latestReport?.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {flagged?.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No flagged plates found.
          </p>
        )}
      </div>
    </div>
  );
}
