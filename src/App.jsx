import { useEffect, useState } from 'react'
import './App.css'
import { clearProfile, loadProfile, recordSession, saveProfile, defaultProfile, exportProfile, importProfile, getLocalDateKey } from './storage'
import { games as catalogGames } from './games/catalog'
import UniversalGame from './games/UniversalGame'

const GAMES = catalogGames.map((game, index) => ({
  id: game.id,
  icon: ['▦','⚡','∑','◉','◒','◇','◆','A','●','△'][index % 10],
  color: ['purple','orange','blue','pink','green','yellow'][index % 6],
  title: game.title,
  detail: game.description,
  category: game.category,
  mechanic: game.mechanic,
}))

const findCatalogGame = (id) => catalogGames.find((game) => game.id === id)

function App() {
  const [profile, setProfile] = useState(defaultProfile)
  const [screen, setScreen] = useState('home')
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => { let mounted = true; loadProfile().then((saved) => { if (mounted) { setProfile(saved); setProfileLoaded(true) } }); return () => { mounted = false } }, [])
  useEffect(() => { if (profileLoaded) saveProfile(profile) }, [profile, profileLoaded])

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
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <button className={screen==='home'?'active':''} onClick={()=>setScreen('home')}><span>⌂</span><small>Home</small></button>
          <button className={screen==='games'?'active':''} onClick={()=>setScreen('games')}><span>▦</span><small>Games</small></button>
          <button className={screen==='challenges'?'active':''} onClick={()=>setScreen('challenges')}><span>◆</span><small>Challenges</small></button>
          <button className={screen==='progress'?'active':''} onClick={()=>setScreen('progress')}><span>◷</span><small>Progress</small></button>
          <button className={screen==='profile'?'active':''} onClick={()=>setScreen('profile')}><span>◉</span><small>Profile</small></button>
        </nav>
        <div className="profile">
          <div className="avatar">M</div>
          <div><strong>Mind Trainer</strong><small>Level {Math.floor(profile.xp / 100) + 1}</small></div>
          <button aria-label="Reset local progress" title="Reset local progress" onClick={() => {
            if (window.confirm('Reset all MindMint progress on this device?')) {
              clearProfile(); setProfile(structuredClone(defaultProfile)); setProfileLoaded(false); setTimeout(()=>setProfileLoaded(true),0)
            }
          }}>↺</button>
        </div>
      </aside>

      <main>
        {screen === 'home' && <Home profile={profile} openGame={openGame} />}
        {screen === 'games' && <Library openGame={openGame} profile={profile} />}
        {screen === 'progress' && <Progress profile={profile} setProfile={setProfile} />}
        {screen === 'challenges' && <Challenges profile={profile} openGame={openGame} />}
        {screen === 'profile' && <Profile profile={profile} setProfile={setProfile} />}
        {!['home','games','progress','challenges','profile'].includes(screen) && findCatalogGame(screen) && (
          <UniversalGame
            game={findCatalogGame(screen)}
            profile={profile}
            onBack={() => setScreen('games')}
            finishGame={finishGame}
          />
        )}
      </main>
    </div>
  )
}

function NavButton({ screen, target, icon, label, onClick }) {
  return <button className={screen === target ? 'nav-item active' : 'nav-item'} onClick={() => onClick(target)}><span>{icon}</span>{label}</button>
}

function bestLabel(game, profile) {
  const value = profile.bests?.[game.id] ?? profile.games?.[game.id]?.bestScore
  if (value == null) return 'No score yet'
  if (game.id === 'reaction') return `Best: ${value} ms`
  if (game.id === 'memory') return `Best: ${value} moves`
  return `Best: ${value}`
}

