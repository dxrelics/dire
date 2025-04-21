import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Facebook, Feather, Instagram, Shield, Twitter, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center">
          <Image src="/images/dire-logo.png" alt="DIRE" width={120} height={50} className="h-auto" />
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/checkout"
            className="group relative overflow-hidden rounded-full bg-white px-6 py-2 text-sm font-medium text-black transition-all duration-300 hover:bg-opacity-90"
          >
            <span className="relative z-10">Buy Now</span>
            <span className="absolute inset-0 z-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <Image
            src="/images/tracksuit.png"
            alt="Dire Khadaffi Track Suit"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="container relative z-20 mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
            <h1 className="mt-6 max-w-4xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-6xl md:text-7xl">
              Stand Defend and Conquer
            </h1>
            <h2 className="mt-4 text-3xl font-bold">Dire Khadaffi Track Suit – Style in Motion</h2>
            <p className="mt-6 max-w-2xl text-lg text-gray-300">Exclusive Edition for Active Trendsetters</p>
            <div className="mt-10">
              <Link
                href="/checkout"
                className="group relative overflow-hidden rounded-full bg-white px-8 py-3 text-black transition-all duration-300 hover:bg-opacity-90"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </span>
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Description Section */}
        <section id="product" className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Elevate your look with the Dire Khadaffi Track Suit!</h2>
                <p className="text-gray-300 leading-relaxed">
                  This sleek black sports set features a modern design with white "DIRE" striped detailing on the
                  sleeves, delivering a bold and dynamic vibe. Crafted from high-quality, lightweight, and breathable
                  materials, it's perfect for both workouts and casual outings.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Equipped with a front zipper and high collar for added protection, this track suit ensures you stay
                  comfortable and confident in every move. Grab yours now and embrace the exclusive Dire Khadaffi style!
                </p>
                <Link
                  href="/checkout"
                  className="inline-block rounded-full bg-white px-8 py-3 text-black transition-all duration-300 hover:bg-opacity-90"
                >
                  Buy Now
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden bg-gray-800 p-2">
                  <Image
                    src="/images/tracksuit.png"
                    alt="Dire Khadaffi Track Suit Full View"
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                <div className="rounded-lg overflow-hidden bg-gray-800 p-2">
                  <Image
                    src="/images/track-top.png"
                    alt="Dire Khadaffi Track Top Detail"
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Feather className="h-10 w-10 text-white" />,
                  title: "Lightweight & Breathable Material",
                  description: "Stay cool and comfortable during any activity",
                },
                {
                  icon: <Zap className="h-10 w-10 text-white" />,
                  title: "Sporty & Casual Design",
                  description: "Perfect for workouts or everyday style",
                },
                {
                  icon: <Shield className="h-10 w-10 text-white" />,
                  title: "High Collar for Extra Protection",
                  description: "Added warmth and style for cooler days",
                },
                {
                  icon: <Clock className="h-10 w-10 text-white" />,
                  title: "Durable Front Zipper",
                  description: "Easy on and off with lasting quality",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-2 text-center"
                >
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image src="/images/dire-logo.png" alt="DIRE" width={100} height={40} className="h-auto" />
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Shipping Info
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Returns Policy
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} DIRE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
