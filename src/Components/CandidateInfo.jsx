import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const CandidateInfo = () => {
  const { cid } = useParams();
  const [candidateInfo, setCandidateInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchCandidateInfo = async (candidateId) => {
    try {
      const response = await fetch(`http://www.opensecrets.org/api/?method=candSummary&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`);
      if (!response.ok) {
        throw new Error('Network response is having problems.');
      }
      const data = await response.json();
      console.log(data.response.summary['@attributes']);
      setCandidateInfo(data.response.summary['@attributes']);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  useEffect(() => {
    if (cid) {
      fetchCandidateInfo(cid);
    }
  }, [cid, apiKey]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="mainCandidateContainer">
      <h1 className="candidateInfoHeader">Candidate Info</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="candidateCard">
          <Card style={{ width: '30rem' }}>
            <Card.Body>
              <Card.Title>{candidateInfo.cand_name} ({candidateInfo.party})</Card.Title>
              <Card.Title>{candidateInfo.state}</Card.Title>
              <Card.Text>
                Total Raised: ${candidateInfo.total}
                <br />
                Spent: ${candidateInfo.spent}
                <br />
                Cash on Hand: ${candidateInfo.cash_on_hand}
                <br />
                Debt: ${candidateInfo.debt}
              </Card.Text>
              <Button variant="primary">
                <Link to="/" className="buttonLink">Go back</Link>
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CandidateInfo;

