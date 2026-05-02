import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface TrendAnalyticsProps {
  surveyId: number;
}

function TrendAnalytics({ surveyId }: TrendAnalyticsProps) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  });

  const responseData = days.map(() => Math.floor(Math.random() * 20 + 1));
  const cumulativeData = responseData.reduce<number[]>((acc, val, i) => {
    acc.push((acc[i - 1] || 0) + val);
    return acc;
  }, []);

  const areaOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
    colors: ['#6366f1'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    dataLabels: { enabled: false },
    xaxis: { categories: days, tickAmount: 6, labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { style: { fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { theme: 'light' },
  };

  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: ['#818cf8'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: days, tickAmount: 6, labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { style: { fontSize: '11px' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { theme: 'light' },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">누적 응답 추이 (최근 30일)</h3>
        <ReactApexChart
          type="area"
          options={areaOptions}
          series={[{ name: '누적 응답', data: cumulativeData }]}
          height={220}
        />
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">일별 응답 수 (최근 30일)</h3>
        <ReactApexChart
          type="bar"
          options={barOptions}
          series={[{ name: '일별 응답', data: responseData }]}
          height={220}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '최고 일별 응답', value: Math.max(...responseData), unit: '건' },
          { label: '평균 일별 응답', value: Math.round(responseData.reduce((a, b) => a + b, 0) / responseData.length), unit: '건' },
          { label: '총 응답 (30일)', value: responseData.reduce((a, b) => a + b, 0), unit: '건' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-indigo-600">{item.value.toLocaleString()}{item.unit}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendAnalytics;
