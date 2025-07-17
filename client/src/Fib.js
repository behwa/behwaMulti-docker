import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchCalculatedValues();
    this.fetchSeenIndexes();
  }

  async fetchCalculatedValues() {
    try {
      const response = await axios.get('/api/values/current');
      this.setState({ values: response.data });
    } catch (err) {
      console.error('Error fetching current values:', err);
    }
  }

  async fetchSeenIndexes() {
    try {
      const response = await axios.get('/api/values/all');
      this.setState({ seenIndexes: response.data });
    } catch (err) {
      console.error('Error fetching seen indexes:', err);
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const index = this.state.index.trim();

    if (!index) return;

    try {
      await axios.post('/api/values', { index });
      this.setState({ index: '' });

      // 🔁 Re-fetch data after submission
      this.fetchCalculatedValues();
      this.fetchSeenIndexes();
    } catch (err) {
      console.error('Error submitting index:', err);
    }
  };

  renderSeenIndexes() {
    return this.state.seenIndexes
      .map(({ number }) => number)
      .join(', ');
  }

  renderCalculatedValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index <strong>{key}</strong>, I calculated <strong>{this.state.values[key]}</strong>
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
        <h2>Fibonacci Calculator</h2>

        <form onSubmit={this.handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="fib-index">Enter your index:</label>
          <input
            id="fib-index"
            type="number"
            min="0"
            value={this.state.index}
            onChange={(e) => this.setState({ index: e.target.value })}
            style={{ margin: '0 1rem' }}
          />
          <button type="submit">Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        <p>{this.renderSeenIndexes() || 'None yet.'}</p>

        <h3>Calculated Values:</h3>
        {this.renderCalculatedValues()}
      </div>
    );
  }
}

export default Fib;
