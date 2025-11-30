import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GamesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <section className="text-center mb-10">
            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">Games</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Pick a game to play.</p>
          </section>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">Wordsearches</CardTitle>
                <CardDescription>Find hidden words in themed grids.</CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter>
                <Button asChild className="w-full bg-btn-gradient text-accent-foreground hover:opacity-90">
                  <Link href="/games/wordsearches">Open</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">Sudoku</CardTitle>
                <CardDescription>Fill the grid so each row and column is complete.</CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter>
                <Button asChild className="w-full bg-btn-gradient text-accent-foreground hover:opacity-90">
                  <Link href="/games/sudoku">Open</Link>
                </Button>
              </CardFooter>
            </Card>

            
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaEd. All rights reserved.
      </footer>
    </div>
  );
}
