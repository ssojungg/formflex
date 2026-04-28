import { motion } from 'framer-motion';

interface StatsData {
  totalSurveys: number;
  totalResponses: number;
  avgCompletion: number;
  activeSurveys: number;
}

interface StatsCardsProps {
  stats: StatsData;
}

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v10l4.5 4.5" />
  </svg>
);

const TrendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      icon: DocumentIcon,
      label: '전체 설문',
      value: stats.totalSurveys,
      change: '+12.5%',
      changeType: 'positive' as const,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: UsersIcon,
      label: '총 응답 수',
      value: stats.totalResponses.toLocaleString(),
      change: '+28.4%',
      changeType: 'positive' as const,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
    {
      icon: ChartIcon,
      label: '평균 완료율',
      value: `${stats.avgCompletion}%`,
      change: '+3.2pp',
      changeType: 'positive' as const,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      icon: TrendingIcon,
      label: '활성 설문',
      value: stats.activeSurveys,
      change: '+2',
      changeType: 'positive' as const,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${item.iconBg} ${item.iconColor} 
                          flex items-center justify-center flex-shrink-0`}>
              <Icon />
            </div>
            <div className="min-w-0">
              <p className="text-lg md:text-2xl font-semibold text-text-primary truncate">
                {item.value}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm text-text-secondary truncate">
                  {item.label}
                </p>
                <span className={`text-xs font-medium hidden sm:inline
                  ${item.changeType === 'positive' ? 'text-indigo-500' : 'text-red-500'}`}>
                  {item.change}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default StatsCards;
