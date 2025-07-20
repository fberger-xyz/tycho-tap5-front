export enum AppUrls {
    // app pages
    ABOUT = '/about',
    MARKET_MAKER = '/',

    // hidden pages
    LOGS = '/logs',

    // external links
    DOCUMENTATION = 'DOCUMENTATION-to-be-added',
    SPECS = 'https://github.com/propeller-heads/tycho-x/blob/main/TAP-5.md',

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
}

export enum AppThemes {
    LIGHT = 'light',
    DARK = 'dark',
}

export enum AppSupportedChainIds {
    ETHEREUM = 1,
    UNICHAIN = 8453,
}

export enum AppInstanceStatus {
    RUNNING = 'running',
    STOPPED = 'stopped',
    PAUSED = 'paused',
    ERROR = 'error',
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
    INSTANCES = 'instances',
    TRADES = 'trades',
    CANDLES = 'candles',
}
