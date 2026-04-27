import React from 'react';

interface ResponseAnalyticsProps {
  data: {
    head: string[];
    rows: any[][];
  };
}

function ResponseAnalytics({ data }: ResponseAnalyticsProps) {
  // Mock data for demo
  const mockData = {
    head: ['응답자', '이메일', 'Q1. 서비스 만족도', 'Q2. 추천 의향', '제출 시간'],
    rows: [
      ['user_001', 'user1@example.com', '매우 만족', '추천함', '2024-03-18 14:32'],
      ['user_002', 'user2@example.com', '만족', '추천함', '2024-03-18 15:21'],
      ['user_003', 'user3@example.com', '보통', '추천하지 않음', '2024-03-18 16:45'],
      ['user_004', 'user4@example.com', '매우 만족', '추천함', '2024-03-19 09:12'],
      ['user_005', 'user5@example.com', '만족', '추천함', '2024-03-19 10:33'],
    ],
  };

  const displayData = data.head.length > 0 ? data : mockData;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">응답 데이터</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            필터
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors">
            CSV 다운로드
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {displayData.head.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          총 {displayData.rows.length}개의 응답
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded">1</span>
          <button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted rounded transition-colors">2</button>
          <button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted rounded transition-colors">3</button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResponseAnalytics;
