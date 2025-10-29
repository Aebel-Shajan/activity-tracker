import { Cell, Pie, PieChart, Tooltip } from "recharts";
import _ from 'lodash';

// types
export interface ChartDataType {
  usage: number;
  app: string;
  [key: string]: unknown;
}

// Define a color palette
const COLORS = [
  "#cc241d", // red
  "#98971a", // green
  "#d79921", // yellow
  "#458588", // blue
  "#b16286", // magenta
  "#689d6a", // cyan
  "#a89984", // white
  "#fb4934", // bright red
  "#b8bb26", // bright green
  "#fabd2f", // bright yellow
  "#83a598", // bright blue
  "#d3869b", // bright magenta
  "#8ec07c", // bright cyan
  "#ebdbb2", // bright white
];

// Util functions
function constructDurationString(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function constructAppName(rawName: string): string {
  const splitNameList = rawName.split('.').filter(word => word !== "com" && word !== "org").slice(1)

  return splitNameList.join(" ")
}

function constructPercentageString(timeInSeconds: number, total: number): string {
  const percentage = Math.floor(100 * timeInSeconds / total)
  return `${percentage}%`
}

// Components
export function UsageChart({ data }: { data: ChartDataType[] }) {
  return (
    <div className="flex justify-center">
      <PieChart width={400} height={350}>
        <Pie
          data={data}
          dataKey="usage"
          nameKey="app"
          outerRadius={100}
          innerRadius={50}

        // label
        >
          {data.map((_, index) => (
            <Cell
              style={{ outline: 'none' }}
              key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 10, padding: "0 10px" }} />
      </PieChart>
    </div>
  );
}

export function TopCategories({ data }: { data: ChartDataType[] }) {
  const total = _.sumBy(data, "usage")

  return (
    <div className='h-70 overflow-scroll w-100 pr-3 flex flex-col gap-3'>
      {data.map((row, index) => {
        return (
          <div key={row.app} className='flex justify-between'>
            <span className='flex'>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: COLORS[index % COLORS.length],
                lineHeight: '20px',
                marginRight: '10px',
              }} />
              <span>
                {constructAppName(row.app)}
              </span>
            </span>
            <span className='display flex gap-8'>
              <span className='text-gray-400'>
                {constructDurationString(row.usage)}
              </span>
              <span>
                {constructPercentageString(row.usage, total)}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
