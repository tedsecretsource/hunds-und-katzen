import './App.css';
import StandardCat from './components/StandardCat';

function App() {
  return (
    <div className="App">
      <StandardCat loadingUrl="/loading.gif" />
    </div>
  );
}

export default App;