function Home({ profile, openGame }) {
  const level = Math.floor(profile.xp / 100) + 1
  const progress = profile.xp % 100
  const today = getLocalDateKey()
  const playedToday = profile.sessions.filter((session) => session.localDate === today).length

  return <div className="page home-page">
    <header className="mobile-home-header">
      <button className="mobile-avatar" onClick={() => openGame('profile')} aria-label="Open profile">M</button>
      <div className="mobile-player"><small>LEVEL {level}</small><div className="mobile-xp-track"><i style={{ width: `${progress}%` }} /></div></div>
      <div className="mobile-streak"><span>🔥</span><strong>{profile.streak}</strong></div>
      <button className="mobile-settings" onClick={() => openGame('profile')} aria-label="Open settings">⚙</button>
    </header>

    <div className="desktop-welcome"><p className="eyebrow">TODAY'S TRAINING</p><h1>Ready for a brain boost?</h1></div>

    <section className="workout-card">
      <div className="workout-orb"><span>🧠</span><i>✦</i></div>
      <div className="workout-copy"><small>Today's brain workout</small><h2>{Math.max(0, 3 - playedToday)} game{Math.max(0, 3 - playedToday) === 1 ? '' : 's'} to go</h2><p><span>+150 XP</span> · {playedToday}/3 complete</p></div>
      <button onClick={() => openGame(GAMES[Math.min(playedToday, 2)].id)}>Play now <b>▶</b></button>
    </section>

    <section className="mobile-collection"><div className="collection-heading"><h2>Continue playing</h2><button onClick={() => openGame('games')}>See all</button></div><div className="game-carousel">{GAMES.slice(0, 8).map((game, index)=><MobileGameTile key={game.id} game={game} profile={profile} onClick={()=>openGame(game.id)} featured={index===0}/>)}</div></section>

    <section className="mobile-collection"><div className="collection-heading"><h2>Recommended for you</h2><button onClick={() => openGame('games')}>Explore</button></div><div className="game-carousel">{GAMES.slice(8, 16).map((game)=><MobileGameTile key={game.id} game={game} profile={profile} onClick={()=>openGame(game.id)}/>)}</div></section>

    <section className="mobile-daily"><div><span>◆</span><p><small>DAILY CHALLENGE</small><strong>Mixed workout</strong></p></div><b>+200 XP</b><button onClick={() => openGame('challenges')}>View</button></section>

    <section className="desktop-section">
      <div className="section-heading"><h2>Choose a game</h2><button onClick={() => openGame('games')}>View library <b>→</b></button></div>
      <div className="game-grid">{GAMES.slice(0, 3).map((game)=><GameCard key={game.id} game={game} best={bestLabel(game, profile)} onClick={()=>openGame(game.id)}/>)}</div>
      <div className="stats-row"><Stat icon="🔥" className="purple-bg" label="CURRENT STREAK" value={`${profile.streak} days`} /><Stat icon="◷" className="orange-bg" label="MINUTES TODAY" value={`${Math.floor((profile.totalPlayTimeSeconds || 0)/60)} min`} /><Stat icon="◇" className="blue-bg" label="TOTAL XP" value={`${profile.xp} XP`} /></div>
    </section>
  </div>
}

function MobileGameTile({ game, profile, onClick, featured=false }) {
  const state = profile.games?.[game.id]
  const level = state?.unlockedLevel || 1
  const progress = Math.min(100, ((state?.highestLevel || 0) / 50) * 100)
  return <button className={`mobile-game-tile ${featured?'featured':''}`} onClick={onClick}>
    <span className={`tile-art ${game.color}`}><b>{game.icon}</b><i /></span>
    <strong>{game.title}</strong>
    <small>Level {level}</small>
    <div className="tile-progress"><i style={{width:`${progress}%`}} /></div>
  </button>
}

