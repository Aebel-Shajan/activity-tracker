import { PieChart, Pie, Tooltip, Cell } from 'recharts'
import './App.css'
import data from "@/../../data/all_screen_time_data.json"
import _ from 'lodash';

const grouped = _.groupBy(data, 'app');
let chartData = _.map(grouped, (items, app) => ({
  app,
  usage: _.sumBy(items, 'usage'),
}));
chartData = _.orderBy(chartData, ['usage'], ['desc']);
chartData = _.filter(chartData, item => item.usage >= 60);
const total = _.sumBy(chartData, "usage")
console.log(total)

// console.log(chartData)

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


function UsageChart() {
  return (
    <div className="flex justify-center">
      <PieChart width={400} height={350}>
        <Pie
          data={chartData}
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

function TopCategories() {

  return (
    <div className='h-70 overflow-scroll w-100 pr-3 flex flex-col gap-3'>
      {chartData.map((row, index) => {
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

function App() {
  return (
    <div className='h-full w-full p-2 flex flex-col items-center justify-center'>
      <div className='w-fit h-fit px-10 py-15 border-2 rounded-2xl flex items-center justify-center bg-card gap-10'>
        <UsageChart />
        <TopCategories />
      </div>
    </div>
  )
}

export default App
