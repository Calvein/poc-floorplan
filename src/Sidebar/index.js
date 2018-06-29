import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './index.css'

class Sidebar extends Component {
  render() {
    const {
      elements,
      onChangeElement,
    } = this.props

    return (
      <div className="Sidebar">
        {elements.length === 0 && (
          <div className="Sidebar-noData">
            Select a table
          </div>
        )}
        {elements.map((d) => (
          <div
            key={d.id}
            className="Sidebar-section"
          >
            <h3>Table id: {d.id}</h3>
            <label>
              Label:
              <input
                type="text"
                value={d.label}
                onChange={(e) => {
                  onChangeElement(d.id, {
                    label: e.target.value,
                  })
                }}
              />
            </label>
            <label>
              Pax:
              <input
                type="number"
                value={d.pax}
                onChange={(e) => {
                  onChangeElement(d.id, {
                    pax: e.target.value,
                  })
                }}
              />
            </label>
          </div>
        ))}
      </div>
    )
  }
}

Sidebar.propTypes = {
  elements: PropTypes.array.isRequired,
  onChangeElement: PropTypes.func.isRequired,
}

export default Sidebar
