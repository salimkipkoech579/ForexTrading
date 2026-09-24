/**
 * FX PRO — Professional Forex Trading Terminal Simulator
 * Vanilla JavaScript ES6+ Engine
 * Features:
 * - Live Brownian Forex tick simulator with green/red price flashes
 * - High-DPI HTML5 Canvas Candlestick Chart with multi-timeframe synthesis, SMA indicators, and crosshair
 * - Realistic order execution (Market, Limit, Stop) with SL/TP auto-triggers
 * - Real-time Portfolio & Margin calculus (Equity, Free Margin, Used Margin, Dynamic P/L)
 * - Watchlist, Position Management, Trading History with filters, Analytics Canvas charts
 * - LocalStorage persistence and Web Audio synthetic feedback
 */

// ============================================================================
// CONFIGURATION & SEED DATA
// ============================================================================
const STORAGE_KEY = 'fx_pro_terminal_state_v2';

const PAIRS_CONFIG = {
  'EUR/USD': { base: 1.17482, pip: 0.0001, decimals: 5, spread: 1.4, category: 'majors', mult: 100000, desc: 'Euro / US Dollar' },
  'GBP/USD': { base: 1.35120, pip: 0.0001, decimals: 5, spread: 1.9, category: 'majors', mult: 100000, desc: 'British Pound / US Dollar' },
  'USD/JPY': { base: 154.250, pip: 0.01, decimals: 3, spread: 1.5, category: 'majors', mult: 100000, desc: 'US Dollar / Japanese Yen' },
  'USD/CHF': { base: 0.89420, pip: 0.0001, decimals: 5, spread: 1.8, category: 'majors', mult: 100000, desc: 'US Dollar / Swiss Franc' },
  'AUD/USD': { base: 0.65820, pip: 0.0001, decimals: 5, spread: 1.6, category: 'majors', mult: 100000, desc: 'Australian Dollar / US Dollar' },
  'USD/CAD': { base: 1.36540, pip: 0.0001, decimals: 5, spread: 1.7, category: 'majors', mult: 100000, desc: 'US Dollar / Canadian Dollar' },
  'NZD/USD': { base: 0.59820, pip: 0.0001, decimals: 5, spread: 2.1, category: 'majors', mult: 100000, desc: 'New Zealand Dollar / US Dollar' },
  'EUR/GBP': { base: 0.86940, pip: 0.0001, decimals: 5, spread: 1.8, category: 'minors', mult: 100000, desc: 'Euro / British Pound' },
  'XAU/USD': { base: 2754.60, pip: 0.1, decimals: 2, spread: 2.5, category: 'metals', mult: 100, desc: 'Gold Spot / US Dollar' },
  'EUR/JPY': { base: 181.200, pip: 0.01, decimals: 3, spread: 2.0, category: 'minors', mult: 100000, desc: 'Euro / Japanese Yen' },
  'GBP/JPY': { base: 208.400, pip: 0.01, decimals: 3, spread: 2.4, category: 'minors', mult: 100000, desc: 'British Pound / Japanese Yen' },
  'BTC/USD': { base: 68420.00, pip: 1.0, decimals: 2, spread: 15.0, category: 'crypto', mult: 1, desc: 'Bitcoin / US Dollar' }
};

const DEFAULT_WATCHLIST = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'XAU/USD'];

