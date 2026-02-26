'use client'
const tabs = [
  {key:'search',icon:'🔍',label:'Search'},
  {key:'trips',icon:'🎫',label:'My Trips'},
  {key:'history',icon:'🕒',label:'History'},
  {key:'settings',icon:'⚙️',label:'Settings'},
]
export default function BottomNav({active,onChange,theme}:{active:string;onChange:(t:string)=>void;theme:'dark'|'light'}) {
  const dark=theme==='dark'
  return (
    <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:dark?'rgba(7,30,48,0.97)':'rgba(240,244,248,0.97)',backdropFilter:'blur(16px)',borderTop:`1px solid ${dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)'}`,display:'flex',zIndex:10}}>
      {tabs.map(t=>(
        <button key={t.key} onClick={()=>onChange(t.key)} style={{flex:1,padding:'12px 8px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',border:'none',background:'transparent',color:active===t.key?'#ff5c3a':dark?'#7eabc5':'#5a7a8a',fontFamily:'DM Sans,sans-serif',fontSize:'0.68rem'}}>
          <span style={{fontSize:'1.2rem',lineHeight:1}}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}
