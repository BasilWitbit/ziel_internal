import { getSingleUserTimelogsV2 } from '@/api/services';
import UserLogsComponent, { type TimelogData, type SummaryShape } from '@/components/use-case/UserLogsComponent'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router'

const UserLogs = () => {
  const location = useLocation();
  const queryObject = new URLSearchParams(location.search);
  const projectID = queryObject.has('projectId') ? queryObject.get('projectId') : '';
  const teamMemberID = queryObject.has('teamMemberId') ? queryObject.get('teamMemberId') : '';

  const [timeLogs, setTimeLogs] = useState<TimelogData[]>([]);
  // summary will be set from API response
  const [summary, setSummary] = useState<SummaryShape | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectID || !teamMemberID) {
      setError('Missing projectId or teamMemberId in query parameters.');
      return;
    }
    // Fetch data based on projectID and teamMemberID
    setLoading(true);
    getSingleUserTimelogsV2(teamMemberID, projectID).then((data) => {
      if (!data) {
        setError('Empty response from server');
        return;
      }
      const payload = (data as any).data ?? data;
      if (payload.error) {
        setError(payload.message || 'Failed to fetch data.');
        return;
      }
      const apiLogs = payload.logs ?? [];
      const mapped: TimelogData[] = apiLogs.map((l: any) => ({
        date: l.date,
        status: (l.tasks && l.tasks.length > 0) ? 'completed' : 'pending',
        tasks: (l.tasks ?? []).map((t: any) => ({
          time: t.time ?? t.timeTakenInHours ?? 0,
          type: t.type ?? '',
          task_description: t.task_description ?? t.taskDescription ?? '',
          featureTitle: t.featureTitle ?? null
        })),
        createdAt: l.createdAt
      }));

      setTimeLogs(mapped);
      setSummary({ projectName: payload.summary?.projectName ?? '', user: { name: payload.summary?.userName ?? '', role: payload.summary?.role ?? '', email: payload.summary?.email ?? '' } });
    }).catch((err) => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [])

  return (
    <>
      {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>Error: {error}</p> : <UserLogsComponent timeLogs={timeLogs} summary={summary} />}
    </>
  )
}

export default UserLogs