import RouterComponent from './RouterComponent'
import AuthProvider from './components/context/AuthProvider';
import './lib/supabaseClient';

const App = () => {
    return (
        <AuthProvider>
            <RouterComponent />
        </AuthProvider>
    )
}

export default App