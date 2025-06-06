import dynamic from 'next/dynamic'

const EchartWrapper = dynamic(() => import('./EchartWrapper'), { ssr: false })
export default EchartWrapper 