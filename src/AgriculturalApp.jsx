import { useState, useRef, useEffect } from "react";
import {
  Leaf, Cloud, TrendingUp, Loader, Eye, EyeOff,
  LogOut, MapPin, Wind, Droplets, AlertCircle,
  ChevronDown, ChevronUp, RefreshCw, Sprout,
  ThumbsUp, Upload, Camera, Search, Globe, Share2
} from "lucide-react";
import { LANGUAGES, t } from "./i18n.js";
import AgroSenseLogo from "./AgroSenseLogo.jsx";
import { BRAND, COLORS as CL, GRADIENTS as GR, SHADOWS as SH, RADIUS as RA, FONTS as FN } from "./brand.js";

/* ═══════════════════════════════════════
   CONFIG
═══════════════════════════════════════ */
const API         = "http://localhost:5000/api";
// ⚠️  Get your FREE key at https://openweathermap.org/api → paste below
const WEATHER_KEY = "51c5817851b7e9f6d44689629ab9f785"; // replace if expired
const STORE_KEY   = "agrosense_v1";

/* shorthand tokens */
const G = CL.gray;

/* ═══════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:${FN.body};background:#f0fdf4;-webkit-font-smoothing:antialiased;overflow-x:hidden}

      /* Animations */
      @keyframes fadeUp   {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
      @keyframes popIn    {0%{opacity:0;transform:scale(.82)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
      @keyframes spin     {to{transform:rotate(360deg)}}
      @keyframes slideDown{from{opacity:0;max-height:0;padding:0}to{opacity:1;max-height:900px}}
      @keyframes float    {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes eyeBlink {0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(0.08)}}
      @keyframes earWiggle{0%,100%{transform:rotate(0deg)}50%{transform:rotate(12deg)}}
      @keyframes tailWag  {0%,100%{transform:rotate(-18deg)}50%{transform:rotate(18deg)}}
      @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(20,184,166,.5)}70%{box-shadow:0 0 0 14px rgba(20,184,166,0)}}
      @keyframes starTwinkle{0%,100%{opacity:.3}50%{opacity:1}}
      @keyframes shimmer  {0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes tealGlow {0%,100%{text-shadow:0 0 8px rgba(20,184,166,.3)}50%{text-shadow:0 0 18px rgba(20,184,166,.7)}}

      input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
      input[type=number]{-moz-appearance:textfield}
      input[type=range]{accent-color:#14b8a6;width:100%}
      select,input{font-family:${FN.body}}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-thumb{background:#0f766e;border-radius:4px}

      /* Shimmer button */
      .btn-shimmer{
        background-size:200% auto;
        background-image:linear-gradient(135deg,#052e16 0%,#14b8a6 40%,#16a34a 60%,#052e16 100%);
        animation:shimmer 2.5s linear infinite;
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════
   ANIMATED FARM BACKGROUND
═══════════════════════════════════════ */
function FarmBG() {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:0,
      background:"linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 35%, #f0fdfa 65%, #fffbeb 100%)"
    }}>
      {/* Subtle dot pattern */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"radial-gradient(circle, rgba(20,184,166,.08) 1px, transparent 1px)",
        backgroundSize:"28px 28px"
      }}/>
      {/* Soft corner accents */}
      <div style={{position:"absolute",top:0,left:0,width:320,height:320,
        background:"radial-gradient(circle at top left, rgba(22,163,74,.1) 0%, transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:0,right:0,width:320,height:320,
        background:"radial-gradient(circle at bottom right, rgba(20,184,166,.1) 0%, transparent 70%)"}}/>
      <div style={{position:"absolute",top:"40%",right:0,width:240,height:240,
        background:"radial-gradient(circle at right, rgba(245,158,11,.06) 0%, transparent 70%)"}}/>
    </div>
  );
}


/* ═══════════════════════════════════════
   LANGUAGE SWITCHER
═══════════════════════════════════════ */
function LangPicker({ lang, setLang, dark=false }) {
  const [open, setOpen] = useState(false);
  const cur = LANGUAGES.find(l=>l.code===lang);
  return (
    <div style={{position:"relative",zIndex:50}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:"flex",alignItems:"center",gap:6,
        background:dark?"rgba(255,255,255,.1)":"rgba(20,184,166,.12)",
        border:"1px solid "+(dark?"rgba(255,255,255,.18)":"rgba(20,184,166,.3)"),
        borderRadius:RA.md,padding:"7px 12px",
        cursor:"pointer",color:dark?"#fff":"#0f766e",
        fontSize:13,fontWeight:600,fontFamily:FN.body,
        backdropFilter:"blur(8px)",transition:"background .2s"}}>
        <Globe size={14}/>
        <span>{cur?.native||"EN"}</span>
        <ChevronDown size={13} style={{transition:"transform .2s",
          transform:open?"rotate(180deg)":"none"}}/>
      </button>
      {open && (
        <div className="popIn" style={{
          position:"absolute",top:"calc(100% + 8px)",right:0,
          background:"#fff",borderRadius:RA.xl,
          boxShadow:SH.xl,border:"1px solid "+G[200],
          minWidth:170,maxHeight:300,overflowY:"auto",zIndex:999}}>
          {LANGUAGES.map(l=>(
            <button key={l.code} onClick={()=>{setLang(l.code);setOpen(false);}} style={{
              width:"100%",padding:"10px 16px",border:"none",textAlign:"left",
              background:l.code===lang?"#f0fdfa":"transparent",
              cursor:"pointer",fontFamily:FN.body,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              fontSize:13,color:G[800],
              borderBottom:"1px solid "+G[100],
              transition:"background .15s"}}>
              <span style={{fontWeight:700}}>{l.native}</span>
              <span style={{color:G[400],fontSize:11}}>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   SHARED UI COMPONENTS
═══════════════════════════════════════ */
const Card = ({children,bg="#fff",border,pad="18px",mb="12px",style={}}) => (
  <div style={{background:bg,borderRadius:RA.lg,
    border:"1px solid "+(border||G[200]),
    padding:pad,marginBottom:mb,...style}}>{children}</div>
);

const SHead = ({from,to,emoji,title,sub,lang,setLang}) => (
  <div style={{background:"linear-gradient(135deg,"+from+","+to+")",
    padding:"52px 22px 26px",color:"#fff",position:"relative",
    borderBottom:"1px solid rgba(255,255,255,.08)"}}>
    <div style={{position:"absolute",top:18,right:18}}>
      <LangPicker lang={lang} setLang={setLang} dark/>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <span style={{fontSize:28}}>{emoji}</span>
      <h2 style={{fontFamily:FN.heading,fontSize:24,margin:0}}>{title}</h2>
    </div>
    <p style={{margin:0,opacity:.8,fontSize:13}}>{sub}</p>
  </div>
);

function PBtn({children,onClick,color=CL.teal[600],disabled=false,outline=false,sm=false,shimmer=false,style={}}){
  return(
    <button onClick={onClick} disabled={disabled}
      className={shimmer&&!disabled?"btn-shimmer":""}
      style={{width:"100%",padding:sm?"9px 14px":"13px 16px",
        borderRadius:RA.md,
        border:outline?"2px solid "+color:"none",
        background:shimmer&&!disabled?"":outline?"#fff":disabled?G[200]:color,
        color:outline?color:disabled?G[400]:"#fff",
        fontSize:sm?13:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        transition:"opacity .15s,transform .12s,box-shadow .2s",
        fontFamily:FN.body,letterSpacing:".01em",
        boxShadow:outline||disabled?"none":"0 4px 18px "+color+"55",...style}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=".84"}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1"}}
      onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform="scale(.97)"}}
      onMouseUp={e=>{e.currentTarget.style.transform="scale(1)"}}>
      {children}
    </button>
  );
}

const FL = ({children}) => (
  <label style={{display:"block",fontSize:12,fontWeight:600,
    color:G[600],marginBottom:5,fontFamily:FN.body}}>{children}</label>
);

function TInp({tint="teal",style={},...p}){
  const map={
    teal:  {bd:CL.teal[200], bg:CL.teal[50],  fc:CL.teal[600]},
    amber: {bd:CL.amber[200],bg:CL.amber[50], fc:CL.amber[600]},
    red:   {bd:CL.primary[200],bg:CL.primary[50],fc:CL.primary[600]},
  };
  const c = map[tint]||map.teal;
  return(
    <input style={{width:"100%",padding:"11px 13px",borderRadius:RA.md,
      border:"1.5px solid "+c.bd,background:c.bg,fontSize:14,
      color:G[800],outline:"none",
      transition:"border-color .2s,box-shadow .2s",...style}} {...p}
      onFocus={e=>{e.target.style.borderColor=c.fc;
        e.target.style.boxShadow="0 0 0 3px "+c.fc+"22"}}
      onBlur={e=>{e.target.style.borderColor=c.bd;
        e.target.style.boxShadow="none"}}/>
  );
}

function SelInp({children,style={},...p}){
  return(
    <select style={{width:"100%",padding:"11px 13px",borderRadius:RA.md,
      border:"1.5px solid "+CL.amber[200],background:CL.amber[50],
      fontSize:14,color:G[800],outline:"none",...style}} {...p}
      onFocus={e=>{e.target.style.borderColor=CL.amber[600]}}
      onBlur={e=>{e.target.style.borderColor=CL.amber[200]}}>
      {children}
    </select>
  );
}

const ErrBox = ({msg,onRetry,lang}) => (
  <div style={{background:"#fef2f2",border:"1px solid #fca5a5",
    borderRadius:RA.lg,padding:"20px 18px",textAlign:"center",marginBottom:12}}>
    <AlertCircle size={30} color="#dc2626" style={{marginBottom:8}}/>
    <p style={{color:"#991b1b",fontWeight:700,fontSize:14,marginBottom:6}}>
      {t("error",lang)}
    </p>
    <p style={{color:G[600],fontSize:13,lineHeight:1.6,marginBottom:14}}>{msg}</p>
    {onRetry&&(
      <PBtn onClick={onRetry} color="#dc2626" sm
        style={{maxWidth:130,margin:"0 auto"}}>
        {t("tryAgain",lang)}
      </PBtn>
    )}
  </div>
);

const SpinBox = ({label,color=CL.teal[600]}) => (
  <div style={{textAlign:"center",padding:"52px 20px"}}>
    <Loader size={40} color={color} className="spin"/>
    <p style={{color:CL.primary[900],marginTop:16,fontWeight:600,fontSize:15}}>{label}</p>
  </div>
);

function Accordion({title,icon,children}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{border:"1px solid "+G[200],borderRadius:RA.lg,
      marginBottom:8,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",padding:"13px 16px",
        background:"linear-gradient(135deg,"+CL.primary[950]+"08,"+CL.teal[950]+"08)",
        border:"none",cursor:"pointer",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        fontFamily:FN.body,fontSize:14,fontWeight:700,color:CL.primary[900]}}>
        <span style={{display:"flex",alignItems:"center",gap:8}}>{icon}{title}</span>
        {open?<ChevronUp size={17}/>:<ChevronDown size={17}/>}
      </button>
      {open&&(
        <div className="slideDown" style={{padding:"12px 16px 14px"}}>
          {children}
        </div>
      )}
    </div>
  );
}

const DotList = ({items,color=CL.teal[600]}) => (
  <ul style={{margin:0,padding:0,listStyle:"none"}}>
    {items.map((item,i)=>(
      <li key={i} style={{display:"flex",gap:10,alignItems:"flex-start",
        marginBottom:i<items.length-1?8:0}}>
        <span style={{width:8,height:8,borderRadius:"50%",
          background:color,flexShrink:0,marginTop:6}}/>
        <span style={{fontSize:13,color:G[800],lineHeight:1.55}}>{item}</span>
      </li>
    ))}
  </ul>
);

const ConfBar = ({pct,color=CL.teal[600]}) => (
  <div style={{background:G[100],borderRadius:RA.full,height:6,
    width:"100%",marginTop:5,overflow:"hidden"}}>
    <div style={{width:pct+"%",height:"100%",borderRadius:RA.full,
      background:"linear-gradient(90deg,"+color+","+color+"cc)",
      transition:"width .9s cubic-bezier(.34,1.56,.64,1)"}}/>
  </div>
);

const ScreenWrap = ({children}) => (
  <div style={{position:"relative",zIndex:10,minHeight:"100vh",
    paddingBottom:90,
    background:"transparent"}}>
    {children}
  </div>
);

/* ═══════════════════════════════════════
   FARMING QUOTES — rotate every 4s, translate per language
═══════════════════════════════════════ */
const QUOTES = [
  {
    en: "The farmer is the only man in our economy who buys everything at retail and sells everything at wholesale.",
    hi: "किसान ही वह व्यक्ति है जो हर चीज़ खुदरा में खरीदता है और थोक में बेचता है।",
    ta: "விவசாயி மட்டுமே சில்லறையில் வாங்கி மொத்தமாக விற்பவர்.",
    te: "రైతు మాత్రమే చిల్లర ధరకు కొని మొత్తం ధరకు అమ్ముతాడు.",
    kn: "ರೈತ ಮಾತ್ರ ಚಿಲ್ಲರೆ ಬೆಲೆಗೆ ಕೊಂಡು ಸಗಟು ಬೆಲೆಗೆ ಮಾರುತ್ತಾನೆ.",
    ml: "കർഷകൻ മാത്രം ചില്ലറ വിലയ്ക്ക് വാങ്ങി മൊത്ത വിലയ്ക്ക് വിൽക്കുന്നു.",
    bn: "কৃষক একমাত্র ব্যক্তি যে সব কিছু খুচরায় কেনে এবং পাইকারিতে বিক্রি করে।",
    mr: "शेतकरी एकमेव व्यक्ती आहे जो सर्वकाही किरकोळ विकत घेतो आणि घाऊक विकतो.",
    gu: "ખેડૂત જ એક એવી વ્યક્તિ છે જે બધું છૂટક ભાવે ખરીદે અને જથ્થાબંધ ભાવે વેચે.",
    pa: "ਕਿਸਾਨ ਹੀ ਉਹ ਵਿਅਕਤੀ ਹੈ ਜੋ ਸਭ ਕੁਝ ਪਰਚੂਨ 'ਤੇ ਖਰੀਦਦਾ ਹੈ ਅਤੇ ਥੋਕ 'ਤੇ ਵੇਚਦਾ ਹੈ।",
    author: "John F. Kennedy"
  },
  {
    en: "Agriculture is not just a job; it is a way of life that feeds the entire world.",
    hi: "खेती सिर्फ काम नहीं है; यह एक जीवनशैली है जो पूरी दुनिया को खिलाती है।",
    ta: "வேளாண்மை வெறும் தொழிலல்ல; இது உலகையே உணவூட்டும் வாழ்க்கை முறை.",
    te: "వ్యవసాయం కేవలం ఒక పని కాదు; ఇది మొత్తం ప్రపంచాన్ని పోషించే జీవన విధానం.",
    kn: "ಕೃಷಿ ಕೇವಲ ಕೆಲಸವಲ್ಲ; ಇದು ಇಡೀ ಜಗತ್ತನ್ನು ತಿನ್ನಿಸುವ ಜೀವನ ವಿಧಾನ.",
    ml: "കൃഷി ഒരു ജോലി മാത്രമല്ല; ഇത് ലോകം മുഴുവൻ ഭക്ഷിപ്പിക്കുന്ന ഒരു ജീവിതരീതിയാണ്.",
    bn: "কৃষি শুধু একটি কাজ নয়; এটি একটি জীবনযাত্রা যা সমগ্র বিশ্বকে খাওয়ায়।",
    mr: "शेती फक्त काम नाही; ती एक जीवनशैली आहे जी संपूर्ण जगाला खाऊ घालते.",
    gu: "ખેતી માત્ર નોકરી નથી; તે એક જીવનશૈલી છે જે આખી દુનિયાને ખવડાવે છે.",
    pa: "ਖੇਤੀ ਕੇਵਲ ਕੰਮ ਨਹੀਂ; ਇਹ ਜ਼ਿੰਦਗੀ ਦਾ ਇੱਕ ਤਰੀਕਾ ਹੈ ਜੋ ਸਾਰੀ ਦੁਨੀਆ ਨੂੰ ਖੁਆਉਂਦਾ ਹੈ।",
    author: "AgroSense"
  },
  {
    en: "To forget how to dig the earth and tend the soil is to forget ourselves.",
    hi: "मिट्टी खोदना और उसकी देखभाल करना भूलना, खुद को भूलना है।",
    ta: "நிலத்தை உழுவதை மறந்தால் நம்மையே மறந்துவிடுவோம்.",
    te: "నేలను తవ్వడం మరియు సేద్యం చేయడం మర్చిపోవడం మనల్ని మనం మర్చిపోవడమే.",
    kn: "ಭೂಮಿಯನ್ನು ಅಗೆಯಲು ಮತ್ತು ಮಣ್ಣನ್ನು ಉಳುಮೆ ಮಾಡಲು ಮರೆತರೆ ನಮ್ಮನ್ನೇ ಮರೆತಂತೆ.",
    ml: "ഭൂമി കുഴിക്കുന്നതും മണ്ണ് ശ്രദ്ധിക്കുന്നതും മറക്കുന്നത് നമ്മളെ മറക്കുന്നതാണ്.",
    bn: "মাটি খোঁড়া এবং মাটির যত্ন নেওয়া ভুলে যাওয়া মানে নিজেদের ভুলে যাওয়া।",
    mr: "माती खोदणे आणि जमिनीची काळजी घेणे विसरणे म्हणजे स्वतःला विसरणे.",
    gu: "ધરતી ખોદવાનું અને માટી ની સંભાળ લેવાનું ભૂલી જવું એ આપણી જાતને ભૂલવા જેવું છે.",
    pa: "ਧਰਤੀ ਪੁੱਟਣਾ ਅਤੇ ਮਿੱਟੀ ਦੀ ਦੇਖਭਾਲ ਕਰਨਾ ਭੁੱਲ ਜਾਣਾ ਆਪਣੇ ਆਪ ਨੂੰ ਭੁੱਲਣਾ ਹੈ।",
    author: "Mahatma Gandhi"
  },
  {
    en: "A good farmer is always a wish-maker, a hope-giver, and a life-sustainer.",
    hi: "एक अच्छा किसान हमेशा एक सपने देखने वाला, उम्मीद देने वाला और जीवन देने वाला होता है।",
    ta: "ஒரு நல்ல விவசாயி எப்போதும் கனவு காண்பவர், நம்பிக்கை தருபவர், உயிர் காப்பவர்.",
    te: "మంచి రైతు ఎప్పుడూ కోరికలు పెట్టుకునే వాడు, ఆశలు ఇచ్చే వాడు, జీవనాన్ని నిలబెట్టే వాడు.",
    kn: "ಒಳ್ಳೆಯ ರೈತ ಯಾವಾಗಲೂ ಕನಸು ಕಾಣುವವ, ಭರವಸೆ ನೀಡುವವ, ಜೀವ ಉಳಿಸುವವ.",
    ml: "ഒരു നല്ല കർഷകൻ എപ്പോഴും ആഗ്രഹിക്കുന്നവനും, പ്രത്യാശ നൽകുന്നവനും, ജീവൻ നിലനിർത്തുന്നവനുമാണ്.",
    bn: "একজন ভালো কৃষক সবসময় স্বপ্নদ্রষ্টা, আশাদাতা এবং জীবনদাতা।",
    mr: "एक चांगला शेतकरी नेहमी स्वप्न पाहणारा, आशा देणारा आणि जीवन टिकवणारा असतो.",
    gu: "એક સારો ખેડૂત હંમેશા ઇચ્છા કરનારો, આશા આપનારો અને જીવન ટકાવનારો હોય છે.",
    pa: "ਇੱਕ ਚੰਗਾ ਕਿਸਾਨ ਹਮੇਸ਼ਾ ਸੁਪਨੇ ਦੇਖਣ ਵਾਲਾ, ਉਮੀਦ ਦੇਣ ਵਾਲਾ ਅਤੇ ਜ਼ਿੰਦਗੀ ਬਚਾਉਣ ਵਾਲਾ ਹੁੰਦਾ ਹੈ।",
    author: "AgroSense"
  },
  {
    en: "The discovery of agriculture was the first big step toward a civilized life.",
    hi: "कृषि की खोज सभ्य जीवन की ओर पहला बड़ा कदम था।",
    ta: "வேளாண்மையின் கண்டுபிடிப்பு நாகரிக வாழ்க்கையை நோக்கிய முதல் பெரிய அடி.",
    te: "వ్యవసాయం యొక్క ఆవిష్కరణ నాగరిక జీవితం వైపు మొదటి పెద్ద అడుగు.",
    kn: "ಕೃಷಿಯ ಆವಿಷ್ಕಾರವು ನಾಗರಿಕ ಜೀವನದತ್ತ ಮೊದಲ ದೊಡ್ಡ ಹೆಜ್ಜೆ.",
    ml: "കൃഷിയുടെ കണ്ടുപിടുത്തം നാഗരിക ജീവിതത്തിലേക്കുള്ള ആദ്യത്തെ വലിയ ചുവടുവെപ്പായിരുന്നു.",
    bn: "কৃষির আবিষ্কার সভ্য জীবনের দিকে প্রথম বড় পদক্ষেপ ছিল।",
    mr: "शेतीचा शोध हा सभ्य जीवनाकडे पहिले मोठे पाऊल होते.",
    gu: "ખેતીની શોધ સભ્ય જીવન તરફ પ્રથમ મોટું પગલું હતું.",
    pa: "ਖੇਤੀਬਾੜੀ ਦੀ ਖੋਜ ਸਭਿਅਕ ਜ਼ਿੰਦਗੀ ਵੱਲ ਪਹਿਲਾ ਵੱਡਾ ਕਦਮ ਸੀ।",
    author: "Arthur Keith"
  },
];

function useRotatingQuote(lang) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const q = QUOTES[idx];
  return { text: q[lang] || q.en, author: q.author, idx };
}

/* ═══════════════════════════════════════
   LOGIN PAGE — Split layout with farm image
═══════════════════════════════════════ */
function LoginPage({onLogin,lang,setLang}){
  const [form,setF]    = useState({username:"",password:"",dob:""});
  const [showPw,setSP] = useState(false);
  const [err,setErr]   = useState("");
  const [busy,setBusy] = useState(false);
  const { text: quoteText, author: quoteAuthor, idx: quoteIdx } = useRotatingQuote(lang);
  const [quoteVisible, setQV] = useState(true);

  useEffect(() => {
    setQV(false);
    const tm = setTimeout(() => setQV(true), 150);
    return () => clearTimeout(tm);
  }, [quoteIdx]);

  const set=k=>e=>setF(f=>({...f,[k]:e.target.value}));

  const submit=e=>{
    e.preventDefault(); setErr("");
    if(!form.username.trim())  return setErr(t("errUsername",lang));
    if(form.password.length<4) return setErr(t("errPassword",lang));
    if(!form.dob)              return setErr(t("errDob",lang));
    setBusy(true);
    setTimeout(()=>{
      const u={username:form.username.trim(),dob:form.dob,loggedIn:true};
      localStorage.setItem(STORE_KEY,JSON.stringify(u));
      setBusy(false); onLogin(u);
    },700);
  };

  return(
    <div style={{
      minHeight:"100vh",
      display:"flex",
      flexDirection:"column",
      position:"relative",
      zIndex:10,
      overflow:"hidden"
    }}>
      {/* ── FULL background image ── */}
      <div style={{
        position:"fixed", inset:0, zIndex:0,
        backgroundImage:"url('/farmimg.jpg')",
        backgroundSize:"cover",
        backgroundPosition:"center top",
        backgroundRepeat:"no-repeat",
      }}/>
      {/* Dark overlay — makes text readable */}
      <div style={{
        position:"fixed", inset:0, zIndex:1,
        background:"linear-gradient(160deg,rgba(3,20,3,.82) 0%,rgba(5,46,22,.75) 40%,rgba(3,20,3,.88) 100%)"
      }}/>

      {/* Lang picker */}
      <div style={{position:"absolute",top:18,right:18,zIndex:30}}>
        <LangPicker lang={lang} setLang={setLang} dark={true}/>
      </div>

      {/* ── TOP section — Logo + Quote ── */}
      <div style={{
        position:"relative", zIndex:10,
        flex:"0 0 auto",
        padding:"52px 28px 32px",
        display:"flex", flexDirection:"column",
        alignItems:"center",
      }}>
        {/* Logo */}
        <div className="fadeUp" style={{marginBottom:14}}>
          <AgroSenseLogo size={52} showText={true} light={true}/>
        </div>

        {/* Tagline */}
        <p className="fadeUp" style={{
          color:"rgba(255,255,255,.80)",
          fontSize:13, textAlign:"center",
          fontStyle:"italic", marginBottom:22,
          letterSpacing:".04em",
          animationDelay:".1s",
          textShadow:"0 1px 6px rgba(0,0,0,.8)"
        }}>
          {BRAND.tagline}
        </p>

        {/* Quote card — glass effect over image */}
        <div className="fadeUp" style={{
          background:"rgba(0,0,0,.55)",
          backdropFilter:"blur(12px)",
          WebkitBackdropFilter:"blur(12px)",
          border:"1px solid rgba(255,255,255,.18)",
          borderRadius:RA.lg,
          padding:"16px 18px",
          maxWidth:340, width:"100%",
          animationDelay:".15s"
        }}>
          <div style={{fontSize:26,color:"rgba(255,255,255,.35)",
            fontFamily:"Georgia,serif",lineHeight:1,marginBottom:6,
            userSelect:"none"}}>"</div>
          <p style={{
            color:"#fff",
            fontSize:13, lineHeight:1.75,
            margin:"0 0 10px",
            fontStyle:"italic",
            opacity:quoteVisible?1:0,
            transition:"opacity .35s ease",
            textShadow:"0 1px 4px rgba(0,0,0,.6)"
          }}>
            {quoteText}
          </p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{
              color:"rgba(255,255,255,.65)",
              fontSize:12, margin:0, fontWeight:600,
              textShadow:"0 1px 3px rgba(0,0,0,.5)"
            }}>— {quoteAuthor}</p>
            <div style={{display:"flex",gap:5}}>
              {QUOTES.map((_,i)=>(
                <div key={i} style={{
                  width:i===quoteIdx?18:6, height:6,
                  borderRadius:3,
                  background:i===quoteIdx?"rgba(255,255,255,.95)":"rgba(255,255,255,.28)",
                  transition:"all .4s ease"
                }}/>
              ))}
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="fadeUp" style={{
          display:"flex", flexWrap:"wrap", gap:8,
          justifyContent:"center", marginTop:18,
          animationDelay:".2s"
        }}>
          {["🔬 Disease AI","🌱 Crop AI","🌦️ Weather","💹 Price AI"].map(pill=>(
            <span key={pill} style={{
              background:"rgba(20,184,166,.25)",
              border:"1px solid rgba(20,184,166,.5)",
              borderRadius:RA.full, padding:"4px 13px",
              fontSize:11, color:"rgba(255,255,255,.9)",
              fontWeight:600,
              backdropFilter:"blur(6px)",
              textShadow:"0 1px 3px rgba(0,0,0,.5)"
            }}>{pill}</span>
          ))}
        </div>
      </div>

      {/* ── BOTTOM section — Sign in form ── */}
      <div style={{
        position:"relative", zIndex:10,
        flex:1,
        background:"rgba(255,255,255,.97)",
        borderRadius:"28px 28px 0 0",
        padding:"32px 26px 36px",
        boxShadow:"0 -8px 40px rgba(0,0,0,.35)",
        /* teal top accent line */
        borderTop:"4px solid transparent",
        backgroundClip:"padding-box"
      }}>
        {/* Teal accent bar */}
        <div style={{
          position:"absolute", top:-4, left:0, right:0, height:4,
          borderRadius:"28px 28px 0 0",
          background:"linear-gradient(90deg,#052e16,#14b8a6,#16a34a,#14b8a6,#052e16)"
        }}/>

        <h2 style={{
          fontFamily:FN.heading, fontSize:24,
          color:CL.primary[900], marginBottom:4
        }}>Welcome back 👋</h2>
        <p style={{color:G[500],fontSize:13,marginBottom:22,lineHeight:1.5}}>
          Sign in to your AgroSense dashboard
        </p>

        <form onSubmit={submit}>
          {/* Username */}
          <div style={{marginBottom:14}}>
            <FL>{t("username",lang)}</FL>
            <div style={{position:"relative"}}>
              <TInp type="text" placeholder={t("username",lang)}
                value={form.username} onChange={set("username")}
                autoComplete="username"/>
              {form.username.length>0&&(
                <span style={{position:"absolute",right:12,top:"50%",
                  transform:"translateY(-50%)",fontSize:15}}>
                  {form.username.length>2?"✅":"✍️"}
                </span>
              )}
            </div>
          </div>

          {/* DOB */}
          <div style={{marginBottom:14}}>
            <FL>{t("dob",lang)}</FL>
            <TInp type="date" value={form.dob} onChange={set("dob")}
              max={new Date().toISOString().split("T")[0]}/>
          </div>

          {/* Password */}
          <div style={{marginBottom:20}}>
            <FL>{t("password",lang)}</FL>
            <div style={{position:"relative"}}>
              <TInp type={showPw?"text":"password"}
                placeholder="••••••••"
                style={{paddingRight:86,
                  letterSpacing:showPw?"normal":".18em"}}
                value={form.password} onChange={set("password")}
                autoComplete="current-password"/>
              <div style={{position:"absolute",right:8,top:"50%",
                transform:"translateY(-50%)",
                display:"flex",alignItems:"center",gap:4}}>
                {form.password.length>0&&(
                  <span style={{fontSize:14}}>
                    {form.password.length>=4?"✅":"⚠️"}
                  </span>
                )}
                <button type="button" onClick={()=>setSP(p=>!p)} style={{
                  background:"none",border:"none",
                  cursor:"pointer",color:G[400],padding:4}}>
                  {showPw?<EyeOff size={17}/>:<Eye size={17}/>}
                </button>
              </div>
            </div>
          </div>

          {err&&(
            <div style={{
              background:"#fef2f2",border:"1px solid #fca5a5",
              borderRadius:RA.md,padding:"10px 13px",
              color:"#b91c1c",fontSize:13,marginBottom:14,fontWeight:500
            }}>⚠️ {err}</div>
          )}

          <PBtn disabled={busy} shimmer={!busy} style={{borderRadius:RA.lg}}>
            {busy?t("signingIn",lang):t("signIn",lang)+" →"}
          </PBtn>
        </form>

        <p style={{textAlign:"center",fontSize:11,color:G[400],marginTop:14}}>
          {t("storedDevice",lang)}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════ */
function BottomNav({active,setActive,lang}){
  const tabs=[
    {id:"home",   icon:<Leaf size={19}/>,       lk:"navHome"},
    {id:"disease",icon:<Search size={19}/>,     lk:"navDisease"},
    {id:"crop",   icon:<Sprout size={19}/>,     lk:"navCrop"},
    {id:"weather",icon:<Cloud size={19}/>,      lk:"navWeather"},
    {id:"price",  icon:<TrendingUp size={19}/>, lk:"navPrice"},
  ];
  return(
    <nav style={{
      position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:480,
      background:"rgba(255,255,255,.97)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      borderTop:"1px solid rgba(20,184,166,.25)",
      display:"flex",zIndex:300,
      boxShadow:"0 -4px 20px rgba(0,0,0,.1)"}}>
      {tabs.map(tb=>(
        <button key={tb.id} onClick={()=>setActive(tb.id)} style={{
          flex:1,padding:"10px 2px 8px",border:"none",background:"none",
          cursor:"pointer",display:"flex",flexDirection:"column",
          alignItems:"center",gap:3,
          color:active===tb.id?CL.teal[700]:CL.gray[400],
          transition:"color .2s",fontFamily:FN.body,position:"relative"}}>
          {/* Active indicator */}
          {active===tb.id&&(
            <div style={{position:"absolute",top:0,left:"50%",
              transform:"translateX(-50%)",
              width:32,height:3,borderRadius:"0 0 3px 3px",
              background:"linear-gradient(90deg,#0f766e,#14b8a6)"}}/>
          )}
          {tb.icon}
          <span style={{fontSize:9,fontWeight:active===tb.id?700:400,
            letterSpacing:".01em"}}>
            {t(tb.lk,lang)}
          </span>
        </button>
      ))}
    </nav>
  );
}

/* ═══════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════ */
function HomeScreen({user,onLogout,setActive,lang,setLang}){
  const age=user.dob
    ?Math.floor((Date.now()-new Date(user.dob))/(365.25*24*3600*1000)):"—";

  const cards=[
    {id:"disease",grad:GR.disease,emoji:"🔬",titleK:"diseaseTitle",subK:"homeDiseaseSub"},
    {id:"crop",   grad:GR.crop,   emoji:"🌱",titleK:"cropTitle",   subK:"homeCropSub"},
    {id:"weather",grad:GR.weather,emoji:"🌦️",titleK:"weatherTitle",subK:"homeWeatherSub"},
    {id:"price",  grad:GR.price,  emoji:"💹",titleK:"priceTitle",  subK:"homePriceSub"},
  ];

  return(
    <ScreenWrap>
      {/* Hero header */}
      <div style={{
        background:GR.primary,
        padding:"54px 22px 30px",color:"#fff",position:"relative",
        borderBottom:"1px solid rgba(20,184,166,.2)"}}>

        {/* Top bar */}
        <div style={{position:"absolute",top:18,right:18,
          display:"flex",gap:8,alignItems:"center"}}>
          <LangPicker lang={lang} setLang={setLang} dark/>
          <button onClick={onLogout} style={{
            background:"rgba(255,255,255,.1)",
            border:"1px solid rgba(255,255,255,.15)",
            borderRadius:RA.md,padding:"7px 12px",color:"#fff",cursor:"pointer",
            display:"flex",alignItems:"center",gap:5,fontSize:12,
            fontFamily:FN.body,fontWeight:600,
            backdropFilter:"blur(8px)"}}>
            <LogOut size={13}/>{t("logout",lang)}
          </button>
        </div>

        {/* Logo */}
        <div style={{marginBottom:18}}>
          <AgroSenseLogo size={36} showText={true} light={true}/>
        </div>

        {/* Welcome */}
        <p style={{margin:"0 0 4px",opacity:.65,fontSize:13}}>
          {t("welcomeBack",lang)}
        </p>
        <h2 style={{fontFamily:FN.heading,fontSize:26,margin:"0 0 4px",
          animation:"tealGlow 3s ease-in-out infinite"}}>
          {user.username} 👋
        </h2>
        <p style={{margin:0,opacity:.55,fontSize:12}}>
          {t("age",lang)}: {age} {t("yrs",lang)}
        </p>
      </div>

      <div style={{padding:"20px 18px"}}>
        <p style={{fontFamily:FN.heading,fontSize:19,
          color:CL.primary[900],marginBottom:14}}>
          {t("whatToday",lang)}
        </p>

        {cards.map((c,i)=>(
          <button key={c.id} onClick={()=>setActive(c.id)}
            className="fadeUp" style={{
              width:"100%",display:"flex",alignItems:"center",gap:15,
              background:c.grad,
              border:"1px solid rgba(255,255,255,.12)",
              borderRadius:RA.xl,padding:"20px 18px",
              marginBottom:10,cursor:"pointer",textAlign:"left",
              animationDelay:i*0.07+"s",
              boxShadow:SH.lg,backdropFilter:"blur(8px)",
              transition:"transform .15s,box-shadow .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";
              e.currentTarget.style.boxShadow=SH.xl}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";
              e.currentTarget.style.boxShadow=SH.lg}}>
            <span style={{fontSize:38,lineHeight:1,flexShrink:0,
              filter:"drop-shadow(0 2px 6px rgba(0,0,0,.35))"}}>{c.emoji}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",
                gap:8,marginBottom:4}}>
                <span style={{fontWeight:700,color:"#fff",fontSize:15,
                  textShadow:"0 1px 4px rgba(0,0,0,.3)"}}>
                  {t(c.titleK,lang)}
                </span>

              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.75)",
                lineHeight:1.4}}>
                {t(c.subK,lang)}
              </div>
            </div>
          </button>
        ))}


      </div>
    </ScreenWrap>
  );
}

