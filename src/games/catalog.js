export const categories = {
  memory: 'Memory Training',
  logic: 'Logic & Reasoning',
  attention: 'Attention & Concentration',
  math: 'Mathematics',
  language: 'Language & Verbal',
  spatial: 'Spatial Intelligence',
}

export const games = [
  ['number-memory','Number Sequence Memory','memory','Number Sequence','Remember an increasingly long number'],
  ['pattern-memory','Pattern Memory','memory','Sequence','Repeat expanding visual patterns'],
  ['card-match','Card Matching','memory','Matching','Match all hidden pairs'],
  ['image-recall','Image Sequence Recall','memory','Sequence','Recall symbols in their original order'],
  ['word-memory','Word Memory','memory','Word List','Recall displayed words'],
  ['color-memory','Color Sequence Memory','memory','Sequence','Repeat the growing color pattern'],
  ['spatial-memory','Spatial Memory','memory','Grid','Remember illuminated grid positions'],
  ['flash-memory','Flash Memory','memory','Flash','Capture briefly shown objects'],
  ['object-recall','Object Recall','memory','Recall','Identify objects seen before'],
  ['grid-memory','Grid Memory','memory','Grid','Memorize and restore a grid'],
  ['sudoku','Sudoku','logic','Grid','Complete a valid number grid'],
  ['logical-sequences','Logical Sequences','logic','Pattern','Choose the next logical item'],
  ['missing-number','Missing Number','logic','Patterns','Find the missing value'],
  ['math-patterns','Mathematical Patterns','logic','Patterns','Complete an arithmetic pattern'],
  ['logical-deduction','Logical Deduction','logic','Deduction','Use clues to solve the deduction'],
  ['odd-one','Odd One Out','logic','Perception','Spot the item that does not belong'],
  ['visual-reasoning','Visual Reasoning','logic','Shapes','Find the matching rule'],
  ['shape-completion','Shape Completion','logic','Shapes','Complete the missing shape'],
  ['number-puzzles','Number Puzzles','logic','Numbers','Solve an arithmetic riddle'],
  ['riddle','Riddle Challenge','logic','Word','Choose the answer to each riddle'],
  ['stroop','Stroop Test','attention','Distraction','Choose meaning, not text color'],
  ['find-difference','Find the Difference','attention','Visual','Locate differences in a pair'],
  ['target-id','Target Identification','attention','Search','Find the requested target'],
  ['color-search','Color Search','attention','Search','Search for a named color'],
  ['focus','Focus Test','attention','Attention','Track the changing target'],
  ['reaction','Reaction Time Test','attention','Reaction','Respond as soon as the signal appears'],
  ['distraction','Distraction Resistance','attention','Distraction','Ignore decoys and choose the target'],
  ['visual-scan','Visual Scanning','attention','Search','Scan a grid for the hidden target'],
  ['quick-math','Quick Math','math','Arithmetic','Solve fast arithmetic problems'],
  ['multiplication','Mental Multiplication','math','Arithmetic','Multiply increasingly large numbers'],
  ['arithmetic','Arithmetic Challenge','math','Arithmetic','Solve multi-step expressions'],
  ['equation','Equation Solver','math','Algebra','Solve for the unknown'],
  ['comparison','Number Comparison','math','Comparison','Choose the greater or smaller value'],
  ['operator','Missing Operator','math','Arithmetic','Select the correct operator'],
  ['math-speed','Math Speed Challenge','math','Speed','Answer a rapid set of math questions'],
  ['word-scramble','Word Scramble','language','Words','Unscramble the displayed word'],
  ['vocabulary','Vocabulary Challenge','language','Words','Choose the closest meaning'],
  ['anagram','Anagram Solver','language','Words','Rearrange letters into a valid word'],
  ['association','Word Association','language','Words','Choose the strongest association'],
  ['letter-sequence','Letter Sequence','language','Patterns','Complete the letter pattern'],
  ['mental-rotation','Mental Rotation','spatial','Shapes','Match a rotated shape'],
  ['shape-match','Shape Matching','spatial','Shapes','Match equivalent shapes'],
  ['mirror','Mirror Image','spatial','Shapes','Select the correct mirror image'],
  ['path','Path Finding','spatial','Navigation','Choose the valid route'],
  ['spatial-puzzle','Spatial Puzzle','spatial','Grid','Arrange pieces into the target'],
  ['hanoi','Tower of Hanoi','spatial','Puzzle','Move every disk to the destination'],
  ['blocks','Block Arrangement','spatial','Grid','Arrange blocks in sequence'],
  ['maze','Maze Challenge','spatial','Navigation','Navigate from start to finish'],
].map(([id,title,category,mechanic,description]) => ({ id,title,category,mechanic,description }))

export const getDifficultyName = level => level <= 10 ? 'Beginner' : level <= 20 ? 'Easy' : level <= 30 ? 'Intermediate' : level <= 40 ? 'Advanced' : 'Expert'

export function getTimeLimit(gameId, level, mode='normal') {
  const base = ['reaction','focus','stroop','distraction','math-speed','quick-math','multiplication'].includes(gameId) ? 45 : 75
  const scaled = Math.max(20, base - Math.floor(level / 5) * 3)
  if (mode === 'speed') return Math.max(15, Math.floor(scaled * 0.75))
  if (mode === 'accuracy') return Math.max(30, Math.floor(scaled * 1.25))
  if (mode === 'endless') return scaled
  return scaled
}
