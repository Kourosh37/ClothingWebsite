import { Navigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute; 