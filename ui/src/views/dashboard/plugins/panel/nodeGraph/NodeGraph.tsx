

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { PanelData, PanelProps } from 'types/dashboard';
import { initTooltip } from './tooltip';
import {  getActiveEdgeLabelCfg } from './default-styles';
import { initLegend } from './legend';
import { setAttrsForData } from './transformData';
import { NodeGraphToolbar } from './Toolbar';
import Help from 'components/help';
import { nodeGraphHelp } from './data/help';
import useContextMenu from './useContextMenu';
import HiddenItems from './HiddenItem';
import { filterData } from './filter/filterData';
import { getDefaultEdgeLabel, getDefaultEdgeStyle, getDefaultNodeLabel, getDefaultNodeStyle } from './default-styles';




let newestColorMode;
const NodeGrapPanel = ({ data, panel, dashboardId }: PanelProps) => {
    const container = React.useRef(null);
    const [graph, setGraph] = useState<Graph>(null);
    const { colorMode } = useColorMode();
    const defaultNodeLabelCfg = getDefaultNodeLabel(colorMode)
    const defaultEdgeLabelCfg = getDefaultEdgeLabel(colorMode)

    const [selected, setSelected] = useState(false)
    const contextMenu = useContextMenu(panel.settings.nodeGraph)

    useEffect(() => {
        if (graph) {
            onColorModeChange(graph, data, colorMode, dashboardId, panel.id)
        }
        newestColorMode = colorMode
    }, [colorMode])

    useEffect(() => {
        if (graph) {
            setAttrsForData(panel.settings.nodeGraph,data[0])
            const newData = filterData(data[0], dashboardId, panel.id)
            if (newData != data[0]) {
                graph.data(newData)
                graph.render()
            } else {
                graph.changeData(newData)
            }
        }
    }, [data,panel.settings])

    const onFilterRulesChange = (rules?) => {
        const newData = filterData(data[0], dashboardId, panel.id, rules)
        if (newData != data[0]) {
            graph.data(newData)
            graph.render()
        } else {
            graph.changeData(newData)
        }
    }

    useEffect(() => {
        if (!graph) {
            const tooltip = initTooltip(panel.settings.nodeGraph)

            setAttrsForData(panel.settings.nodeGraph,data[0])

            const legend = initLegend(JSON.parse(panel.settings.nodeGraph.node.donutColors))

            const gh = new G6.Graph({
                container: container.current,
                width: container.current.scrollWidth,
                height: container.current.scrollHeight,
                // fitView: true,
                fitCenter: true,
                fitView: true,
                fitViewPadding: 16,
                plugins: [legend, tooltip, contextMenu],
                modes: {
                    default: ['drag-node', 'activate-relations', 'drag-canvas', 'click-select', {
                        type: 'lasso-select',
                        onSelect(nodes, edges) {
                            setSelected(true)
                        }
                    }],
                    fisheyeMode: []
                },
                layout: {
                    type: 'force2',
                    // focusNode: 'li',
                    linkDistance: 300,
                    // unitRadius: 200,
                    preventNodeOverlap: true,
                },
                defaultEdge: {
                    type: 'quadratic',
                    style: {
                        endArrow: true,
                        // lineAppendWidth: 2,
                        opacity: 1,
                        lineWidth: 1,
                        stroke: colorMode == "light" ? '#eee' : '#444'
                    },
                    labelCfg: defaultEdgeLabelCfg,
                    stateStyles: {

                    }
                },
                defaultNode: {
                    type: 'circle',
                    style: {
                        lineWidth: 1,
                        fill: 'transparent',
                        stroke: '#61DDAA'
                    },
                    size: 40,
                    labelCfg: defaultNodeLabelCfg,
                    donutColorMap: JSON.parse(panel.settings.nodeGraph.node.donutColors),
                    stateStyles: {
                    }
                },
                nodeStateStyles: getDefaultNodeStyle(colorMode),
                edgeStateStyles: getDefaultEdgeStyle(colorMode),
            });

            const g1 = gh
            g1.on('node:mouseenter', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'active', true);
                //@ts-ignore
                item.getEdges().forEach(edge => {
                    g1.updateItem(edge, {
                        // as we can't fetch the newest colorMode here, we use a global variable instead
                        labelCfg: getActiveEdgeLabelCfg(newestColorMode)
                    })
                })
            });

            g1.on('node:mouseleave', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'active', false);

                if (!item.hasState('selected')) {
                    //@ts-ignore
                    item.getEdges().forEach(edge => {
                        g1.updateItem(edge, {
                            labelCfg: defaultEdgeLabelCfg
                        })
                    })
                }

            });

            g1.on('node:click', (evt) => {
                const { item } = evt;
                console.log(g1, item)
                g1.setItemState(item, 'selected', true);

                setSelected(true)
            })

            g1.on('node:dblclick', (evt) => {
                // clearSelectedNodesState(g1)
                // clearSelectedEdgesState(g1,defaultEdgeLabelCfg)

                const { item } = evt;
                g1.setItemState(item, 'selected', true);
                //@ts-ignore
                item.getEdges().forEach(edge => {
                    g1.updateItem(edge, {
                        labelCfg: getActiveEdgeLabelCfg(newestColorMode)
                    })
                    g1.setItemState(edge, 'selected', true);
                })
            });

            g1.on('canvas:click', (evt) => {
                clearSelectedEdgesState(g1, defaultEdgeLabelCfg)
                // clearSelectedNodesState(g1,defaultEdgeLabelCfg)
                setSelected(false)
            });


            const newData = filterData(data[0], dashboardId, panel.id)
            gh.data(newData);
            gh.render();
            setGraph(gh)
            if (typeof window !== 'undefined') {
                window.onresize = () => {
                    if (!graph || gh.get('destroyed')) return;
                    if (!container || !container.current.scrollWidth || !container.current.scrollHeight) return;
                    gh.changeSize(container.current.scrollWidth, container.current.scrollHeight);
                };
            }
        }
    }, [panel.settings.nodeGraph]);

    const onSelectChange = useCallback(v => setSelected(v), [])


    return <>
        {graph && <NodeGraphToolbar graph={graph} dashboardId={dashboardId} panelId={panel.id} data={data[0]} onFilterRulesChange={onFilterRulesChange} />}
        <Box width="100%" height="100%" ref={container} />
        <Help data={nodeGraphHelp} iconSize="0.8rem" />
        {graph && <Box><HiddenItems dashboardId={dashboardId} panelId={panel.id} selected={selected} graph={graph} onSelectChange={onSelectChange} data={data} /></Box>}
    </>;
}