// ============================================================================
// STATE INITIALIZATION
// ============================================================================
let state = {
  account: {
    balance: 25000.00,
    leverage: 100,
    currency: 'USD',
    name: 'Alex Morgan',
    accountId: 'FX-884920'
  },
  positions: [
    {
      id: 'pos-101',
      pair: 'EUR/USD',
      type: 'BUY',
      size: 0.50,
      entry: 1.17240,
      current: 1.17482,
      sl: 1.16900,
      tp: 1.18000,
      openTime: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'pos-102',
      pair: 'GBP/USD',
      type: 'BUY',
      size: 0.30,
      entry: 1.34850,
      current: 1.35120,
      sl: 1.34200,
      tp: 1.35900,
      openTime: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 'pos-103',
      pair: 'USD/JPY',
      type: 'SELL',
      size: 0.40,
      entry: 154.600,
      current: 154.250,
      sl: 155.200,
      tp: 153.800,
      openTime: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'pos-104',
      pair: 'XAU/USD',
      type: 'BUY',
      size: 0.20,
      entry: 2742.50,
      current: 2754.60,
      sl: 2715.00,
      tp: 2790.00,
      openTime: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  orders: [
    {
      id: 'ord-201',
      pair: 'EUR/USD',
      type: 'BUY LIMIT',
      size: 0.25,
      targetPrice: 1.17100,
      sl: 1.16600,
      tp: 1.17800,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  history: [
    {
      id: 'hist-1',
      pair: 'EUR/USD',
      type: 'BUY',
      size: 0.50,
      entry: 1.16850,
      exit: 1.17350,
      pnl: 250.00,
      returnPct: 2.14,
      status: 'TP Hit',
      closeTime: new Date(Date.now() - 86400000 * 1.5).toISOString()
    },
    {
      id: 'hist-2',
      pair: 'USD/CAD',
      type: 'SELL',
      size: 0.40,
      entry: 1.36900,
      exit: 1.36420,
      pnl: 192.00,
      returnPct: 1.64,
      status: 'Closed',
      closeTime: new Date(Date.now() - 86400000 * 2.2).toISOString()
    },
    {
      id: 'hist-3',
      pair: 'GBP/USD',
      type: 'BUY',
      size: 0.30,
      entry: 1.35400,
      exit: 1.34980,
      pnl: -126.00,
      returnPct: -1.08,
      status: 'SL Hit',
      closeTime: new Date(Date.now() - 86400000 * 3.1).toISOString()
    },
    {
      id: 'hist-4',
      pair: 'XAU/USD',
      type: 'BUY',
      size: 0.30,
      entry: 2720.00,
      exit: 2748.50,
      pnl: 855.00,
      returnPct: 7.31,
      status: 'TP Hit',
      closeTime: new Date(Date.now() - 86400000 * 4.0).toISOString()
    },
    {
      id: 'hist-5',
      pair: 'AUD/USD',
      type: 'SELL',
      size: 0.50,
      entry: 0.66200,
      exit: 0.65850,
      pnl: 175.00,
      returnPct: 1.50,
      status: 'Closed',
      closeTime: new Date(Date.now() - 86400000 * 4.8).toISOString()
    }
  ],
  watchlist: [...DEFAULT_WATCHLIST],
  activePair: 'EUR/USD',
  activeTimeframe: '15m',
  chartType: 'candles',
  indicators: { sma20: true, sma50: true },
  settings: {
    sound: true,
    theme: 'dark',
    defaultLot: 0.5
  },
  notifications: [
    { id: 'notif-1', title: 'Market Session Open', desc: 'London / New York overlap session is now active.', time: '10m ago', unread: true },
    { id: 'notif-2', title: 'Take Profit Executed', desc: 'XAU/USD simulated target achieved: +$855.00', time: '1h ago', unread: false },
    { id: 'notif-3', title: 'Volatility Alert', desc: 'USD/JPY spread contracted to 1.3 pips.', time: '2h ago', unread: false }
  ]
};

// Immediate global exposure
window.state = state;

// Load saved local storage state if available
function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.account && parsed.positions) {
        state = { ...state, ...parsed };
        window.state = state;
      }
    }
  } catch (err) {
    console.warn('Could not read localStorage:', err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

// Live Prices Cache
const livePrices = {};
Object.keys(PAIRS_CONFIG).forEach(sym => {
  const cfg = PAIRS_CONFIG[sym];
  const halfSpread = (cfg.spread * cfg.pip) / 2;
  livePrices[sym] = {
    bid: Number((cfg.base - halfSpread).toFixed(cfg.decimals)),
    ask: Number((cfg.base + halfSpread).toFixed(cfg.decimals)),
    high: Number((cfg.base * 1.0045).toFixed(cfg.decimals)),
    low: Number((cfg.base * 0.9955).toFixed(cfg.decimals)),
    changePct: 0.35,
    sparkline: Array.from({ length: 16 }, () => cfg.base * (1 + (Math.random() - 0.5) * 0.003))
  };
});

// Sound Audio Context (Web Audio API synthetic chime/clicks)
let audioCtx = null;
function playSound(type = 'click') {
  if (!state.settings.sound) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'buy') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'sell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.14); // A4
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'close') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(523.25, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Audio non-critical
  }
}

// ============================================================================
// PRICE FORMATTING & CALCULATIONS
// ============================================================================
function formatCurrency(num, decimals = 2) {
  return (num < 0 ? '-' : '') + '$' + Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatPrice(symbol, price) {
  const cfg = PAIRS_CONFIG[symbol] || { decimals: 5 };
  return Number(price).toFixed(cfg.decimals);
}

function calculatePositionPnL(pos) {
  const current = pos.type === 'BUY' ? livePrices[pos.pair].bid : livePrices[pos.pair].ask;
  const cfg = PAIRS_CONFIG[pos.pair];
  if (!cfg) return 0;

  const diff = pos.type === 'BUY' ? (current - pos.entry) : (pos.entry - current);
  let pnl = diff * pos.size * cfg.mult;

  // Currency adjustment if quote is JPY
  if (pos.pair.endsWith('/JPY')) {
    pnl = pnl / (livePrices['USD/JPY'] ? livePrices['USD/JPY'].bid : 154.0);
  }
  return pnl;
}

function calculateEstimatedMargin(pair, lotSize) {
  const cfg = PAIRS_CONFIG[pair];
  if (!cfg) return 0;
  const price = livePrices[pair].ask;
  const leverage = state.account.leverage || 100;
  let nominalValue = lotSize * cfg.mult * price;
  if (pair.endsWith('/JPY')) {
    nominalValue = nominalValue / (livePrices['USD/JPY'] ? livePrices['USD/JPY'].bid : 154.0);
  }
  return nominalValue / leverage;
}

// ============================================================================
// CANDLESTICK CHART ENGINE (HTML5 CANVAS)
// ============================================================================
class TradingChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.candles = [];
    this.pair = state.activePair;
    this.timeframe = state.activeTimeframe;
    this.zoom = 1;
    this.crosshair = { x: -1, y: -1, active: false };

    this.initSyntheticCandles();
    this.setupEventListeners();
    this.resize();
  }

  initSyntheticCandles() {
    const cfg = PAIRS_CONFIG[this.pair];
    let base = cfg.base;
    const count = 75;
    this.candles = [];
    let curTime = Date.now() - count * 60000 * 15;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.495) * (base * 0.002);
      const open = base;
      const close = base + delta;
      const high = Math.max(open, close) + Math.random() * (base * 0.0012);
      const low = Math.min(open, close) - Math.random() * (base * 0.0012);
      const volume = Math.floor(Math.random() * 800 + 200);

      this.candles.push({
        time: curTime,
        open,
        high,
        low,
        close,
        volume
      });
      base = close;
      curTime += 60000 * 15;
    }
  }

  setPair(symbol) {
    this.pair = symbol;
    this.initSyntheticCandles();
    this.render();
  }

  setTimeframe(tf) {
    this.timeframe = tf;
    this.initSyntheticCandles();
    this.render();
  }

  onPriceTick(symbol, newPrice) {
    if (symbol !== this.pair || !this.candles.length) return;
    const last = this.candles[this.candles.length - 1];
    last.close = newPrice;
    if (newPrice > last.high) last.high = newPrice;
    if (newPrice < last.low) last.low = newPrice;
    this.render();
  }

  addNewCandle(newPrice) {
    const last = this.candles[this.candles.length - 1];
    const newCandle = {
      time: Date.now(),
      open: last.close,
      high: Math.max(last.close, newPrice),
      low: Math.min(last.close, newPrice),
      close: newPrice,
      volume: Math.floor(Math.random() * 400 + 100)
    };
    this.candles.push(newCandle);
    if (this.candles.length > 100) this.candles.shift();
    this.render();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.crosshair = {
        x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
        active: true
      };
      this.render();
      this.updateCrosshairBadges(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.crosshair.active = false;
      this.render();
      const pBadge = document.getElementById('chart-crosshair-price');
      const tBadge = document.getElementById('chart-crosshair-time');
      if (pBadge) pBadge.style.display = 'none';
      if (tBadge) tBadge.style.display = 'none';
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoom = Math.min(this.zoom * 1.08, 2.5);
      } else {
        this.zoom = Math.max(this.zoom * 0.92, 0.5);
      }
      this.render();
    }, { passive: false });
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = parent.clientWidth * dpr;
    this.canvas.height = parent.clientHeight * dpr;
    this.render();
  }

  updateCrosshairBadges(clientX, clientY, w, h) {
    const pBadge = document.getElementById('chart-crosshair-price');
    const tBadge = document.getElementById('chart-crosshair-time');
    if (!pBadge || !tBadge || !this.lastPriceRange) return;

    pBadge.style.display = 'block';
    pBadge.style.top = `${clientY}px`;

    const { minPrice, maxPrice, chartHeight } = this.lastPriceRange;
    const priceRatio = (h - clientY) / h;
    const priceVal = minPrice + priceRatio * (maxPrice - minPrice);
    pBadge.textContent = formatPrice(this.pair, priceVal);

    tBadge.style.display = 'block';
    tBadge.style.left = `${clientX}px`;
    const now = new Date();
    tBadge.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  render() {
    if (!this.ctx || !this.candles.length) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cfg = PAIRS_CONFIG[this.pair] || { decimals: 5 };

    ctx.clearRect(0, 0, w, h);

    // Padding & Axis Dimensions
    const priceAxisWidth = 72;
    const timeAxisHeight = 26;
    const chartWidth = w - priceAxisWidth;
    const chartHeight = h - timeAxisHeight;
    const volumeHeight = chartHeight * 0.18;

    // Visible Candles calculation
    const baseCandleWidth = 8 * this.zoom;
    const candleGap = 3 * this.zoom;
    const totalSlot = baseCandleWidth + candleGap;
    const visibleCount = Math.floor(chartWidth / totalSlot);
    const startIndex = Math.max(0, this.candles.length - visibleCount);
    const visibleCandles = this.candles.slice(startIndex);

    if (!visibleCandles.length) return;

    // Price Bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    visibleCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const pricePadding = (maxPrice - minPrice) * 0.1 || 0.001;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    this.lastPriceRange = { minPrice, maxPrice, chartHeight };

    const getY = price => chartHeight - ((price - minPrice) / priceRange) * (chartHeight - volumeHeight - 10) - volumeHeight;
    const getX = index => index * totalSlot + totalSlot / 2;

    // 1. Grid Lines
    ctx.strokeStyle = '#151f33';
    ctx.lineWidth = 1;

    // Horizontal grid
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange * i) / gridSteps;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price labels on right axis
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(cfg.decimals), chartWidth + 6, y + 3);
    }

    // Vertical time grid
    const timeGridSteps = 5;
    for (let i = 0; i < visibleCandles.length; i += Math.ceil(visibleCandles.length / timeGridSteps)) {
      const x = getX(i);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      const d = new Date(visibleCandles[i].time);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, h - 8);
    }

    // 2. Volume Bars
    visibleCandles.forEach((c, i) => {
      const x = getX(i);
      const isBull = c.close >= c.open;
      const vHeight = (c.volume / (maxVolume || 1)) * volumeHeight;
      ctx.fillStyle = isBull ? 'rgba(0, 192, 118, 0.18)' : 'rgba(255, 71, 87, 0.18)';
      ctx.fillRect(x - baseCandleWidth / 2, chartHeight - vHeight, baseCandleWidth, vHeight);
    });

    // 3. Candlesticks / Line Chart
    if (state.chartType === 'line' || state.chartType === 'area') {
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(visibleCandles[0].close));
      for (let i = 1; i < visibleCandles.length; i++) {
        ctx.lineTo(getX(i), getY(visibleCandles[i].close));
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (state.chartType === 'area') {
        ctx.lineTo(getX(visibleCandles.length - 1), chartHeight);
        ctx.lineTo(getX(0), chartHeight);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, chartHeight);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
    } else {
      // Candlestick rendering
      visibleCandles.forEach((c, i) => {
        const x = getX(i);
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isBull = c.close >= c.open;
        const color = isBull ? '#00c076' : '#ff4757';

        // Upper & Lower wicks
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle body
        ctx.fillStyle = color;
        const topY = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
        ctx.fillRect(x - baseCandleWidth / 2, topY, baseCandleWidth, bodyHeight);
      });
    }

    // 4. Moving Average Overlays (SMA 20 & SMA 50)
    if (state.indicators.sma20) {
      this.drawSMA(visibleCandles, 20, '#f59e0b', getX, getY);
    }
    if (state.indicators.sma50) {
      this.drawSMA(visibleCandles, 50, '#06b6d4', getX, getY);
    }

    // 5. Bid & Ask Price Horizontal Lines
    const currentBid = livePrices[this.pair].bid;
    const currentAsk = livePrices[this.pair].ask;
    const bidY = getY(currentBid);
    const askY = getY(currentAsk);

    // Bid Line (Cyan dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, bidY);
    ctx.lineTo(chartWidth, bidY);
    ctx.stroke();

    // Ask Line (Red dashed)
    ctx.strokeStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(0, askY);
    ctx.lineTo(chartWidth, askY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Price Pill on Axis
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(chartWidth, bidY - 8, priceAxisWidth, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(currentBid.toFixed(cfg.decimals), chartWidth + 6, bidY + 4);

    // 6. Crosshair Rendering
    if (this.crosshair.active) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // Vertical
      ctx.beginPath();
      ctx.moveTo(this.crosshair.x, 0);
      ctx.lineTo(this.crosshair.x, chartHeight);
      ctx.stroke();

      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, this.crosshair.y);
      ctx.lineTo(chartWidth, this.crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Update overlay HUD
    const last = visibleCandles[visibleCandles.length - 1];
    const hud = document.getElementById('chart-hud-stats');
    if (hud) {
      hud.innerHTML = `<span>O: <b>${last.open.toFixed(cfg.decimals)}</b></span> ` +
        `<span>H: <b>${last.high.toFixed(cfg.decimals)}</b></span> ` +
        `<span>L: <b>${last.low.toFixed(cfg.decimals)}</b></span> ` +
        `<span>C: <b>${last.close.toFixed(cfg.decimals)}</b></span> ` +
        `<span>Vol: <b>${last.volume}</b></span>`;
    }
  }

  drawSMA(candles, period, color, getX, getY) {
    if (candles.length < period) return;
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();

    let first = true;
    for (let i = period - 1; i < candles.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += candles[i - j].close;
      }
      const sma = sum / period;
      const x = getX(i);
      const y = getY(sma);
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

// Global chart instance
let chartInstance = null;

// ============================================================================
// SIMULATED MARKET TICK GENERATOR
// ============================================================================
function initMarketSimulator() {
  setInterval(() => {
    // Pick 1 to 3 random pairs to tick
    const pairs = Object.keys(PAIRS_CONFIG);
    const tickCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < tickCount; i++) {
      const sym = pairs[Math.floor(Math.random() * pairs.length)];
      simulatePairTick(sym);
    }

    updatePortfolioCalculations();
    checkOrderAndPositionTriggers();
  }, 450);

  // New candle interval for active chart (every 12 seconds in demo)
  setInterval(() => {
    if (chartInstance) {
      const currentPrice = livePrices[state.activePair].bid;
      chartInstance.addNewCandle(currentPrice);
    }
  }, 12000);
}

function simulatePairTick(sym) {
  const cfg = PAIRS_CONFIG[sym];
  const oldPrice = livePrices[sym].bid;

  // Brownian motion delta
  const volatility = cfg.category === 'crypto' ? 0.0008 : (cfg.category === 'metals' ? 0.0004 : 0.00015);
  const delta = (Math.random() - 0.498) * (cfg.base * volatility);
  let newBid = Number((oldPrice + delta).toFixed(cfg.decimals));

  // Drift bounded
  if (newBid > cfg.base * 1.05) newBid = cfg.base * 1.049;
  if (newBid < cfg.base * 0.95) newBid = cfg.base * 0.951;

  const halfSpread = (cfg.spread * cfg.pip) / 2;
  const newAsk = Number((newBid + (cfg.spread * cfg.pip)).toFixed(cfg.decimals));

  const isUp = newBid >= oldPrice;
  livePrices[sym].bid = newBid;
  livePrices[sym].ask = newAsk;
  if (newBid > livePrices[sym].high) livePrices[sym].high = newBid;
  if (newBid < livePrices[sym].low) livePrices[sym].low = newBid;

  const changePct = ((newBid - cfg.base) / cfg.base) * 100;
  livePrices[sym].changePct = Number(changePct.toFixed(2));

  // Update sparkline
  livePrices[sym].sparkline.push(newBid);
  if (livePrices[sym].sparkline.length > 20) livePrices[sym].sparkline.shift();

  // Trigger chart tick if matches active pair
  if (sym === state.activePair && chartInstance) {
    chartInstance.onPriceTick(sym, newBid);
    updateActivePairDisplay();
  }

  // Flash UI elements
  flashMarketTableRow(sym, isUp);
}

function flashMarketTableRow(sym, isUp) {
  const bidEl = document.getElementById(`bid-${sym.replace('/', '-')}`);
  const askEl = document.getElementById(`ask-${sym.replace('/', '-')}`);
  if (bidEl && askEl) {
    const flashClass = isUp ? 'flash-up' : 'flash-down';
    bidEl.textContent = formatPrice(sym, livePrices[sym].bid);
    askEl.textContent = formatPrice(sym, livePrices[sym].ask);

    bidEl.classList.remove('flash-up', 'flash-down');
    askEl.classList.remove('flash-up', 'flash-down');
    void bidEl.offsetWidth; // Trigger reflow
    bidEl.classList.add(flashClass);
    askEl.classList.add(flashClass);

    // Update 24h change pill
    const chgEl = document.getElementById(`chg-${sym.replace('/', '-')}`);
    if (chgEl) {
      const val = livePrices[sym].changePct;
      chgEl.textContent = (val >= 0 ? '+' : '') + val.toFixed(2) + '%';
      chgEl.className = val >= 0 ? 'text-bull tabular-nums' : 'text-bear tabular-nums';
    }
  }
}

// ============================================================================
// PORTFOLIO & MARGIN CALCULATOR
// ============================================================================
function updatePortfolioCalculations() {
  let totalFloatingPnL = 0;
  let totalUsedMargin = 0;

  state.positions.forEach(pos => {
    const pnl = calculatePositionPnL(pos);
    totalFloatingPnL += pnl;
    totalUsedMargin += calculateEstimatedMargin(pos.pair, pos.size);

    // Update row P/L in UI
    const rowPnL = document.getElementById(`pos-pnl-${pos.id}`);
    const rowCur = document.getElementById(`pos-cur-${pos.id}`);
    if (rowPnL && rowCur) {
      const curPrice = pos.type === 'BUY' ? livePrices[pos.pair].bid : livePrices[pos.pair].ask;
      rowCur.textContent = formatPrice(pos.pair, curPrice);
      rowPnL.textContent = (pnl >= 0 ? '+' : '') + formatCurrency(pnl);
      rowPnL.className = pnl >= 0 ? 'text-bull tabular-nums' : 'text-bear tabular-nums';
    }
  });

  const equity = state.account.balance + totalFloatingPnL;
  const availableMargin = Math.max(0, equity - totalUsedMargin);
  const marginLevel = totalUsedMargin > 0 ? (equity / totalUsedMargin) * 100 : 999;

  // Update Top Nav & Stat Cards
  const elDemoBalance = document.getElementById('stat-demo-balance');
  const elTopBalance = document.getElementById('top-bar-balance');
  const elEquity = document.getElementById('stat-equity');
  const elAvailMargin = document.getElementById('stat-avail-margin');
  const elUsedMargin = document.getElementById('stat-used-margin');
  const elTodayPnL = document.getElementById('stat-today-pnl');
  const elOpenPositions = document.getElementById('stat-open-positions');

  if (elDemoBalance) elDemoBalance.textContent = formatCurrency(state.account.balance);
  if (elTopBalance) elTopBalance.textContent = formatCurrency(state.account.balance);
  if (elEquity) elEquity.textContent = formatCurrency(equity);
  if (elAvailMargin) elAvailMargin.textContent = formatCurrency(availableMargin);
  if (elUsedMargin) elUsedMargin.textContent = formatCurrency(totalUsedMargin);
  if (elOpenPositions) elOpenPositions.textContent = state.positions.length.toString();

  if (elTodayPnL) {
    const sign = totalFloatingPnL >= 0 ? '+' : '';
    const pct = ((totalFloatingPnL / state.account.balance) * 100).toFixed(2);
    elTodayPnL.textContent = `${sign}${formatCurrency(totalFloatingPnL)} (${sign}${pct}%)`;
    elTodayPnL.className = `stat-value ${totalFloatingPnL >= 0 ? 'text-bull' : 'text-bear'}`;
  }
}

// Check Stop Loss & Take Profit Triggers & Limit Orders
function checkOrderAndPositionTriggers() {
  // 1. Position SL / TP
  for (let i = state.positions.length - 1; i >= 0; i--) {
    const pos = state.positions[i];
    const cur = pos.type === 'BUY' ? livePrices[pos.pair].bid : livePrices[pos.pair].ask;

    let triggered = false;
    let reason = '';

    if (pos.type === 'BUY') {
      if (pos.sl && cur <= pos.sl) {
        triggered = true;
        reason = 'Stop Loss Hit';
      } else if (pos.tp && cur >= pos.tp) {
        triggered = true;
        reason = 'Take Profit Hit';
      }
    } else {
      if (pos.sl && cur >= pos.sl) {
        triggered = true;
        reason = 'Stop Loss Hit';
      } else if (pos.tp && cur <= pos.tp) {
        triggered = true;
        reason = 'Take Profit Hit';
      }
    }

    if (triggered) {
      closePosition(pos.id, reason);
    }
  }

  // 2. Pending Orders
  for (let j = state.orders.length - 1; j >= 0; j--) {
    const ord = state.orders[j];
    const curBid = livePrices[ord.pair].bid;
    const curAsk = livePrices[ord.pair].ask;
    let fill = false;

    if (ord.type === 'BUY LIMIT' && curAsk <= ord.targetPrice) fill = true;
    if (ord.type === 'SELL LIMIT' && curBid >= ord.targetPrice) fill = true;
    if (ord.type === 'BUY STOP' && curAsk >= ord.targetPrice) fill = true;
    if (ord.type === 'SELL STOP' && curBid <= ord.targetPrice) fill = true;

    if (fill) {
      state.orders.splice(j, 1);
      const isBuy = ord.type.startsWith('BUY');
      const entryPrice = isBuy ? curAsk : curBid;
      const newPos = {
        id: 'pos-' + Math.floor(Math.random() * 90000 + 10000),
        pair: ord.pair,
        type: isBuy ? 'BUY' : 'SELL',
        size: ord.size,
        entry: entryPrice,
        current: entryPrice,
        sl: ord.sl || null,
        tp: ord.tp || null,
        openTime: new Date().toISOString()
      };
      state.positions.unshift(newPos);
      showToast(`Order Executed: ${ord.type} ${ord.size} lots ${ord.pair} at ${formatPrice(ord.pair, entryPrice)}`, 'success');
      playSound(isBuy ? 'buy' : 'sell');
      renderOpenPositionsTable();
      renderOrdersTable();
      saveState();
    }
  }
}

// ============================================================================
// ORDER EXECUTION & POSITION MANAGEMENT
// ============================================================================
let pendingOrderDraft = null;

function prepareOrder(actionType) {
  const pair = state.activePair;
  const orderType = document.querySelector('.order-type-tab.active')?.dataset.type || 'MARKET';
  const lotInput = document.getElementById('order-lot-size');
  const slInput = document.getElementById('order-stop-loss');
  const tpInput = document.getElementById('order-take-profit');
  const entryInput = document.getElementById('order-entry-price');

  const lots = parseFloat(lotInput?.value) || 0.1;
  const sl = slInput?.value ? parseFloat(slInput.value) : null;
  const tp = tpInput?.value ? parseFloat(tpInput.value) : null;
  const isBuy = actionType === 'BUY';
  const price = isBuy ? livePrices[pair].ask : livePrices[pair].bid;
  const targetEntry = orderType === 'MARKET' ? price : (parseFloat(entryInput?.value) || price);

  const estMargin = calculateEstimatedMargin(pair, lots);

  pendingOrderDraft = {
    pair,
    action: actionType,
    orderType,
    lots,
    price: targetEntry,
    sl,
    tp,
    estMargin
  };

  // Populate Confirmation Modal
  const modal = document.getElementById('order-confirm-modal');
  if (modal) {
    document.getElementById('confirm-pair').textContent = pair;
    document.getElementById('confirm-action').textContent = `${actionType} / ${orderType}`;
    document.getElementById('confirm-action').className = isBuy ? 'text-bull font-bold' : 'text-bear font-bold';
    document.getElementById('confirm-lots').textContent = lots.toFixed(2) + ' Lots';
    document.getElementById('confirm-price').textContent = formatPrice(pair, targetEntry);
    document.getElementById('confirm-sl').textContent = sl ? formatPrice(pair, sl) : 'None';
    document.getElementById('confirm-tp').textContent = tp ? formatPrice(pair, tp) : 'None';
    document.getElementById('confirm-margin').textContent = formatCurrency(estMargin);
    modal.classList.add('show');
  }
}

function executeConfirmedOrder() {
  if (!pendingOrderDraft) return;
  const draft = pendingOrderDraft;
  closeModal('order-confirm-modal');

  if (draft.orderType === 'MARKET') {
    const newPos = {
      id: 'pos-' + Math.floor(Math.random() * 90000 + 10000),
      pair: draft.pair,
      type: draft.action,
      size: draft.lots,
      entry: draft.price,
      current: draft.price,
      sl: draft.sl,
      tp: draft.tp,
      openTime: new Date().toISOString()
    };
    state.positions.unshift(newPos);
    showToast(`Simulated Order Executed: ${draft.action} ${draft.lots} lots ${draft.pair} @ ${formatPrice(draft.pair, draft.price)}`, 'success');
    playSound(draft.action === 'BUY' ? 'buy' : 'sell');
    renderOpenPositionsTable();
  } else {
    // Limit or Stop Order
    const newOrder = {
      id: 'ord-' + Math.floor(Math.random() * 90000 + 10000),
      pair: draft.pair,
      type: `${draft.action} ${draft.orderType}`,
      size: draft.lots,
      targetPrice: draft.price,
      sl: draft.sl,
      tp: draft.tp,
      createdAt: new Date().toISOString()
    };
    state.orders.unshift(newOrder);
    showToast(`Pending Order Placed: ${newOrder.type} ${draft.lots} lots ${draft.pair} @ ${formatPrice(draft.pair, draft.price)}`, 'info');
    renderOrdersTable();
  }

  saveState();
  updatePortfolioCalculations();
  pendingOrderDraft = null;
}

function closePosition(posId, customReason = 'Manual Close') {
  const index = state.positions.findIndex(p => p.id === posId);
  if (index === -1) return;
  const pos = state.positions[index];
  const exitPrice = pos.type === 'BUY' ? livePrices[pos.pair].bid : livePrices[pos.pair].ask;
  const netPnL = calculatePositionPnL(pos);

  // Update balance
  state.account.balance += netPnL;

  // Add to closed trade history
  state.history.unshift({
    id: 'hist-' + Math.floor(Math.random() * 90000 + 10000),
    pair: pos.pair,
    type: pos.type,
    size: pos.size,
    entry: pos.entry,
    exit: exitPrice,
    pnl: Number(netPnL.toFixed(2)),
    returnPct: Number(((netPnL / (pos.size * 1000)) * 100).toFixed(2)),
    status: customReason,
    closeTime: new Date().toISOString()
  });

  // Remove from open positions
  state.positions.splice(index, 1);

  showToast(`Position Closed: ${pos.pair} | Net: ${netPnL >= 0 ? '+' : ''}${formatCurrency(netPnL)} (${customReason})`, netPnL >= 0 ? 'success' : 'danger');
  playSound('close');

  saveState();
  renderOpenPositionsTable();
  renderHistoryTable();
  updatePortfolioCalculations();
  renderAnalyticsCharts();
}

function closeAllPositions() {
  if (!state.positions.length) {
    showToast('No open positions to close.', 'info');
    return;
  }
  const count = state.positions.length;
  while (state.positions.length > 0) {
    closePosition(state.positions[0].id, 'Bulk Close');
  }
  showToast(`All ${count} simulated positions closed.`, 'info');
}

// Modify SL/TP Modal logic
let modifyingPosId = null;
function openModifyModal(posId) {
  const pos = state.positions.find(p => p.id === posId);
  if (!pos) return;
  modifyingPosId = posId;

  const modal = document.getElementById('modify-sltp-modal');
  if (modal) {
    document.getElementById('modify-pos-info').textContent = `${pos.pair} ${pos.type} ${pos.size} Lots (Entry: ${formatPrice(pos.pair, pos.entry)})`;
    const slIn = document.getElementById('modify-sl-input');
    const tpIn = document.getElementById('modify-tp-input');
    if (slIn) slIn.value = pos.sl ? pos.sl.toString() : '';
    if (tpIn) tpIn.value = pos.tp ? pos.tp.toString() : '';
    modal.classList.add('show');
  }
}

function saveModifiedSLTP() {
  if (!modifyingPosId) return;
  const pos = state.positions.find(p => p.id === modifyingPosId);
  if (!pos) return;

  const slVal = document.getElementById('modify-sl-input')?.value;
  const tpVal = document.getElementById('modify-tp-input')?.value;

  pos.sl = slVal ? parseFloat(slVal) : null;
  pos.tp = tpVal ? parseFloat(tpVal) : null;

  showToast(`Updated SL/TP for ${pos.pair}`, 'success');
  closeModal('modify-sltp-modal');
  renderOpenPositionsTable();
  saveState();
  modifyingPosId = null;
}

// Add Demo Funds Modal
function addDemoFunds(amount) {
  state.account.balance += amount;
  showToast(`Successfully added ${formatCurrency(amount)} demo funds.`, 'success');
  playSound('buy');
  closeModal('add-funds-modal');
  saveState();
  updatePortfolioCalculations();
}

function resetDemoAccount() {
  if (confirm('Reset demo account back to default $25,000.00 and default simulation state?')) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
}

// ============================================================================
// UI RENDERING FUNCTIONS
// ============================================================================
function renderMarketTable(containerId = 'market-table-body', filterCategory = 'all') {
  const tbody = document.getElementById(containerId);
  if (!tbody) return;

  tbody.innerHTML = '';
  const pairs = Object.keys(PAIRS_CONFIG);

  pairs.forEach(sym => {
    const cfg = PAIRS_CONFIG[sym];
    if (filterCategory !== 'all' && cfg.category !== filterCategory) return;

    const data = livePrices[sym];
    const isUp = data.changePct >= 0;

    const tr = document.createElement('tr');
    tr.id = `row-${sym.replace('/', '-')}`;
    tr.className = sym === state.activePair ? 'active-row' : '';
    tr.onclick = () => selectPair(sym);

    tr.innerHTML = `
      <td class="symbol-cell">
        <span class="pair-icon-pill">${sym.substring(0, 3)}</span>
        <div>
          <div style="font-weight: 700;">${sym}</div>
          <div style="font-size: 10px; color: var(--text-muted);">${cfg.desc}</div>
        </div>
      </td>
      <td class="num-cell" id="bid-${sym.replace('/', '-')}">${formatPrice(sym, data.bid)}</td>
      <td class="num-cell" id="ask-${sym.replace('/', '-')}">${formatPrice(sym, data.ask)}</td>
      <td class="num-cell text-center" style="color: var(--text-secondary);">${cfg.spread.toFixed(1)}</td>
      <td class="num-cell text-right" id="chg-${sym.replace('/', '-')}">
        <span class="${isUp ? 'text-bull' : 'text-bear'}">${isUp ? '+' : ''}${data.changePct.toFixed(2)}%</span>
      </td>
      <td class="text-center">
        <canvas class="sparkline-canvas" id="spark-${sym.replace('/', '-')}" width="70" height="24"></canvas>
      </td>
      <td class="text-right">
        <button class="btn btn-outline" style="padding: 2px 8px; font-size: 11px;" onclick="event.stopPropagation(); quickTrade('${sym}', 'BUY')">Trade</button>
      </td>
    `;
    tbody.appendChild(tr);

    // Draw sparkline
    setTimeout(() => drawSparkline(`spark-${sym.replace('/', '-')}`, data.sparkline, isUp), 0);
  });
}

function drawSparkline(canvasId, points, isBull) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !points.length) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  ctx.beginPath();
  points.forEach((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = isBull ? '#00c076' : '#ff4757';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function renderOpenPositionsTable() {
  const tbody = document.getElementById('open-positions-tbody');
  const tbodyFull = document.getElementById('positions-view-tbody');
  const countEl = document.getElementById('open-pos-count-badge');
  if (countEl) countEl.textContent = state.positions.length.toString();

  const renderTo = target => {
    if (!target) return;
    target.innerHTML = '';
    if (!state.positions.length) {
      target.innerHTML = `<tr><td colspan="9" class="empty-state">No open positions. Use the Order Panel or Market Watch to execute simulated trades.</td></tr>`;
      return;
    }

    state.positions.forEach(pos => {
      const curPrice = pos.type === 'BUY' ? livePrices[pos.pair].bid : livePrices[pos.pair].ask;
      const pnl = calculatePositionPnL(pos);
      const isProfit = pnl >= 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="symbol-cell">
          <span class="pair-icon-pill">${pos.pair.substring(0, 3)}</span>
          <b>${pos.pair}</b>
        </td>
        <td>
          <span class="badge-position-type ${pos.type === 'BUY' ? 'badge-buy' : 'badge-sell'}">${pos.type}</span>
        </td>
        <td class="num-cell">${pos.size.toFixed(2)}</td>
        <td class="num-cell">${formatPrice(pos.pair, pos.entry)}</td>
        <td class="num-cell" id="pos-cur-${pos.id}">${formatPrice(pos.pair, curPrice)}</td>
        <td class="num-cell">${pos.sl ? formatPrice(pos.pair, pos.sl) : '—'}</td>
        <td class="num-cell">${pos.tp ? formatPrice(pos.pair, pos.tp) : '—'}</td>
        <td class="num-cell font-bold ${isProfit ? 'text-bull' : 'text-bear'}" id="pos-pnl-${pos.id}">
          ${isProfit ? '+' : ''}${formatCurrency(pnl)}
        </td>
        <td class="text-right">
          <button class="btn btn-outline" style="padding: 2px 6px; font-size: 10px; margin-right: 4px;" onclick="openModifyModal('${pos.id}')">Modify</button>
          <button class="btn btn-danger" style="padding: 2px 8px; font-size: 10px;" onclick="closePosition('${pos.id}')">Close</button>
        </td>
      `;
      target.appendChild(tr);
    });
  };

  renderTo(tbody);
  renderTo(tbodyFull);
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-view-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!state.orders.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No pending limit or stop orders currently active.</td></tr>`;
    return;
  }

  state.orders.forEach(ord => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="symbol-cell"><b>${ord.pair}</b></td>
      <td><span class="badge-position-type badge-buy">${ord.type}</span></td>
      <td class="num-cell">${ord.size.toFixed(2)}</td>
      <td class="num-cell">${formatPrice(ord.pair, ord.targetPrice)}</td>
      <td class="num-cell">${ord.sl ? formatPrice(ord.pair, ord.sl) : '—'}</td>
      <td class="num-cell">${ord.tp ? formatPrice(ord.pair, ord.tp) : '—'}</td>
      <td><span class="impact-badge impact-medium">Active</span></td>
      <td class="text-right">
        <button class="btn btn-outline" style="padding: 2px 8px; font-size: 10px; color: var(--bear-red);" onclick="cancelOrder('${ord.id}')">Cancel</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function cancelOrder(orderId) {
  state.orders = state.orders.filter(o => o.id !== orderId);
  showToast('Pending order cancelled.', 'info');
  renderOrdersTable();
  saveState();
}

function renderHistoryTable(filterType = 'all') {
  const tbody = document.getElementById('history-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let list = [...state.history];
  if (filterType === 'profitable') list = list.filter(h => h.pnl > 0);
  if (filterType === 'losing') list = list.filter(h => h.pnl <= 0);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No historical simulated trades recorded for this filter.</td></tr>`;
    return;
  }

  list.forEach(h => {
    const isProfit = h.pnl >= 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color: var(--text-muted); font-size: 11px;">${new Date(h.closeTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      <td class="symbol-cell"><b>${h.pair}</b></td>
      <td><span class="badge-position-type ${h.type === 'BUY' ? 'badge-buy' : 'badge-sell'}">${h.type}</span></td>
      <td class="num-cell">${h.size.toFixed(2)}</td>
      <td class="num-cell">${formatPrice(h.pair, h.entry)}</td>
      <td class="num-cell">${formatPrice(h.pair, h.exit)}</td>
      <td class="num-cell font-bold ${isProfit ? 'text-bull' : 'text-bear'}">${isProfit ? '+' : ''}${formatCurrency(h.pnl)}</td>
      <td class="num-cell ${isProfit ? 'text-bull' : 'text-bear'}">${isProfit ? '+' : ''}${h.returnPct.toFixed(2)}%</td>
      <td><span style="font-size: 11px; color: var(--text-secondary);">${h.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderWatchlistGrid() {
  const container = document.getElementById('watchlist-items-container');
  if (!container) return;
  container.innerHTML = '';

  state.watchlist.forEach(sym => {
    const cfg = PAIRS_CONFIG[sym];
    if (!cfg) return;
    const data = livePrices[sym];
    const isUp = data.changePct >= 0;

    const item = document.createElement('div');
    item.className = `stat-card ${sym === state.activePair ? 'stat-primary' : ''}`;
    item.style.cursor = 'pointer';
    item.onclick = () => selectPair(sym);

    item.innerHTML = `
      <div class="stat-title-row">
        <span class="stat-title" style="font-size: 13px; color: var(--text-primary); font-weight: 700;">${sym}</span>
        <button class="btn-icon" style="padding: 2px 4px; font-size: 10px;" onclick="event.stopPropagation(); removeWatchlistPair('${sym}')" title="Remove">✕</button>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 4px 0;">
        <span class="stat-value" style="font-size: 15px;">${formatPrice(sym, data.bid)}</span>
        <span class="${isUp ? 'text-bull' : 'text-bear'} font-bold tabular-nums">${isUp ? '+' : ''}${data.changePct.toFixed(2)}%</span>
      </div>
      <div class="stat-subtext" style="justify-content: space-between;">
        <span>Spread: ${cfg.spread.toFixed(1)} pips</span>
        <span style="color: #38bdf8;">View Chart →</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function removeWatchlistPair(sym) {
  state.watchlist = state.watchlist.filter(p => p !== sym);
  showToast(`Removed ${sym} from Watchlist`, 'info');
  renderWatchlistGrid();
  saveState();
}

function addPairToWatchlist(sym) {
  if (!state.watchlist.includes(sym)) {
    state.watchlist.push(sym);
    showToast(`Added ${sym} to Watchlist`, 'success');
    renderWatchlistGrid();
    saveState();
  }
}

// ============================================================================
// ANALYTICS CHARTS (HTML5 CANVAS)
// ============================================================================
function renderAnalyticsCharts() {
  renderEquityCurveCanvas();
  renderDailyPnLCanvas();
  calculateAnalyticsMetrics();
}

function renderEquityCurveCanvas() {
  const canvas = document.getElementById('analytics-equity-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Compute equity points based on initial 25000 + accumulated closed history trades
  const points = [25000];
  let cur = 25000;
  const reversedHistory = [...state.history].reverse();
  reversedHistory.forEach(trade => {
    cur += trade.pnl;
    points.push(cur);
  });

  if (points.length === 1) points.push(cur);

  const min = Math.min(...points) * 0.99;
  const max = Math.max(...points) * 1.01;
  const range = max - min || 1;

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Curve
  ctx.beginPath();
  points.forEach((val, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 20) - 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Gradient fill
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function renderDailyPnLCanvas() {
  const canvas = document.getElementById('analytics-pnl-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const trades = state.history.slice(0, 10).reverse();
  if (!trades.length) return;

  const maxVal = Math.max(...trades.map(t => Math.abs(t.pnl))) * 1.15 || 500;
  const centerY = h / 2;

  // Center zero line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(w, centerY);
  ctx.stroke();

  const barWidth = Math.min(24 * dpr, (w / trades.length) * 0.6);
  const gap = w / trades.length;

  trades.forEach((t, i) => {
    const x = i * gap + gap / 2 - barWidth / 2;
    const barHeight = (Math.abs(t.pnl) / maxVal) * (centerY - 10);
    const isBull = t.pnl >= 0;

    ctx.fillStyle = isBull ? '#00c076' : '#ff4757';
    if (isBull) {
      ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);
    } else {
      ctx.fillRect(x, centerY, barWidth, barHeight);
    }
  });
}

function calculateAnalyticsMetrics() {
  const total = state.history.length;
  const winners = state.history.filter(h => h.pnl > 0);
  const losers = state.history.filter(h => h.pnl <= 0);

  const winRate = total > 0 ? ((winners.length / total) * 100).toFixed(1) : '0.0';
  const totalProfit = winners.reduce((acc, h) => acc + h.pnl, 0);
  const totalLoss = Math.abs(losers.reduce((acc, h) => acc + h.pnl, 0));
  const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : (totalProfit > 0 ? '99.9' : '0.00');

  const avgWin = winners.length > 0 ? totalProfit / winners.length : 0;
  const avgLoss = losers.length > 0 ? totalLoss / losers.length : 0;
  const riskReward = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '1:2.0';

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('metric-win-rate', `${winRate}%`);
  setEl('metric-total-trades', total.toString());
  setEl('metric-profit-factor', profitFactor);
  setEl('metric-avg-profit', formatCurrency(avgWin));
  setEl('metric-avg-loss', formatCurrency(avgLoss));
  setEl('metric-risk-reward', `1 : ${riskReward}`);
}

// ============================================================================
// ECONOMIC CALENDAR DATA (SIMULATED)
// ============================================================================
const CALENDAR_EVENTS = [
  { time: '08:30 GMT', cur: 'USD', event: 'Consumer Price Index (YoY)', impact: 'high', prev: '3.1%', fcast: '2.9%', actual: '2.8%' },
  { time: '09:00 GMT', cur: 'EUR', event: 'ECB Monetary Policy Statement', impact: 'high', prev: '4.25%', fcast: '4.00%', actual: '4.00%' },
  { time: '11:30 GMT', cur: 'GBP', event: 'Bank of England Governor Speech', impact: 'high', prev: '—', fcast: '—', actual: 'Simulated' },
  { time: '13:15 GMT', cur: 'USD', event: 'ADP Non-Farm Employment Change', impact: 'medium', prev: '143K', fcast: '150K', actual: '154K' },
  { time: '14:00 GMT', cur: 'USD', event: 'ISM Manufacturing PMI', impact: 'high', prev: '47.2', fcast: '47.5', actual: '47.8' },
  { time: '15:30 GMT', cur: 'CAD', event: 'BOC Interest Rate Decision', impact: 'high', prev: '4.75%', fcast: '4.50%', actual: '4.50%' },
  { time: '19:00 GMT', cur: 'USD', event: 'FOMC Meeting Minutes', impact: 'high', prev: '—', fcast: '—', actual: 'Simulated' },
  { time: '23:50 GMT', cur: 'JPY', event: 'Retail Sales (YoY)', impact: 'low', prev: '2.6%', fcast: '2.3%', actual: '2.4%' }
];

function renderEconomicCalendar(filterImpact = 'all') {
  const tbody = document.getElementById('calendar-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const list = filterImpact === 'all' ? CALENDAR_EVENTS : CALENDAR_EVENTS.filter(e => e.impact === filterImpact);

  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="tabular-nums" style="color: var(--text-secondary);">${item.time}</td>
      <td><b>${item.cur}</b></td>
      <td>${item.event}</td>
      <td><span class="impact-badge impact-${item.impact}">${item.impact}</span></td>
      <td class="tabular-nums text-right">${item.prev}</td>
      <td class="tabular-nums text-right">${item.fcast}</td>
      <td class="tabular-nums text-right font-bold" style="color: #38bdf8;">${item.actual}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================================
// SEARCH & PAIR SELECTION
// ============================================================================
function selectPair(symbol) {
  if (!PAIRS_CONFIG[symbol]) return;
  state.activePair = symbol;

  if (chartInstance) {
    chartInstance.setPair(symbol);
  }

  updateActivePairDisplay();
  updateOrderPanelMetrics();
  renderMarketTable();
  saveState();
}

function updateActivePairDisplay() {
  const sym = state.activePair;
  const cfg = PAIRS_CONFIG[sym];
  const data = livePrices[sym];

  const titleEl = document.getElementById('chart-pair-name');
  const priceEl = document.getElementById('chart-current-price');
  const sellBtnPrice = document.getElementById('sell-btn-price');
  const buyBtnPrice = document.getElementById('buy-btn-price');
  const quickSellPrice = document.getElementById('quick-sell-price');
  const quickBuyPrice = document.getElementById('quick-buy-price');

  if (titleEl) titleEl.textContent = sym;
  if (priceEl) {
    priceEl.innerHTML = `<span class="${data.changePct >= 0 ? 'text-bull' : 'text-bear'}">${formatPrice(sym, data.bid)}</span> ` +
      `<span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(${data.changePct >= 0 ? '+' : ''}${data.changePct.toFixed(2)}%)</span>`;
  }
  if (sellBtnPrice) sellBtnPrice.textContent = formatPrice(sym, data.bid);
  if (buyBtnPrice) buyBtnPrice.textContent = formatPrice(sym, data.ask);
  if (quickSellPrice) quickSellPrice.textContent = formatPrice(sym, data.bid);
  if (quickBuyPrice) quickBuyPrice.textContent = formatPrice(sym, data.ask);
}

function quickTrade(symbol, action) {
  selectPair(symbol);
  prepareOrder(action);
}

function updateOrderPanelMetrics() {
  const lotInput = document.getElementById('order-lot-size');
  const slInput = document.getElementById('order-stop-loss');
  const tpInput = document.getElementById('order-take-profit');
  const marginDisplay = document.getElementById('order-est-margin');
  const rrDisplay = document.getElementById('order-est-rr');
  const pipValDisplay = document.getElementById('order-pip-val');

  const lots = parseFloat(lotInput?.value) || 0.1;
  const pair = state.activePair;
  const cfg = PAIRS_CONFIG[pair];

  if (marginDisplay) {
    const margin = calculateEstimatedMargin(pair, lots);
    marginDisplay.textContent = formatCurrency(margin);
  }

  if (pipValDisplay && cfg) {
    const pipValue = cfg.pip * lots * cfg.mult;
    pipValDisplay.textContent = formatCurrency(pipValue);
  }

  if (rrDisplay) {
    const entry = livePrices[pair].ask;
    const sl = parseFloat(slInput?.value);
    const tp = parseFloat(tpInput?.value);
    if (sl && tp && Math.abs(entry - sl) > 0) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      const ratio = (reward / risk).toFixed(2);
      rrDisplay.textContent = `1 : ${ratio}`;
    } else {
      rrDisplay.textContent = '1 : 2.0 (Est)';
    }
  }
}

// ============================================================================
// NAVIGATION & MODALS
// ============================================================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));

  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) targetView.classList.add('active');

  const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeNav) activeNav.classList.add('active');

  const mobileNav = document.querySelector(`.mobile-nav-btn[data-tab="${tabId}"]`);
  if (mobileNav) mobileNav.classList.add('active');

  if (tabId === 'analytics') {
    setTimeout(renderAnalyticsCharts, 50);
  }
  if (tabId === 'dashboard' && chartInstance) {
    setTimeout(() => chartInstance.resize(), 50);
  }

  // Close mobile sidebar if open
  document.querySelector('.sidebar')?.classList.remove('mobile-open');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="flex: 1;">${message}</div>
    <button style="background: transparent; border: none; color: var(--text-muted); cursor: pointer;" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ============================================================================
// SEARCH DROPDOWN ENGINE
// ============================================================================
function setupSearchEngine() {
  const searchInput = document.getElementById('market-search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (!searchInput || !dropdown) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toUpperCase();
    if (!query) {
      dropdown.classList.remove('show');
      return;
    }

    const matches = Object.keys(PAIRS_CONFIG).filter(s => s.includes(query) || PAIRS_CONFIG[s].desc.toUpperCase().includes(query));
    if (!matches.length) {
      dropdown.innerHTML = `<div style="padding: 10px; color: var(--text-muted); text-align: center;">No matches found</div>`;
      dropdown.classList.add('show');
      return;
    }

    dropdown.innerHTML = matches.map(sym => `
      <div class="search-item" onclick="selectPair('${sym}'); document.getElementById('search-dropdown').classList.remove('show'); document.getElementById('market-search-input').value = '';">
        <div>
          <b>${sym}</b>
          <div style="font-size: 10px; color: var(--text-muted);">${PAIRS_CONFIG[sym].desc}</div>
        </div>
        <div class="tabular-nums font-bold">${formatPrice(sym, livePrices[sym].bid)}</div>
      </div>
    `).join('');
    dropdown.classList.add('show');
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

// ============================================================================
// UI HELPER FUNCTIONS & ACTIONS
// ============================================================================
function toggleSound() {
  state.settings.sound = !state.settings.sound;
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) btn.style.color = state.settings.sound ? 'var(--bull-green)' : 'var(--text-muted)';
  showToast(state.settings.sound ? 'Sound enabled' : 'Sound muted');
  saveState();
}

function toggleChartStyle() {
  state.chartType = state.chartType === 'candles' ? 'area' : 'candles';
  if (chartInstance) chartInstance.render();
  saveState();
}

function toggleSMA20() {
  state.indicators.sma20 = !state.indicators.sma20;
  if (chartInstance) chartInstance.render();
  saveState();
}

function resetChartZoom() {
  if (chartInstance) {
    chartInstance.zoom = 1;
    chartInstance.render();
  }
}

function setDemoLeverage(val) {
  state.account.leverage = parseInt(val, 10) || 100;
  updatePortfolioCalculations();
  saveState();
  showToast(`Leverage updated to 1:${state.account.leverage}`);
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================
function initApp() {
  loadSavedState();
  window.state = state;

  // Initialize Chart
  chartInstance = new TradingChart('trading-chart');
  window.chartInstance = chartInstance;

  // Initial UI Render
  renderMarketTable();
  renderOpenPositionsTable();
  renderOrdersTable();
  renderHistoryTable();
  renderWatchlistGrid();
  renderEconomicCalendar();
  updateActivePairDisplay();
  updatePortfolioCalculations();
  updateOrderPanelMetrics();
  setupSearchEngine();

  // Start Live Simulation Ticks
  initMarketSimulator();

  // Navigation Links
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // Sidebar Collapse
  const collapseBtn = document.getElementById('sidebar-collapse-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => chartInstance && chartInstance.resize(), 200);
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Chart Timeframe buttons
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTimeframe = btn.dataset.tf;
      chartInstance.setTimeframe(btn.dataset.tf);
    });
  });

  // Order Type Tabs (Market, Limit, Stop)
  document.querySelectorAll('.order-type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.order-type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const type = tab.dataset.type;
      const entryGroup = document.getElementById('order-entry-group');
      if (entryGroup) {
        entryGroup.style.display = type === 'MARKET' ? 'none' : 'flex';
      }
    });
  });

  // Lot Steppers
  document.querySelectorAll('.stepper-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const lotInput = document.getElementById('order-lot-size');
      if (lotInput) {
        lotInput.value = chip.dataset.lot;
        updateOrderPanelMetrics();
      }
    });
  });

  // Order Inputs live recalculation
  const lotInput = document.getElementById('order-lot-size');
  const slInput = document.getElementById('order-stop-loss');
  const tpInput = document.getElementById('order-take-profit');
  [lotInput, slInput, tpInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updateOrderPanelMetrics);
  });

  // Buy & Sell Buttons
  const sellBtn = document.getElementById('order-sell-btn');
  const buyBtn = document.getElementById('order-buy-btn');
  const quickSell = document.getElementById('quick-sell-btn');
  const quickBuy = document.getElementById('quick-buy-btn');

  if (sellBtn) sellBtn.addEventListener('click', () => prepareOrder('SELL'));
  if (buyBtn) buyBtn.addEventListener('click', () => prepareOrder('BUY'));
  if (quickSell) quickSell.addEventListener('click', () => prepareOrder('SELL'));
  if (quickBuy) quickBuy.addEventListener('click', () => prepareOrder('BUY'));

  // Notification Dropdown Toggle
  const notifBtn = document.getElementById('notif-bell-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', () => {
      notifDropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }
    });
  }

  // Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      state.settings.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      saveState();
      if (chartInstance) chartInstance.render();
      renderAnalyticsCharts();
    });
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'b' || e.key === 'B') {
      prepareOrder('BUY');
    } else if (e.key === 's' || e.key === 'S') {
      prepareOrder('SELL');
    } else if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
    } else if (e.key === '?' || e.key === 'k' || e.key === 'K') {
      openModal('shortcuts-modal');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Global window-level exports
window.state = state;
window.chartInstance = chartInstance;
window.toggleSound = toggleSound;
window.toggleChartStyle = toggleChartStyle;
window.toggleSMA20 = toggleSMA20;
window.resetChartZoom = resetChartZoom;
window.setDemoLeverage = setDemoLeverage;
window.switchTab = switchTab;
window.showToast = showToast;
window.saveState = saveState;
window.updatePortfolioCalculations = updatePortfolioCalculations;
window.renderMarketTable = renderMarketTable;
window.closeModal = closeModal;
window.openModal = openModal;
window.executeConfirmedOrder = executeConfirmedOrder;
window.closePosition = closePosition;
window.closeAllPositions = closeAllPositions;
window.openModifyModal = openModifyModal;
window.saveModifiedSLTP = saveModifiedSLTP;
window.addDemoFunds = addDemoFunds;
window.resetDemoAccount = resetDemoAccount;
window.selectPair = selectPair;
window.removeWatchlistPair = removeWatchlistPair;
window.addPairToWatchlist = addPairToWatchlist;
window.quickTrade = quickTrade;
window.cancelOrder = cancelOrder;
window.renderHistoryTable = renderHistoryTable;
window.renderEconomicCalendar = renderEconomicCalendar;

