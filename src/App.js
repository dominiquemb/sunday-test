import logo from './logo.svg';
import './App.css';
import PaymentForm from './components/PaymentForm/PaymentForm';

function App() {
  return (
    <div className="App">
          <PaymentForm onSubmit={(result) => {
            alert(JSON.stringify(result));
          }} />
    </div>
  );
}

export default App;