/* ═══════════════════════════════════════
   DISEASE DETECTION
═══════════════════════════════════════ */
const CEMOJI={rice:"🌾",maize:"🌽",chickpea:"🫘",kidneybeans:"🫘",
  pigeonpeas:"🌿",mothbeans:"🌿",mungbean:"🌿",blackgram:"🌿",lentil:"🌿",
  pomegranate:"🍎",banana:"🍌",mango:"🥭",grapes:"🍇",watermelon:"🍉",
  muskmelon:"🍈",apple:"🍏",orange:"🍊",papaya:"🍑",coconut:"🥥",
  cotton:"🌸",jute:"🌿",coffee:"☕"};

function DiseaseScreen({lang,setLang}){
  const fileRef  =useRef();
  const videoRef =useRef();
  const canvasRef=useRef();
  const [mode,  setMode]=useState("idle");
  const [prev,  setPrev]=useState(null);
  const [imgF,  setImgF]=useState(null);
  const [result,setRes] =useState(null);
  const [err,   setErr] =useState("");
  const [stream,setStr] =useState(null);

  useEffect(()=>{return()=>{if(stream)stream.getTracks().forEach(t=>t.stop());};},[stream]);

  const reset=()=>{
    if(stream){stream.getTracks().forEach(t=>t.stop());setStr(null);}
    setMode("idle");setPrev(null);setImgF(null);setRes(null);setErr("");
  };
  const pickFile=f=>{
    if(!f)return;
    if(!f.type.startsWith("image/"))
      return(setErr("Please choose an image file."),setMode("error"));
    setPrev(URL.createObjectURL(f));setImgF(f);setMode("preview");
  };
  const openCam=async()=>{
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      setStr(s);setMode("camera");
      setTimeout(()=>{if(videoRef.current)videoRef.current.srcObject=s;},80);
    }catch{setErr("Camera not available or permission denied.");setMode("error");}
  };
  const capture=()=>{
    const v=videoRef.current,c=canvasRef.current;
    if(!v||!c)return;
    c.width=v.videoWidth;c.height=v.videoHeight;
    c.getContext("2d").drawImage(v,0,0);
    c.toBlob(b=>{
      stream.getTracks().forEach(t=>t.stop());setStr(null);
      setPrev(URL.createObjectURL(b));
      setImgF(new File([b],"cap.jpg",{type:"image/jpeg"}));
      setMode("preview");
    },"image/jpeg",.92);
  };
  const analyse=async()=>{
    if(!imgF)return;setMode("loading");
    try{
      const fd=new FormData();fd.append("file",imgF);
      const r=await fetch(API+"/disease-detect",{method:"POST",body:fd});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"API error");
      setRes(d);setMode("result");
    }catch(e){
      setErr(e.message.includes("fetch")?t("backendErr",lang):e.message);
      setMode("error");
    }
  };
  const shareWA=()=>{
    if(!result)return;
    const msg=encodeURIComponent(
      "🌿 AgroSense Disease Report\n"+
      "Plant: "+result.plant+"\n"+
      "Detected: "+result.display+"\n"+
      "Condition: "+result.condition+"\n"+
      "Confidence: "+result.confidence+"%\n"+
      "Severity: "+result.severity+"\n"+
      "Recovery: "+result.recovery+"\n\n"+
      "Treatment:\n"+result.treatment.map((t,i)=>(i+1)+". "+t).join("\n")+"\n\n"+
      "Powered by AgroSense — Sense the Farm. Grow the Future."
    );
    window.open("https://wa.me/?text="+msg,"_blank");
  };
  const sevColor=s=>({Low:CL.teal[600],Medium:CL.amber[600],High:"#ea580c",Critical:"#dc2626"}[s]||G[400]);
  const sevBg   =s=>({Low:CL.teal[50], Medium:CL.amber[50], High:"#fff7ed",Critical:"#fef2f2"}[s]||G[50]);

  return(
    <ScreenWrap>
      <SHead from="#7c2d12" to="#ea580c" emoji="🔬"
        title={t("diseaseTitle",lang)} sub={t("diseaseSub",lang)}
        lang={lang} setLang={setLang}/>
      <div style={{padding:"18px"}}>

        {mode==="idle"&&(
          <div className="fadeUp">
            <div style={{border:"2px dashed #fed7aa",borderRadius:RA.xl,
              padding:"36px 20px",textAlign:"center",
              background:"rgba(255,247,237,.94)",marginBottom:16}}>
              <div style={{fontSize:64,marginBottom:10}} className="float">🍃</div>
              <p style={{color:"#9a3412",fontWeight:700,fontSize:15,marginBottom:4}}>
                {t("diseaseSub",lang).split("→")[0].trim()}
              </p>
              <p style={{color:G[500],fontSize:13}}>JPG · PNG · WebP</p>
            </div>
            <PBtn onClick={()=>fileRef.current.click()}
              color="#ea580c" style={{marginBottom:10}}>
              <Upload size={17}/>{t("chooseGallery",lang)}
            </PBtn>
            <PBtn onClick={openCam} color="#ea580c" outline
              style={{background:"rgba(255,255,255,.95)",marginBottom:16}}>
              <Camera size={17}/>{t("openCamera",lang)}
            </PBtn>
            <input ref={fileRef} type="file" accept="image/*"
              style={{display:"none"}}
              onChange={e=>pickFile(e.target.files[0])}/>
            <Card style={{background:"rgba(255,255,255,.95)"}}>
              <p style={{fontWeight:700,color:CL.primary[800],
                marginBottom:10,fontSize:14}}>
                🌿 Supported Crops — Pepper · Potato · Tomato
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["Pepper Bell","Potato","Tomato"].map(c=>(
                  <span key={c} style={{
                    background:"linear-gradient(135deg,"+CL.teal[50]+","+CL.primary[50]+")",
                    color:CL.teal[800],borderRadius:RA.full,
                    padding:"3px 11px",fontSize:12,fontWeight:600,
                    border:"1px solid "+CL.teal[200]}}>
                    {c}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {mode==="camera"&&(
          <div className="fadeUp" style={{textAlign:"center"}}>
            <video ref={videoRef} autoPlay playsInline style={{
              width:"100%",borderRadius:RA.lg,background:"#000",
              marginBottom:12,maxHeight:360,objectFit:"cover"}}/>
            <canvas ref={canvasRef} style={{display:"none"}}/>
            <div style={{display:"flex",gap:10}}>
              <PBtn onClick={capture} color="#ea580c">📸 Capture</PBtn>
              <PBtn onClick={reset} color={G[500]} outline
                style={{background:"rgba(255,255,255,.95)"}}>Cancel</PBtn>
            </div>
          </div>
        )}

        {mode==="preview"&&(
          <div className="fadeUp">
            <div style={{position:"relative",marginBottom:14}}>
              <img src={prev} alt="Leaf" style={{width:"100%",
                borderRadius:RA.lg,maxHeight:320,objectFit:"cover"}}/>
              <div style={{position:"absolute",top:10,right:10,
                background:"rgba(0,0,0,.6)",color:"#fff",
                borderRadius:RA.full,padding:"4px 12px",fontSize:12,fontWeight:600}}>
                ✓ Ready
              </div>
            </div>
            <PBtn onClick={analyse} color="#ea580c" style={{marginBottom:10}}>
              🔍 {t("detectBtn",lang)}
            </PBtn>
            <PBtn onClick={reset} color={G[500]} outline
              style={{background:"rgba(255,255,255,.95)"}}>
              Choose Different Photo
            </PBtn>
          </div>
        )}

        {mode==="loading"&&(
          <div style={{textAlign:"center",padding:"52px 0"}}>
            <div style={{position:"relative",display:"inline-block",marginBottom:16}}>
              {prev&&<img src={prev} alt="" style={{width:100,height:100,
                borderRadius:RA.lg,objectFit:"cover",opacity:.55}}/>}
              <div style={{position:"absolute",inset:0,display:"flex",
                alignItems:"center",justifyContent:"center"}}>
                <Loader size={36} color="#ea580c" className="spin"/>
              </div>
            </div>
            <p style={{fontWeight:700,color:CL.primary[900],fontSize:15}}>
              {t("analysing",lang)}
            </p>
          </div>
        )}

        {mode==="result"&&result&&(
          <div className="fadeUp">
            {prev&&<img src={prev} alt="Leaf" style={{width:"100%",
              borderRadius:RA.lg,maxHeight:230,objectFit:"cover",marginBottom:14}}/>}

            {/* Result banner */}
            <div style={{
              background:result.healthy
                ?"linear-gradient(135deg,#14532d,#16a34a)"
                :GR.disease,
              borderRadius:RA.xl,
              padding:"22px 20px",color:"#fff",marginBottom:12,
              boxShadow:SH.lg}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{background:"rgba(255,255,255,.2)",borderRadius:RA.full,
                  padding:"3px 12px",fontSize:12,fontWeight:700}}>
                  🌿 {result.plant}
                </span>
                <span style={{background:result.healthy?"rgba(255,255,255,.25)":"rgba(220,38,38,.4)",
                  borderRadius:RA.full,padding:"3px 12px",fontSize:12,fontWeight:700}}>
                  {result.condition}
                </span>
              </div>
              <h2 style={{fontFamily:FN.heading,fontSize:22,
                margin:"0 0 10px",lineHeight:1.3}}>
                {result.display}
              </h2>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                <span style={{background:"rgba(255,255,255,.2)",
                  borderRadius:RA.full,padding:"4px 12px",fontSize:13,fontWeight:600}}>
                  {t("confidence",lang)}: {result.confidence}%
                </span>
                <span style={{background:sevColor(result.severity),
                  borderRadius:RA.full,padding:"4px 12px",
                  fontSize:12,fontWeight:700}}>
                  {result.severity} {t("severity",lang)}
                </span>
              </div>
              <div style={{background:"rgba(255,255,255,.2)",
                borderRadius:RA.full,height:9,overflow:"hidden"}}>
                <div style={{width:result.confidence+"%",height:"100%",
                  borderRadius:RA.full,background:"rgba(255,255,255,.75)",
                  transition:"width .9s ease"}}/>
              </div>
            </div>

            {/* Description */}
            {result.description&&(
              <div style={{background:"rgba(255,255,255,.95)",borderRadius:RA.md,
                padding:"12px 14px",marginBottom:12,
                border:"1px solid "+G[200]}}>
                <p style={{margin:0,fontSize:13,color:G[700],lineHeight:1.6}}>
                  {result.description}
                </p>
              </div>
            )}
            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",
              gap:10,marginBottom:12}}>
              <Card pad="12px 14px" mb="0"
                style={{background:sevBg(result.severity),
                  border:"1px solid "+sevColor(result.severity)+"44"}}>
                <p style={{margin:"0 0 3px",fontSize:11,
                  color:sevColor(result.severity),fontWeight:700,
                  textTransform:"uppercase",letterSpacing:".06em"}}>
                  {t("severity",lang)}
                </p>
                <p style={{margin:0,fontWeight:700,
                  color:sevColor(result.severity),fontSize:17}}>
                  {result.severity}
                </p>
              </Card>
              <Card pad="12px 14px" mb="0"
                style={{background:CL.teal[50],border:"1px solid "+CL.teal[200]}}>
                <p style={{margin:"0 0 3px",fontSize:11,color:CL.teal[700],
                  fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>
                  {t("recovery",lang)}
                </p>
                <p style={{margin:0,fontWeight:700,color:CL.teal[800],fontSize:14}}>
                  {result.recovery}
                </p>
              </Card>
            </div>

            {result.symptoms?.length>0&&(
              <Accordion title={t("symptoms",lang)} icon="🔍">
                <DotList items={result.symptoms} color="#ea580c"/>
              </Accordion>
            )}
            {result.treatment?.length>0&&(
              <Accordion title={t("treatment",lang)} icon="💊">
                <DotList items={result.treatment} color={CL.teal[600]}/>
              </Accordion>
            )}
            {result.prevention?.length>0&&(
              <Accordion title={t("prevention",lang)} icon="🛡️">
                <DotList items={result.prevention} color={CL.primary[600]}/>
              </Accordion>
            )}
            {result.top3?.length>0&&(
              <Accordion title={t("top3",lang)} icon="📊">
                {result.top3.map((r,i)=>(
                  <div key={i} style={{
                    paddingBottom:i<result.top3.length-1?12:0,
                    borderBottom:i<result.top3.length-1?"1px solid "+G[100]:undefined,
                    marginBottom:i<result.top3.length-1?12:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",
                      alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{background:["#ea580c",CL.amber[600],G[400]][i],
                          color:"#fff",borderRadius:"50%",width:22,height:22,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</span>
                        <span style={{fontSize:13,fontWeight:600,
                          color:G[800],lineHeight:1.3}}>
                          {r.display||r.class}
                        </span>
                      </div>
                      <span style={{fontSize:14,fontWeight:700,color:"#ea580c"}}>
                        {r.confidence}%
                      </span>
                    </div>
                    <ConfBar pct={r.confidence}
                      color={["#ea580c",CL.amber[600],G[400]][i]}/>
                  </div>
                ))}
              </Accordion>
            )}

            {/* Actions */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
              <PBtn onClick={reset} color="#ea580c">
                <RefreshCw size={14}/>{t("scanAgain",lang)}
              </PBtn>
              <PBtn onClick={shareWA} color="#25D366">
                <Share2 size={14}/> WhatsApp
              </PBtn>
            </div>
            <div style={{marginTop:10}}>
              <PBtn onClick={()=>fileRef.current.click()} color="#ea580c" outline
                style={{background:"rgba(255,255,255,.95)"}}>
                <Upload size={14}/> New Photo
              </PBtn>
            </div>
            <input ref={fileRef} type="file" accept="image/*"
              style={{display:"none"}}
              onChange={e=>pickFile(e.target.files[0])}/>
          </div>
        )}

        {mode==="error"&&<ErrBox msg={err} onRetry={reset} lang={lang}/>}
      </div>
    </ScreenWrap>
  );
}

/* ═══════════════════════════════════════
   CROP RECOMMENDATION
═══════════════════════════════════════ */
function CropScreen({lang,setLang}){
  const [form,setForm]=useState({N:90,P:42,K:43,temperature:25,humidity:70,ph:6.5,rainfall:150});
  const [status,setSt]=useState("idle");
  const [result,setRes]=useState(null);
  const [err,setErr]=useState("");

  const fields=[
    {key:"N",          label:"Nitrogen (N)",   unit:"mg/kg",min:0,  max:140,step:1},
    {key:"P",          label:"Phosphorus (P)", unit:"mg/kg",min:0,  max:145,step:1},
    {key:"K",          label:"Potassium (K)",  unit:"mg/kg",min:0,  max:205,step:1},
    {key:"temperature",label:"Temperature",    unit:"°C",   min:0,  max:50, step:.1},
    {key:"humidity",   label:"Humidity",       unit:"%",    min:10, max:100,step:.1},
    {key:"ph",         label:"Soil pH",        unit:"",     min:3.5,max:9.5,step:.1},
    {key:"rainfall",   label:"Rainfall",       unit:"mm",   min:20, max:300,step:1},
  ];

  const predict=async()=>{
    setSt("loading");
    try{
      const res=await fetch(API+"/crop-recommend",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({N:+form.N,P:+form.P,K:+form.K,
          temperature:+form.temperature,humidity:+form.humidity,
          ph:+form.ph,rainfall:+form.rainfall})
      });
      const d=await res.json();
      if(!res.ok)throw new Error(d.error||"API error");
      setRes(d);setSt("ok");
    }catch(e){
      setErr(e.message.includes("fetch")?t("backendErr",lang):e.message);
      setSt("error");
    }
  };

  return(
    <ScreenWrap>
      <SHead from={CL.primary[950]} to={CL.teal[700]} emoji="🌱"
        title={t("cropTitle",lang)} sub={t("cropSub",lang)}
        lang={lang} setLang={setLang}/>
      <div style={{padding:"18px"}}>
        <Card style={{background:"rgba(255,255,255,.97)"}}>
          <p style={{fontFamily:FN.heading,fontSize:17,
            color:CL.primary[900],marginBottom:14}}>
            {t("soilClimate",lang)}
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {fields.map(f=>(
              <div key={f.key}>
                <FL>{f.label}{f.unit&&
                  <span style={{color:G[400],fontWeight:400}}> ({f.unit})</span>}
                </FL>
                <TInp type="number" min={f.min} max={f.max} step={f.step}
                  value={form[f.key]}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/>
              </div>
            ))}
          </div>
        </Card>
        <PBtn onClick={predict} color={CL.teal[700]}
          disabled={status==="loading"} style={{marginBottom:14}}>
          {status==="loading"
            ?<><Loader size={16} className="spin"/>{t("analysing2",lang)}</>
            :t("getCropBtn",lang)}
        </PBtn>
        {status==="error"&&<ErrBox msg={err} onRetry={()=>setSt("idle")} lang={lang}/>}
        {status==="ok"&&result&&(
          <div className="fadeUp">
            <div style={{background:GR.crop,borderRadius:RA.xl,
              padding:"26px 20px",color:"#fff",
              textAlign:"center",marginBottom:12,boxShadow:SH.lg}}>
              <div style={{fontSize:64,marginBottom:8,lineHeight:1}} className="float">
                {CEMOJI[result.crop]||"🌱"}
              </div>
              <h2 style={{fontFamily:FN.heading,fontSize:30,
                textTransform:"capitalize",margin:"0 0 10px"}}>
                {result.crop}
              </h2>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,
                background:"rgba(255,255,255,.2)",borderRadius:RA.full,
                padding:"6px 18px",fontSize:14,fontWeight:600}}>
                <ThumbsUp size={15}/>
                {t("confidence",lang)}: {result.confidence}%
              </div>
            </div>
            {result.tips&&Object.keys(result.tips).length>0&&(
              <Card style={{background:"rgba(255,255,255,.97)"}}>
                <p style={{fontFamily:FN.heading,fontSize:16,
                  color:CL.primary[900],marginBottom:14}}>
                  📋 {t("cropDetails",lang)}
                </p>
                {[
                  {icon:"📅",label:"Season",val:result.tips.season},
                  {icon:"💧",label:"Water",val:result.tips.water},
                  {icon:"⏱️",label:"Days",val:result.tips.days},
                  {icon:"💡",label:"Tip",val:result.tips.tip},
                ].filter(r=>r.val).map((r,i,arr)=>(
                  <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",
                    paddingBottom:i<arr.length-1?12:0,
                    borderBottom:i<arr.length-1?"1px solid "+G[100]:undefined,
                    marginBottom:i<arr.length-1?12:0}}>
                    <span style={{fontSize:20,lineHeight:1.4,flexShrink:0}}>{r.icon}</span>
                    <div>
                      <p style={{margin:"0 0 2px",fontSize:11,color:G[400],
                        fontWeight:700,textTransform:"uppercase",
                        letterSpacing:".06em"}}>{r.label}</p>
                      <p style={{margin:0,fontSize:14,color:G[800],
                        lineHeight:1.5}}>{r.val}</p>
                    </div>
                  </div>
                ))}
              </Card>
            )}
            {result.top3?.length>0&&(
              <Card style={{background:"rgba(255,255,255,.97)"}}>
                <p style={{fontFamily:FN.heading,fontSize:16,
                  color:CL.primary[900],marginBottom:14}}>
                  🏆 {t("top3Pred",lang)}
                </p>
                {result.top3.map((c,i)=>(
                  <div key={i} style={{
                    paddingBottom:i<result.top3.length-1?12:0,
                    borderBottom:i<result.top3.length-1?"1px solid "+G[100]:undefined,
                    marginBottom:i<result.top3.length-1?12:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",
                      alignItems:"center",marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{background:[CL.teal[600],CL.amber[600],G[400]][i],
                          color:"#fff",borderRadius:"50%",width:22,height:22,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</span>
                        <span style={{fontSize:14,fontWeight:600,
                          textTransform:"capitalize",color:G[800]}}>
                          {CEMOJI[c.crop]||"🌱"} {c.crop}
                        </span>
                      </div>
                      <span style={{fontSize:14,fontWeight:700,color:CL.teal[600]}}>
                        {c.confidence}%
                      </span>
                    </div>
                    <ConfBar pct={c.confidence}
                      color={[CL.teal[600],CL.amber[600],G[400]][i]}/>
                  </div>
                ))}
              </Card>
            )}
            <PBtn onClick={()=>setSt("idle")} color={G[600]} outline
              style={{background:"rgba(255,255,255,.95)"}}>
              <RefreshCw size={14}/>{t("tryDiff",lang)}
            </PBtn>
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}

/* ═══════════════════════════════════════
   WEATHER
═══════════════════════════════════════ */
function WeatherScreen({lang,setLang}){
  const [status,setSt]=useState("idle");
  const [data,  setDat]=useState(null);
  const [err,   setErr]=useState("");

  const load=()=>{
    setSt("loading");
    if(!navigator.geolocation)
      return(setErr("Geolocation not supported."),setSt("error"));
    navigator.geolocation.getCurrentPosition(async pos=>{
      const {latitude:la,longitude:lo}=pos.coords;
      const B="https://api.openweathermap.org/data/2.5";
      try{
        const [c,f]=await Promise.all([
          fetch(B+"/weather?lat="+la+"&lon="+lo+"&appid="+WEATHER_KEY+"&units=metric").then(r=>r.json()),
          fetch(B+"/forecast?lat="+la+"&lon="+lo+"&appid="+WEATHER_KEY+"&units=metric").then(r=>r.json()),
        ]);
        if(c.cod!==200)throw new Error((c.message||"Weather API error")+" (code: "+c.cod+")");
        const seen=new Set(),days=[];
        for(const it of f.list){
          const d=it.dt_txt.split(" ")[0];
          if(!seen.has(d)&&days.length<5){seen.add(d);days.push(it);}
        }
        setDat({
          city:c.name,country:c.sys.country,
          temp:Math.round(c.main.temp),feels:Math.round(c.main.feels_like),
          humidity:c.main.humidity,wind:Math.round(c.wind.speed*3.6),
          vis:c.visibility?(c.visibility/1000).toFixed(1):"—",
          desc:c.weather[0].description,icon:c.weather[0].icon,
          forecast:days.map(d=>({
            date:new Date(d.dt*1000).toLocaleDateString("en-IN",
              {weekday:"short",day:"numeric",month:"short"}),
            high:Math.round(d.main.temp_max),low:Math.round(d.main.temp_min),
            desc:d.weather[0].description,icon:d.weather[0].icon,
            rain:d.rain?d.rain["3h"]||0:0
          }))
        });
        setSt("ok");
      }catch(e){setErr("Weather error: "+e.message+". If you see 403/Host error, your API key may be domain-restricted. Get a new free key at openweathermap.org/api");setSt("error");}
    },()=>{setErr("Location denied.");setSt("error");});
  };

  return(
    <ScreenWrap>
      <SHead from={CL.blue[900]} to="#60a5fa" emoji="🌦️"
        title={t("weatherTitle",lang)} sub={t("weatherSub",lang)}
        lang={lang} setLang={setLang}/>
      <div style={{padding:"18px"}}>
        {status==="idle"&&(
          <div className="fadeUp" style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:72,marginBottom:14}} className="float">🌍</div>
            <p style={{fontWeight:700,color:CL.primary[900],marginBottom:6,fontSize:16}}>
              {t("weatherTitle",lang)}
            </p>
            <p style={{color:CL.primary[700],fontSize:13,
              marginBottom:24,lineHeight:1.6}}>
              {t("weatherSub",lang)}
            </p>
            <PBtn onClick={load} color={CL.blue[600]}
              style={{maxWidth:230,margin:"0 auto"}}>
              <MapPin size={15}/>{t("getWeatherBtn",lang)}
            </PBtn>
          </div>
        )}
        {status==="loading"&&<SpinBox label={t("fetchingWeather",lang)} color={CL.blue[500]}/>}
        {status==="error"&&<ErrBox msg={err} onRetry={()=>setSt("idle")} lang={lang}/>}
        {status==="ok"&&data&&(
          <div className="fadeUp">
            <div style={{background:GR.weather,borderRadius:RA.xl,
              padding:"22px 20px",color:"#fff",
              marginBottom:14,boxShadow:SH.lg}}>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"flex-start"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:4,
                    opacity:.75,fontSize:12,marginBottom:4}}>
                    <MapPin size={11}/> {data.city}, {data.country}
                  </div>
                  <div style={{fontSize:56,fontWeight:700,lineHeight:1}}>
                    {data.temp}°C
                  </div>
                  <div style={{opacity:.85,textTransform:"capitalize",
                    fontSize:14,marginTop:5}}>{data.desc}</div>
                  <div style={{opacity:.65,fontSize:12,marginTop:3}}>
                    {t("feelsLike",lang)} {data.feels}°C
                  </div>
                </div>
                <img src={"https://openweathermap.org/img/wn/"+data.icon+"@2x.png"}
                  alt={data.desc} style={{width:76,height:76}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
                gap:8,marginTop:16}}>
                {[
                  {icon:<Droplets size={13}/>,lk:"humidity",  val:data.humidity+"%"},
                  {icon:<Wind     size={13}/>,lk:"wind",      val:data.wind+" km/h"},
                  {icon:<MapPin   size={13}/>,lk:"visibility",val:data.vis+" km"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.14)",
                    borderRadius:RA.md,padding:"9px 6px",textAlign:"center"}}>
                    <div style={{marginBottom:3,opacity:.8}}>{s.icon}</div>
                    <div style={{fontSize:13,fontWeight:700}}>{s.val}</div>
                    <div style={{fontSize:10,opacity:.7}}>{t(s.lk,lang)}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{fontFamily:FN.heading,fontSize:17,color:CL.primary[900],marginBottom:10}}>
              {t("fiveDayForecast",lang)}
            </p>
            {data.forecast.map((d,i)=>(
              <Card key={i} pad="12px 16px" mb="8px"
                style={{background:"rgba(255,255,255,.94)"}}>
                <div style={{display:"flex",alignItems:"center",
                  justifyContent:"space-between"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:CL.blue[900],fontSize:13}}>
                      {d.date}
                    </div>
                    <div style={{color:G[400],fontSize:11,textTransform:"capitalize",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {d.desc}
                    </div>
                  </div>
                  <img src={"https://openweathermap.org/img/wn/"+d.icon+".png"}
                    alt="" style={{width:38,height:38,flexShrink:0}}/>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontWeight:700,color:CL.blue[900],fontSize:14}}>
                      {d.high}° / {d.low}°
                    </div>
                    {d.rain>0&&(
                      <div style={{fontSize:11,color:CL.blue[500]}}>
                        💧{d.rain.toFixed(1)} mm
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            <PBtn onClick={()=>setSt("idle")} color={CL.blue[600]} outline
              style={{marginTop:4,background:"rgba(255,255,255,.95)"}}>
              <RefreshCw size={14}/>{t("refresh",lang)}
            </PBtn>
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}

/* ═══════════════════════════════════════
   PRICE PREDICTION
═══════════════════════════════════════ */
function PriceScreen({lang,setLang}){
  const now=new Date();
  const [form,setForm]=useState({
    commodity:"Tomato",minPrice:"",maxPrice:"",
    year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate()
  });
  const [status,setSt]=useState("idle");
  const [result,setRes]=useState(null);
  const [err,   setErr]=useState("");
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const commodities=["Tomato","Potato","Onion","Rice","Wheat","Cotton",
    "Sugarcane","Maize","Chilli","Brinjal","Banana",
    "Mango","Grapes","Orange","Papaya"];

  const predict=async()=>{
    if(!form.minPrice||!form.maxPrice)
      return(setErr("Enter both Min and Max Price."),setSt("error"));
    if(+form.minPrice>=+form.maxPrice)
      return(setErr("Min Price must be less than Max Price."),setSt("error"));
    setSt("loading");
    try{
      const res=await fetch(API+"/price-predict",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({commodity:form.commodity,
          minPrice:+form.minPrice,maxPrice:+form.maxPrice,
          year:+form.year,month:+form.month,day:+form.day})
      });
      const d=await res.json();
      if(!res.ok)throw new Error(d.error||"API error");
      setRes(d);setSt("ok");
    }catch(e){
      setErr(e.message.includes("fetch")?t("backendErr",lang):e.message);
      setSt("error");
    }
  };

  const pct=result
    ?Math.min(100,Math.max(0,
      ((result.predictedPrice-+form.minPrice)/(+form.maxPrice-+form.minPrice))*100))
    :0;

  return(
    <ScreenWrap>
      <SHead from={CL.amber[950]} to={CL.amber[500]} emoji="💹"
        title={t("priceTitle",lang)} sub={t("priceSub",lang)}
        lang={lang} setLang={setLang}/>
      <div style={{padding:"18px"}}>
        <Card style={{background:"rgba(255,255,255,.97)"}}>
          <p style={{fontFamily:FN.heading,fontSize:17,
            color:CL.amber[900],marginBottom:14}}>
            {t("marketData",lang)}
          </p>
          <div style={{marginBottom:12}}>
            <FL>{t("commodity",lang)}</FL>
            <SelInp value={form.commodity} onChange={set("commodity")}>
              {commodities.map(c=><option key={c}>{c}</option>)}
            </SelInp>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",
            gap:10,marginBottom:12}}>
            <div>
              <FL>{t("minPrice",lang)}</FL>
              <TInp tint="amber" type="number" placeholder="500"
                value={form.minPrice} onChange={set("minPrice")}/>
            </div>
            <div>
              <FL>{t("maxPrice",lang)}</FL>
              <TInp tint="amber" type="number" placeholder="1500"
                value={form.maxPrice} onChange={set("maxPrice")}/>
            </div>
          </div>
          <FL>{t("targetDate",lang)}</FL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{k:"day",l:"Day",mn:1,mx:31},
              {k:"month",l:"Month",mn:1,mx:12},
              {k:"year",l:"Year",mn:2020,mx:2035}
            ].map(f=>(
              <div key={f.k}>
                <FL>{f.l}</FL>
                <TInp tint="amber" type="number" min={f.mn} max={f.mx}
                  value={form[f.k]} onChange={set(f.k)}/>
              </div>
            ))}
          </div>
        </Card>
        <PBtn onClick={predict} color={CL.amber[700]}
          disabled={status==="loading"} style={{marginBottom:14}}>
          {status==="loading"
            ?<><Loader size={16} className="spin"/>{t("predicting",lang)}</>
            :t("predictBtn",lang)}
        </PBtn>
        {status==="error"&&<ErrBox msg={err} onRetry={()=>setSt("idle")} lang={lang}/>}
        {status==="ok"&&result&&(
          <div className="fadeUp">
            <div style={{background:GR.price,borderRadius:RA.xl,
              padding:"26px 20px",color:"#fff",
              textAlign:"center",marginBottom:12,boxShadow:SH.lg}}>
              <p style={{margin:"0 0 4px",opacity:.8,fontSize:13}}>
                {t("predictedPrice",lang)} — {result.commodity}
              </p>
              <div style={{fontSize:52,fontWeight:700,lineHeight:1,marginBottom:6}}>
                ₹{result.predictedPrice.toLocaleString("en-IN",
                  {minimumFractionDigits:2,maximumFractionDigits:2})}
              </div>
              <div style={{opacity:.8,fontSize:13}}>{result.unit}</div>
              <div style={{background:"rgba(255,255,255,.18)",borderRadius:RA.md,
                padding:"8px 14px",marginTop:12,fontSize:12,lineHeight:1.7}}>
                {result.inputs?.date} · Min ₹{result.inputs?.minPrice} · Max ₹{result.inputs?.maxPrice}
              </div>
            </div>
            <Card style={{background:"rgba(255,255,255,.97)"}}>
              <p style={{fontFamily:FN.heading,fontSize:16,
                color:CL.amber[900],marginBottom:14}}>
                📊 Price Range
              </p>
              <div style={{display:"flex",justifyContent:"space-between",
                fontSize:12,color:G[600],marginBottom:6}}>
                <span>₹{(+form.minPrice).toLocaleString("en-IN")} (Min)</span>
                <span>₹{(+form.maxPrice).toLocaleString("en-IN")} (Max)</span>
              </div>
              <div style={{background:G[100],borderRadius:RA.full,
                height:14,position:"relative",overflow:"visible"}}>
                <div style={{width:pct+"%",height:"100%",borderRadius:RA.full,
                  background:"linear-gradient(90deg,"+CL.amber[800]+","+CL.amber[500]+")"}}/>
                <div style={{position:"absolute",left:pct+"%",top:"50%",
                  transform:"translate(-50%,-50%)",
                  width:24,height:24,borderRadius:"50%",
                  background:CL.amber[500],border:"3px solid #fff",
                  boxShadow:SH.md}}/>
              </div>
              <div style={{textAlign:"center",marginTop:10,fontWeight:700,
                color:CL.amber[800],fontSize:17}}>
                ₹{result.predictedPrice.toLocaleString("en-IN",
                  {minimumFractionDigits:2,maximumFractionDigits:2})}
              </div>
            </Card>
            <Card style={{background:"rgba(255,255,255,.97)"}}>
              {[
                {label:"Min (entered)",    val:+form.minPrice,        color:"#dc2626"},
                {label:"Predicted (model)",val:result.predictedPrice, color:CL.teal[600],bold:true},
                {label:"Max (entered)",    val:+form.maxPrice,        color:CL.amber[600]},
              ].map((r,i,arr)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"11px 0",
                  borderBottom:i<arr.length-1?"1px solid "+G[100]:undefined}}>
                  <span style={{fontSize:13,color:G[600]}}>{r.label}</span>
                  <span style={{fontWeight:r.bold?700:600,color:r.color,
                    fontSize:r.bold?18:14}}>
                    ₹{r.val.toLocaleString("en-IN",
                      {minimumFractionDigits:2,maximumFractionDigits:2})}
                  </span>
                </div>
              ))}
            </Card>
            <PBtn onClick={()=>setSt("idle")} color={CL.amber[700]} outline
              style={{background:"rgba(255,255,255,.95)"}}>
              <RefreshCw size={14}/>{t("predictAgain",lang)}
            </PBtn>
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}

/* ═══════════════════════════════════════
   ROOT APP
═══════════════════════════════════════ */
export default function App(){
  const [user,   setUser]  =useState(null);
  const [active, setActive]=useState("home");
  const [lang,   setLang]  =useState("en");
  const [boot,   setBoot]  =useState(true);

  useEffect(()=>{
    try{
      const s=localStorage.getItem(STORE_KEY);
      if(s){const u=JSON.parse(s);if(u?.loggedIn)setUser(u);}
      const l=localStorage.getItem("agrosense_lang");
      if(l)setLang(l);
    }catch{}
    setBoot(false);
  },[]);

  const changeLang=l=>{
    setLang(l);
    localStorage.setItem("agrosense_lang",l);
  };
  const logout=()=>{
    localStorage.removeItem(STORE_KEY);
    setUser(null);setActive("home");
  };

  if(boot) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",background:"#f0fdf4"}}>
      <GlobalStyles/>
      <div className="popIn" style={{textAlign:"center",color:"#fff"}}>
        <AgroSenseLogo size={64} showText={true} light={true}/>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:13,marginTop:12,
          fontStyle:"italic"}}>{BRAND.tagline}</p>
      </div>
    </div>
  );

  return(
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",
      position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>
      <FarmBG/>
      {!user
        ?<LoginPage onLogin={setUser} lang={lang} setLang={changeLang}/>
        :<>
          {active==="home"   &&<HomeScreen user={user} onLogout={logout} setActive={setActive} lang={lang} setLang={changeLang}/>}
          {active==="disease"&&<DiseaseScreen lang={lang} setLang={changeLang}/>}
          {active==="crop"   &&<CropScreen   lang={lang} setLang={changeLang}/>}
          {active==="weather"&&<WeatherScreen lang={lang} setLang={changeLang}/>}
          {active==="price"  &&<PriceScreen  lang={lang} setLang={changeLang}/>}
          <BottomNav active={active} setActive={setActive} lang={lang}/>
        </>
      }
    </div>
  );
}