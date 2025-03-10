import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';

const Legislators = () => {
  const [legislators, setLegislators] = useState([]);
  const [usState, setUsState] = useState(localStorage.getItem('usState') || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY;

  const fetchLegislators = async (stateId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.opensecrets.org/api/?method=getLegislators&id=${stateId}&apikey=${apiKey}&output=json`);
      if (!response.ok) {
        throw new Error('Network response is having problems.');
      }
      const data = await response.json();
      setLegislators(data.response.legislator);
    } catch (error) {
      setError(error);
      console.error('There was a problem with the fetch operation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usState) {
      fetchLegislators(usState);
    }
  }, [usState, apiKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedState = event.target.elements.usState.value;
    setUsState(selectedState);
    localStorage.setItem('usState', selectedState);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='mainContainer'>
      <div className="stateForm">
        <h1 className="stateFormLegislatorsHeader">Legislators</h1>
        <div className="stateFormCard">
          <Card style={{ width: '25rem' }}>
            <Card.Body>
              <h2 className="stateFormLegislatorsSubheader">Choose your state</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="usState">
                  <Form.Select name="usState" className="stateFormSelect" defaultValue={usState}>
                    <option value="">Select a state</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit">Submit</Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
        {usState && (
          <Image className="flagImage" src={`https://flagpedia.net/data/us/w1160/${usState.toLowerCase()}.webp`} fluid />
        )}
      </div>
      <ul className="legislatorList">
        {loading ? (
          <p>Loading...</p>
        ) : (
          legislators.map((legislator, index) => (
            <li className="legislator" key={index}>
              <Link to={`/candidate/${legislator['@attributes'].cid}`}>
                {legislator['@attributes'].firstlast} ({legislator['@attributes'].party})
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Legislators;
