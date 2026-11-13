import React from 'react';
import { getAppSetting } from '@/lib/get-app-setting';
import QueryHydrator from '@/providers/QueryHydrator';

export default async function StandaloneLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAppSetting();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <QueryHydrator entries={[{ endpointName: 'getAppSetting', value: settings }]} />
      {children}
    </div>
  );
}
