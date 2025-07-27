import type { ToolDefinition } from '../../types/tools.types';


export const GenerateMQL5Code:ToolDefinition = {
    name: "GenerateMQL5Code",
    description: "Generates MQL5 code for a trading strategy based on user specifications. Requires a bot name and strategy description to proceed.",
    arguments: [
        {
            name: 'botName',
            type: 'string',
            description: "The unique name for the trading bot.",
            question: "What unique name would you like to give your trading bot?"
        },
        {
            name: 'strategyDescription',
            type: 'string',
            description: "A comprehensive overview of the trading strategy, covering its core logic, indicators, and intended behavior.",
            question: "Could you please provide a comprehensive description of your trading strategy, including its core logic, any indicators you plan to use, and how it should behave?"
        },
        {
            name: 'long_strategy',
            type: 'object',
            description: "Defines the conditions and actions for opening, managing, and closing long (buy) trades.",
            properties: {
                entryConditions: {
                    type: 'string',
                    description: "Conditions to open a long trade (e.g., 'EMA20 crosses above EMA200', 'price above resistance').",
                    question: "What specific conditions should trigger opening a long (buy) trade?"
                },
                inTradeActions: {
                    type: 'string',
                    description: "Actions while a long trade is open (e.g., 'trailing stop', 'move to break-even').",
                    question: "Once a long trade is active, what actions or conditions should be managed? (e.g., trailing stop, break-even, partial closes)"
                },
                exitConditions: {
                    type: 'string',
                    description: "Conditions to close an open long trade (e.g., 'RSI oversold', 'price hits take profit').",
                    question: "What conditions should lead to closing an open long trade?"
                },
                riskManagement: {
                    type: 'string',
                    description: "Risk management specifics for long trades, including stop loss, take profit, and lot sizing.",
                    question: "How should risk be managed for long trades? Please specify stop loss, take profit, and lot size calculations."
                },
                cleanupConditions: {
                    type: 'string',
                    description: "Optional: Conditions for bot cleanup after a long trade (e.g., 'ExpertRemove after 24 hours').",
                    question: "Are there any specific conditions or actions for cleaning up or detaching the bot after a long trade? (This is optional)."
                },
                orderType: {
                    type: 'string',
                    description: "Type of order for long trades (e.g., 'market order', 'buy limit'). The order type specifies how the trade is executed, such as whether it is a market order that executes immediately at the current price or a limit order that waits for a specific price. The default order type is 'market order', which means the trade will be executed at the current market price unless the user specifies otherwise.",
                    question: "What type of order should be used for long trades? (e.g., market order, limit order, stop order). By default, I'll use a market order."
                }
            }
        },
        {
            name: 'short_strategy',
            type: 'object',
            description: "Defines the conditions and actions for opening, managing, and closing short (sell) trades.",
            properties: {
                entryConditions: {
                    type: 'string',
                    description: "Conditions to open a short trade (e.g., 'EMA20 crosses below EMA200', 'price below support').",
                    question: "What specific conditions should trigger opening a short (sell) trade?"
                },
                inTradeActions: {
                    type: 'string',
                    description: "Actions while a short trade is open (e.g., 'trailing stop', 'move to break-even').",
                    question: "Once a short trade is active, what actions or conditions should be managed? (e.g., trailing stop, break-even, partial closes)"
                },
                exitConditions: {
                    type: 'string',
                    description: "Conditions to close an open short trade (e.g., 'RSI overbought', 'price hits stop loss').",
                    question: "What conditions should lead to closing an open short trade?"
                },
                riskManagement: {
                    type: 'string',
                    description: "Risk management specifics for short trades, including stop loss, take profit, and lot sizing.",
                    question: "How should risk be managed for short trades? Please specify stop loss, take profit, and lot size calculations."
                },
                cleanupConditions: {
                    type: 'string',
                    description: "Optional: Conditions for bot cleanup after a short trade (e.g., 'ExpertRemove on Friday close').",
                    question: "Are there any specific conditions or actions for cleaning up or detaching the bot after a short trade? (This is optional)."
                },
                orderType: {
                    type: 'string',
                    description: "Type of order for short trades (e.g., 'market order', 'sell stop'). The order type specifies how the trade is executed, such as whether it is a market order that executes immediately at the current price or a limit order that waits for a specific price. The default order type is 'market order', which means the trade will be executed at the current market price unless the user specifies otherwise.",
                    question: "What type of order should be used for short trades? (e.g., market order, limit order, stop order). By default, I'll use a market order."
                }
            }
        },
        {
            name: 'timeframe',
            type: 'string',
            description: "The chart timeframe for strategy execution (e.g., 'M1', 'H4', 'D1').",
            question: "What chart timeframe should your strategy be executed on? (e.g., M1, H4, D1)"
        },
        {
            name: 'tradingPair',
            type: 'string',
            description: "The specific financial instrument the strategy trades (e.g., 'EURUSD', 'XAUUSD').",
            question: "Which specific trading pair or asset will this strategy be designed for? (e.g., EUR/USD, BTC/USD)"
        },
        {
            name: 'tradingStyle',
            type: 'string',
            description: "The overall trading approach (e.g., 'scalping', 'swing trading', 'position trading').",
            question: "What style of trading will your strategy be based on? (e.g., scalping, day trading, swing trading)"
        },
        {
            name: 'riskRewardRatio',
            type: 'string',
            description: "Desired risk-reward ratio (e.g., '1:2', '1:3').",
            question: "What risk-reward ratio does your strategy aim to achieve? (e.g., 1:2, 1:3)"
        },
        {
            name: 'profitTarget',
            type: 'string',
            description: "The target profit level for trades (e.g., '50 pips', '1% account'). This is also known as take profit(tp).",
            question: "What is the profit target (or take profit/TP) for your strategy? (e.g., 50 pips, 100 pips, 1% of account)"
        },
        {
            name: 'stopLoss',
            type: 'string',
            description: "The stop loss level for trades (e.g., '30 pips', '0.5% account'). This is also known as stop loss(sl).",
            question: "What is the stop loss (or SL) level for your strategy? (e.g., 30 pips, 50 pips, 0.5% of account)"
        },
        {
            name: 'lotSize',
            type: 'string',
            description: "The trade volume (e.g., '0.01 lots', '1 standard lot'). This is also known as volume in MQL5. Volume is the number of lots to trade, which determines the size of each trade in terms of the base currency.",
            question: "What lot size (or volume) should be used for trades? (e.g., 0.01 lots, 0.1 lots)"
        },
        {
            name: 'tradingSession',
            type: 'string',
            description: "Specific trading session for activity (e.g., 'London session', 'New York session').",
            question: "During which specific trading session is your strategy intended to be executed? (e.g., London session, New York session)"
        },
        {
            name: 'tradingConditions',
            type: 'string',
            description: "Market conditions the strategy targets (e.g., 'high volatility', 'news events').",
            question: "Are there any specific market conditions or events your strategy is designed to take advantage of? (e.g., news events, market volatility)"
        },
        // {
        //     name: 'step-by-step-strategy', // Keeping commented out as per previous instructions
        //     type: 'string',
        //     description: "A comprehensive, coherent summary of the entire strategy's logic from start to finish."
        // },
        {
            name: 'indicators',
            type: 'string',
            description: "List of indicators used, including parameters and settings (e.g., 'RSI(14)', 'MACD(12,26,9)').",
            question: "Which indicators are used in your strategy, including their parameters and any specific settings?"
        },
        // {
        //     name: 'tradingPlatform', // Keeping commented out as per previous instructions
        //     type: 'string',
        //     description: "The platform where the bot will operate (e.g., 'MetaTrader 5', 'cTrader')."
        // },
        // {
        //     name: 'strategyName', // Keeping commented out as per previous instructions
        //     type: 'string',
        //     description: "A unique, descriptive name for the trading strategy itself."
        // },
        {
            name: 'other-artifacts',
            type: 'string',
            description: "Additional relevant trading concepts or tools (e.g., 'support and resistance zones', 'chart patterns').",
            question: "Are there any other relevant artifacts or components part of your trading strategy, like support/resistance levels or chart patterns?"
        },
        {
            name: 'code',
            type: 'string',
            description: "The complete MQL5 source code generated for the strategy.",
            // No question for 'code' as it's generated, not asked for.
        }
    ]
};

