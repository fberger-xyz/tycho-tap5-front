'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import * as ecStat from 'echarts-stat'
import { cn } from '@/utils'

/**
 * ------------------------ helper
 */

export function ChartBackground({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-card rounded-lg p-4 ${className}`}>{children}</div>
}

export function LoadingArea() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="text-secondary">Loading...</div>
        </div>
    )
}

export function CustomFallback() {
    return (
        <div className="bg-card flex h-[400px] w-full items-center justify-center rounded-lg">
            <div className="text-secondary">Loading chart...</div>
        </div>
    )
}

/**
 * ------------------------ wrapper
 */

interface InterfaceEchartWrapperProps {
    options: echarts.EChartsOption
    id?: string
    onPointClick?: (params: unknown) => void
    onDataZoomChange?: (start: number, end: number) => void
    className?: string
    forceReplace?: boolean // Add flag to force complete replacement when needed
}

export default function EchartWrapper(props: InterfaceEchartWrapperProps) {
    const chartRef = useRef<HTMLDivElement>(null)
    const myChart = useRef<echarts.ECharts | null>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const isFirstRender = useRef(true)
    const handleChartResize = () => myChart.current?.resize()

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(echarts as any).registerTransform((ecStat as any).transform.regression)

        // Define handleMouseLeave outside the condition so it's accessible in cleanup
        const handleMouseLeave = () => {
            if (myChart.current) {
                myChart.current.dispatchAction({
                    type: 'hideTip',
                })
            }
        }

        // only if ref mounted in dom
        if (chartRef?.current) {
            const isNewChart = !myChart.current
            if (isNewChart) myChart.current = echarts.init(chartRef.current)
            window.addEventListener('resize', handleChartResize, { passive: true })

            // Determine if we should replace or merge options
            const shouldReplace = isNewChart || isFirstRender.current || props.forceReplace

            myChart.current?.setOption(
                // @ts-expect-error: poorly typed
                props.options,
                {
                    /**
                     * notMerge: Controls whether to merge or replace options
                     * - true: Replace everything (for initial load or major changes)
                     * - false: Merge and animate (for data updates)
                     */
                    notMerge: shouldReplace,

                    /**
                     * lazyUpdate: Batch updates for better performance
                     */
                    lazyUpdate: true,

                    /**
                     * silent: false to allow animations and events
                     */
                    silent: false,
                },
            )

            // Mark first render as complete
            if (isFirstRender.current) {
                isFirstRender.current = false
            }

            // attach click event listener
            myChart.current?.on('click', (params: unknown) => {
                if (props.onPointClick) props.onPointClick(params)
            })

            // attach dataZoom event listener
            myChart.current?.on('dataZoom', () => {
                const option = myChart.current?.getOption()
                const zoom = option?.dataZoom?.[0]
                if (!zoom) return

                // Get the percentage values directly
                const startPercent = zoom?.start ?? 0
                const endPercent = zoom?.end ?? 100

                if (props.onDataZoomChange) {
                    props.onDataZoomChange(startPercent, endPercent)
                }
            })

            // Fix tooltip persistence - hide tooltip on mouse leave
            chartRef.current.addEventListener('mouseleave', handleMouseLeave)
        }

        return () => {
            if (myChart?.current) {
                // cleanup events listeners
                window.removeEventListener('resize', handleChartResize)
                myChart.current.off('click')
                myChart.current.off('dataZoom')
            }
            if (chartRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                chartRef.current.removeEventListener('mouseleave', handleMouseLeave)
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.options])

    return (
        <div
            ref={chartRef}
            className={cn('m-0 p-0', props.className)}
            style={{
                width: '100%',
                height: '100%',
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
        />
    )
}
