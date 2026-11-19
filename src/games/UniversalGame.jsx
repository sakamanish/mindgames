import { useEffect, useRef, useState } from 'react'
import { getDifficultyName, getTimeLimit } from './catalog'

const words=['planet','bridge','garden','camera','silver','forest','orange','puzzle','rocket','anchor','canvas','music','button','socket','crystal','meadow']
const riddles=[['What has keys but opens no doors?','Piano'],['What gets wetter as it dries?','Towel'],['What has a face and two hands?','Clock'],['What has many teeth but cannot bite?','Comb']]

function makeQuestion(game, level) {
  const pool=game.category==='math'?['math','operator','comparison','equation','pattern']:game.category==='language'?['word','association','sequence']:game.category==='spatial'?['mirror','spatial','shape','maze']:game.category==='attention'?['stroop','search','target','reaction']:game.category==='memory'?['grid','sequence','word','flash']:['pattern','missing','odd','choice','sudoku']
  let type=pool[Math.floor(Math.random()*pool.length)]
  const range=8+level*3
  if(type==='math'||type==='operator'||type==='comparison'||type==='equation'||type==='pattern'||type==='missing'){
    if(type==='pattern'){const a=2+Math.floor(Math.random()*8),d=1+Math.floor(level/8)+Math.floor(Math.random()*4);const vals=[a,a+d,a+d*2,a+d*3];return {prompt:`${vals.join(' · ')} · ?`,options:[a+d*4,a+d*3+1,a+d*4+2,a+d*2-1].map(String),answer:String(a+d*4),type}}
    if(type==='operator'){const a=5+Math.floor(Math.random()*range),b=2+Math.floor(Math.random()*12),answer=a+b;return {prompt:`${a} ? ${b} = ${answer}`,options:['+','−','×','÷'],answer:'+',type}}
    if(type==='comparison'){const a=Math.floor(Math.random()*range),b=Math.floor(Math.random()*range);return {prompt:`Which number is larger?  ${a}  or  ${b}`,options:[String(a),String(b)],answer:String(Math.max(a,b)),type}}
    if(type==='equation'){const x=2+Math.floor(Math.random()*range/2),m=2+Math.floor(Math.random()*8),b=1+Math.floor(Math.random()*10);return {prompt:`${m}x + ${b} = ${m*x+b}` ,options:[String(x),String(x+1),String(x-1),String(x+2)],answer:String(x),type}}
    if(type==='missing'){const a=2+Math.floor(Math.random()*range),b=2+Math.floor(Math.random()*range);return {prompt:`Choose the missing number: ${a}, ${a+b}, ${a+b*2}, ?`,options:[String(a+b*3),String(a+b*2+b/2),String(a+b*2+1),String(a+b*2-1)],answer:String(a+b*3),type}}
    const a=Math.floor(Math.random()*range),b=Math.floor(Math.random()*12);return {prompt:`${a} + ${b}`,options:[String(a+b),String(a+b+1),String(a+b-1),String(a+b+2)],answer:String(a+b),type:'math'}
  }
  if(type==='word'||type==='association'||type==='sequence'){
    if(type==='association')return {prompt:'Choose the word most strongly associated with “library”',options:['map','books','table','ocean'],answer:'books',type}
    if(type==='sequence'){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';const start=Math.floor(Math.random()*18);return {prompt:`Complete the sequence: ${alphabet[start]}, ${alphabet[start+1]}, ${alphabet[start+2]}, ?`,options:[alphabet[start+3],alphabet[start+4],alphabet[start+1],alphabet[start-1]],answer:alphabet[start+3],type}}
    const word=words[Math.floor(Math.random()*words.length)],scrambled=[...word].sort(()=>Math.random()-0.5).join('');if(scrambled===word)return makeQuestion(game,level)
    return {prompt:`Unscramble this word: ${scrambled.toUpperCase()}`,options:shuffleUnique([word,words[(words.indexOf(word)+3)%words.length],words[(words.indexOf(word)+7)%words.length],words[(words.indexOf(word)+11)%words.length]].map(v=>v.toUpperCase())),answer:word.toUpperCase(),type}
  }
  if(type==='stroop'||type==='target'||type==='search'||type==='reaction'||type==='flash'){
    const colors=[['RED','#d95d67'],['BLUE','#557bd3'],['GREEN','#4eaa79'],['GOLD','#c79a3b']],value=colors[Math.floor(Math.random()*colors.length)],ink=colors[Math.floor(Math.random()*colors.length)]
    if(type==='stroop')return {prompt:value[0],ink:ink[1],question:'Choose the word meaning',options:colors.map(v=>v[0]),answer:value[0],type}
    if(type==='target')return {prompt:'Find the target symbol',target:'◆',options:['◆','●','▲','■'],answer:'◆',type:'choice'}
    if(type==='reaction')return {prompt:'Wait for the green target, then choose GO',options:['WAIT','GO'],answer:'GO',type:'reaction'}
    return {prompt:'Which item appeared in the highlighted group?',target:'⚡',options:['⚡','★','●','▲'],answer:'⚡',type:'choice'}
  }
  if(type==='sudoku'){
    const base=[1,2,3,4],row=(Math.floor(Math.random()*4)),col=(Math.floor(Math.random()*4));return {prompt:`Select the missing number in the 4×4 Sudoku pattern`,options:['1','2','3','4'],answer:String(base[(row+col+1)%4]),type}
  }
  if(type==='mirror'||type==='spatial'||type==='shape'||type==='maze'){
    if(type==='maze')return {prompt:'Choose the valid route: Start → right → right → down',options:['Right · Right · Down','Left · Right · Down','Right · Left · Down','Down · Left · Up'],answer:'Right · Right · Down',type}
    if(type==='mirror')return {prompt:'Which option is the mirror image of ◀?',options:['▶','◀','▲','▼'],answer:'▶',type}
    if(type==='spatial')return {prompt:'Which arrangement completes the pattern?  ● · ▲ · ● · ?',options:['▲','■','◆','●'],answer:'▲',type}
    return {prompt:'Complete the shape pattern: ■ · ■▲ · ■▲▲ · ?',options:['■▲▲▲','▲▲','■■■','■▲■'],answer:'■▲▲▲',type}
  }
  if(type==='grid'||type==='flash'){
    const count=Math.min(4+Math.floor(level/8),9),answer=Math.floor(Math.random()*count)
    return {prompt:`Remembered target #${answer+1}`,target:answer,options:Array.from({length:count},(_,i)=>String(i+1)),answer:String(answer+1),type:'grid'}
  }
  if(type==='odd'||type==='choice'){
    const shapes=['●','■','▲','◆'];const answer=shapes[Math.floor(Math.random()*4)];return {prompt:'Select the odd one out',options:shuffleUnique([answer,answer+'',answer+'',answer+'']),answer, type:'odd'}
  }
  const r=riddles[Math.floor(Math.random()*riddles.length)]
  return {prompt:r[0],options:shuffleUnique([r[1],'Cup','Window','Pen']),answer:r[1],type:'choice'}
}

function shuffleUnique(items){return [...new Set(items)].sort(()=>Math.random()-0.5)}

export default function UniversalGame({ game, profile, onBack, finishGame }) {
  const levelState=profile.games[game.id]
  const [level,setLevel]=useState(levelState?.unlockedLevel||1)
  const [mode,setMode]=useState('normal')
  const [phase,setPhase]=useState('intro')
  const [question,setQuestion]=useState(null)
  const [round,setRound]=useState(0)
  const [correct,setCorrect]=useState(0)
  const [incorrect,setIncorrect]=useState(0)
  const [score,setScore]=useState(0)
  const [streak,setStreak]=useState(0)
  const [remaining,setRemaining]=useState(getTimeLimit(game.id,level,mode))
  const [startedAt,setStartedAt]=useState(null)
  const [feedback,setFeedback]=useState('')
  const [countdown,setCountdown]=useState(null)
  const timer=useRef(null)
  const countdownTimer=useRef(null)

  const difficulty=getDifficultyName(level)
  const limit=getTimeLimit(game.id,level,mode)

  const nextQuestion=question

  useEffect(()=>{if(phase==='playing') timer.current=setInterval(()=>setRemaining(v=>Math.max(0,v-1)),1000);return()=>{clearInterval(timer.current);clearInterval(countdownTimer.current)}},[phase])
  useEffect(()=>{if(phase==='playing'&&remaining===0) finish()},[remaining]) // eslint-disable-line react-hooks/exhaustive-deps

  const start=(selectedLevel=level,selectedMode=mode)=>{
    setLevel(Math.min(selectedLevel,levelState?.unlockedLevel||1));setMode(selectedMode);setRound(0);setCorrect(0);setIncorrect(0);setScore(0);setStreak(0);setRemaining(getTimeLimit(game.id,selectedLevel,selectedMode));setStartedAt(Date.now());setQuestion(makeQuestion(game,selectedLevel));setCountdown(3)
    let value=3
    countdownTimer.current=setInterval(()=>{value-=1;if(value>0)setCountdown(value);else{clearInterval(countdownTimer.current);setCountdown(null);setPhase('playing')}},700)
  }

  function finish(finalStats){
    if(phase==='results')return
    setPhase('results');clearInterval(timer.current)
    const elapsed=startedAt?Math.round((Date.now()-startedAt)/1000):Math.max(1,limit-remaining)
    const finalCorrect=finalStats?.correct ?? correct
    const finalIncorrect=finalStats?.incorrect ?? incorrect
    const finalScore=finalStats?.score ?? score
    const answered=finalCorrect+finalIncorrect
    const accuracy=answered?Math.round(finalCorrect/answered*100):0
    const xp=Math.max(5,Math.round(finalScore/10+(accuracy>=80?level*2:level)))
    finishGame({gameId:game.id,level,mode,score:finalScore,correct:finalCorrect,incorrect:finalIncorrect,answered,accuracy,durationSeconds:elapsed,xp,lowerIsBetter:false})
  }

  const answer=(value)=>{
    if(phase!=='playing'||remaining<=0)return
    const current=question||nextQuestion
    const isCorrect=value===current.answer
    if(isCorrect){const speedBonus=Math.max(0,Math.ceil(remaining/4));const streakBonus=Math.max(0,streak*5);const earned=100+speedBonus+streakBonus+level*3;setCorrect(v=>v+1);setStreak(v=>v+1);setScore(v=>v+earned);setFeedback('Correct!')}
    else{setIncorrect(v=>v+1);setStreak(0);setScore(v=>Math.max(0,v-25));setFeedback(`Correct: ${current.answer}`)}
    if(round+1>=10){
      const finalCorrect=correct+(isCorrect?1:0)
      const finalIncorrect=incorrect+(isCorrect?0:1)
      const speedBonus=Math.max(0,Math.ceil(remaining/4))
      const streakBonus=Math.max(0,streak*5)
      const finalScore=isCorrect?score+100+speedBonus+streakBonus+level*3:Math.max(0,score-25)
      setTimeout(()=>finish({correct:finalCorrect,incorrect:finalIncorrect,score:finalScore}),600)
    } else setTimeout(()=>{setRound(v=>v+1);setQuestion(makeQuestion(game,level));setFeedback('')},600)
  }

  const currentQuestion=question||nextQuestion

  if(phase==='intro')return <div className="mobile-game-shell intro"><header className="mobile-game-top"><button className="game-back" onClick={onBack} aria-label="Back">‹</button><div><small>{game.category}</small><strong>{game.title}</strong></div><span className="level-pill">LV {level}</span></header><main className="game-intro-content"><div className={`game-hero-icon ${game.category}`}><span>{game.category==='math'?'∑':game.category==='memory'?'▦':game.category==='attention'?'⚡':game.category==='spatial'?'◆':'◇'}</span></div><h1>{game.title}</h1><p>{game.description}</p><div className="game-intro-meta"><div><small>DIFFICULTY</small><strong>{difficulty}</strong></div><div><small>TIME</small><strong>{limit}s</strong></div><div><small>REWARD</small><strong>+XP</strong></div></div><div className="difficulty-strip mobile-level-strip"><button disabled className="active">Level {level}</button>{[10,20,30,40,50].map(v=><button key={v} disabled={v>(levelState?.unlockedLevel||1)}>Lv {v}{v>(levelState?.unlockedLevel||1)?' 🔒':''}</button>)}</div><div className="mode-list mobile-mode-list">{['normal','speed','accuracy','endless'].map(v=><button key={v} className={mode===v?'active':''} onClick={()=>setMode(v)}>{v}</button>)}</div><button className="mobile-start-button" onClick={()=>start()}><span>▶</span> Start game</button></main></div>

  /* legacy desktop intro */
  if(phase==='legacy-intro')return <div className="page game-page"><header className="game-header"><button className="back" onClick={onBack}>←</button><div><p className="eyebrow">{game.category}</p><h1>{game.title}</h1><p>{game.description}</p></div></header><div className="intro-card"><div className="difficulty-strip">{[1,10,20,30,40,50].map(v=><button key={v} disabled={v>(levelState?.unlockedLevel||1)} className={level===v?'active':''} onClick={()=>setLevel(v)}>Level {v}{v>(levelState?.unlockedLevel||1)?' 🔒':''}</button>)}</div><h2>{difficulty} level</h2><p>Answer 10 challenges. Accuracy and remaining time build your score.</p><div className="mode-list">{['normal','speed','accuracy','endless'].map(v=><button key={v} className={mode===v?'active':''} onClick={()=>setMode(v)}>{v}</button>)}</div><button className="primary-button" onClick={()=>start()}>Start challenge</button></div></div>

  if(countdown!==null)return <div className="mobile-countdown"><span>{countdown}</span><small>Get ready</small></div>

  if(phase==='results'){
    const answered=correct+incorrect,accuracy=answered?Math.round(correct/answered*100):0
    const pb=profile.games[game.id]?.bestScore
    return <div className="mobile-game-shell results"><header className="mobile-game-top"><button className="game-back" onClick={onBack} aria-label="Back">‹</button><div><small>CHALLENGE COMPLETE</small><strong>{game.title}</strong></div><span className="level-pill">LV {level}</span></header><main className="game-results-content"><div className="results-badge"><span>★</span><strong>Level complete</strong></div><div className="result-ring" style={{'--progress':`${accuracy}%`}}><strong>{accuracy}%</strong><small>Accuracy</small></div><div className="xp-earned"><small>XP EARNED</small><strong>+{Math.max(5,Math.round(score/10+(accuracy>=80?level*2:level)))}</strong></div><div className="result-stats"><div><small>SCORE</small><strong>{score}</strong></div><div><small>CORRECT</small><strong>{correct}</strong></div><div><small>INCORRECT</small><strong>{incorrect}</strong></div><div><small>BEST</small><strong>{pb??score}</strong></div></div><div className="result-actions"><button className="mobile-start-button" onClick={()=>start(level,mode)}>Play again</button>{level<50&&<button className="secondary-button" onClick={()=>start(Math.min(50,level+1),mode)}>Next level</button>}<button className="secondary-button" onClick={onBack}>Home</button></div></main></div>
  }

  if(phase==='paused')return <div className="mobile-countdown pause"><div className="pause-card"><span>Ⅱ</span><h1>Paused</h1><p>Your challenge is waiting.</p><button className="mobile-start-button" onClick={()=>setPhase('playing')}>Resume</button><button className="secondary-button" onClick={onBack}>Quit</button></div></div>

  return <div className="mobile-game-shell playing"><header className="mobile-game-top"><button className="game-back" onClick={onBack} aria-label="Back">‹</button><div><small>LEVEL {level} · {difficulty}</small><strong>{game.title}</strong></div><button className="game-pause" aria-label="Pause" onClick={()=>setPhase(phase==='paused'?'playing':'paused')}>Ⅱ</button></header><section className="game-status-bar"><div className={`game-timer ${remaining<=10?'warning':''}`}><small>TIME</small><strong>{remaining}s</strong></div><div className="game-score"><small>SCORE</small><strong>{score}</strong></div><div className="game-round"><small>ROUND</small><strong>{round+1}/10</strong></div></section><div className="timer-track game-timer-track"><i style={{width:`${(remaining/limit)*100}%`}} /></div><main className="live-game-board"><div className="live-score"><span>Streak ×{streak}</span><span>{feedback||'Choose the answer'}</span></div><h2 style={currentQuestion?.ink?{color:currentQuestion.ink}:{}}>{currentQuestion?.prompt}</h2>{currentQuestion?.question&&<p>{currentQuestion.question}</p>}<div className="answer-grid mobile-answer-grid">{currentQuestion?.options.map(option=><button key={option} onClick={()=>answer(option)}>{option}</button>)}</div>{feedback&&<div className="answer-feedback">{feedback}</div>}</main></div>
}
