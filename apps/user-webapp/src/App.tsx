import RouterComponent from './RouterComponent'
import AuthProvider from './components/context/AuthProvider';
import DayEngLogFormProvider from './components/context/DayEngLogFormProvider';
import './lib/supabaseClient';

const App = () => {
    return (
        <AuthProvider>
            <DayEngLogFormProvider>
                <RouterComponent />
            </DayEngLogFormProvider>
        </AuthProvider>
    )
}

export default App