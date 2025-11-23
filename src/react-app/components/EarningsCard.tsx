import { DollarSign, TrendingUp, Calendar } from "lucide-react";

interface EarningsSummary {
  today: number;
  week: number;
  month: number;
  totalRides: number;
}

interface EarningsCardProps {
  earnings: EarningsSummary;
}

export default function EarningsCard({ earnings }: EarningsCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Your Earnings</h2>
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <DollarSign className="w-7 h-7" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="w-4 h-4 opacity-75" />
            <p className="text-xs opacity-75">Today</p>
          </div>
          <p className="text-2xl font-bold">{earnings.today} ZMW</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-xs opacity-75 mb-2">This Week</p>
          <p className="text-2xl font-bold">{earnings.week} ZMW</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-xs opacity-75 mb-2">This Month</p>
          <p className="text-2xl font-bold">{earnings.month} ZMW</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
        <div>
          <p className="text-xs opacity-75 mb-1">Total Completed Rides</p>
          <p className="text-xl font-bold">{earnings.totalRides}</p>
        </div>
        <TrendingUp className="w-8 h-8 opacity-75" />
      </div>
    </div>
  );
}
