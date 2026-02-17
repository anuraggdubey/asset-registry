import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfcfc]">

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600 mb-6 md:mb-8">
          Stellar Testnet Demo
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-6 md:mb-8 leading-tight">
          Prove and transfer digital ownership.
        </h1>

        <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
          A decentralized registry for creators to notarize files, transfer rights, and prove authenticity using the Stellar blockchain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="primary" className="h-12 px-8 text-base w-full sm:w-auto">
              Register Asset
            </Button>
          </Link>
          <Link href="/verify" className="w-full sm:w-auto">
            <Button variant="secondary" className="h-12 px-8 text-base bg-white w-full sm:w-auto">
              Verify Ownership
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          <FeatureCard
            step="01"
            title="Upload & Hash"
            description="Your file is hashed locally in your browser. Only the cryptographic fingerprint leaves your device."
          />

          <FeatureCard
            step="02"
            title="Register on Chain"
            description="We stamp the file hash onto the Stellar ledger, creating an immutable proof of existence and ownership."
          />

          <FeatureCard
            step="03"
            title="Transfer & Verify"
            description="Send ownership to any Stellar wallet. public verification is available to anyone instantly."
          />

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 text-center text-sm text-gray-400">
        <p>Built with Next.js + Stellar SDK + Freighter</p>
      </footer>

    </main>
  );
}

function FeatureCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <div className="text-xs font-mono text-gray-400 mb-4">{step}</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-500 leading-relaxed text-sm">
        {description}
      </p>
    </Card>
  );
}
