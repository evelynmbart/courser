import { LocalGameClient } from "@/components/local-game-client"

export default function LocalPlayPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Local Play</h1>
            <p className="text-muted-foreground">Play Chivalry with someone sitting next to you</p>
          </div>
        </div>
        <LocalGameClient />
      </div>
    </div>
  )
}
