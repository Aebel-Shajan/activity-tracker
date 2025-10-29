import './App.css'
import importedData from "@/../../data/all_screen_time_data.json"
import { useEffect, useState } from 'react';
import { TopCategories, UsageChart, type ChartDataType } from './components/usage-pie-chart';
import _ from 'lodash';
import { HeatmapVisual, type HeatmapSettings } from './components/heatmap-visual';
import { DEFAULT_HEATMAP_SETTINGS } from './constants';




function App() {
  const [chartData, setChartData] = useState<ChartDataType[]>([])

  useEffect(() => {
    const grouped = _.groupBy(importedData, 'app');
    let newChartData = _.map(grouped, (items, app) => ({
      app,
      usage: _.sumBy(items, 'usage'),
    }));
    newChartData = _.orderBy(newChartData, ['usage'], ['desc']);
    newChartData = _.filter(newChartData, item => item.usage >= 60);
    setChartData(newChartData)
  }, [])


  const heatmapSettings: HeatmapSettings = {
    ...DEFAULT_HEATMAP_SETTINGS,
    xOffset: 30,
    yOffset: 30,
    monthSpacing: 20,
  }

  return (
    <div className='h-full w-full p-2 flex flex-col items-center justify-center gap-5'>
      <div className='w-fit h-fit px-10 py-15 border-2 rounded-2xl flex items-center justify-center bg-card gap-10'>
        <UsageChart data={chartData} />
        <TopCategories data={chartData} />
      </div>

      <div className='w-fit h-fit p-10 border-2 rounded-2xl flex items-center justify-center bg-card gap-10'>
        <HeatmapVisual data={importedData} heatmapSettings={heatmapSettings} />
      </div>
    </div>
  )
}

export default App
