import { Navigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user && user.isAdmin ? children : <Navigate to="/login" />;
};

export default AdminRoute; 