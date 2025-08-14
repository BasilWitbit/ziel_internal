import RouterComponent from './RouterComponent'
import AuthProvider from './components/context/AuthProvider';
import DayEndLogFormProvider from './components/context/DayEndLogFormProvider';
import './lib/supabaseClient';

const App = () => {
    return (
        <AuthProvider>
            <DayEndLogFormProvider>
                <RouterComponent />
            </DayEndLogFormProvider>
        </AuthProvider>
    )
}

export default App