function Stat({ icon, className, label, value }) {
  return <div><span className={`stat-icon ${className}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>
}

function GameCard({ game, best, onClick }) {
  return <button className="game-card" onClick={onClick}><span className={`game-icon ${game.color}`}>{game.icon}</span><div><h3>{game.title}</h3><p>{game.detail}</p><small>{best}</small></div><b>→</b></button>
}

function Challenges({ profile, openGame }) {
  const challengeGames = GAMES.slice(0, 3)
  const completed = challengeGames.filter((game) => profile.sessions.some((session) => session.gameId === game.id && session.localDate === getLocalDateKey())).length
  return <div className="page mobile-screen-page"><header className="mobile-page-header"><p>DAILY CHALLENGE</p><h1>Three minds. One win.</h1></header><section className="challenge-hero"><div className="challenge-ring" style={{'--progress':`${completed/3*360}deg`}}><strong>{completed}/3</strong></div><div><small>DAILY REWARD</small><b>+200 XP</b></div></section><div className="challenge-list">{challengeGames.map((game,index)=><button key={game.id} onClick={()=>openGame(game.id)}><span className={`game-icon ${game.color}`}>{game.icon}</span><div><small>CHALLENGE {index+1}</small><strong>{game.title}</strong></div><b>→</b></button>)}</div></div>
}

function Profile({ profile, setProfile }) {
  const level = Math.floor(profile.xp/100)+1
  return <div className="page mobile-screen-page"><header className="mobile-page-header"><p>YOUR JOURNEY</p><h1>Trainer profile</h1></header><section className="profile-hero"><div className="profile-avatar">M</div><div><small>LEVEL {level}</small><strong>{profile.xp} XP</strong><div className="mobile-xp-track"><i style={{width:`${profile.xp%100}%`}} /></div></div></section><section className="profile-stats"><div><span>🔥</span><strong>{profile.streak}</strong><small>Day streak</small></div><div><span>★</span><strong>{profile.sessions.length}</strong><small>Games played</small></div><div><span>◷</span><strong>{Math.floor((profile.totalPlayTimeSeconds||0)/60)}m</strong><small>Training</small></div></section><div className="profile-actions"><button onClick={()=>exportProfile(profile)}>Export backup</button><label>Import backup<input type="file" accept="application/json" onChange={async(event)=>{const file=event.target.files?.[0];if(!file)return;try{setProfile(await importProfile(file))}catch(error){alert(error.message)}}}/></label><button className="danger" onClick={()=>{if(confirm('Reset all local progress?')){clearProfile();setProfile(structuredClone(defaultProfile))}}}>Reset progress</button></div></div>
}

function Library({ openGame, profile }) {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')
  const categories = ['All', ...new Set(GAMES.map((game) => game.category))]
  const visible = (filter === 'All' ? GAMES : GAMES.filter((game) => game.category === filter))
    .filter((game) => `${game.title} ${game.detail}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'name' ? a.title.localeCompare(b.title) : sort === 'recent' ? (profile.sessions.findIndex((s) => s.gameId === b.id) - profile.sessions.findIndex((s) => s.gameId === a.id)) : (profile.games[b.id]?.bestScore || 0) - (profile.games[a.id]?.bestScore || 0))
  return <div className="page mobile-screen-page"><header className="mobile-page-header"><p>GAME COLLECTION</p><h1>Choose your challenge</h1></header><div className="library-tools"><label><span>⌕</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search 48 games" /></label><select value={sort} onChange={(event)=>setSort(event.target.value)} aria-label="Sort games"><option value="name">Name</option><option value="recent">Recently played</option><option value="best">Personal best</option></select></div><div className="filters">{categories.map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{category}</button>)}</div><section className="library-grid mobile-library-grid">{visible.map((game) => <GameCard key={game.id} game={game} best={bestLabel(game, profile)} onClick={() => openGame(game.id)} />)}</section></div>
}

function Progress({ profile, setProfile }) {
  const level = Math.floor(profile.xp / 100) + 1
  const recent = profile.sessions.slice(0, 8)
  return <div className="page"><header className="topbar"><div><p className="eyebrow">YOUR PERFORMANCE</p><h1>Progress</h1></div><div className="backup-actions"><button onClick={()=>exportProfile(profile)}>Export backup</button><label className="import-button">Import backup<input type="file" accept="application/json" onChange={async(event)=>{const file=event.target.files?.[0];if(!file)return;try{setProfile(await importProfile(file))}catch(error){window.alert(error.message)}}}/></label></div></header><section className="progress-cards"><div><small>LEVEL</small><strong>{level}</strong></div><div><small>TOTAL XP</small><strong>{profile.xp}</strong></div><div><small>GAMES PLAYED</small><strong>{profile.sessions.length}</strong></div><div><small>BEST STREAK</small><strong>{profile.streak} days</strong></div></section><section className="history-panel"><div className="panel-heading"><h2>Recent activity</h2><small>Saved locally</small></div>{recent.length === 0 ? <div className="empty-state">Complete a game to start your history.</div> : recent.map((session) => { const game = GAMES.find((item) => item.id === session.gameId); return <div className="history-row" key={session.id}><span className={`game-icon ${game?.color || 'purple'}`}>{game?.icon || '◆'}</span><div><strong>{game?.title || session.gameId}</strong><small>{new Date(session.date).toLocaleDateString()}</small></div><b>+{session.xp} XP</b></div> })}</section></div>
}

export default App