const clearSelectedNodesState = (graph: Graph, defaultEdgeLabelCfg?) => {
    const selectedNodes = graph.findAllByState('node', 'selected')
    const nodes = graph.getNodes()
    nodes.forEach(node => {
        if (node.hasState('selected')) {
            if (defaultEdgeLabelCfg) {
                setTimeout(() => {
                    //@ts-ignore

                    node.getEdges().forEach(edge => {
                        graph.updateItem(edge, {
                            labelCfg: defaultEdgeLabelCfg
                        })
                    })
                }, 200)
            }


            graph.setItemState(node, 'selected', false)
        }
    })
}

const clearSelectedEdgesState = (graph: Graph, defaultEdgeLabelCfg) => {
    // const selectedEdges = graph.findAllByState('edge', 'selected')
    graph.getEdges().forEach(edge => {
        // graph.clearItemStates(edge)
        // console.log("here333333:",edge, defaultEdgeLabelCfg)
        graph.updateItem(edge, {
            labelCfg: defaultEdgeLabelCfg
        })
    })
}


export default NodeGrapPanel

const onColorModeChange = (graph, data, colorMode, dashboardId, panelId) => {
    const defaultNodeLabelCfg = getDefaultNodeLabel(colorMode)
    const defaultEdgeLabelCfg = getDefaultEdgeLabel(colorMode)

    data[0].nodes.forEach((node: any) => {
        if (!node.labelCfg) {
            node.labelCfg = defaultNodeLabelCfg
        } else {
            node.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
        }

        const defaultNodeStyle = getDefaultNodeStyle(colorMode)
        if (!node.stateStyles) node.stateStyles = {}
        Object.keys(defaultNodeStyle).forEach(key => {
            node.stateStyles[key] = defaultNodeStyle[key]
        })

    })

    data[0].edges.forEach((edge: any) => {
        if (!edge.labelCfg) {
            edge.labelCfg = defaultEdgeLabelCfg
        } else {
            edge.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
        }
        edge.style.stroke = colorMode == "light" ? '#ddd' : '#444'
        const defaultEdgeStyle = getDefaultEdgeStyle(colorMode)
        if (!edge.stateStyles) edge.stateStyles = {}
        Object.keys(defaultEdgeStyle).forEach(key => {
            edge.stateStyles[key] = defaultEdgeStyle[key]
        })
    })
    const newData = filterData(data[0], dashboardId, panelId)
    graph.data(newData)
    graph.render()
}

