import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { useDataContext } from "./use-data-context";
import { localPoint } from "@visx/event";
import { constructAppName, constructDurationString, createAppColorMap } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import _ from "lodash";

interface DayActivityDataType {
  start_time: string;
  end_time: string;
  [x: string]: number | string;
}

export default function DailyActivity(
  {
    data,
  }: {
    data: DayActivityDataType[],
  }
) {

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();
  const dataToDisplay = tooltipData as Record<string, string | number>
  const { setSelectedDate, selectedDate } = useDataContext()
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  })

  const handleMouseOver = (event: React.MouseEvent<SVGElement>, datum: Record<string, number | string>) => {
    const svg = (event.target as SVGElement).ownerSVGElement;
    if (!svg) return;
    const coords = localPoint(svg, event);
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: datum
    });
  };

  function getPercentageOfDay(date: Date) {
    const minutesSinceStartOfDay = date.getHours() * 60 + date.getMinutes();
    return (minutesSinceStartOfDay / 1440)
  }

  const SVG_WIDTH = 1000
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const dailyData = data.filter(row => {
    const start = fmt(new Date(row.start_time));
    const end = fmt(new Date(row.end_time));
    const target = fmt(selectedDate);
    return start === target && end === target;
  });
  const app_color_map = createAppColorMap(data)

  const hourMarkers = Array.from({ length: 24 }).map((_, index) => {
    const hourDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), index, 0, 0);
    const x = (getPercentageOfDay(hourDate)) * SVG_WIDTH;
    const label = index === 0 ? '12 AM' : index === 12 ? '12 PM' : index < 12 ? `${index} AM` : `${index - 12} PM`;

    return (
      <g key={`hour-${index}`}>
        <line x1={x} y1={0} x2={x} y2={32} stroke="white" strokeWidth={0.5} />
        <text x={x + 4} y={40} fontSize={10} fill="white">{label}</text>
      </g>
    );
  });

  const timeRanges = _.orderBy(dailyData, [(row) => {
    const startPos = getPercentageOfDay(new Date(row.start_time))
    const endPos = getPercentageOfDay(new Date(row.end_time))
    return (startPos - endPos)
  }]).map((row, index) => {
    const startPos = getPercentageOfDay(new Date(row.start_time))
    const endPos = getPercentageOfDay(new Date(row.end_time))

    return (
      <rect
        className='hover:fill-white hover:animate-pulse'
        x={startPos * SVG_WIDTH}
        y={0}
        width={(endPos - startPos) * SVG_WIDTH}
        height={30}
        fill={app_color_map[row.app]}
        key={"daily_rect" + index}
        onMouseOver={(e) => handleMouseOver(e, row)}
        onMouseMove={(e) => handleMouseOver(e, row)}
        onMouseOut={hideTooltip}
      />
    )


  })
  function nextDay() {
    setSelectedDate(prev => {
      prev.setHours(0, 0, 0, 0)
      const next = new Date(prev.getTime() + 24 * 60 * 60 * 1000);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  }
  function prevDay() {
    setSelectedDate(prev => {
      prev.setHours(0, 0, 0, 0)
      const next = new Date(prev.getTime() - 24 * 60 * 60 * 1000);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  }

  return (
    <div className='flex items-center justify-center gap-5 flex-wrap w-full'>

      <div className='flex items-center justify-between gap-4'>
        <button
          onClick={prevDay}
          className='h-fit w-fit border-2 rounded-xl p-2 cursor-pointer hover:bg-foreground hover:text-accent'>
          <ArrowLeft />
        </button>
        <div className="border-2 rounded-xl p-2">
          {selectedDate.toLocaleDateString()}
        </div>
        <button
          onClick={nextDay}
          className='h-fit w-fit border-2 rounded-xl p-2 cursor-pointer hover:bg-foreground hover:text-accent'>
          <ArrowRight />
        </button>

      </div>
      <div className="w-fit max-w-full overflow-scroll h-fit">
      <svg width={SVG_WIDTH + 20} height={40} ref={containerRef}>
        {timeRanges}
        {hourMarkers}
      </svg>
      </div>
      {tooltipOpen && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          {tooltipData && <div className='flex flex-col gap-1'>
            <div>
              App: <strong>{constructAppName(dataToDisplay.app as string)}</strong>
            </div>
            <div>
              Duration: <strong>{constructDurationString(dataToDisplay.usage as number)}</strong>
            </div>
            <div>
              Start: <strong>{(dataToDisplay.start_time as string).split("T")[1]}</strong>
            </div>
            <div>
              End: <strong>{(dataToDisplay.end_time as string).split("T")[1]}</strong>
            </div>

          </div>
          }
        </TooltipInPortal>
      )}

    </div>
  )

}