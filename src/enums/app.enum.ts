export enum AppUrls {
    // app pages
    ABOUT = '/about',
    STRATEGIES = '/',

    // api
    API_CONFIGURATIONS = '/api/configurations',
    API_STRATEGIES = '/api/strategies',
    API_TRADES = '/api/trades',
    API_PRICES = '/api/prices',
    API_DEBANK = '/api/debank',

    // hidden pages
    LOGS = '/logs',

    // external links
    DOCUMENTATION = 'DOCUMENTATION-to-be-added',
    SPECS = 'https://github.com/propeller-heads/tycho-x/blob/main/TAP-5.md',
    BUILDERNET = 'https://buildernet.org/docs/',

    // PropellerHeads
    PROPELLERHEADS_WEBSITE = 'https://www.propellerheads.xyz/',
    PROPELLERHEADS_X = 'https://x.com/PropellerSwap',
    PROPELLERHEADS_TELEGRAM = 'https://t.me/+B4CNQwv7dgIyYTJl',
    PROPELLERHEADS_EXPLORER = 'PROPELLERHEADS_EXPLORERto-be-added',
    TYCHO_STATUS = 'https://grafana.propellerheads.xyz/public-dashboards/518dd877a470434383caf9fc5845652e?orgId=1&refresh=5s',
    ORDERBOOK = 'https://www.orderbook.wtf/',

    // team links
    FBERGER_WEBSITE = 'https://www.fberger.xyz/',
    FBERGER_TELEGRAM = 'https://t.me/fberger_xyz',
    MERSO_TELEGRAM = 'https://t.me/xMerso',
    MERSO_WEBSITE = 'https://www.merso.xyz/',
    QUANT_TELEGRAM = 'https://t.me/hugoschrng',

    // binance api https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-api-information
    BINANCE_API_DEV = 'https://api.binance.com',
    BINANCE_API_PROD = 'https://data-api.binance.vision',
    BINANCE_API_STATUS = 'https://www.binance.us/status',
}

export enum AppThemes {
    LIGHT = 'light',
    DARK = 'dark',
}

export enum AppSupportedChainIds {
    ETHEREUM = 1,
    UNICHAIN = 130,
    BASE = 8453,
}

export enum AppInstanceStatus {
    RUNNING = 'running',
    STOPPED = 'stopped',
    PAUSED = 'paused',
    ERROR = 'error',
}

export enum AppSupportedProtocols {
    BALANCER = 'balancer',
    CURVE = 'curve',
    PANCAKESWAP = 'pancakeswap',
    SUSHISWAP = 'sushiswap',
    UNISWAP = 'uniswap',
}

export enum SupportedFilters {
    CONFIGURATION_CREATED = 'Config Created',
    // INSTANCE_CREATED = 'Instance Created',
    INSTANCE_STARTED = 'Started At',
    RUNNING_TIME = 'Running Time',
    INSTANCE_ENDED = 'Ended At',
    TRADE_COUNT = 'Trade Count',
    PRICES_COUNT_CALLED = 'Prices Called',
}

export enum SupportedStrategyChainsFilters {
    CHAIN_NAME = 'Chain Name',
    TRADE_COUNT = 'Trade Count',
    AUM = 'AUM',
    INSTANCES = 'Instances',
}

export enum SupportedFilterDirections {
    ASCENDING = 'Ascending',
    DESCENDING = 'Descending',
}

export enum InstanceDisplayMode {
    LIST = 'list',
    GROUPED = 'grouped',
}

export enum TradeStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum ReactQueryKeys {
    STRATEGIES = 'strategies',
    CONFIGURATIONS = 'configurations',
    INSTANCES = 'instances',
    TRADES = 'trades',
    CANDLES = 'candles',
    PRICES = 'prices',
    DEBANK = 'debank',
}

export enum ChartType {
    CANDLES = 'Candles',
    PNL = 'P&L',
    SPREAD = 'Spread',
    AUM = 'AUM',
    // INVENTORY = 'Inventory',
}

export enum ChartIntervalInSeconds {
    FIVE_MINUTES = 300,
    FIFTEEN_MINUTES = 900,
    ONE_HOUR = 3600,
    FOUR_HOURS = 14400,
    ONE_DAY = 86400,
}

export enum StrategyTabs {
    TRADES = 'Trades',
    INSTANCES = 'Instances',
    INVENTORY = 'Inventory',
}

export enum ListToShow {
    STRATEGIES = 'Strategies',
    TRADES = 'Trades History',
}

export enum Authors {
    PROPELLER_HEADS = 'PropellerHeads',
    FBERGER = 'fberger.xyz',
    MERSO = 'merso.xyz',
    HUGOSCHRNG = 'hugoschrng',
}
