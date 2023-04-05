import './App.scss';
import { Router } from './components/layout/Router';
import ReactGA from 'react-ga4';

ReactGA.initialize("G-W0EDGX3KYV");
ReactGA.send("pageview");

function App() {
  return (
    <>
      <Router />
    </>
  );
}

export default App;
