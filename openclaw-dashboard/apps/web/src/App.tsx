import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { get, send, wsUrl } from './lib/api';

const tabs = ['Overview','Agent Selection','Instances','Task Manager','Reminders','News & Updates Feed','Logs & Debug','Settings'] as const;

function ErrorBoundary({ children }: { children: JSX.Element }) {
  return children;
}

export function App() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Overview');
  const [collapsed, setCollapsed] = useState(false);
  const [overview, setOverview] = useState<any>();
  const [instances, setInstances] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [logs, setLogs] = useState<any>({ logs: [], tokenBreakdown: {} });
  const [settings, setSettings] = useState<any>({});

  const perf = useMemo(() => Array.from({length:20}, (_,i)=>({name:`T${i}`, value:(overview?.tokenUsage?.used||10000)+i*8})), [overview]);

  const load = async () => {
    const [o,i,t,r,n,l,s] = await Promise.all([get('/api/overview'),get('/api/instances'),get('/api/tasks'),get('/api/reminders'),get('/api/news'),get('/api/logs'),get('/api/settings')]);
    setOverview(o); setInstances(i); setTasks(t); setReminders(r); setNews(n); setLogs(l); setSettings(s);
  };

  useEffect(() => { load(); const ws = new WebSocket(wsUrl); ws.onmessage = (m) => { const p = JSON.parse(m.data); if (p.type === 'overview') setOverview(p.data); }; return () => ws.close(); }, []);

  return <ErrorBoundary>
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950 text-slate-100 flex'>
      <aside className={`transition-all ${collapsed ? 'w-16' : 'w-72'} border-r border-slate-800 p-3`}>
        <button className='mb-3 text-xs opacity-70 hover:opacity-100' onClick={()=>setCollapsed(!collapsed)}>Toggle</button>
        {tabs.map(t => <button key={t} onClick={()=>setTab(t)} className={`w-full text-left p-2 rounded mb-1 hover:bg-slate-800 ${tab===t?'bg-fuchsia-700/30':''}`}>{collapsed ? t[0] : t}</button>)}
      </aside>
      <main className='flex-1 p-5'>
        <AnimatePresence mode='wait'>
          <motion.section key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className='space-y-4'>
            {tab==='Overview' && <div className='grid md:grid-cols-3 gap-4'>
              <div className='card'><div>Active Model</div><div className='text-xl font-bold'>{overview?.activeModel}</div><div className='badge bg-emerald-500/20 text-emerald-300'>{overview?.systemStatus}</div></div>
              <div className='card'><div>Provider</div><div className='text-xl font-bold'>{overview?.provider}</div><div>Running Agents: {overview?.runningAgents}</div></div>
              <div className='card'><div>Token Usage</div><div>{overview?.tokenUsage?.used}/{overview?.tokenUsage?.limit}</div><div className='flex gap-2 mt-2'><button className='px-3 py-1 rounded bg-fuchsia-700' onClick={()=>send('/api/instances/i1/restart','POST').then(load)}>Restart Main</button><button className='px-3 py-1 rounded bg-slate-700' onClick={load}>Refresh</button></div></div>
              <div className='card md:col-span-3 h-72'><ResponsiveContainer width='100%' height='100%'><AreaChart data={perf}><XAxis dataKey='name'/><YAxis/><Tooltip/><Area dataKey='value' stroke='#d946ef' fill='#d946ef33'/></AreaChart></ResponsiveContainer></div>
            </div>}

            {tab==='Agent Selection' && <div className='card space-y-3 max-w-xl'>
              <h3 className='text-lg font-semibold'>Model Routing</h3>
              <select className='w-full bg-slate-800 p-2 rounded' defaultValue={overview?.provider} id='provider'><option>openai</option><option>anthropic</option><option>gemini</option></select>
              <input className='w-full bg-slate-800 p-2 rounded' id='model' defaultValue={overview?.activeModel} placeholder='Model name'/>
              <label className='flex items-center gap-2'><input type='checkbox' id='reasoning' defaultChecked={overview?.reasoning}/> Reasoning mode</label>
              <label>Token limit<input type='range' min='1000' max='200000' defaultValue={overview?.tokenLimit} id='tokenLimit' className='w-full'/></label>
              <button className='px-3 py-2 rounded bg-fuchsia-700' onClick={async()=>{const g=(id:string)=>(document.getElementById(id) as HTMLInputElement); await send('/api/agent/select','POST',{provider:g('provider').value, model:g('model').value, reasoning:g('reasoning').checked, tokenLimit:Number(g('tokenLimit').value), saveDefault:true}); load();}}>Save as default</button>
            </div>}

            {tab==='Instances' && <div className='grid gap-3'>{instances.map(i=><div key={i.id} className='card flex items-center justify-between'><div><div className='font-semibold'>{i.name}</div><div className={`badge ${i.status==='active'?'bg-emerald-500/20 text-emerald-300':i.status==='error'?'bg-red-500/20 text-red-300':'bg-yellow-500/20 text-yellow-300'}`}>{i.status}</div><div>CPU {i.cpu}% · MEM {i.memory}%</div><div className='text-xs opacity-70'>{i.logs?.[0]}</div></div><div className='flex gap-2'><button className='px-2 py-1 rounded bg-sky-700' onClick={()=>send(`/api/instances/${i.id}/restart`,'POST').then(load)}>Restart</button><button className='px-2 py-1 rounded bg-rose-700' onClick={()=>send(`/api/instances/${i.id}/stop`,'POST').then(load)}>Stop</button></div></div>)}</div>}

            {tab==='Task Manager' && <div className='space-y-3'>
              <div className='card flex gap-2'><input id='taskTitle' className='bg-slate-800 p-2 rounded flex-1' placeholder='Create task'/><select id='taskPriority' className='bg-slate-800 p-2 rounded'><option>low</option><option>medium</option><option>high</option></select><button className='bg-fuchsia-700 px-3 rounded' onClick={()=>send('/api/tasks','POST',{title:(document.getElementById('taskTitle') as HTMLInputElement).value, priority:(document.getElementById('taskPriority') as HTMLSelectElement).value, tags:[]}).then(load)}>Add</button></div>
              {tasks.map(t=><div key={t.id} className='card flex justify-between'><div><div>{t.title}</div><div className='text-xs opacity-70'>{t.priority} · {t.dueDate || 'no due date'} · {t.recurring || 'one-shot'}</div></div><div className='flex gap-2'><button className='px-2 rounded bg-emerald-700' onClick={()=>send(`/api/tasks/${t.id}`,'PUT',{completed:!t.completed}).then(load)}>{t.completed?'Undo':'Complete'}</button><button className='px-2 rounded bg-red-700' onClick={()=>send(`/api/tasks/${t.id}`,'DELETE').then(load)}>Delete</button></div></div>)}
            </div>}

            {tab==='Reminders' && <div className='space-y-3'>
              <div className='card flex gap-2'><input id='remName' className='bg-slate-800 p-2 rounded' placeholder='Reminder'/><input id='remCron' className='bg-slate-800 p-2 rounded' placeholder='0 8 * * *'/><select id='remChannel' className='bg-slate-800 p-2 rounded'><option>discord</option><option>email</option><option>none</option></select><button className='bg-fuchsia-700 px-3 rounded' onClick={()=>send('/api/reminders','POST',{name:(document.getElementById('remName') as HTMLInputElement).value, cron:(document.getElementById('remCron') as HTMLInputElement).value, channel:(document.getElementById('remChannel') as HTMLSelectElement).value, enabled:true}).then(load)}>Save</button></div>
              {reminders.map(r=><div className='card' key={r.id}>{r.name} · {r.cron} · next run {r.nextRun || 'invalid cron'} · {r.channel}</div>)}
            </div>}

            {tab==='News & Updates Feed' && <div className='space-y-3'>
              <button className='px-3 py-1 rounded bg-slate-700' onClick={()=>get('/api/news').then(setNews)}>Manual refresh</button>
              {news.map((n, idx)=><a key={idx} href={n.link} target='_blank' className='card block'><div className='font-semibold'>{n.title}</div><div className='text-sm opacity-80'>{n.summary}</div><div className='text-xs text-fuchsia-300 mt-1'>{n.link}</div></a>)}
            </div>}

            {tab==='Logs & Debug' && <div className='card space-y-2'><div>Token Breakdown: {JSON.stringify(logs.tokenBreakdown)}</div><div className='max-h-72 overflow-auto text-xs'>{(logs.logs||[]).map((l:string, i:number)=><div key={i}>{l}</div>)}</div><a href='http://localhost:4000/api/logs/export' className='inline-block px-3 py-1 rounded bg-fuchsia-700'>Export logs</a></div>}

            {tab==='Settings' && <div className='space-y-3'>
              <div className='card'>Provider Auth: {JSON.stringify(settings.providerAuth)}</div>
              <div className='card'>Discord Plugin: {String(settings.plugins?.discord)}</div>
              <div className='card flex gap-2'><input id='apiProvider' className='bg-slate-800 p-2 rounded' placeholder='provider'/><input id='apiKey' className='bg-slate-800 p-2 rounded flex-1' placeholder='api key'/><button className='bg-emerald-700 px-3 rounded' onClick={()=>send('/api/settings/api-keys','POST',{provider:(document.getElementById('apiProvider') as HTMLInputElement).value, apiKey:(document.getElementById('apiKey') as HTMLInputElement).value})}>Save key</button></div>
            </div>}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  </ErrorBoundary>;
}
