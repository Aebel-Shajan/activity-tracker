import { clsx, type ClassValue } from "clsx"
import _ from "lodash";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function constructDurationString(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export function constructAppName(rawName: string): string {
  const splitNameList = rawName.split('.').filter(word => word !== "com" && word !== "org").slice(1)
  return splitNameList.join(" ")
}

export function constructPercentageString(timeInSeconds: number, total: number): string {
  const percentage = Math.floor(100 * timeInSeconds / total)
  return `${percentage}%`
}

export function createAppColorMap(fullData: Record<string, string | number>[]) {
  const app_names = _.uniq(_.map(fullData, 'app'))
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
  const appColorMap = _.fromPairs(
    app_names.map((name, i) => [name, COLORS[i % COLORS.length]])
  );
  return appColorMap

}