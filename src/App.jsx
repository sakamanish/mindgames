import { useEffect, useRef, useState } from 'react'
import './App.css'
import { clearProfile, loadProfile, recordSession, saveProfile } from './storage'

const GAMES = [
  { id: 'memory', icon: '▦', color: 'purple', title: 'Memory Match', detail: 'Remember patterns', category: 'Memory' },
  { id: 'reaction', icon: '⚡', color: 'orange', title: 'Reaction Time', detail: 'Test your reflexes', category: 'Speed' },
  { id: 'math', icon: '∑', color: 'blue', title: 'Quick Math', detail: 'Solve number puzzles', category: 'Logic' },
  { id: 'sequence', icon: '◉', color: 'pink', title: 'Sequence Recall', detail: 'Repeat the pattern', category: 'Memory' },
  { id: 'color', icon: '◒', color: 'green', title: 'Color Rush', detail: 'Ignore the distractions', category: 'Focus' },
  { id: 'odd', icon: '◇', color: 'yellow', title: 'Odd One Out', detail: 'Spot the difference', category: 'Perception' },
]

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)

function App() {
  const [profile, setProfile] = useState(loadProfile)
  const [screen, setScreen] = useState('home')

  useEffect(() => saveProfile(profile), [profile])

  const finishGame = (session) => setProfile((current) => recordSession(current, session))
  const openGame = (id) => setScreen(id)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Go home">
          <span className="brand-mark">M</span><span>Mind<span>Mint</span></span>
        </button>
        <nav aria-label="Primary navigation">
          <NavButton screen={screen} target="home" icon="⌂" label="Home" onClick={setScreen} />
          <NavButton screen={screen} target="games" icon="▦" label="Games" onClick={setScreen} />
          <NavButton screen={screen} target="progress" icon="◷" label="Progress" onClick={setScreen} />
        </nav>
        <div className="profile">
          <div className="avatar">M</div>
          <div><strong>Mind Trainer</strong><small>Level {Math.floor(profile.xp / 100) + 1}</small></div>
          <button aria-label="Reset local progress" title="Reset local progress" onClick={() => {
            if (window.confirm('Reset all MindMint progress on this device?')) {
              clearProfile(); setProfile(loadProfile())
            }
          }}>↺</button>
        </div>
      </aside>

      <main>
        {screen === 'home' && <Home profile={profile} openGame={openGame} />}
        {screen === 'games' && <Library openGame={openGame} profile={profile} />}
        {screen === 'progress' && <Progress profile={profile} />}
        {screen === 'memory' && <MemoryGame onBack={() => setScreen('games')} finishGame={finishGame} />}
        {screen === 'reaction' && <ReactionGame onBack={() => setScreen('games')} finishGame={finishGame} />}
        {screen === 'math' && <MathGame onBack={() => setScreen('games')} finishGame={finishGame} />}
        {screen === 'sequence' && <SequenceGame onBack={() => setScreen('games')} finishGame={finishGame} />}
        {screen === 'color' && <ColorGame onBack={() => setScreen('games')} finishGame={finishGame} />}
        {screen === 'odd' && <OddGame onBack={() => setScreen('games')} finishGame={finishGame} />}
      </main>
    </div>
  )
}

function NavButton({ screen, target, icon, label, onClick }) {
  return <button className={screen === target ? 'nav-item active' : 'nav-item'} onClick={() => onClick(target)}><span>{icon}</span>{label}</button>
}

function bestLabel(game, profile) {
  const value = profile.bests[game.id]
  if (value == null) return 'No score yet'
  if (game.id === 'reaction') return `Best: ${value} ms`
  if (game.id === 'memory') return `Best: ${value} moves`
  return `Best: ${value}`
}

