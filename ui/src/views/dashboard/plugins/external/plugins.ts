
// DON'T modify this file, it is automatically generated by observex external plugin system
import { DatasourcePluginComponents, PanelPluginComponents } from "types/plugin"

import candlestickPanel from "./panel/candlestick"
import clickhouseDatasrouce from "./datasource/clickhouse"

export const externalPanelPlugins: Record<string,PanelPluginComponents> = {
	[candlestickPanel.settings.type]: candlestickPanel,
}
export const externalDatasourcePlugins: Record<string,DatasourcePluginComponents> = {
	[clickhouseDatasrouce.settings.type]: clickhouseDatasrouce,
}