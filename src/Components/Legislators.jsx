import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const Legislators = () => {
  const [legislators, setLegislators] = useState([]);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY;
  const [usState, setUsState] = useState("");

  const fetchLegislators = async (stateId) => {
    try {
      const response = await fetch(`http://www.opensecrets.org/api/?method=getLegislators&id=${stateId}&apikey=${apiKey}`);
      if (!response.ok) {
        throw new Error('Network response is having problems.');
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/xml')) {
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        data = xmlToJson(xmlDoc);
      } else {
        const text = await response.text();
        data = { response: { legislator: [{ '@attributes': { firstlast: text } }] } };
      }

      setLegislators(data.response.legislator);
    } catch (error) {
      setError(error);
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const xmlToJson = (xml) => {
    const obj = {};
    if (xml.nodeType === 1) { 
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) {
      obj = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof(obj[nodeName]) === "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof(obj[nodeName].push) === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
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
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Legislators</h1>
      <div>
        <h2>Choose your state</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="usState">
            <Form.Label>State</Form.Label>
            <Form.Select name="usState">
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="DC">District Of Columbia</option>
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
      </div>
      <ul className="legislatorList">
        {legislators.map((legislator, index) => (
          <li className="legislator" key={index}>{legislator['@attributes'].firstlast}</li>
        ))}
      </ul>
    </div>
  );
};

export default Legislators;
