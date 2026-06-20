import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import {
  Send, History, PiggyBank, Film, Smartphone, Receipt, Wallet,
  ShieldCheck, Bell, Gift, Star, Globe, Sparkles, ChevronRight,
  Eye, EyeOff, QrCode, BadgePercent, Lock, WalletCards,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Award,
  CreditCard, Landmark, BarChart2, Percent,
  CircleDollarSign, Wifi, Tv, Droplets, Zap,
} from 'lucide-react';

/* ──────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────── */
const fmt   = (n) => n?.toLocaleString('vi-VN') ?? '0';
const fmtM  = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

/* ──────────────────────────────────────────────────
   AREA CHART (SVG)  — smooth curved spending chart
────────────────────────────────────────────────── */
function AreaChart({ data, labels, activeIdx, onSelect, accentColor = '#4ADE80', height = 110 }) {
  const W = 340, H = height, PAD_X = 8, PAD_Y = 12;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.85;
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2);
    const y = PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2);
    return [x, y];
  });

  /* build smooth bezier path */
  const linePath = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const cx1 = px + (x - px) * 0.5, cy1 = py;
    const cx2 = px + (x - px) * 0.5, cy2 = y;
    return `${acc} C${cx1},${cy1} ${cx2},${cy2} ${x},${y}`;
  }, '');
  const areaPath = `${linePath} L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z`;

  const gradId = 'areaGrad';
  const [ax, ay] = pts[activeIdx] || pts[0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={accentColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* grid lines */}
      {[0.25, 0.5, 0.75].map((t) => {
        const y = PAD_Y + t * (H - PAD_Y * 2);
        return <line key={t} x1={PAD_X} x2={W - PAD_X} y1={y} y2={y}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 4" />;
      })}

      {/* line */}
      <path d={linePath} fill="none" stroke={accentColor} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

      {/* dots + tap areas */}
      {pts.map(([x, y], i) => (
        <g key={i} onClick={() => onSelect(i)} style={{ cursor:'pointer' }}>
          <rect x={x - 16} y={0} width={32} height={H} fill="transparent" />
          {i === activeIdx ? (
            <>
              <line x1={x} y1={PAD_Y - 4} x2={x} y2={H} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3"/>
              <circle cx={x} cy={y} r={6} fill="#0B1832" stroke={accentColor} strokeWidth="2.5"/>
              <circle cx={x} cy={y} r={3} fill={accentColor}/>
            </>
          ) : (
            <circle cx={x} cy={y} r={3} fill="rgba(255,255,255,0.18)"
              onMouseEnter={(e) => { e.target.setAttribute('r','5'); e.target.setAttribute('fill', accentColor); }}
              onMouseLeave={(e) => { e.target.setAttribute('r','3'); e.target.setAttribute('fill','rgba(255,255,255,0.18)'); }}
            />
          )}
        </g>
      ))}

      {/* tooltip above active point */}
      {(() => {
        const tx = Math.min(Math.max(ax, 28), W - 28);
        const ty = Math.max(ay - 36, 4);
        const val = fmtM(data[activeIdx] * 10_000);
        return (
          <g>
            <rect x={tx - 28} y={ty} width={56} height={22} rx={6}
              fill={accentColor} opacity="0.95"/>
            <text x={tx} y={ty + 15} textAnchor="middle"
              fill="#041206" fontSize="11" fontWeight="700">{val}₫</text>
          </g>
        );
      })()}
    </svg>
  );
}

/* ──────────────────────────────────────────────────
   DONUT CHART (SVG) — spending by category
────────────────────────────────────────────────── */
function DonutChart({ segments, size = 120 }) {
  const r = 44, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, sg) => s + sg.value, 0);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18"/>
      {segments.map((sg, i) => {
        const pct = sg.value / total;
        const dash = pct * circ;
        const gap  = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={sg.color} strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += pct;
        return el;
      })}
      {/* center text */}
      <text x={cx} y={cy - 5}  textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="15" fontWeight="800">{Math.round(segments[0]?.value / total * 100)}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)"  fontSize="9"  fontWeight="600">{segments[0]?.label}</text>
    </svg>
  );
}