function Home({ profile, openGame }) {
  const level = Math.floor(profile.xp / 100) + 1
  const progress = profile.xp % 100
  const today = new Date().toISOString().slice(0, 10)
  const playedToday = profile.sessions.filter((session) => session.date?.slice(0, 10) === today).length

  return <div className="page home-page">
    <header className="topbar">
      <div><p className="eyebrow">TODAY'S TRAINING</p><h1>Ready for a brain boost?</h1></div>
      <div className="level-badge"><span>⭐</span><div><small>LEVEL {level}</small><div className="progress"><i style={{ width: `${progress}%` }} /></div></div></div>
    </header>

    <section className="hero-card">
      <div className="hero-copy"><span className="tag">DAILY CHALLENGE</span><h2>Train your mind.<br />Build your streak.</h2><p>{playedToday ? `${playedToday} game${playedToday === 1 ? '' : 's'} completed today` : 'Complete a game to start today’s workout'}.</p><button onClick={() => openGame('memory')}>Start workout <b>→</b></button></div>
      <div className="brain-art"><div className="brain">🧠</div><span className="spark spark-one">✦</span><span className="spark spark-two">●</span></div>
    </section>

    <div className="section-heading"><h2>Choose a game</h2><button onClick={() => openGame('games')}>View library <b>→</b></button></div>
    <section className="game-grid">
      {GAMES.slice(0, 3).map((game) => <GameCard key={game.id} game={game} best={bestLabel(game, profile)} onClick={() => openGame(game.id)} />)}
    </section>

    <section className="stats-row">
      <Stat icon="🔥" className="purple-bg" label="CURRENT STREAK" value={`${profile.streak} days`} />
      <Stat icon="◷" className="orange-bg" label="MINUTES TODAY" value={`${profile.totalPlayTimeMinutes} min`} />
      <Stat icon="◇" className="blue-bg" label="TOTAL XP" value={`${profile.xp} XP`} />
    </section>
  </div>
}

