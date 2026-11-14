import { ChartArtifactPayload, toChartData } from "./types";
import { SafeBar, SafeDoughnut } from "../../../lib/claudeChart";

/** Chart artifact renderer — reuses the app's Claude chart system. */
const ArtifactChart = ({ payload }: { payload: ChartArtifactPayload }) => {
  const valid =
    payload?.labels?.length > 0 &&
    payload.series?.some((s) => s.values?.some((v) => typeof v === "number" && !Number.isNaN(v)));

  if (!valid) {
    return <p className='py-6 text-center text-sm text-muted-foreground'>No chart data available</p>;
  }

  const { data, options } = toChartData(payload);

  return (
    <div className='w-full' style={{ height: 320 }}>
      {payload.kind === "doughnut" ? <SafeDoughnut data={data} options={options} /> : <SafeBar data={data} options={options} />}
    </div>
  );
};

export default ArtifactChart;
