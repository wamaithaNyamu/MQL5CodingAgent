I'd like to create a trading bot and name it **"GatorMACD_RSI_Breakout"**.


Here’s the full strategy description:

🧠 **Strategy Description**:  
This is a trend-following strategy that uses the Gator Oscillator, MACD, and RSI. The bot runs on the 15-minute timeframe. It looks for breakout conditions when volatility compresses and then expands in the direction of the trend. The idea is to catch early momentum.

📥 **Entry Conditions**:  
- RSI crosses above 50 from below  
- MACD line crosses above the signal line  
- Gator Oscillator bars are green and expanding  
- Price breaks above the recent 20-bar high  
- All conditions must happen within the same bar or within 2 bars of each other

⚙️ **In-Trade Actions**:  
- Set a trailing stop of 25 pips once trade is in 15 pips profit  
- Move stop loss to break-even after 10 pips  
- Close 50% of the position at 2R (risk-to-reward)  
- Continue trailing remainder until stopped out

📤 **Exit Conditions**:  
- RSI crosses below 60  
- MACD crosses below signal line  
- Gator histogram turns red  
- Or price hits trailing stop or SL

💰 **Risk Management**:  
- Risk 1.5% of account balance per trade  
- Use ATR(14) to dynamically calculate stop loss (2x ATR)  
- Lot size based on stop distance and account equity

🧹 **Cleanup Conditions**:  
- Detach the EA automatically after 20 consecutive trades (win or lose)  
- Or remove EA after 3 days of being attached without a trade

✅ **User Confirmation**:  
Yes, I confirm that all requirements are correct and I’m ready for you to generate the full MQL5 code.



<!-- EXAMPLE TWO -->
I want to create a trading bot and name it **Vagabond**.

🧠 **Strategy Description**:  
This bot runs on the **5-minute timeframe** and uses **no indicators**. Its only job is to detect when a **new bar is formed** and send a notification to the user.

📥 **Entry Conditions**:  
When a **new bar is formed**, send a notification. **Do not open any trades**.

⚙️ **In-Trade Actions**:  
None — this bot does **not manage any trades**.

📤 **Exit Conditions**:  
None — the bot does **not open trades**, so there are no exit conditions.

💰 **Risk Management**:  
None — since no trades are opened, **risk management is not applicable**.

🧹 **Cleanup Conditions**:  
None — the bot should keep running and continue sending notifications until manually removed.

✅ **User Confirmation**:  
Yes, I confirm the bot should be generated based on these details.
