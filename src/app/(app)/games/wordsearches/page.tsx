"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Coord = { r: number; c: number }
type PlacedWord = { word: string; positions: Coord[] }
type Puzzle = { size: number; grid: string[]; words: string[]; placed: PlacedWord[] }

function makePuzzle(words: string[], size: number): Puzzle {
  const dirs = [
    { dr: 1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
  ]
  const grid: (string | null)[] = Array(size * size).fill(null)
  const placed: PlacedWord[] = []
  function canPlace(word: string, r: number, c: number, dr: number, dc: number) {
    let rr = r
    let cc = c
    for (let i = 0; i < word.length; i++) {
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) return false
      const idx = rr * size + cc
      const ch = grid[idx]
      if (ch && ch !== word[i]) return false
      rr += dr
      cc += dc
    }
    return true
  }
  function place(word: string) {
    const attempts = size * size * 5
    for (let a = 0; a < attempts; a++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)]
      const r = Math.floor(Math.random() * size)
      const c = Math.floor(Math.random() * size)
      if (!canPlace(word, r, c, dir.dr, dir.dc)) continue
      const positions: Coord[] = []
      let rr = r
      let cc = c
      for (let i = 0; i < word.length; i++) {
        const idx = rr * size + cc
        grid[idx] = word[i]
        positions.push({ r: rr, c: cc })
        rr += dir.dr
        cc += dir.dc
      }
      placed.push({ word, positions })
      return true
    }
    return false
  }
  words.forEach(w => place(w.toUpperCase()))
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) grid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  }
  return { size, grid: grid as string[], words: words.map(w => w.toUpperCase()), placed }
}

function WordSearch({ puzzle, onComplete }: { puzzle: Puzzle; onComplete?: () => void }) {
  const [found, setFound] = useState<Set<string>>(new Set())
  const [foundCells, setFoundCells] = useState<Set<number>>(new Set())
  const [selecting, setSelecting] = useState(false)
  const startRef = useRef<Coord | null>(null)
  const [activePath, setActivePath] = useState<number[]>([])
  const [congratsOpen, setCongratsOpen] = useState(false)


  function idx(r: number, c: number) {
    return r * puzzle.size + c
  }
  function pathBetween(a: Coord, b: Coord) {
    const dr = b.r - a.r
    const dc = b.c - a.c
    const len = Math.max(Math.abs(dr), Math.abs(dc))
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc)
    if (!(Math.abs(dr) === Math.abs(dc) || dr === 0 || dc === 0)) return []
    const p: number[] = []
    let rr = a.r
    let cc = a.c
    for (let i = 0; i <= len; i++) {
      p.push(idx(rr, cc))
      rr += stepR
      cc += stepC
    }
    return p
  }
  function lettersAtPath(p: number[]) {
    return p.map(i => puzzle.grid[i]).join("")
  }
  function onDown(r: number, c: number) {
    setSelecting(true)
    startRef.current = { r, c }
    setActivePath([idx(r, c)])
  }
  function onEnter(r: number, c: number) {
    if (!selecting || !startRef.current) return
    const p = pathBetween(startRef.current, { r, c })
    setActivePath(p)
  }
  function onUp(r: number, c: number) {
    if (!startRef.current) return
    const p = pathBetween(startRef.current, { r, c })
    setSelecting(false)
    startRef.current = null
    setActivePath([])
    if (p.length === 0) return
    const s = lettersAtPath(p)
    const sr = s.split("").reverse().join("")
    const target = puzzle.words.find(w => (w === s || w === sr) && !found.has(w))
    if (!target) return
    const nf = new Set(found)
    nf.add(target)
    setFound(nf)
    const nc = new Set(foundCells)
    p.forEach(i => nc.add(i))
    setFoundCells(nc)
  }

  useEffect(() => {
    if (found.size === puzzle.words.length) {
      const t0 = setTimeout(() => { setCongratsOpen(true) }, 0)
      const t = setTimeout(() => {
        setCongratsOpen(false)
        onComplete && onComplete()
      }, 1800)
      return () => { clearTimeout(t0); clearTimeout(t) }
    }
  }, [found, puzzle, onComplete])

  return (
    <div className="grid gap-8 md:grid-cols-[auto_320px]">
      <div className="inline-grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 2.5rem)` }}>
        {Array.from({ length: puzzle.size }).map((_, r) => (
          Array.from({ length: puzzle.size }).map((_, c) => {
            const i = idx(r, c)
            const ch = puzzle.grid[i]
            const isActive = activePath.includes(i)
            const isFound = foundCells.has(i)
            return (
              <button
                key={`${r}-${c}`}
                onMouseDown={() => onDown(r, c)}
                onMouseEnter={() => onEnter(r, c)}
                onMouseUp={() => onUp(r, c)}
                onTouchStart={() => onDown(r, c)}
                onTouchMove={e => {
                  const touch = e.touches[0]
                  const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
                  if (!target) return
                  const rr = Number(target.getAttribute("data-r"))
                  const cc = Number(target.getAttribute("data-c"))
                  if (!Number.isNaN(rr) && !Number.isNaN(cc)) onEnter(rr, cc)
                }}
                onTouchEnd={() => onUp(r, c)}
                data-r={r}
                data-c={c}
                className={cn(
                  "flex items-center justify-center select-none text-lg font-bold w-10 h-10 border rounded-md",
                  isFound && "bg-green-600 text-primary-foreground",
                  !isFound && isActive && "bg-accent",
                  !isFound && !isActive && "bg-card"
                )}
              >
                {ch}
              </button>
            )
          })
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Words</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {puzzle.words.map(w => (
              <li key={w} className={cn("text-base", found.has(w) && "line-through text-muted-foreground")}>{w}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Dialog open={congratsOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl">Wahoo! Puzzle Complete</DialogTitle>
            <DialogDescription>Loading a new Mario wordsearch...</DialogDescription>
          </DialogHeader>
          <ConfettiBurst />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function WordsearchesPage() {
  const sets = useMemo(() => {
    return [
      ["Mario","Luigi","Peach","Bowser","Yoshi","Toad","Goomba","Koopa","Boo","Star"],
      ["Wario","Waluigi","Daisy","Rosalina","BowserJr","ShyGuy","Lakitu","Tanooki","FireFlower","Mushroom"],
      ["DonkeyKong","Diddy","Pauline","Birdo","HammerBro","Piranha","ChainChomp","BulletBill","Thwomp","BobOmb"],
      ["WarpPipe","SuperStar","1Up","Shell","Kart","RainbowRoad","Galaxy","Castle","Coin","Block"],
      ["Boomerang","Propeller","Penguin","Cappy","Frog","Cat","BoomBoom","Kamek","Nabbit","Sprixie"],
    ]
  }, [])
  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [puzzle, setPuzzle] = useState<Puzzle>(() => makePuzzle(sets[0], 12))
  function nextPuzzle() {
    const next = Math.floor(Math.random() * sets.length)
    setIndex(next)
    setPuzzle(makePuzzle(sets[next], 12))
    setSeed(s => s + 1)
  }
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">Wordsearches</h1>
          <p className="mt-4 text-lg text-muted-foreground">Find the hidden Super Mario words. When you find them all, a new puzzle loads.</p>
          <div className="mt-6">
            <div className="mb-4 flex items-center gap-2">
              <Button className="bg-btn-gradient text-accent-foreground hover:opacity-90" onClick={nextPuzzle}>New Puzzle</Button>
            </div>
            <WordSearch key={seed} puzzle={puzzle} onComplete={nextPuzzle} />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaEd. All rights reserved.
      </footer>
    </div>
  )
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
