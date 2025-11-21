import { Button } from "@/components/ui/button";
import { Bike, DollarSign, MapPin, Users } from "lucide-react";
import { APP_LOGO } from "@/const";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Umuntu Pachela</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-gray-700">Login</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Fast and Affordable Motorbike Rides
                </h1>
                <p className="text-xl text-gray-700 mb-8">
                  Experience the future of urban mobility with Umuntu Pachela. Propose your fare, connect with nearby drivers, and enjoy transparent pricing.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                    Get Started
                  </Button>
                  <Button variant="outline" className="px-8 py-6 text-lg border-2 border-red-400 text-gray-900 hover:bg-gray-50">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <Bike className="w-32 h-32 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-lg text-gray-700">
                Join thousands of riders and drivers on Umuntu Pachela
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Why Choose Umuntu Pachela?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: DollarSign,
                  title: "Fair Pricing",
                  description: "You propose the fare. Drivers bid. You choose the best offer."
                },
                {
                  icon: Bike,
                  title: "Quick Rides",
                  description: "Get matched with nearby drivers in seconds."
                },
                {
                  icon: MapPin,
                  title: "Real-time Tracking",
                  description: "Track your driver location in real-time."
                },
                {
                  icon: Users,
                  title: "Trusted Community",
                  description: "Rated drivers and verified riders for your safety."
                }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Request a Ride",
                  description: "Enter your pickup and destination, then propose your fare."
                },
                {
                  step: "2",
                  title: "Drivers Bid",
                  description: "Nearby drivers see your request and submit their offers."
                },
                {
                  step: "3",
                  title: "Choose and Ride",
                  description: "Select your preferred driver and enjoy your ride."
                }
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join the revolution in affordable urban mobility.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Umuntu Pachela. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
