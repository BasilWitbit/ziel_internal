import { getSingleUserTimelogsV2 } from '@/api/services';
import UserLogsComponent, { type TimelogData } from '@/components/use-case/UserLogsComponent'
import { LOGS } from '@/components/use-case/UserLogsComponent/dummy_data';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router'

const UserLogs = () => {
  const location = useLocation();
  const queryObject = new URLSearchParams(location.search);
  const projectID = queryObject.has('projectId') ? queryObject.get('projectId') : '';
  const teamMemberID = queryObject.has('teamMemberId') ? queryObject.get('teamMemberId') : '';

  const [timeLogs, setTimeLogs] = useState<TimelogData[]>([]);
  const [projectName, setProjectName] = useState('');
  const [user, setUser] = useState({ name: '', role: '', email: '', teamMemberStartDate: null });

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
      if (data.error) {
        setError(data.message || 'Failed to fetch data.');
        return;
      }
      // const logs = data.data?.logs || [];
      /**TO BE:
       * {
       *  date: string;
       *  status: 'completed' | 'pending';
       *  tasks?: TaskData[];
       *  createdAt: string;
       * }
       */

      setTimeLogs(LOGS)
    }).catch((err) => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [])

  return (
    <>
      {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>Error: {error}</p> : <UserLogsComponent timeLogs={timeLogs} />}
    </>
  )
}

export default UserLogs