function Stat({ icon, className, label, value }) {
  return <div><span className={`stat-icon ${className}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>
}

function GameCard({ game, best, onClick }) {
  return <button className="game-card" onClick={onClick}><span className={`game-icon ${game.color}`}>{game.icon}</span><div><h3>{game.title}</h3><p>{game.detail}</p><small>{best}</small></div><b>→</b></button>
}

function Library({ openGame, profile }) {
  const [filter, setFilter] = useState('All')
  const categories = ['All', ...new Set(GAMES.map((game) => game.category))]
  const visible = filter === 'All' ? GAMES : GAMES.filter((game) => game.category === filter)
  return <div className="page"><header className="topbar"><div><p className="eyebrow">TRAIN YOUR BRAIN</p><h1>Game library</h1></div></header><div className="filters">{categories.map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><section className="library-grid">{visible.map((game) => <GameCard key={game.id} game={game} best={bestLabel(game, profile)} onClick={() => openGame(game.id)} />)}</section></div>
}

function Progress({ profile }) {
  const level = Math.floor(profile.xp / 100) + 1
  const recent = profile.sessions.slice(0, 8)
  return <div className="page"><header className="topbar"><div><p className="eyebrow">YOUR PERFORMANCE</p><h1>Progress</h1></div></header><section className="progress-cards"><div><small>LEVEL</small><strong>{level}</strong></div><div><small>TOTAL XP</small><strong>{profile.xp}</strong></div><div><small>GAMES PLAYED</small><strong>{profile.sessions.length}</strong></div><div><small>BEST STREAK</small><strong>{profile.streak} days</strong></div></section><section className="history-panel"><div className="panel-heading"><h2>Recent activity</h2><small>Saved locally</small></div>{recent.length === 0 ? <div className="empty-state">Complete a game to start your history.</div> : recent.map((session) => { const game = GAMES.find((item) => item.id === session.gameId); return <div className="history-row" key={session.id}><span className={`game-icon ${game?.color || 'purple'}`}>{game?.icon || '◆'}</span><div><strong>{game?.title || session.gameId}</strong><small>{new Date(session.date).toLocaleDateString()}</small></div><b>+{session.xp} XP</b></div> })}</section></div>
}

function BackHeader({ title, subtitle, onBack }) {
  return <header className="game-header"><button className="back" onClick={onBack} aria-label="Back to games">←</button><div><p className="eyebrow">BRAIN TRAINING</p><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div></header>
}

function MemoryGame({ onBack, finishGame }) {
  const symbols = ['🧠','🚀','🎯','⚡','🌈','🔮']
  const makeCards = () => shuffle([...symbols, ...symbols].map((symbol, index) => ({ id: index, symbol })))
  const [cards, setCards] = useState(makeCards)
  const [open, setOpen] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [finished, setFinished] = useState(false)

  

  const reset = () => { setCards(makeCards()); setOpen([]); setMatched([]); setMoves(0); setFinished(false) }
  const clickCard = (card) => {
    if (open.length === 2 || open.includes(card.id) || matched.includes(card.symbol)) return
    const next = [...open, card.id]; setOpen(next)
    if (next.length === 2) {
      const nextMoves = moves + 1; setMoves(nextMoves)
      const first = cards.find((item) => item.id === next[0]); const second = cards.find((item) => item.id === next[1])
      if (first.symbol === second.symbol) { setMatched((items) => [...items, first.symbol]); setOpen([]) }
      else setTimeout(() => setOpen([]), 650)
    }
  }

  return <div className="page game-page"><BackHeader title="Memory Match" subtitle="Find all matching pairs" onBack={onBack} /><div className="game-toolbar"><strong>{moves} moves</strong><button onClick={reset}>Restart</button></div><div className="memory-grid">{cards.map((card) => { const revealed = open.includes(card.id) || matched.includes(card.symbol); return <button key={card.id} className={revealed ? 'memory-card revealed' : 'memory-card'} onClick={() => clickCard(card)} aria-label={revealed ? card.symbol : 'Hidden card'}>{revealed ? card.symbol : '?'}</button> })}</div>{finished && <div className="complete">🎉 Board cleared! <strong>+{Math.max(20, 60-moves)} XP</strong></div>}</div>
}

function ReactionGame({ onBack, finishGame }) {
  const [phase, setPhase] = useState('idle'); const [time, setTime] = useState(null)
  const startRef = useRef(null); const timerRef = useRef(null)
  useEffect(() => () => clearTimeout(timerRef.current), [])
  const start = () => { clearTimeout(timerRef.current); setTime(null); setPhase('waiting'); timerRef.current = setTimeout(() => { startRef.current = performance.now(); setPhase('go') }, 1200 + Math.random()*2600) }
  const hit = () => { if (phase==='waiting') { clearTimeout(timerRef.current); setPhase('early') } else if (phase==='go') { const result=Math.round(performance.now()-startRef.current); setTime(result); setPhase('result'); finishGame({gameId:'reaction',score:result,xp:result<250?30:20,lowerIsBetter:true,durationMinutes:1}) } }
  return <div className="page game-page"><BackHeader title="Reaction Time" subtitle="Click only when the color changes" onBack={onBack} /><div className={`reaction-box ${phase}`} onClick={phase==='waiting'||phase==='go'?hit:undefined}>{phase==='idle'&&<><span>⚡</span><h2>Ready to test your reflexes?</h2><button onClick={(event)=>{event.stopPropagation();start()}}>Start game</button></>}{phase==='waiting'&&<><h2>Wait for green...</h2><p>Don't click yet</p></>}{phase==='go'&&<h2>CLICK!</h2>}{phase==='early'&&<><h2>Too soon!</h2><button onClick={(event)=>{event.stopPropagation();start()}}>Try again</button></>}{phase==='result'&&<><small>YOUR TIME</small><h2>{time} ms</h2><p>{time<250?'Lightning fast!':time<350?'Great reflexes':'Keep practicing'}</p><button onClick={(event)=>{event.stopPropagation();start()}}>Try again</button></>}</div></div>
}

function makeProblem() {
  const a=Math.floor(Math.random()*14)+2,b=Math.floor(Math.random()*12)+2, op=['+','−','×'][Math.floor(Math.random()*3)]
  return {text:`${a} ${op} ${b}`,answer:op==='+'?a+b:op==='−'?a-b:a*b}
}

function MathGame({ onBack, finishGame }) {
  const [problem,setProblem]=useState(makeProblem),[input,setInput]=useState(''),[score,setScore]=useState(0),[round,setRound]=useState(1),[message,setMessage]=useState(''),[finished,setFinished]=useState(false)
  const submit=(event)=>{event.preventDefault();if(input===''||finished)return;const correct=Number(input)===problem.answer;if(correct)setScore((value)=>value+1);setMessage(correct?'Correct!':`Answer: ${problem.answer}`);if(round===10){const finalScore=score+(correct?1:0);setFinished(true);finishGame({gameId:'math',score:finalScore,xp:10+finalScore*3,durationMinutes:2})}else setTimeout(()=>{setProblem(makeProblem());setRound((value)=>value+1);setInput('');setMessage('')},550)}
  return <div className="page game-page"><BackHeader title="Quick Math" subtitle="10 rounds • solve as quickly as you can" onBack={onBack}/><div className="math-card"><div className="math-status"><span>Round {Math.min(round,10)} / 10</span><strong>Score: {score}</strong></div><h2>{finished?'Great work!':problem.text}</h2>{message&&<p className="math-message">{message}</p>}{!finished&&<form onSubmit={submit}><input aria-label="Answer" type="number" value={input} onChange={(event)=>setInput(event.target.value)} placeholder="Your answer"/><button type="submit">Submit</button></form>}{finished&&<button className="primary-button" onClick={()=>{setProblem(makeProblem());setInput('');setScore(0);setRound(1);setMessage('');setFinished(false)}}>Play again</button>}</div></div>
}

function SequenceGame({ onBack, finishGame }) {
  const pads=['#7163cb','#eb8069','#5ba98c','#dfa348']; const [sequence,setSequence]=useState([0]),[inputIndex,setInputIndex]=useState(0),[showing,setShowing]=useState(false),[active,setActive]=useState(null),[level,setLevel]=useState(1),[finished,setFinished]=useState(false)
  const timer=useRef(null)
  useEffect(()=>()=>clearTimeout(timer.current),[])
  const play=()=>{setShowing(true);setInputIndex(0);sequence.forEach((value,index)=>{setTimeout(()=>{setActive(value);timer.current=setTimeout(()=>setActive(null),380)},700+index*650)});timer.current=setTimeout(()=>setShowing(false),700+sequence.length*650)}
  useEffect(()=>{play()},[]) // eslint-disable-line react-hooks/exhaustive-hooks
  const reset=()=>{setSequence([0]);setLevel(1);setFinished(false);setShowing(true);setInputIndex(0);setActive(0);setTimeout(()=>{setActive(null);setShowing(false)},500)}
  const hit=(value)=>{if(showing||finished)return;if(value===sequence[inputIndex]){if(inputIndex===sequence.length-1){const nextLevel=level+1;if(nextLevel>8){setFinished(true);finishGame({gameId:'sequence',score:level,xp:level*8,durationMinutes:2})}else{setLevel(nextLevel);setSequence((items)=>[...items,Math.floor(Math.random()*4)]);setTimeout(()=>{setShowing(true);setInputIndex(0);setTimeout(()=>setShowing(false),500)},500)}}else setInputIndex((value)=>value+1)}else{setFinished(true);finishGame({gameId:'sequence',score:level,xp:level*5,durationMinutes:1})}}
  useEffect(()=>{if(level>1&&!finished){let items=[...sequence];setShowing(true);items.forEach((value,index)=>setTimeout(()=>{setActive(value);setTimeout(()=>setActive(null),360)},600+index*580));setTimeout(()=>{setShowing(false);setInputIndex(0)},600+items.length*580)}},[level]) // eslint-disable-line react-hooks/exhaustive-hooks
  return <div className="page game-page"><BackHeader title="Sequence Recall" subtitle={`Level ${level} • repeat the pattern`} onBack={onBack}/><div className="sequence-status">{finished?'Game complete':showing?'Watch the pattern':'Your turn'}</div><div className="sequence-grid">{pads.map((color,index)=><button key={color} aria-label={`Pad ${index+1}`} style={{background:active===index?color:'#ececf4',boxShadow:active===index?`0 0 28px ${color}88`:'none'}} onClick={()=>hit(index)}/>)}</div>{finished&&<div className="complete"><button className="primary-button" onClick={reset}>Play again</button></div>}</div>
}

function ColorGame({ onBack, finishGame }) {
  const colors=[{name:'RED',color:'#df6666'},{name:'BLUE',color:'#557bd3'},{name:'GREEN',color:'#4eaa79'},{name:'YELLOW',color:'#d3a43d'}]; const [round,setRound]=useState(1),[score,setScore]=useState(0),[prompt,setPrompt]=useState(colors[0]),[finished,setFinished]=useState(false)
  const next=()=>{setPrompt(colors[Math.floor(Math.random()*colors.length)]);setRound((value)=>value+1)}
  useEffect(()=>{const ink=colors[Math.floor(Math.random()*colors.length)];setPrompt({...ink,ink:colors[Math.floor(Math.random()*colors.length)].color})},[])
  const choose=(name)=>{if(finished)return;const correct=name===prompt.name;if(correct)setScore((value)=>value+1);if(round===15){const final=score+(correct?1:0);setFinished(true);finishGame({gameId:'color',score:final,xp:12+final*2,durationMinutes:2})}else next()}
  const inkPrompt=prompt.ink||prompt.color
  return <div className="page game-page"><BackHeader title="Color Rush" subtitle="Choose the meaning of the word, not its color" onBack={onBack}/><div className="color-card"><div className="math-status"><span>Round {Math.min(round,15)} / 15</span><strong>Score: {score}</strong></div>{finished?<h2>Final score: {score}/15</h2>:<h2 style={{color:inkPrompt}}>{prompt.name}</h2>}<div className="color-options">{colors.map((color)=><button key={color.name} onClick={()=>choose(color.name)} style={{borderColor:color.color}}>{color.name}</button>)}</div>{finished&&<button className="primary-button" onClick={()=>{setRound(1);setScore(0);setFinished(false)}}>Play again</button>}</div></div>
}

function OddGame({ onBack, finishGame }) {
  const [round,setRound]=useState(1),[score,setScore]=useState(0),[odd,setOdd]=useState(Math.floor(Math.random()*16)),[finished,setFinished]=useState(false)
  const [shape,setShape]=useState(['●','◆','▲','■'][Math.floor(Math.random()*4)])
  const resetRound=()=>{setOdd(Math.floor(Math.random()*16));setShape(['●','◆','▲','■'][Math.floor(Math.random()*4)]);setRound((value)=>value+1)}
  
  const choose=(index)=>{if(finished)return;const correct=index===odd;if(correct)setScore((value)=>value+1);if(round===12){const final=score+(correct?1:0);setFinished(true);finishGame({gameId:'odd',score:final,xp:10+final*2,durationMinutes:2})}else resetRound()}
  return <div className="page game-page"><BackHeader title="Odd One Out" subtitle="Find the shape that doesn't belong" onBack={onBack}/><div className="odd-card"><div className="math-status"><span>Round {Math.min(round,12)} / 12</span><strong>Score: {score}</strong></div>{finished?<h2>Final score: {score}/12</h2>:<div className="odd-grid">{Array.from({length:16},(_,index)=><button key={index} onClick={()=>choose(index)} aria-label={`Shape ${index+1}`} className={index===odd?'odd-target':''}>{index===odd?'✦':shape}</button>)}</div>}{finished&&<button className="primary-button" onClick={()=>{setRound(1);setScore(0);setFinished(false);resetRound()}}>Play again</button>}</div></div>
}

export default App