/* ──────────────────────────────────────────────────
   RING PROGRESS
────────────────────────────────────────────────── */
function Ring({ pct, size = 56, stroke = 6, color = '#F4D98A' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset 1s ease' }}/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────
   STATIC DATA
────────────────────────────────────────────────── */
const spendingData  = [320, 410, 370, 520, 490, 600, 440, 610, 570, 720, 530, 680];
const incomeData    = [900, 900, 900, 950, 900, 1050, 900, 900, 920, 900, 900, 960];
const MONTHS        = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const spendCategories = [
  { label:'Ăn uống',    value:38, color:'#4ADE80' },
  { label:'Mua sắm',    value:27, color:'#60A5FA' },
  { label:'Di chuyển',  value:15, color:'#F4D98A' },
  { label:'Hóa đơn',    value:12, color:'#F472B6' },
  { label:'Khác',       value:8,  color:'rgba(255,255,255,0.25)' },
];

const currencies = [
  { code:'USD', flag:'🇺🇸', buy:25_340, sell:25_620, change:+0.12 },
  { code:'EUR', flag:'🇪🇺', buy:27_180, sell:27_510, change:-0.08 },
  { code:'JPY', flag:'🇯🇵', buy:163.4,  sell:165.2,  change:+0.31 },
  { code:'SGD', flag:'🇸🇬', buy:18_720, sell:18_990, change:-0.05 },
];

const quickServices = [
  { title:'Chuyển tiền', desc:'24/7 miễn phí',   icon:<Send size={19} strokeWidth={2.2}/>,       bg:'linear-gradient(135deg,#1D4ED8,#3B82F6)', link:'/transfer' },
  { title:'Lịch sử GD',  desc:'Theo dõi GD',     icon:<History size={19} strokeWidth={2.2}/>,    bg:'linear-gradient(135deg,#059669,#34D399)', link:'/history' },
  { title:'QR Pay',      desc:'Quét & thanh toán',icon:<QrCode size={19} strokeWidth={2.2}/>,     bg:'linear-gradient(135deg,#7C3AED,#A78BFA)', link:'/qr' },
  { title:'Ví điện tử',  desc:'Liên kết ví',     icon:<Wallet size={19} strokeWidth={2.2}/>,     bg:'linear-gradient(135deg,#BE185D,#F472B6)', link:'/wallet' },
  { title:'Tiết kiệm',   desc:'Lãi suất 8.2%',   icon:<PiggyBank size={19} strokeWidth={2.2}/>,  bg:'linear-gradient(135deg,#B45309,#FCD34D)', link:'/saving' },
  { title:'Nạp ĐT',      desc:'Chiết khấu 5%',   icon:<Smartphone size={19} strokeWidth={2.2}/>, bg:'linear-gradient(135deg,#0E7490,#22D3EE)', link:'/topup' },
  { title:'Thanh toán',  desc:'Điện nước • Net',  icon:<Receipt size={19} strokeWidth={2.2}/>,   bg:'linear-gradient(135deg,#DC2626,#FCA5A5)', link:'/payment' },
  { title:'Đặt vé phim', desc:'CGV • Galaxy',     icon:<Film size={19} strokeWidth={2.2}/>,      bg:'linear-gradient(135deg,#6D28D9,#C4B5FD)', link:'/movie' },
];

const bills = [
  { icon:<Zap size={18}/>,     label:'Điện lực',  amount:'Chưa có hóa đơn', status:'ok',   color:'#F4D98A' },
  { icon:<Droplets size={18}/>,label:'Nước',      amount:'Chưa có hóa đơn', status:'ok',   color:'#60A5FA' },
  { icon:<Wifi size={18}/>,    label:'Internet',  amount:'Đến hạn 15/06',   status:'warn', color:'#FB923C' },
  { icon:<Tv size={18}/>,      label:'Truyền hình',amount:'Đã thanh toán',  status:'done', color:'#4ADE80' },
];

const notices = [
  { icon:<ShieldCheck size={17} strokeWidth={2.2}/>, title:'Bảo mật tài khoản', desc:'Không chia sẻ mã OTP cho bất kỳ ai.' },
  { icon:<Bell size={17} strokeWidth={2.2}/>,        title:'Thông báo hệ thống', desc:'Bảo trì 00:00–02:00 Chủ Nhật.' },
  { icon:<BadgePercent size={17} strokeWidth={2.2}/>,title:'Ưu đãi mới', desc:'Miễn phí chuyển khoản liên ngân hàng tháng 6.' },
];

/* ──────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────── */
export default function Dashboard() {
  const [profile, setProfile]       = useState(null);
  const [showBal, setShowBal]       = useState(true);
  const [chartTab, setChartTab]     = useState('spend'); // 'spend' | 'income'
  const [activeMonth, setActiveMonth] = useState(11);

  useEffect(() => {
    axios.get('/users/profile').then((r) => setProfile(r.data));
  }, []);

  const balance  = profile?.balance ?? 48_350_000;
  const income   = 15_400_000;
  const expense  =  4_200_000;
  const saving   =  6_000_000;
  const loyaltyPts  = 4_750;
  const loyaltyMax  = 10_000;

  const chartData   = chartTab === 'spend' ? spendingData : incomeData;
  const chartColor  = chartTab === 'spend' ? '#4ADE80' : '#60A5FA';
  const totalChart  = chartData.reduce((a, b) => a + b, 0);

  /* ── STYLES ── */
  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '28px',
    backdropFilter: 'blur(16px)',
  };

  const pill = (active) => ({
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
    transition: '0.2s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg,#040C1C 0%,#071525 50%,#081A2E 100%)',
      paddingBottom: '48px',
      color: '#fff',
      fontFamily: '"DM Sans", sans-serif',
    }}>

      {/* ════════════════ HEADER ════════════════ */}
      <div style={{ padding:'22px 22px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:0 }}>Xin chào trở lại 👋</p>
          <h1 style={{ margin:'4px 0 0', fontSize:'26px', fontWeight:'800', letterSpacing:'-0.03em' }}>
            {profile?.fullName || 'YN User'}
          </h1>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <button style={{
            width:'42px', height:'42px', borderRadius:'14px',
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            position:'relative',
          }}>
            <Bell size={19} color="#fff" strokeWidth={2.2}/>
            <span style={{
              position:'absolute', top:'9px', right:'9px', width:'7px', height:'7px',
              borderRadius:'50%', background:'#EF4444', border:'1.5px solid #040C1C',
            }}/>
          </button>
          <div style={{
            width:'42px', height:'42px', borderRadius:'14px',
            background:'linear-gradient(135deg,#F4D98A,#C9A84C)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#071120', fontWeight:'800', fontSize:'18px',
            boxShadow:'0 6px 22px rgba(201,168,76,0.35)',
          }}>Y</div>
        </div>
      </div>

      {/* ════════════════ PREMIUM CARD ════════════════ */}
      <div style={{ padding:'20px 22px 0' }}>
        <div style={{
          position:'relative', overflow:'hidden', borderRadius:'32px', padding:'28px',
          background:'linear-gradient(140deg,#0B1D42 0%,#153468 55%,#0C1930 100%)',
          border:'1px solid rgba(255,255,255,0.11)',
          boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
        }}>
          {/* decorative circles */}
          <div style={{ position:'absolute', top:'-80px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(96,165,250,0.07)' }}/>
          <div style={{ position:'absolute', bottom:'-90px', left:'-70px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(201,168,76,0.07)' }}/>
          {/* shimmer line */}
          <div style={{ position:'absolute', top:'0', left:'0', right:'0', height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)' }}/>

          <div style={{ position:'relative', zIndex:2 }}>
            {/* top row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.38)', fontSize:'10px', letterSpacing:'0.22em', fontWeight:'700', margin:0 }}>YN BANKING PREMIUM</p>
                <p style={{ margin:'8px 0 0', fontSize:'14px', fontWeight:'600', letterSpacing:'0.16em', color:'rgba(255,255,255,0.7)', fontFamily:'monospace' }}>
                  {profile?.accountNumber || '•••• •••• •••• 4821'}
                </p>
              </div>
              {/* chip */}
              <div style={{
                width:'56px', height:'42px', borderRadius:'12px',
                background:'linear-gradient(135deg,#F4D98A,#C9A84C)',
                position:'relative', overflow:'hidden',
                boxShadow:'0 6px 18px rgba(201,168,76,0.3)',
              }}>
                <div style={{ position:'absolute', left:'11px', top:'7px', width:'13px', height:'26px', borderRadius:'5px', border:'1.5px solid rgba(0,0,0,0.15)' }}/>
                <div style={{ position:'absolute', left:'27px', top:'14px', width:'18px', height:'1.5px', background:'rgba(0,0,0,0.12)' }}/>
                <div style={{ position:'absolute', left:'27px', top:'19px', width:'18px', height:'1.5px', background:'rgba(0,0,0,0.12)' }}/>
              </div>
            </div>

            {/* balance */}
            <p style={{ color:'rgba(255,255,255,0.42)', fontSize:'12px', marginBottom:'8px' }}>Tổng tài sản khả dụng</p>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <h1 style={{ margin:0, fontSize:'36px', fontWeight:'800', lineHeight:1, letterSpacing:'-0.04em', flex:1 }}>
                {showBal ? `${fmt(balance)} ₫` : '••••••••'}
              </h1>
              <button onClick={() => setShowBal(!showBal)} style={{
                width:'42px', height:'42px', borderRadius:'13px',
                border:'1px solid rgba(255,255,255,0.10)',
                background:'rgba(255,255,255,0.07)', backdropFilter:'blur(12px)',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              }}>
                {showBal ? <Eye size={17} color="#fff" strokeWidth={2.2}/> : <EyeOff size={17} color="#fff" strokeWidth={2.2}/>}
              </button>
            </div>

            {/* 3-stat row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'22px' }}>
              {[
                { label:'Thu nhập', val:income,  color:'#4ADE80', icon:<ArrowDownLeft size={13}/> },
                { label:'Chi tiêu', val:expense, color:'#F87171', icon:<ArrowUpRight size={13}/> },
                { label:'Tiết kiệm',val:saving,  color:'#60A5FA', icon:<PiggyBank size={13}/> },
              ].map((item) => (
                <div key={item.label} style={{
                  background:'rgba(255,255,255,0.06)', borderRadius:'16px', padding:'11px 12px',
                  border:'1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px', color:item.color }}>{item.icon}
                    <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.42)', fontWeight:'600' }}>{item.label}</span>
                  </div>
                  <p style={{ margin:0, fontSize:'13px', fontWeight:'700', color:item.color, letterSpacing:'-0.01em' }}>
                    {showBal ? `${fmtM(item.val)}₫` : '••••'}
                  </p>
                </div>
              ))}
            </div>

            {/* footer */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px' }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.38)', margin:0, fontSize:'10px' }}>Chủ tài khoản</p>
                <p style={{ margin:'4px 0 0', fontWeight:'700', fontSize:'14px' }}>{profile?.fullName || 'YN User'}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                <WalletCards size={19} color="#F4D98A" strokeWidth={2.2}/>
                <span style={{ fontWeight:'800', fontSize:'19px', color:'#F4D98A', letterSpacing:'0.06em' }}>VISA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ QUICK ACTIONS ════════════════ */}
      <div style={{ padding:'20px 22px 0' }}>
        <div style={{ ...card, padding:'18px 16px 14px', display:'flex', justifyContent:'space-around' }}>
          {[
            { label:'Chuyển tiền', icon:<Send size={20} strokeWidth={2.2}/>,    color:'#3B82F6', link:'/transfer' },
            { label:'QR Pay',      icon:<QrCode size={20} strokeWidth={2.2}/>,  color:'#8B5CF6', link:'/qr' },
            { label:'Nạp tiền',    icon:<Wallet size={20} strokeWidth={2.2}/>,  color:'#10B981', link:'/wallet' },
            { label:'Lịch sử',    icon:<History size={20} strokeWidth={2.2}/>, color:'#F59E0B', link:'/history' },
            { label:'Vay vốn',    icon:<Landmark size={20} strokeWidth={2.2}/>,color:'#EC4899', link:'/loan' },
          ].map((item) => (
            <Link key={item.label} to={item.link} style={{ textDecoration:'none', textAlign:'center', flex:1 }}>
              <div style={{
                width:'46px', height:'46px', borderRadius:'16px',
                background:`${item.color}18`, border:`1px solid ${item.color}28`,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:item.color, margin:'0 auto 8px',
              }}>{item.icon}</div>
              <p style={{ margin:0, fontSize:'10px', color:'rgba(255,255,255,0.55)', fontWeight:'600', lineHeight:1.3 }}>{item.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ════════════════ ANALYTICS CHART ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ ...card, padding:'22px 20px 18px' }}>

          {/* header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
            <div>
              <p style={{ margin:0, fontSize:'16px', fontWeight:'700' }}>Phân tích tài chính</p>
              <p style={{ margin:'3px 0 0', fontSize:'12px', color:'rgba(255,255,255,0.38)' }}>Năm 2025</p>
            </div>
            {/* tab toggle */}
            <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:'999px', padding:'3px', gap:'2px' }}>
              <button style={pill(chartTab==='spend')}  onClick={() => setChartTab('spend')}>Chi tiêu</button>
              <button style={pill(chartTab==='income')} onClick={() => setChartTab('income')}>Thu nhập</button>
            </div>
          </div>

          {/* big stat */}
          <div style={{ display:'flex', alignItems:'baseline', gap:'10px', margin:'14px 0 2px' }}>
            <span style={{ fontSize:'28px', fontWeight:'800', color:chartColor, letterSpacing:'-0.03em' }}>
              {fmtM(chartData[activeMonth] * 10_000)}₫
            </span>
            <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.38)' }}>{MONTHS[activeMonth]} 2025</span>
            <div style={{
              display:'flex', alignItems:'center', gap:'4px',
              background: chartTab==='spend' ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
              borderRadius:'999px', padding:'3px 9px',
            }}>
              {chartTab==='spend'
                ? <TrendingDown size={12} color="#F87171" strokeWidth={2.5}/>
                : <TrendingUp   size={12} color="#4ADE80" strokeWidth={2.5}/>}
              <span style={{ fontSize:'11px', color: chartTab==='spend' ? '#F87171' : '#4ADE80', fontWeight:'700' }}>
                {chartTab==='spend' ? '-8.4%' : '+6.7%'}
              </span>
            </div>
          </div>

          {/* area chart */}
          <div style={{ margin:'16px -4px 0' }}>
            <AreaChart
              data={chartData}
              labels={MONTHS}
              activeIdx={activeMonth}
              onSelect={setActiveMonth}
              accentColor={chartColor}
            />
          </div>

          {/* month labels */}
          <div style={{ display:'flex', gap:'0', marginTop:'6px', paddingLeft:'4px', paddingRight:'4px' }}>
            {MONTHS.map((m, i) => (
              <div key={i} style={{
                flex:1, textAlign:'center', fontSize:'9px',
                color: i===activeMonth ? chartColor : 'rgba(255,255,255,0.25)',
                fontWeight: i===activeMonth ? '800' : '400',
                cursor:'pointer',
              }} onClick={() => setActiveMonth(i)}>{m}</div>
            ))}
          </div>

          {/* summary row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'16px' }}>
            {[
              { label:'Trung bình/tháng', val: Math.round(totalChart / 12) * 10_000 },
              { label:'Cao nhất',         val: Math.max(...chartData)      * 10_000 },
              { label:'Thấp nhất',        val: Math.min(...chartData)      * 10_000 },
            ].map((s) => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <p style={{ margin:0, fontSize:'13px', fontWeight:'700', color:chartColor }}>{fmtM(s.val)}₫</p>
                <p style={{ margin:'3px 0 0', fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ SPENDING BREAKDOWN ════════════════ */}
      <div style={{ padding:'18px 22px 0' }}>
        <div style={{ ...card, padding:'20px' }}>
          <p style={{ margin:'0 0 16px', fontSize:'16px', fontWeight:'700' }}>Cơ cấu chi tiêu tháng này</p>
          <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
            <DonutChart segments={spendCategories} size={120}/>
            <div style={{ flex:1, display:'grid', gap:'10px' }}>
              {spendCategories.map((sg) => (
                <div key={sg.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:sg.color, flexShrink:0 }}/>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>{sg.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'60px', height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                      <div style={{ width:`${sg.value}%`, height:'100%', background:sg.color, borderRadius:'2px' }}/>
                    </div>
                    <span style={{ fontSize:'12px', fontWeight:'700', minWidth:'28px', textAlign:'right' }}>{sg.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ PROMOTIONS ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>Ưu đãi dành cho bạn</h2>
          <span style={{ color:'#60A5FA', fontSize:'13px', cursor:'pointer' }}>Xem tất cả</span>
        </div>
        <div style={{ display:'flex', gap:'14px', overflowX:'auto', paddingBottom:'6px', marginLeft:'-2px', paddingLeft:'2px' }}>
          {[
            { title:'Hoàn tiền 5%',  desc:'Thanh toán VISA online', sub:'Hạn: 30/06/2025', color:'linear-gradient(135deg,#1D4ED8,#2563EB)', badge:'HOT' },
            { title:'CGV giảm 50%', desc:'Mỗi thứ 6 hàng tuần',   sub:'Áp dụng mọi rạp', color:'linear-gradient(135deg,#BE185D,#DB2777)', badge:'MỚI' },
            { title:'Lãi suất 8.2%',desc:'Gửi tiết kiệm online',  sub:'Kỳ hạn 6–12 tháng',color:'linear-gradient(135deg,#047857,#059669)', badge:'' },
            { title:'Vay 0% lãi',   desc:'Kỳ hạn 3 tháng đầu',   sub:'Tối đa 50 triệu',  color:'linear-gradient(135deg,#6D28D9,#7C3AED)', badge:'VIP' },
          ].map((item, i) => (
            <div key={i} style={{
              minWidth:'220px', borderRadius:'24px', padding:'20px',
              background:item.color, position:'relative', overflow:'hidden',
              boxShadow:'0 14px 36px rgba(0,0,0,0.3)', cursor:'pointer', flexShrink:0,
            }}>
              {item.badge && (
                <span style={{
                  position:'absolute', top:'13px', right:'13px',
                  background:'rgba(255,255,255,0.18)', backdropFilter:'blur(6px)',
                  borderRadius:'20px', padding:'3px 9px',
                  fontSize:'9px', fontWeight:'800', letterSpacing:'0.06em',
                }}>{item.badge}</span>
              )}
              <div style={{ position:'absolute', top:'-25px', right:'-25px', width:'90px', height:'90px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }}/>
              <Gift size={20} strokeWidth={2.2} style={{ marginBottom:'13px', opacity:0.9 }}/>
              <h3 style={{ margin:0, fontSize:'20px', fontWeight:'800', lineHeight:1.1 }}>{item.title}</h3>
              <p style={{ margin:'7px 0 3px', color:'rgba(255,255,255,0.85)', fontSize:'12px' }}>{item.desc}</p>
              <p style={{ margin:0, color:'rgba(255,255,255,0.45)', fontSize:'10px' }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ QUICK SERVICES ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>Tiện ích nổi bật</h2>
          <span style={{ color:'#60A5FA', fontSize:'13px', cursor:'pointer' }}>Xem tất cả</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
          {quickServices.map((item, i) => (
            <Link key={i} to={item.link} style={{
              textDecoration:'none', color:'#fff',
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:'20px', padding:'14px 8px 12px', textAlign:'center',
              transition:'transform 0.22s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; }}
            >
              <div style={{
                width:'44px', height:'44px', borderRadius:'14px', background:item.bg,
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 9px', boxShadow:'0 6px 18px rgba(0,0,0,0.22)',
              }}>{item.icon}</div>
              <p style={{ margin:0, fontSize:'11px', fontWeight:'700', lineHeight:1.3 }}>{item.title}</p>
              <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,0.38)', fontSize:'9px', lineHeight:1.4 }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ════════════════ BILLS TRACKER ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>Theo dõi hóa đơn</h2>
          <span style={{ color:'#60A5FA', fontSize:'13px', cursor:'pointer' }}>Quản lý</span>
        </div>
        <div style={{ ...card, padding:'6px 0', overflow:'hidden' }}>
          {bills.map((b, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'12px', padding:'12px 18px',
              borderBottom: i < bills.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{
                width:'40px', height:'40px', borderRadius:'13px', flexShrink:0,
                background:`${b.color}18`, border:`1px solid ${b.color}28`,
                display:'flex', alignItems:'center', justifyContent:'center', color:b.color,
              }}>{b.icon}</div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:'14px', fontWeight:'700' }}>{b.label}</p>
                <p style={{ margin:'2px 0 0', fontSize:'11px', color:'rgba(255,255,255,0.38)' }}>{b.amount}</p>
              </div>
              <span style={{
                fontSize:'10px', fontWeight:'700', padding:'4px 10px', borderRadius:'999px',
                background: b.status==='warn' ? 'rgba(251,146,60,0.15)' : b.status==='done' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.08)',
                color:       b.status==='warn' ? '#FB923C'              : b.status==='done' ? '#4ADE80'               : 'rgba(255,255,255,0.45)',
              }}>
                {b.status==='warn' ? 'Sắp đến hạn' : b.status==='done' ? 'Hoàn tất' : 'Chờ hóa đơn'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ LOYALTY ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{
          background:'linear-gradient(135deg,#1A0E04,#2D1C08)',
          border:'1px solid rgba(244,217,138,0.14)', borderRadius:'28px', padding:'22px',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(244,217,138,0.04)' }}/>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(244,217,138,0.25),transparent)' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px' }}>
            <div style={{ position:'relative' }}>
              <Ring pct={Math.round(loyaltyPts / loyaltyMax * 100)} size={60} stroke={6} color="#F4D98A"/>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Award size={18} color="#F4D98A" strokeWidth={2.2}/>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:'12px', color:'rgba(244,217,138,0.6)', fontWeight:'600' }}>YN GOLD MEMBER</p>
              <p style={{ margin:'4px 0 0', fontSize:'24px', fontWeight:'800', letterSpacing:'-0.02em' }}>
                {fmt(loyaltyPts)} <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.38)', fontWeight:'400' }}>điểm</span>
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ margin:0, fontSize:'10px', color:'rgba(255,255,255,0.38)' }}>Còn thiếu</p>
              <p style={{ margin:'3px 0 0', fontWeight:'700', color:'#F4D98A', fontSize:'15px' }}>{fmt(loyaltyMax - loyaltyPts)}</p>
              <p style={{ margin:'1px 0 0', fontSize:'9px', color:'rgba(255,255,255,0.28)' }}>lên Platinum</p>
            </div>
          </div>
          {/* progress bar */}
          <div style={{ width:'100%', height:'5px', borderRadius:'999px', background:'rgba(255,255,255,0.1)', overflow:'hidden', marginBottom:'14px' }}>
            <div style={{ width:`${loyaltyPts / loyaltyMax * 100}%`, height:'100%', background:'linear-gradient(90deg,#C9A84C,#F4D98A)', borderRadius:'999px', transition:'width 1s ease' }}/>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            {[{ l:'Đổi quà', s:'Từ 1,000 điểm' }, { l:'Ưu đãi Gold', s:'Xem đặc quyền' }].map((b) => (
              <button key={b.l} style={{
                flex:1, padding:'10px', borderRadius:'14px', cursor:'pointer',
                background:'rgba(244,217,138,0.09)', border:'1px solid rgba(244,217,138,0.18)',
                color:'#F4D98A',
              }}>
                <p style={{ margin:0, fontSize:'13px', fontWeight:'700' }}>{b.l}</p>
                <p style={{ margin:0, fontSize:'10px', color:'rgba(244,217,138,0.5)' }}>{b.s}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ EXCHANGE RATES ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>Tỷ giá ngoại tệ</h2>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>Cập nhật 09:00</span>
        </div>
        <div style={{ ...card, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 56px', padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            {['Tiền tệ','Mua','Bán','±'].map((h) => (
              <span key={h} style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)', fontWeight:'700', letterSpacing:'0.1em' }}>{h}</span>
            ))}
          </div>
          {currencies.map((c, i) => (
            <div key={c.code} style={{
              display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 56px',
              padding:'12px 16px', alignItems:'center',
              borderBottom: i < currencies.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'17px' }}>{c.flag}</span>
                <span style={{ fontWeight:'700', fontSize:'13px' }}>{c.code}</span>
              </div>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.72)' }}>{c.buy.toLocaleString()}</span>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.72)' }}>{c.sell.toLocaleString()}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'3px', color: c.change > 0 ? '#4ADE80' : '#F87171' }}>
                {c.change > 0 ? <TrendingUp size={12} strokeWidth={2.5}/> : <TrendingDown size={12} strokeWidth={2.5}/>}
                <span style={{ fontSize:'10px', fontWeight:'700' }}>{c.change > 0 ? '+' : ''}{c.change}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ SAVINGS PRODUCTS ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h2 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>Sản phẩm sinh lời</h2>
          <span style={{ color:'#60A5FA', fontSize:'13px', cursor:'pointer' }}>Chi tiết</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[
            { icon:<PiggyBank size={22} strokeWidth={2.2} color="#4ADE80"/>,     title:'Tiết kiệm online', rate:'8.2%/năm',  desc:'Kỳ hạn 12 tháng', tag:'Phổ biến', bg:'linear-gradient(135deg,#052E16,#065F46)' },
            { icon:<BarChart2 size={22} strokeWidth={2.2} color="#60A5FA"/>,     title:'Đầu tư linh hoạt', rate:'10–15%',    desc:'Danh mục đa dạng', tag:'Mới',      bg:'linear-gradient(135deg,#0C1B3A,#1E3A5F)' },
            { icon:<Percent size={22} strokeWidth={2.2} color="#F4D98A"/>,       title:'Trái phiếu DN',    rate:'9.5%/năm',  desc:'Kỳ hạn 24 tháng', tag:'An toàn',  bg:'linear-gradient(135deg,#1C1005,#3B2006)' },
            { icon:<CircleDollarSign size={22} strokeWidth={2.2} color="#F472B6"/>, title:'Quỹ mở YNFUND', rate:'12–18%',   desc:'Định kỳ hàng tháng',tag:'Hot',      bg:'linear-gradient(135deg,#2D0626,#5C0B44)' },
          ].map((item, i) => (
            <div key={i} style={{ borderRadius:'22px', padding:'18px', background:item.bg, border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', position:'relative', overflow:'hidden' }}>
              <span style={{
                position:'absolute', top:'12px', right:'12px',
                fontSize:'9px', fontWeight:'800', padding:'3px 8px', borderRadius:'999px',
                background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.8)',
              }}>{item.tag}</span>
              <div style={{ marginBottom:'12px' }}>{item.icon}</div>
              <p style={{ margin:0, fontSize:'13px', fontWeight:'700', lineHeight:1.3 }}>{item.title}</p>
              <p style={{ margin:'6px 0 2px', fontSize:'20px', fontWeight:'800', letterSpacing:'-0.02em' }}>{item.rate}</p>
              <p style={{ margin:0, fontSize:'11px', color:'rgba(255,255,255,0.38)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ FEATURES 2×2 ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <h2 style={{ margin:'0 0 14px', fontSize:'18px', fontWeight:'700' }}>Tính năng cao cấp</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[
            { icon:<Globe size={22} strokeWidth={2.2} color="#60A5FA"/>,       title:'Thanh toán quốc tế', desc:'Giao dịch toàn cầu bảo mật', bg:'linear-gradient(135deg,#0F172A,#1E293B)' },
            { icon:<Star size={22} strokeWidth={2.2} color="#F4D98A"/>,         title:'Thành viên Premium', desc:'Ưu đãi sân bay & hoàn tiền', bg:'linear-gradient(135deg,#1A0E04,#1E293B)' },
            { icon:<CreditCard size={22} strokeWidth={2.2} color="#A78BFA"/>,  title:'Thẻ ảo tức thì',    desc:'Phát hành thẻ trong 60 giây', bg:'linear-gradient(135deg,#1E1B4B,#2E1065)' },
            { icon:<ShieldCheck size={22} strokeWidth={2.2} color="#4ADE80"/>, title:'Bảo hiểm số',       desc:'Bảo vệ giao dịch toàn diện',  bg:'linear-gradient(135deg,#052E16,#0F172A)' },
          ].map((item, i) => (
            <div key={i} style={{
              borderRadius:'22px', padding:'18px',
              background:item.bg, border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer',
            }}>
              <div style={{ marginBottom:'11px' }}>{item.icon}</div>
              <h3 style={{ margin:0, fontSize:'14px', fontWeight:'700', lineHeight:1.3 }}>{item.title}</h3>
              <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.42)', fontSize:'11px', lineHeight:1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ SECURITY ════════════════ */}
      <div style={{ padding:'22px 22px 0' }}>
        <div style={{ ...card, padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'13px', background:'linear-gradient(135deg,#1D4ED8,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Lock size={18} strokeWidth={2.2}/>
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:'15px', fontWeight:'700' }}>Trung tâm bảo mật</h3>
              <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,0.38)', fontSize:'12px' }}>Bảo vệ tài khoản của bạn</p>
            </div>
          </div>
          <div style={{ display:'grid', gap:'9px' }}>
            {notices.map((item, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)',
                borderRadius:'16px', padding:'11px 13px',
              }}>
                <div style={{ display:'flex', gap:'11px', alignItems:'center' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'11px', background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>{item.icon}</div>
                  <div>
                    <p style={{ margin:'0 0 2px', fontWeight:'700', fontSize:'13px' }}>{item.title}</p>
                    <p style={{ margin:0, color:'rgba(255,255,255,0.38)', fontSize:'11px' }}>{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={15} color="rgba(255,255,255,0.3)"/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════ FOOTER ════════════════ */}
      <div style={{ textAlign:'center', padding:'28px 0 10px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'9px 18px', borderRadius:'999px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <Sparkles size={14} strokeWidth={2.2} color="#F4D98A"/>
          <span style={{ color:'rgba(255,255,255,0.42)', fontSize:'11px' }}>YN Banking • Secure Digital Banking Experience</span>
        </div>
      </div>

    </div>
  );
}