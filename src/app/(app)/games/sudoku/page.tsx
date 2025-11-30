"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Board = number[][]

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeSolvedSudoku(n: number, br: number, bc: number): Board {
  const board: Board = Array.from({ length: n }, () => Array(n).fill(0))
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      board[r][c] = ((r * bc + Math.floor(r / br) + c) % n) + 1
    }
  }
  const bandRows: number[] = []
  for (let b = 0; b < n; b += br) {
    const rows = shuffle(range(br)).map(i => b + i)
    bandRows.push(...rows)
  }
  const board1 = bandRows.map(r => board[r])
  const bandOrder = shuffle(range(n / br))
  const board2 = bandOrder.flatMap(bi => board1.slice(bi * br, (bi + 1) * br))
  const colIdx = [] as number[]
  for (let s = 0; s < n; s += bc) {
    const cols = shuffle(range(bc)).map(i => s + i)
    colIdx.push(...cols)
  }
  const board3 = board2.map(row => colIdx.map(ci => row[ci]))
  const stackOrder = shuffle(range(n / bc))
  const colOrder = stackOrder.flatMap(si => colIdx.slice(si * bc, (si + 1) * bc))
  const board4 = board2.map(row => colOrder.map(ci => row[ci]))
  const symbols = shuffle(range(n).map(i => i + 1))
  const board5 = board4.map(row => row.map(v => symbols[v - 1]))
  return board5
}

function makePuzzle(n: number, br: number, bc: number, empties: number) {
  const solution = makeSolvedSudoku(n, br, bc)
  const puzzle: Board = solution.map(row => [...row])
  const positions = shuffle(range(n * n))
  for (let k = 0; k < Math.min(empties, n * n); k++) {
    const p = positions[k]
    const r = Math.floor(p / n)
    const c = p % n
    puzzle[r][c] = 0
  }
  const givens = puzzle.map(row => row.map(v => v !== 0))
  return { puzzle, solution, givens }
}

function SudokuBoard({ n, br, bc, seed, onReset }: { n: number; br: number; bc: number; seed: number; onReset: () => void }) {
  const empties = n === 4 ? 8 : 20
  const { puzzle, solution, givens } = useMemo(() => makePuzzle(n, br, bc, empties), [n, br, bc, seed, empties])
  const [grid, setGrid] = useState<Board>(puzzle)
  const [active, setActive] = useState<{ r: number; c: number } | null>(null)
  const cell = n === 4 ? 64 : 56
  const [congratsOpen, setCongratsOpen] = useState(false)

  function setCell(r: number, c: number, val: number) {
    if (givens[r][c]) return
    setGrid(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = val
      const solved = next.every((row, ri) => row.every((v, ci) => v !== 0 && v === solution[ri][ci]))
      if (solved) {
        setCongratsOpen(true)
        setTimeout(() => {
          setCongratsOpen(false)
          onReset()
        }, 1800)
      }
      return next
    })
  }

  function reset() {
    onReset()
  }

  const keypad = range(n).map(i => i + 1)
  return (
    <div className="grid gap-8 md:grid-cols-[auto_240px]">
      <div className="inline-grid gap-0 overflow-hidden rounded-md" style={{ gridTemplateColumns: `repeat(${n}, ${cell}px)`, gridAutoRows: `${cell}px` }}>
        {range(n).map(r => (
          range(n).map(c => {
            const v = grid[r][c]
            const isGiven = givens[r][c]
            const thickLeft = c % bc === 0
            const thickTop = r % br === 0
            const thickRight = c === n - 1
            const thickBottom = r === n - 1
            const collapseX = c > 0 && c % bc !== 0
            const collapseY = r > 0 && r % br !== 0
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => setActive({ r, c })}
                className={cn(
                  "flex items-center justify-center select-none text-lg font-semibold border bg-card",
                  isGiven ? "text-foreground" : "text-muted-foreground",
                  thickLeft && "border-l-2",
                  thickTop && "border-t-2",
                  thickRight && "border-r-2",
                  thickBottom && "border-b-2",
                  collapseX && "-ml-px",
                  collapseY && "-mt-px",
                  active && active.r === r && active.c === c && "bg-accent"
                )}
                style={{ width: `${cell}px`, height: `${cell}px` }}
              >
                {v === 0 ? "" : v}
              </button>
            )
          })
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {keypad.map(k => (
              <Button key={k} variant="secondary" onClick={() => active && setCell(active.r, active.c, k)}>{k}</Button>
            ))}
            <Button variant="outline" onClick={() => active && setCell(active.r, active.c, 0)}>Clear</Button>
          </div>
          <Button className="bg-btn-gradient text-accent-foreground hover:opacity-90" onClick={reset}>New Puzzle</Button>
        </CardContent>
      </Card>
      <Dialog open={congratsOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl">Nice! Sudoku Solved</DialogTitle>
            <DialogDescription>Generating a new puzzle...</DialogDescription>
          </DialogHeader>
          <ConfettiBurst />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SudokuPage() {
  const [tab, setTab] = useState("4x4")
  const [seed4, setSeed4] = useState(0)
  const [seed6, setSeed6] = useState(0)
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">Sudoku</h1>
          <p className="mt-4 text-lg text-muted-foreground">Choose a size and solve. Reset generates a fresh puzzle.</p>
          <div className="mt-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="4x4">4×4</TabsTrigger>
                <TabsTrigger value="6x6">6×6</TabsTrigger>
              </TabsList>
              <TabsContent value="4x4"><SudokuBoard key={`4-${seed4}`} n={4} br={2} bc={2} seed={seed4} onReset={() => setSeed4(s => s + 1)} /></TabsContent>
              <TabsContent value="6x6"><SudokuBoard key={`6-${seed6}`} n={6} br={2} bc={3} seed={seed6} onReset={() => setSeed6(s => s + 1)} /></TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaEd. All rights reserved.
      </footer>
    </div>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 40 })
  const emojis = ["🎉","🌟","🍄","⭐","🎈"]
  return (
    <div className="pointer-events-none fixed inset-0">
      <style>{`@keyframes confettiFall {0%{transform:translateY(-20vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map((_, i) => {
        const left = Math.floor(Math.random()*100)
        const duration = 1000 + Math.floor(Math.random()*1000)
        const delay = Math.floor(Math.random()*200)
        const emoji = emojis[i % emojis.length]
        const size = 18 + Math.floor(Math.random()*10)
        return (
          <div key={i} style={{position:'absolute',left:`${left}%`,top:0,animation:`confettiFall ${duration}ms linear ${delay}ms forwards`,fontSize:size}}>{emoji}</div>
        )
      })}
    </div>
  )
}
