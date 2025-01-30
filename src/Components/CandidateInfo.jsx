import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

const CandidateInfo = () => {
  const { cid } = useParams();
  const [candidateInfo, setCandidateInfo] = useState({});
  const [candidateSector, setCandidateSector] = useState([]);
  const [candidateContributor, setCandidateContributor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_API_KEY;

  const chartRef = useRef();
  const contributorsChartRef = useRef();

  const fetchCandidateInfo = async (candidateId) => {
    try {
      const response = await fetch(
        `https://www.opensecrets.org/api/?method=candSummary&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`
      );
      if (!response.ok) {
        throw new Error("Network response is having problems.");
      }
      const data = await response.json();
      setCandidateInfo(data.response.summary["@attributes"]);
    } catch (error) {
      setError(error);
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateSector = async (candidateId) => {
    try {
      const response = await fetch(
        `https://www.opensecrets.org/api/?method=candSector&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`
      );
      if (!response.ok) {
        throw new Error("Network response is having problems.");
      }
      const data = await response.json();
      if (
        data.response &&
        data.response.sectors &&
        Array.isArray(data.response.sectors.sector)
      ) {
        setCandidateSector(data.response.sectors.sector);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const fetchCandidateContributors = async (candidateId) => {
    try {
      const response = await fetch(
        `https://www.opensecrets.org/api/?method=candContrib&cid=${candidateId}&cycle=2024&apikey=${apiKey}&output=json`
      );
      if (!response.ok) {
        throw new Error("Network response is having problems.");
      }
      const data = await response.json();
      if (
        data.response &&
        data.response.contributors &&
        Array.isArray(data.response.contributors.contributor)
      ) {
        setCandidateContributor(data.response.contributors.contributor);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    if (cid) {
      fetchCandidateInfo(cid);
      fetchCandidateSector(cid);
      fetchCandidateContributors(cid);
    }
  }, [cid, apiKey]);

  useEffect(() => {
    if (candidateSector.length > 0) {
      drawChart();
      window.addEventListener("resize", drawChart);
      return () => window.removeEventListener("resize", drawChart);
    }
  }, [candidateSector]);

  useEffect(() => {
    if (candidateContributor.length > 0) {
      drawContributorsChart();
      window.addEventListener("resize", drawContributorsChart);
      return () => window.removeEventListener("resize", drawContributorsChart);
    }
  }, [candidateContributor]);

  const drawChart = () => {
    const data = candidateSector.map((sector) => ({
      name: sector["@attributes"].sector_name,
      value: parseInt(sector["@attributes"].total, 10),
    }));

    const containerWidth = chartRef.current
      ? chartRef.current.offsetWidth
      : 600;
    const isMobile = containerWidth < 500;
    const width = Math.max(containerWidth, 350);
    const height = isMobile ? 300 : 400;
    const margin = {
      top: 20,
      right: 20,
      bottom: isMobile ? 80 : 100,
      left: 60,
    };

    d3.select(chartRef.current).select("svg").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, width - margin.left - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", isMobile ? "end" : "middle")
      .attr("transform", isMobile ? "rotate(-25)" : "rotate(0)")
      .style("font-size", isMobile ? "10px" : "12px");

    svg.append("g").call(d3.axisLeft(yScale));

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.name))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr(
        "height",
        (d) => height - margin.top - margin.bottom - yScale(d.value)
      )
      .attr("fill", "#4caf50");
  };

  const drawContributorsChart = () => {
    const data = candidateContributor.map((contributor) => ({
      name: contributor["@attributes"].org_name,
      value: parseInt(contributor["@attributes"].total, 10),
    }));

    const containerWidth = contributorsChartRef.current
      ? contributorsChartRef.current.offsetWidth
      : 600;
    const isMobile = containerWidth < 500;
    const width = Math.max(containerWidth, 350);
    const height = isMobile ? 300 : 400;
    const margin = {
      top: 20,
      right: 20,
      bottom: isMobile ? 80 : 100,
      left: 60,
    };

    d3.select(contributorsChartRef.current).select("svg").remove();

    const svg = d3
      .select(contributorsChartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, width - margin.left - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", isMobile ? "end" : "middle")
      .attr("transform", isMobile ? "rotate(-25)" : "rotate(0)")
      .style("font-size", isMobile ? "10px" : "12px");

    svg.append("g").call(d3.axisLeft(yScale));

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.name))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr(
        "height",
        (d) => height - margin.top - margin.bottom - yScale(d.value)
      )
      .attr("fill", "#ff6b6b");
  };

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mainCandidateContainer">
      <h1 className="candidateInfoHeader">Candidate Info</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="candidateCard">
          <Card>
            <Card.Body>
              <Card.Title>
                {candidateInfo.cand_name} ({candidateInfo.party})
              </Card.Title>
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
                {Array.isArray(candidateSector) &&
                  candidateSector.map((sector, index) => (
                    <div key={index}>
                      <strong>{sector["@attributes"].sector_name}:</strong> $
                      {formatNumber(sector["@attributes"].total)}
                    </div>
                  ))}
              </Card.Text>
              <div className="chart" ref={chartRef}></div>
              <Card.Text>
                <Card.Title>Top Contributors</Card.Title>
                {Array.isArray(candidateContributor) &&
                  candidateContributor.map((contributor, index) => (
                    <div key={index}>
                      <strong>{contributor["@attributes"].org_name}:</strong> $
                      {formatNumber(contributor["@attributes"].total)}
                    </div>
                  ))}
              </Card.Text>
              <div className="chart" ref={contributorsChartRef}></div>
              <Button className="goBackButton" variant="primary">
                <Link to="/" className="buttonLink">
                  Go back
                </Link>
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CandidateInfo;
