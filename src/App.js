import "./Styles/App.scss";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Legislators from "./Components/Legislators";
import CandidateInfo from "./Components/CandidateInfo";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Legislators />} />
          <Route path="/candidate/:cid" element={<CandidateInfo />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
