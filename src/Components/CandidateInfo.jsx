import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const CandidateInfo = () => {
  const { cid } = useParams();
  const [candidateInfo, setCandidateInfo] = useState({});
  const [candidateSector, setCandidateSector] = useState([]);
  const [candidateContributor, setCandidateContributor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchCandidateInfo = async (candidateId) => {
    try {
      const response = await fetch(`https://www.opensecrets.org/api/?method=candSummary&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`);
      if (!response.ok) {
        throw new Error('Network response is having problems.');
      }
      const data = await response.json();
      setCandidateInfo(data.response.summary['@attributes']);
    } catch (error) {
      setError(error);
      console.error('There was a problem with the fetch operation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateSector = async (candidateId) => {
    try {
      const response = await fetch(`https://www.opensecrets.org/api/?method=candSector&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`);
      if (!response.ok) {
        throw new Error('Network response is having problems.');
      }
      const data = await response.json();
      if (data.response && data.response.sectors && Array.isArray(data.response.sectors.sector)) {
        setCandidateSector(data.response.sectors.sector);
      } else {
        console.error('Unexpected data structure:', data);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const fetchCandidateContributors = async (candidateId) => {
    try {
      const response = await fetch(`https://www.opensecrets.org/api/?method=candContrib&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`);
      if (!response.ok) {
        throw new Error('Network response is having problems.');
      }
      const data = await response.json();
      if (data.response && data.response.contributors && Array.isArray(data.response.contributors.contributor)) {
        console.log(data.response.contributors.contributor);
        setCandidateContributor(data.response.contributors.contributor);
      } else {
        console.error('Unexpected data structure:', data);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  function formatNumber(number) {
    let numberString = number.toString();
    let parts = numberString.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
  }

  useEffect(() => {
    if (cid) {
      fetchCandidateInfo(cid);
      fetchCandidateSector(cid);
      fetchCandidateContributors(cid);
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
          <Card style={{ width: '25rem' }}>
            <Card.Body>
              <Card.Title>{candidateInfo.cand_name} ({candidateInfo.party})</Card.Title>
              <Card.Title>{candidateInfo.state}</Card.Title>
              <Card.Text>
                <b>Total Raised:</b> ${formatNumber(candidateInfo.total)}
                <br />
                <b>Spent:</b> ${formatNumber(candidateInfo.spent)}
                <br />
                <b>Cash on Hand:</b> ${formatNumber(candidateInfo.cash_on_hand)}
                <br />
                <b>Debt:</b> ${candidateInfo.debt}
              </Card.Text>

              <Card.Text>
                <Card.Title>Candidate Sectors</Card.Title>
                {Array.isArray(candidateSector) && candidateSector.map((sector, index) => (
                  <div key={index}>
                    <strong>{sector['@attributes'].sector_name}:</strong> ${formatNumber(sector['@attributes'].total)}
                  </div>
                ))}
              </Card.Text>
                <Card.Title>Top Contributors</Card.Title>
                {Array.isArray(candidateContributor) && candidateContributor.map((contributor, index) => (
                  <div key={index}>
                    <strong>{contributor['@attributes'].org_name}:</strong> ${formatNumber(contributor['@attributes'].total)}
                  </div>
                ))}
              <Card.Text>

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
